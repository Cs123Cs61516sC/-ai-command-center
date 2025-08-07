# Deployment Instructions

## Quick Deploy to Vercel (5 minutes)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd "/mnt/c/Users/carls/OneDrive/Desktop/Utlyze lead gen program/the search"
   vercel --prod
   ```

3. **Update Frontend**
   - Replace `https://your-app.vercel.app` in AI_Command_Center_v3.html
   - With your actual Vercel URL

## API Keys Needed

1. **Indeed API** (Free - 25 searches/day)
   - Sign up: https://ads.indeed.com/jobroll/xmlfeed
   - Add to Vercel environment: `INDEED_API_KEY`

2. **RapidAPI LinkedIn** ($49/month)
   - Sign up: https://rapidapi.com/rockapis/api/linkedin-api2/
   - Add: `RAPIDAPI_KEY`

3. **Clearbit** ($99/month for enrichment)
   - Sign up: https://clearbit.com/
   - Add: `CLEARBIT_API_KEY`

## Cost Estimate
- **Free**: Indeed API (limited)
- **Starter**: $49/month (LinkedIn access)
- **Professional**: $150/month (full features)

## Ready to go live?
Update line 1839 in AI_Command_Center_v3.html with your Vercel URL!