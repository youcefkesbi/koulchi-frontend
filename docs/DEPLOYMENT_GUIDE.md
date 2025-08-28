# Deployment Guide

This guide explains how to deploy the Koulchi Frontend application to Vercel.

## Prerequisites

- GitHub repository with your code
- Vercel account
- Supabase project configured

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository and click "Deploy"

### 2. Configure Environment Variables

Set these environment variables in Vercel:

```bash
VITE_APP_URL=https://koulchi-frontend.vercel.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_VERCEL=1
```

### 3. Build Configuration

Vercel automatically detects Vue.js and configures:
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Your app will be available at the provided URL

## Post-Deployment

### 1. Test OAuth Flow
- Verify OAuth redirects to: `https://koulchi-frontend.vercel.app/auth/v1/callback`
- Test Google and Facebook OAuth login

### 2. Check Environment Variables
- Verify all environment variables are set correctly
- Check browser console for any errors

### 3. Monitor Performance
- Use Vercel Analytics to monitor performance
- Check for any build or runtime errors

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Troubleshooting

### Build Failures
- Check build logs in Vercel
- Verify all dependencies are in `package.json`
- Ensure build command works locally

### Environment Variables
- Verify all required variables are set
- Check variable names match exactly
- Restart deployment after variable changes

### OAuth Issues
- Verify redirect URIs in Supabase Dashboard
- Check OAuth provider configuration
- Test OAuth flow in development first

## Automatic Deployments

Vercel automatically deploys on:
- Push to main branch
- Pull request creation
- Manual deployment trigger

## Rollback

To rollback to a previous deployment:
1. Go to your project in Vercel
2. Click on "Deployments"
3. Find the previous deployment
4. Click "Promote to Production"

## Support

For deployment issues:
1. Check Vercel build logs
2. Verify environment configuration
3. Test locally before deploying
4. Check Vercel documentation
