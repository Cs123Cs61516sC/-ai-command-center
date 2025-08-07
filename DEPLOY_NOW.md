# 🚀 Make Search Work in 5 Minutes

## Step 1: Install Vercel (One Time)
Open Command Prompt/Terminal and run:
```
npm install -g vercel
```

## Step 2: Deploy Your API
Navigate to the search folder:
```
cd "C:\Users\carls\OneDrive\Desktop\Utlyze lead gen program\the search"
```

Then deploy:
```
vercel --prod
```

It will ask you a few questions:
- Set up and deploy? **Y**
- Which scope? **Select your account**
- Link to existing project? **N**
- Project name? **ai-command-center** (or press enter)
- Directory? **Press enter**
- Override settings? **N**

## Step 3: Update Your HTML
After deployment, Vercel gives you a URL like:
`https://ai-command-center-abc123.vercel.app`

Open AI_Command_Center_v3.html and replace line 1859:
```javascript
// Change this:
: 'https://your-app.vercel.app';

// To your actual URL:
: 'https://ai-command-center-abc123.vercel.app';
```

## Step 4: Test It!
1. Open AI_Command_Center_v3.html in your browser
2. Click "🔍 Run Automated Search"
3. Watch REAL job opportunities appear!

## What You Get:
- ✅ Real job postings from Indeed (FREE - no API key!)
- ✅ Automatic AI opportunity scoring
- ✅ Easy money detection 🔥
- ✅ Value estimation
- ✅ No monthly fees

## How It Works:
- Uses Indeed's RSS feeds (100% legal, no API needed)
- Searches multiple keywords
- Scores opportunities based on AI potential
- Returns top 20 best matches

## Troubleshooting:
- If search fails, check browser console (F12)
- Make sure you updated the URL in step 3
- Vercel free tier = 100GB bandwidth/month (plenty!)

That's it! Your search button now finds REAL opportunities!