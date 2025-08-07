# AI COMMAND CENTER V3 - COMPLETE PROJECT BACKUP
Generated: 2025-07-04

## 1. CURRENT SITUATION

### Project Overview
- **Project Name**: AI Opportunity Command Center v3
- **Purpose**: Lead generation tool for finding companies that need AI automation services
- **Status**: Deployed but experiencing API connectivity issues

### Deployment Details
- **Frontend (HTML)**: Deployed to GitHub Pages
  - URL: https://cs123cs61516sc.github.io/-ai-command-center/
  - File: AI_Command_Center_v3.html
  
- **Backend (API)**: Deployed to Vercel
  - URL: https://the-search-21oevorjr-carl-stephens-projects.vercel.app
  - Endpoints: /api/search and /api/search-real

### Features
- 20 pre-loaded companies with detailed guides
- Real-time job search via Indeed RSS feeds
- AI opportunity scoring system
- Easy Money indicator for quick wins
- Outreach script generation
- Dark/Light mode toggle
- Export capabilities (PDF, CSV)

## 2. THE TWO PROBLEMS

### Problem 1: CORS (Cross-Origin Resource Sharing)
- **Issue**: Browser blocks API calls from GitHub Pages to Vercel
- **Error**: "CORS policy: No 'Access-Control-Allow-Origin' header"
- **Cause**: Frontend and backend are on different domains
- **Current Config**: vercel.json has CORS headers but they may not be applying correctly

### Problem 2: 404 Not Found
- **Issue**: The /api/search-real endpoint returns 404
- **Error**: "Failed to fetch", "404 Not Found"
- **Possible Causes**:
  - API file not deployed properly
  - Vercel routing misconfiguration
  - File structure issue

## 3. ALL FILES AND PATHS

### Main Project Directory
`/mnt/c/Users/carls/OneDrive/Desktop/Utlyze lead gen program/the search/`

### Core Files
```
AI_Command_Center_v3.html      # Main frontend file
vercel.json                    # Vercel configuration
package.json                   # Node.js dependencies
api/
  ├── search.js               # Basic search endpoint
  └── search-real.js          # Real job search with Indeed RSS
public/
  └── index.html              # Vercel landing page
```

### Company Guides Directory
`/mnt/c/Users/carls/OneDrive/Desktop/Utlyze lead gen program/the leads/claudeTry/`

### All 20 Company Guides
1. Addepar_ADM_Solutions_Consultant_Guide.html
2. CaseWorthy_Solutions_Consultant_Guide.html
3. Coesia_Flexlink_Sales_Engineer_Guide.html
4. Deloitte_Dynamics_CRM_Consultant_Guide.html
5. Eide_Bailly_Solutions_Consultant_CRM_Guide.html
6. Fuchs_Lubricants_Sales_Service_Engineer_Guide.html
7. Gong_Professional_Services_Consultant_Guide.html
8. Mashura_Veterinary_Implementation_Consultant_Guide.html
9. Mountain_America_Credit_Union_CRM_Solutions_Architect_Guide.html
10. Protiviti_Adobe_Experience_Senior_Consultant_Guide.html
11. PwC_Oracle_Field_Service_Consultant_Guide.html
12. RLDatix_Sales_Engineer_Guide.html
13. RainFocus_Solutions_Consultant_Guide.html
14. Red_Pepper_Software_Sr_Technical_Implementation_Consultant_Guide.html
15. SSC_Salentica_CRM_Solutions_Consultant_Guide.html
16. Salesforce_Pre_Sales_Consultant_Admin_Guide.html
17. Silac_Insurance_Solutions_Architect_Guide.html
18. Solventum_Implementation_Consultant_Guide.html
19. Workday_Solution_Consulting_Enablement_Lead_Guide.html
20. Zions_Bancorp_Salesforce_Solutions_Architect_Guide.html

### Supporting Files
- AI_Projects_Strategic_Ranking_Analysis.html
- AI_Ranking.html
- COMMAND_CENTER_USER_GUIDE.md
- DEPLOY_NOW.md
- Production_Setup_Guide.md

## 4. TECHNICAL DETAILS

### API Configuration (search-real.js)
```javascript
// Main handler with CORS
module.exports = async (req, res) => {
  const allowedOrigin = 'https://cs123cs61516sc.github.io';
  
  // Handle preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  // ... rest of handler
}
```

### Frontend API Call (AI_Command_Center_v3.html)
```javascript
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://the-search-21oevorjr-carl-stephens-projects.vercel.app';

const response = await fetch(`${API_BASE}/api/search-real`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ keywords })
});
```

### Vercel Configuration (vercel.json)
```json
{
  "functions": {
    "api/search.js": { "maxDuration": 30 },
    "api/search-real.js": { "maxDuration": 30 }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://cs123cs61516sc.github.io" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/", "destination": "/public/index.html" }
  ]
}
```

### Package Dependencies
```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.11.3",
    "rss-parser": "^3.13.0"
  }
}
```

## 5. WHAT NEEDS TO BE DONE

### Step 1: Verify API Endpoint Exists
```bash
# Test if endpoint is accessible
curl https://the-search-21oevorjr-carl-stephens-projects.vercel.app/api/search-real

# Should return:
# {"status":"API is working!","message":"Use POST method to search","cors":"Configured for..."}
```

### Step 2: Fix CORS Headers
1. The vercel.json CORS config might be conflicting with the code-level headers
2. Consider removing vercel.json headers and relying only on code headers
3. Or ensure they match exactly

### Step 3: Debug Deployment
1. Check Vercel dashboard for deployment logs
2. Verify file structure matches Vercel's expectations
3. Ensure api/ folder is at root level

### Step 4: Test Thoroughly
1. Test GET request first (should work)
2. Test OPTIONS preflight
3. Test POST request with proper headers
4. Check browser console for detailed errors

## 6. QUICK FIX ATTEMPTS

### Option 1: Simplify CORS
Remove headers from vercel.json and rely only on code:
```javascript
// In search-real.js
res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins temporarily
```

### Option 2: Test Direct API
Visit directly in browser:
https://the-search-21oevorjr-carl-stephens-projects.vercel.app/api/search-real

### Option 3: Check Vercel Logs
```bash
vercel logs https://the-search-21oevorjr-carl-stephens-projects.vercel.app
```

## 7. ALTERNATIVE SOLUTIONS

### If API Cannot Be Fixed
1. **Proxy Server**: Use a CORS proxy service
2. **Netlify Functions**: Deploy API to Netlify instead
3. **GitHub Actions**: Use GitHub Actions as a serverless function
4. **Static Data**: Pre-generate opportunity data and serve as JSON

### Emergency Fallback
The app already has 20 pre-loaded companies, so basic functionality works without the API.

## 8. CONTACT & RESOURCES

### Deployment URLs
- Frontend: https://cs123cs61516sc.github.io/-ai-command-center/
- Backend: https://the-search-21oevorjr-carl-stephens-projects.vercel.app
- API Test: https://the-search-21oevorjr-carl-stephens-projects.vercel.app/api/search-real

### Key Technologies
- Frontend: Pure HTML/CSS/JavaScript (no framework)
- Backend: Node.js with Vercel Functions
- Data Source: Indeed RSS feeds (no API key needed)
- Deployment: GitHub Pages + Vercel

### Error Tracking
- CORS errors appear in browser console (F12)
- 404 errors indicate endpoint not found
- Network tab shows full request/response details

## 9. RECOVERY PLAN

If everything fails:
1. The app works with 20 pre-loaded companies
2. Can manually add more companies via the interface
3. Export functionality still works (PDF/CSV)
4. All guides are accessible locally

This backup contains everything needed to understand, debug, and restore the project.