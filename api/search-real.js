// REAL Job Search - Works with Indeed's free RSS feed
import Parser from 'rss-parser';

export const config = {
  runtime: 'nodejs',
};

const parser = new Parser();

// Search Indeed via RSS (NO API KEY NEEDED!)
async function searchIndeedRSS(keywords) {
  const query = encodeURIComponent(keywords);
  const feeds = [
    `https://www.indeed.com/rss?q=${query}&l=Remote`,
    `https://www.indeed.com/rss?q=${query}&l=San+Francisco`,
    `https://www.indeed.com/rss?q=${query}&l=New+York`
  ];
  
  const allJobs = [];
  
  for (const feedUrl of feeds) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const jobs = feed.items.map(item => ({
        company: extractCompany(item.title),
        title: item.title,
        description: item.summary || item.contentSnippet || '',
        url: item.link,
        location: item.location || 'Remote',
        datePosted: item.pubDate
      }));
      allJobs.push(...jobs);
    } catch (err) {
      console.log('Feed error:', err);
    }
  }
  
  return allJobs;
}

// Extract company name from job title
function extractCompany(title) {
  // Indeed format: "Job Title - Company Name"
  const parts = title.split(' - ');
  return parts.length > 1 ? parts[parts.length - 1] : 'Unknown Company';
}

// Calculate AI opportunity score
function calculateOpportunityScore(job) {
  let score = 40; // Base score
  
  const aiKeywords = [
    'automation', 'efficiency', 'streamline', 'optimize', 'scale',
    'manual process', 'repetitive', 'time-consuming', 'bottleneck',
    'growth', 'expansion', 'digital transformation', 'modernize'
  ];
  
  const description = (job.description + ' ' + job.title).toLowerCase();
  
  aiKeywords.forEach(keyword => {
    if (description.includes(keyword)) {
      score += 15;
    }
  });
  
  // High-value indicators
  if (description.includes('enterprise') || description.includes('fortune')) {
    score += 20;
  }
  
  // Easy money indicators
  if (description.includes('urgent') || description.includes('immediate') || 
      description.includes('asap') || description.includes('contractor')) {
    job.easyMoney = true;
    score += 25;
  }
  
  return Math.min(score, 95);
}

// Estimate opportunity value based on company/role
function estimateValue(job) {
  const baseValue = 100000;
  let multiplier = 1;
  
  const description = job.description.toLowerCase();
  
  // Size indicators
  if (description.includes('enterprise') || description.includes('fortune 500')) {
    multiplier = 10;
  } else if (description.includes('series b') || description.includes('series c')) {
    multiplier = 5;
  } else if (description.includes('startup')) {
    multiplier = 2;
  }
  
  // Urgency indicators
  if (job.easyMoney) {
    multiplier *= 0.5; // Lower value but quick close
  }
  
  const maxValue = baseValue * multiplier;
  const minValue = maxValue * 0.1;
  
  return { minValue, maxValue };
}

// Main handler for Vercel with PROPER CORS
export default async function handler(req, res) {
  // CORS headers - MUST be on EVERY response
  const allowedOrigin = 'https://cs123cs61516sc.github.io';
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
    return res.status(200).end();
  }
  
  // Set CORS headers for actual requests
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Allow GET requests for testing
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'API is working!',
      message: 'Use POST method to search for opportunities',
      cors: 'Configured for ' + allowedOrigin
    });
  }
  
  // Handle POST requests
  if (req.method === 'POST') {
    try {
      // Determine search terms from client or fallback defaults
      const bodyKeywords = (req.body && req.body.keywords) || null;
      let searchTerms;
      if (Array.isArray(bodyKeywords)) {
        searchTerms = bodyKeywords;
      } else if (typeof bodyKeywords === 'string' && bodyKeywords.trim()) {
        searchTerms = bodyKeywords.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        searchTerms = [
          'hiring consultant',
          'process improvement', 
          'digital transformation',
          'automation engineer',
          'efficiency consultant',
          'systems optimization'
        ];
      }
      
      const allOpportunities = [];
      
      // Search multiple terms
      for (const term of searchTerms.slice(0, 2)) { // Limit to 2 for speed
        const jobs = await searchIndeedRSS(term);
        
        // Convert to opportunities
        const opportunities = jobs.map(job => {
          const score = calculateOpportunityScore(job);
          const { minValue, maxValue } = estimateValue(job);
          
          return {
            company: job.company,
            title: job.title,
            description: job.description.substring(0, 200) + '...',
            location: job.location,
            url: job.url,
            score,
            minValue,
            maxValue,
            easyMoney: job.easyMoney || false,
            industry: 'Technology', // Default, could be enhanced
            source: 'Indeed',
            dateFound: new Date().toISOString()
          };
        });
        
        allOpportunities.push(...opportunities);
      }
      
      // Remove duplicates by company name
      const unique = Array.from(
        new Map(allOpportunities.map(opp => [opp.company, opp])).values()
      );
      
      // Sort by score
      unique.sort((a, b) => b.score - a.score);
      
      // Return top 10 opportunities
      const top10 = unique.slice(0, 10);
      
      return res.status(200).json({
        success: true,
        count: top10.length,
        opportunities: top10
      });
      
    } catch (error) {
      console.error('Search error:', error);
      return res.status(500).json({ 
        error: 'Search failed',
        message: error.message 
      });
    }
  }
  
  // Method not allowed
  res.setHeader('Allow', 'GET, POST, OPTIONS');
  return res.status(405).json({ error: 'Method not allowed' });
}