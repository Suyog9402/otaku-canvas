# 🚀 Vercel Deployment Guide for OtakuCanvas

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Gemini API Key**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🔧 Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 1.2 Verify Files
Make sure these files are in your repository:
- ✅ `vercel.json` (Vercel configuration)
- ✅ `package.json` (with Vercel scripts)
- ✅ `next.config.js` (Next.js configuration)
- ✅ `app/` directory (Next.js app router)
- ✅ `components/` directory
- ✅ `lib/` directory

## 🌐 Step 2: Deploy to Vercel

### 2.1 Connect Repository
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Select your `OtakuCanvas` repository

### 2.2 Configure Project
- **Project Name**: `otaku-canvas` (or your preferred name)
- **Framework Preset**: Next.js (should auto-detect)
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

### 2.3 Environment Variables
Add these environment variables in Vercel dashboard:

```
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

**How to add environment variables:**
1. In your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key
   - **Environment**: Production, Preview, Development

## 🔄 Step 3: Backend Strategy

Since Vercel is primarily for frontend deployment, you have two options:

### Option A: Use Vercel API Routes (Recommended)
Your Next.js API routes in `app/api/` will work directly on Vercel:
- ✅ `/api/comic/generate` - Comic generation
- ✅ `/api/comic/share` - Share functionality
- ✅ `/api/characters` - Character management

### Option B: Deploy Backend Separately
If you need the Python backend:
1. Deploy to **Railway**, **Render**, or **Heroku**
2. Update API URLs in your frontend code
3. Use the deployed backend URL

## 🎯 Step 4: Deploy

### 4.1 Deploy
1. Click **"Deploy"** in Vercel dashboard
2. Wait for build to complete (2-3 minutes)
3. Your app will be live at `https://your-app-name.vercel.app`

### 4.2 Verify Deployment
Test these features:
- ✅ Home page loads
- ✅ Sample stories work
- ✅ Comic generation works
- ✅ Export functionality works
- ✅ Demo mode works

## 🔧 Step 5: Post-Deployment Configuration

### 5.1 Update API URLs (if needed)
If you deployed backend separately, update these files:
- `app/api/comic/generate/route.ts`
- `app/api/comic/share/route.ts`

### 5.2 Test All Features
1. **Sample Stories**: Try all 10 sample stories
2. **Custom Stories**: Test with your own story
3. **Export**: Test PDF and image export
4. **Demo Mode**: Test the demo toggle
5. **Character Upload**: Test character reference upload

## 🚨 Troubleshooting

### Common Issues:

#### 1. Build Fails
```bash
# Check for TypeScript errors
npm run lint

# Check for missing dependencies
npm install
```

#### 2. API Routes Not Working
- Verify environment variables are set
- Check Vercel function logs
- Ensure API routes are in `app/api/` directory

#### 3. Images Not Loading
- Check if image URLs are correct
- Verify CORS settings
- Check network requests in browser dev tools

#### 4. Gemini API Errors
- Verify `GEMINI_API_KEY` is set correctly
- Check API quota limits
- Test API key in Google AI Studio

## 📊 Step 6: Monitor and Optimize

### 6.1 Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor performance metrics
- Track user engagement

### 6.2 Performance Optimization
- Use Vercel's Edge Functions for faster API responses
- Optimize images with Next.js Image component
- Enable Vercel's CDN for static assets

## 🎉 Success Checklist

- ✅ Repository pushed to GitHub
- ✅ Vercel project created and connected
- ✅ Environment variables configured
- ✅ Deployment successful
- ✅ All features working
- ✅ Sample stories generating comics
- ✅ Export functionality working
- ✅ Demo mode functional
- ✅ Performance optimized

## 🔗 Your Live App

Once deployed, your app will be available at:
`https://your-app-name.vercel.app`

## 📱 Share Your Success

Your hackathon judges can now access your live comic generator at the Vercel URL! The app includes:
- 10 diverse sample stories
- Professional comic generation
- Character consistency
- Export and share functionality
- Demo mode for presentations

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally first
4. Check GitHub repository for latest changes

**Your professional comic generator is now live and ready to win the hackathon! 🏆**
