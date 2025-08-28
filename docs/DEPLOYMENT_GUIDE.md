# Deployment Guide for Koulchi Frontend

This guide explains how to deploy your Koulchi Frontend app to Vercel with proper environment configuration.

## Prerequisites

- [Vercel account](https://vercel.com/signup)
- [GitHub/GitLab/Bitbucket repository](https://github.com) with your code
- [Supabase production project](https://supabase.com) configured

## Step 1: Prepare Your Repository

### 1.1 Environment Files

Ensure your repository has the following files:
- `env.example` - Example environment variables
- `.gitignore` - Should include `.env.local` and other sensitive files
- `vercel.json` - Vercel configuration (already created)

### 1.2 Commit and Push

```bash
git add .
git commit -m "Add environment configuration and deployment setup"
git push origin main
```

## Step 2: Deploy to Vercel

### 2.1 Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select the repository containing your Koulchi Frontend code

### 2.2 Configure Build Settings

Vercel should automatically detect your Vue.js project. Verify these settings:

- **Framework Preset**: Vue.js
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.3 Set Environment Variables

Before deploying, set these environment variables in Vercel:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

#### Required Variables

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Production |
| `VITE_SUPABASE_ANON_KEY` | `your-production-anon-key` | Production |
| `VITE_APP_URL` | `https://your-app.vercel.app` | Production |

#### Optional Variables

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_VERCEL` | `1` | Production |

### 2.4 Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at the provided URL

## Step 3: Configure Supabase Production

### 3.1 Update Site URL

1. Go to your Supabase production project dashboard
2. Navigate to **Authentication** > **URL Configuration**
3. Set **Site URL** to your Vercel domain (e.g., `https://your-app.vercel.app`)

### 3.2 Add Redirect URIs

Add these redirect URIs in your Supabase project:

1. Go to **Authentication** > **URL Configuration**
2. Add these URLs to **Redirect URLs**:

```
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/reset-password
```

### 3.3 Verify OAuth Providers

If using Google/Facebook OAuth:

1. Go to **Authentication** > **Providers**
2. Ensure your OAuth app redirect URIs include:
   - `https://your-app.vercel.app/auth/callback`

## Step 4: Test Your Deployment

### 4.1 Basic Functionality

1. Visit your deployed app
2. Test basic navigation
3. Verify Supabase connection

### 4.2 Authentication Flows

1. **Sign Up**: Create a new account
2. **Email Confirmation**: Check if confirmation emails work
3. **OAuth**: Test Google/Facebook login
4. **Password Reset**: Test password reset flow

### 4.3 Environment Detection

Open browser console and look for:

```
🔍 Environment Diagnostics
Environment: {isProduction: true, isVercel: true, ...}
Configuration: {appUrl: "https://your-app.vercel.app", ...}
Feature Support: {authentication: true, oauth: true, ...}
```

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain

1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### 5.2 Update Environment Variables

After adding a custom domain:

1. Update `VITE_APP_URL` in Vercel environment variables
2. Update Supabase Site URL and redirect URIs
3. Redeploy if necessary

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading

**Symptoms**: App shows "Environment validation failed" errors

**Solutions**:
- Verify environment variables are set in Vercel
- Check variable names (must start with `VITE_`)
- Ensure variables are set for Production environment
- Redeploy after adding variables

#### 2. Supabase Connection Errors

**Symptoms**: Authentication fails, database errors

**Solutions**:
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check Supabase project is active
- Ensure production Supabase is accessible
- Verify Site URL and redirect URIs in Supabase

#### 3. Wrong Redirect URLs

**Symptoms**: OAuth flows redirect to wrong domain

**Solutions**:
- Update `VITE_APP_URL` in Vercel
- Update Supabase redirect URIs
- Clear browser cache and cookies
- Check environment detection in console

#### 4. Build Failures

**Symptoms**: Vercel build fails

**Solutions**:
- Check build logs for specific errors
- Verify all dependencies are in `package.json`
- Ensure Node.js version compatibility
- Check for syntax errors in code

### Debug Mode

In development, the app automatically runs environment diagnostics. In production:

1. Open browser console
2. Look for environment logs
3. Check for any error messages
4. Verify environment detection is working

## Environment Variables Reference

### Development (.env.local)

```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
VITE_APP_URL=http://localhost:3000
VITE_VERCEL=0
```

### Production (Vercel)

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_APP_URL=https://your-app.vercel.app
VITE_VERCEL=1
```

## Security Best Practices

1. **Never commit sensitive files**:
   - `.env.local`
   - `.env.production`
   - API keys or secrets

2. **Use Vercel environment variables** for production secrets

3. **Regularly rotate** Supabase API keys

4. **Monitor** your Supabase usage and limits

5. **Enable** Supabase Row Level Security (RLS) policies

## Monitoring and Maintenance

### 1. Vercel Analytics

Enable Vercel Analytics to monitor:
- Page views and performance
- User behavior
- Error rates

### 2. Supabase Monitoring

Monitor your Supabase project:
- Database performance
- Authentication usage
- API rate limits

### 3. Regular Updates

Keep dependencies updated:
```bash
npm audit
npm update
npm run build
```

## Support

If you encounter issues:

1. Check the [Environment Setup Guide](./ENVIRONMENT_SETUP.md)
2. Review Vercel build logs
3. Check Supabase project status
4. Verify environment variable configuration
5. Test locally with production values

## Next Steps

After successful deployment:

1. Set up monitoring and analytics
2. Configure custom domain (if desired)
3. Set up CI/CD pipeline
4. Implement error tracking
5. Set up performance monitoring
