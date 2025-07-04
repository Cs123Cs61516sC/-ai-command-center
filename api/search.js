// Vercel Serverless Function for Job Search
// Deploy this to Vercel for instant API without managing servers

export const config = {
  runtime: 'nodejs',
};

// Mock search function for testing
async function searchJobs(keywords) {
  // In production, replace with real API calls
  const mockResults = [
    {
      company: "TechCorp Solutions",
      title: "AI Implementation Manager",
      description: "Seeking AI solutions for supply chain optimization",
      location: "San Francisco, CA",
      industry: "Technology",
      url: "https://example.com/job1",
      easyMoney: true,
      estimatedValue: 250000
    },
    {
      company: "FinanceHub Inc",
      title: "Digital Transformation Lead",
      description: "Transform our risk assessment with ML",
      location: "New York, NY", 
      industry: "Finance",
      url: "https://example.com/job2",
      easyMoney: false,
      estimatedValue: 850000
    }
  ];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockResults;
}

// Vercel serverless function handler
export default async function handler(req, res) {
  // Enable CORS - matching vercel.json
  const allowedOrigin = 'https://cs123cs61516sc.github.io';
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { keywords } = req.body;
    
    if (!keywords) {
      return res.status(400).json({ error: 'Keywords required' });
    }

    // Search for jobs
    const results = await searchJobs(keywords);
    
    // Score and enrich results
    const opportunities = results.map(job => ({
      ...job,
      score: calculateScore(job),
      minValue: job.estimatedValue * 0.1,
      maxValue: job.estimatedValue,
      stage: 'discovered',
      dateFound: new Date().toISOString()
    }));

    res.status(200).json({
      success: true,
      count: opportunities.length,
      opportunities
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed', 
      message: error.message 
    });
  }
}

function calculateScore(job) {
  let score = 50;
  
  const keywords = ['AI', 'automation', 'machine learning', 'digital transformation'];
  const description = job.description.toLowerCase();
  
  keywords.forEach(keyword => {
    if (description.includes(keyword.toLowerCase())) {
      score += 10;
    }
  });
  
  if (job.easyMoney) {
    score += 20;
  }
  
  return Math.min(score, 100);
}