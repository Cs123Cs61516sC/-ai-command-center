export default async function handler(req, res) {
  // CORS headers for GitHub Pages
  const origin = 'https://cs123cs61516sc.github.io';
  
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Mock opportunities for testing
  const mockOpportunities = [
    {
      id: Date.now() + 1,
      company: "TechCorp Solutions",
      title: "Process Automation Needed",
      description: "Looking for consultants to automate our manual workflows",
      type: "direct",
      score: 85,
      minValue: 50000,
      maxValue: 250000,
      stage: "discovered",
      industry: "Technology",
      easyMoney: true,
      location: "San Francisco, CA"
    },
    {
      id: Date.now() + 2,
      company: "Global Finance Ltd",
      title: "Digital Transformation Initiative",
      description: "Seeking AI solutions for risk assessment automation",
      type: "direct",
      score: 78,
      minValue: 100000,
      maxValue: 500000,
      stage: "discovered",
      industry: "Finance",
      easyMoney: false,
      location: "New York, NY"
    },
    {
      id: Date.now() + 3,
      company: "Healthcare Plus",
      title: "Efficiency Consultant",
      description: "Need to streamline patient intake process with AI",
      type: "direct",
      score: 82,
      minValue: 75000,
      maxValue: 300000,
      stage: "discovered",
      industry: "Healthcare",
      easyMoney: true,
      location: "Boston, MA"
    }
  ];
  
  return res.status(200).json({
    success: true,
    count: mockOpportunities.length,
    opportunities: mockOpportunities,
    message: "Mock data - replace with real Indeed search"
  });
}