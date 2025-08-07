# AI Command Center - Production Setup Guide

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│   Frontend      │────▶│   Backend API    │────▶│   Database      │
│   (HTML/JS)     │     │   (Node.js)      │     │   (PostgreSQL)  │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   External APIs     │
                    │  - Indeed           │
                    │  - LinkedIn         │
                    │  - Clearbit         │
                    │  - Google News      │
                    └─────────────────────┘
```

## Quick Start Options

### Option 1: Serverless (Recommended for Start)
Use Vercel or Netlify Functions for API calls without managing servers.

### Option 2: Full Stack
Deploy complete Node.js backend with Express.

## Step 1: Backend API Server

Create `server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { keywords } = req.body;
    
    // Search multiple sources
    const [indeed, linkedin] = await Promise.all([
      searchIndeed(keywords),
      searchLinkedIn(keywords)
    ]);
    
    // Combine and score results
    const opportunities = processResults([...indeed, ...linkedin]);
    
    // Save to database
    await saveOpportunities(opportunities);
    
    res.json({ success: true, count: opportunities.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function searchIndeed(keywords) {
  // Indeed API integration
  const response = await axios.get('https://api.indeed.com/ads/apisearch', {
    params: {
      publisher: process.env.INDEED_API_KEY,
      q: keywords,
      format: 'json',
      limit: 25
    }
  });
  
  return response.data.results.map(job => ({
    company: job.company,
    title: job.jobtitle,
    description: job.snippet,
    location: job.formattedLocation,
    url: job.url,
    source: 'indeed'
  }));
}

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Step 2: Database Schema

```sql
-- opportunities table
CREATE TABLE opportunities (
  id SERIAL PRIMARY KEY,
  company VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  industry VARCHAR(100),
  location VARCHAR(255),
  min_value DECIMAL(10,2),
  max_value DECIMAL(10,2),
  score INTEGER,
  stage VARCHAR(50) DEFAULT 'discovered',
  easy_money BOOLEAN DEFAULT false,
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- guides table
CREATE TABLE guides (
  id SERIAL PRIMARY KEY,
  opportunity_id INTEGER REFERENCES opportunities(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- contacts table
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  opportunity_id INTEGER REFERENCES opportunities(id),
  type VARCHAR(50),
  notes TEXT,
  contacted_at TIMESTAMP DEFAULT NOW()
);
```

## Step 3: API Integrations

### Indeed API
```javascript
// Free tier: 25 queries/day
const INDEED_API = {
  endpoint: 'https://api.indeed.com/ads/apisearch',
  key: process.env.INDEED_API_KEY,
  rateLimit: 25
};
```

### LinkedIn Sales Navigator (via RapidAPI)
```javascript
// Paid: $49/month for 1000 requests
const LINKEDIN_API = {
  endpoint: 'https://linkedin-api.rapidapi.com/search/jobs',
  headers: {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'linkedin-api.rapidapi.com'
  }
};
```

### Company Enrichment (Clearbit)
```javascript
// $99/month for 1000 enrichments
const CLEARBIT_API = {
  endpoint: 'https://company.clearbit.com/v2/companies/find',
  headers: {
    'Authorization': `Bearer ${process.env.CLEARBIT_API_KEY}`
  }
};
```

## Step 4: Frontend Updates

Update the search function in v3:

```javascript
async function runAutomatedSearch() {
  const keywords = document.getElementById('searchKeywords').value;
  
  try {
    const response = await fetch('https://your-api.com/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('apiToken')}`
      },
      body: JSON.stringify({ keywords })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Refresh opportunities list
      await loadOpportunities();
      showNotification(`Found ${data.count} new opportunities!`, 'success');
    }
  } catch (error) {
    showNotification('Search failed: ' + error.message, 'error');
  }
}
```

## Step 5: Deployment

### Using Vercel (Easiest)
1. Install Vercel CLI: `npm i -g vercel`
2. Create `vercel.json`:
```json
{
  "functions": {
    "api/search.js": {
      "maxDuration": 30
    }
  }
}
```
3. Deploy: `vercel --prod`

### Using Heroku
1. Create `Procfile`: `web: node server.js`
2. Deploy:
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

## Step 6: Environment Variables

Create `.env` file:
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
INDEED_API_KEY=your_indeed_key
RAPIDAPI_KEY=your_rapidapi_key
CLEARBIT_API_KEY=your_clearbit_key
JWT_SECRET=your_jwt_secret
```

## Step 7: Security

1. **API Authentication**
   - Add JWT tokens for API access
   - Rate limiting per user
   - IP whitelisting for production

2. **Data Protection**
   - Encrypt sensitive data
   - Regular backups
   - GDPR compliance

## Cost Breakdown

- **Hosting**: $0-20/month (Vercel free tier or Heroku)
- **Database**: $0-15/month (PostgreSQL free tier)
- **APIs**:
  - Indeed: Free (25/day limit)
  - LinkedIn: $49/month
  - Clearbit: $99/month
  - Total: ~$150/month for full features

## Next Steps

1. Sign up for API keys
2. Choose hosting platform
3. Set up database
4. Deploy backend
5. Update frontend to use real API
6. Test with live data

## Support

For questions or issues:
- GitHub: [your-repo]
- Email: [your-email]