// api/search-supabase.js
import Parser from 'rss-parser';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'nodejs',
};

const parser = new Parser();

async function searchIndeed(keywords) {
  const feed = await parser.parseURL(`https://www.indeed.com/rss?q=${encodeURIComponent(keywords)}`);
  return feed.items.map(item => {
    const m = item.title.match(/^(.*) - (.*?) -/);
    let job_title = item.title;
    let company_name = '';
    if (m) {
      job_title = m[1].trim();
      company_name = m[2].trim();
    }
    return {
      job_title,
      company_name,
      job_url: item.link,
      description: item.contentSnippet || ''
    };
  });
}

function calculateOpportunityScore(desc) {
  if (!desc) return 0;
  let score = 0;
  const text = desc.toLowerCase();
  const rules = [
    { word: 'manual', weight: 20 },
    { word: 'repetitive', weight: 15 },
    { word: 'spreadsheet', weight: 10 },
    { word: 'data entry', weight: 25 },
    { word: 'reconcile', weight: 15 },
    { word: 'reporting', weight: 10 },
    { word: 'multiple systems', weight: 15 }
  ];
  rules.forEach(({ word, weight }) => {
    if (text.includes(word)) score += weight;
  });
  return Math.min(score, 100);
}

function estimateValue(job_title) {
  const t = job_title.toLowerCase();
  if (t.includes('manager') || t.includes('analyst')) return { min: 100000, max: 200000 };
  return { min: 50000, max: 100000 };
}

async function enrichCompany(name, apiKey) {
  if (!apiKey || !name) return null;
  try {
    const res = await axios.get('https://company.clearbit.com/v2/companies/find', {
      params: { name },
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    return {
      name: res.data.name,
      domain: res.data.domain,
      industry: res.data.industry,
      size: res.data.metrics?.employees_range,
      location: res.data.location
    };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  // CORS headers - MUST be on EVERY response
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Handle GET for testing
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'API endpoint is working',
      message: 'Use POST with keywords to search',
      env: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
        hasClearbitKey: !!process.env.CLEARBIT_API_KEY
      }
    });
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get environment variables
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const CLEARBIT_API_KEY = process.env.CLEARBIT_API_KEY;

  // Check for required environment variables
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ 
      error: 'Missing configuration',
      details: 'SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required',
      debug: {
        hasUrl: !!SUPABASE_URL,
        hasKey: !!SUPABASE_SERVICE_KEY
      }
    });
  }

  // Create Supabase client
  let supabase;
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to initialize Supabase client',
      details: error.message
    });
  }

  const keywords = (req.body && req.body.keywords) || '';
  if (!keywords) {
    return res.status(400).json({ error: 'Keywords required' });
  }

  try {
    const postings = await searchIndeed(keywords);
    const newOps = [];
    
    for (const p of postings) {
      const score = calculateOpportunityScore(p.description);
      const { min, max } = estimateValue(p.job_title);

      // Upsert company
      let companyId = null;
      if (p.company_name) {
        // Check if company exists
        const { data: existing, error: fetchError } = await supabase
          .from('companies')
          .select('id')
          .eq('name', p.company_name)
          .limit(1)
          .maybeSingle();
        
        if (fetchError) {
          console.error('Error fetching company:', fetchError);
          continue;
        }
        
        if (existing) {
          companyId = existing.id;
        } else {
          // Try to enrich company data
          const enriched = await enrichCompany(p.company_name, CLEARBIT_API_KEY);
          
          // Insert new company
          const { data: inserted, error: insertError } = await supabase
            .from('companies')
            .insert([{
              name: p.company_name,
              domain: enriched?.domain || null,
              industry: enriched?.industry || null,
              size: enriched?.size || null,
              location: enriched?.location || null
            }])
            .select('id')
            .single();
          
          if (insertError) {
            console.error('Error inserting company:', insertError);
            continue;
          }
          
          companyId = inserted.id;
        }
      }
      
      if (!companyId) continue;

      // Check for duplicate opportunity
      const { data: dup, error: dupError } = await supabase
        .from('opportunities')
        .select('id')
        .eq('company_id', companyId)
        .eq('job_title', p.job_title)
        .maybeSingle();
      
      if (dupError) {
        console.error('Error checking duplicate:', dupError);
        continue;
      }
      
      if (dup) continue;

      // Insert new opportunity
      const { data: newOpp, error: oppError } = await supabase
        .from('opportunities')
        .insert([{
          company_id: companyId,
          job_title: p.job_title,
          job_url: p.job_url,
          source: 'indeed',
          score,
          stage: 'discovered',
          value_min: min,
          value_max: max
        }])
        .select('*')
        .single();
      
      if (oppError) {
        console.error('Error inserting opportunity:', oppError);
        continue;
      }
      
      newOps.push(newOpp);
    }
    
    res.status(200).json({ 
      success: true,
      inserted: newOps.length, 
      opportunities: newOps 
    });
    
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message
    });
  }
}