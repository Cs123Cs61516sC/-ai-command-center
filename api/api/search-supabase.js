// api/search-supabase.js
const Parser = require('rss-parser');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const CLEARBIT_API_KEY = process.env.CLEARBIT_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function searchIndeed(keywords) {
  const parser = new Parser();
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

async function enrichCompany(name) {
  if (!CLEARBIT_API_KEY || !name) return null;
  try {
    const res = await axios.get('https://company.clearbit.com/v2/companies/find', {
      params: { name },
      headers: { Authorization: `Bearer ${CLEARBIT_API_KEY}` }
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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const keywords = (req.body && req.body.keywords) || '';
  if (!keywords) return res.status(400).json({ error: 'Keywords required' });

  try {
    const postings = await searchIndeed(keywords);
    const newOps = [];
    for (const p of postings) {
      const score = calculateOpportunityScore(p.description);
      const { min, max } = estimateValue(p.job_title);

      // Upsert company
      let companyId = null;
      if (p.company_name) {
        const { data: existing } = await supabase.from('companies')
          .select('id').eq('name', p.company_name).limit(1).single();
        if (existing) {
          companyId = existing.id;
        } else {
          const enriched = await enrichCompany(p.company_name);
          const { data: inserted } = await supabase.from('companies')
            .insert([{
              name: p.company_name,
              domain: enriched?.domain || null,
              industry: enriched?.industry || null,
              size: enriched?.size || null,
              location: enriched?.location || null
            }]).select('id').single();
          companyId = inserted.id;
        }
      }
      if (!companyId) continue;

      // Check duplicate
      const { data: dup } = await supabase.from('opportunities')
        .select('id').eq('company_id', companyId).eq('job_title', p.job_title).maybeSingle();
      if (dup) continue;

      const { data: newOpp } = await supabase.from('opportunities')
        .insert([{
          company_id: companyId,
          job_title: p.job_title,
          job_url: p.job_url,
          source: 'indeed',
          score,
          stage: 'discovered',
          value_min: min,
          value_max: max
        }]).select('*').single();
      newOps.push(newOpp);
    }
    res.status(200).json({ inserted: newOps.length, opportunities: newOps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};