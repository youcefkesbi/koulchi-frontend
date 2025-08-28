# OAuth Environment Setup Guide

This guide explains how to configure OAuth for different environments (development vs production) in the Koulchi Frontend application.

## Overview

The OAuth setup has been refactored to support different environment configurations:
- **Development**: Uses `.env.local` with localhost URLs and development OAuth credentials
- **Production**: Uses `.env` (Vercel) with production URLs and production OAuth credentials

## Environment Variables

### Core Variables (Same for both environments)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### Environment-Specific Variables
- `VITE_APP_URL` - Application URL (differs between dev/prod)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (differs between dev/prod)
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret (differs between dev/prod)

## Development Environment Setup

### 1. Create `.env.local` file
Copy `docs/env.local.example` to `.env.local` in your project root:

```bash
cp docs/env.local.example .env.local
```

### 2. Configure development values
```bash
# App Configuration (Development)
VITE_APP_URL=http://localhost:3000

# Supabase Configuration (Development)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-supabase-anon-key

# OAuth Configuration (Development)
VITE_GOOGLE_CLIENT_ID=your-development-google-oauth-client-id
VITE_GOOGLE_CLIENT_SECRET=your-development-google-oauth-client-secret

# Environment Detection
VITE_VERCEL=0
```

### 3. Set up development OAuth app
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/v1/callback`
   - `http://localhost:54321/auth/v1/callback` (for local Supabase)

## Production Environment Setup

### 1. Configure Vercel environment variables
Set these variables in your Vercel project settings:

```bash
# App Configuration (Production)
VITE_APP_URL=https://your-app.vercel.app

# Supabase Configuration (Production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-supabase-anon-key

# OAuth Configuration (Production)
VITE_GOOGLE_CLIENT_ID=your-production-google-oauth-client-id
VITE_GOOGLE_CLIENT_SECRET=your-production-google-oauth-client-secret

# Environment Detection
VITE_VERCEL=1
```

### 2. Set up production OAuth app
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-app.vercel.app/auth/v1/callback`
   - `https://your-project.supabase.co/auth/v1/callback`

## OAuth Callback Path

**Important**: The OAuth callback path is fixed as `/auth/v1/callback` for both environments.

This ensures consistency between development and production OAuth flows.

## Environment Detection

The application automatically detects the environment:

- **Development**: `import.meta.env.PROD = false`
- **Production**: `import.meta.env.PROD = true`
- **Vercel**: `import.meta.env.VITE_VERCEL = '1'`

## Configuration Files

### Development
- **File**: `.env.local`
- **Purpose**: Local development with localhost URLs
- **OAuth**: Development OAuth app credentials

### Production
- **File**: `.env` (Vercel environment variables)
- **Purpose**: Production deployment with live URLs
- **OAuth**: Production OAuth app credentials

## Validation

The environment configuration automatically validates:
- Required Supabase variables
- Required OAuth variables
- OAuth callback path consistency

## Testing

### Development Testing
1. Start local development server: `npm run dev`
2. Verify OAuth redirects to: `http://localhost:3000/auth/v1/callback`
3. Check browser console for environment validation logs

### Production Testing
1. Deploy to Vercel
2. Verify OAuth redirects to: `https://your-app.vercel.app/auth/v1/callback`
3. Check browser console for environment validation logs

## Troubleshooting

### Common Issues

1. **OAuth redirect mismatch**
   - Ensure callback path is exactly `/auth/v1/callback`
   - Verify redirect URIs in Google Cloud Console

2. **Environment variables not loading**
   - Check file names: `.env.local` for dev, `.env` for prod
   - Verify Vite configuration loads correct environment

3. **OAuth credentials error**
   - Ensure correct client ID/secret for each environment
   - Verify OAuth app is properly configured in Google Cloud Console

### Debug Mode

Development mode includes debug logging:
```javascript
// Check browser console for environment configuration
console.log('Environment Configuration:', environment)
```

## Security Notes

- Never commit `.env.local` to version control
- Production OAuth credentials should only be in Vercel environment variables
- OAuth client secrets are sensitive - keep them secure
- Use different OAuth apps for development and production

## Migration from Previous Setup

If migrating from the previous OAuth setup:

1. Update environment variables to include OAuth credentials
2. Ensure callback path is `/auth/v1/callback`
3. Test OAuth flow in both environments
4. Update OAuth app redirect URIs if necessary

## Support

For issues with this setup:
1. Check environment validation logs
2. Verify OAuth app configuration
3. Test with minimal OAuth setup
4. Check Supabase OAuth settings
