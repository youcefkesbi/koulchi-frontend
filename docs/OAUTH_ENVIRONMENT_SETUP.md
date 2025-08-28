# OAuth Environment Setup Guide

This guide explains how to configure OAuth for different environments (development vs production) in the Koulchi Frontend application.

## Overview

The OAuth setup has been simplified to support different environment configurations:
- **Development**: Uses `.env.local` with localhost URLs
- **Production**: Uses `.env` (Vercel) with production URLs
- **OAuth**: Handled entirely by Supabase Dashboard - no OAuth credentials needed in frontend

## Environment Variables

### Required Variables (Same for both environments)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### Environment-Specific Variables
- `VITE_APP_URL` - Application URL (differs between dev/prod)

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
# Use the same Supabase project as production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Environment Detection
VITE_VERCEL=0
```

### 3. Configure OAuth in Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Configure Google OAuth:
   - Enable Google provider
   - Add your Google OAuth app credentials
   - Set redirect URL to: `https://your-project.supabase.co/auth/v1/callback`
4. Configure Facebook OAuth (if needed):
   - Enable Facebook provider
   - Add your Facebook OAuth app credentials
   - Set redirect URL to: `https://your-project.supabase.co/auth/v1/callback`

## Production Environment Setup

### 1. Configure Vercel environment variables
Set these variables in your Vercel project settings:

```bash
# App Configuration (Production)
VITE_APP_URL=https://koulchi-frontend.vercel.app

# Supabase Configuration (Production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Environment Detection
VITE_VERCEL=1
```

### 2. OAuth is already configured in Supabase
No additional OAuth configuration needed in production - it uses the same Supabase project as development.

## OAuth Callback Path

**Important**: The OAuth callback path is always `/auth/v1/callback` (Supabase's built-in path).

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
- **OAuth**: Configured in Supabase Dashboard

### Production
- **File**: `.env` (Vercel environment variables)
- **Purpose**: Production deployment with live URLs
- **OAuth**: Same Supabase configuration as development

## Validation

The environment configuration automatically validates:
- Required Supabase variables
- OAuth callback path consistency

## Testing

### Development Testing
1. Start local development server: `npm run dev`
2. Verify OAuth redirects to: `http://localhost:3000/auth/v1/callback`
3. Check browser console for environment validation logs

### Production Testing
1. Deploy to Vercel
2. Verify OAuth redirects to: `https://koulchi-frontend.vercel.app/auth/v1/callback`
3. Check browser console for environment validation logs

## Troubleshooting

### Common Issues

1. **OAuth redirect mismatch**
   - Ensure callback path is exactly `/auth/v1/callback`
   - Verify redirect URIs in Supabase Dashboard

2. **Environment variables not loading**
   - Check file names: `.env.local` for dev, `.env` for prod
   - Verify Vite configuration loads correct environment

3. **OAuth not working**
   - Check OAuth provider configuration in Supabase Dashboard
   - Verify redirect URIs are set correctly in Supabase
   - Ensure OAuth providers are enabled in Supabase

### Debug Mode

Development mode includes debug logging:
```javascript
// Check browser console for environment configuration
console.log('Environment Configuration:', environment)
```

## Security Notes

- Never commit `.env.local` to version control
- Production environment variables should only be in Vercel
- OAuth credentials are managed in Supabase Dashboard (not in frontend)
- No secrets are exposed in frontend code

## Migration from Previous Setup

If migrating from the previous OAuth setup:

1. Remove Google OAuth credentials from environment files
2. Configure OAuth providers in Supabase Dashboard
3. Ensure callback path is `/auth/v1/callback`
4. Test OAuth flow in both environments

## Support

For issues with this setup:
1. Check environment validation logs
2. Verify OAuth provider configuration in Supabase Dashboard
3. Test with minimal OAuth setup
4. Check Supabase OAuth settings

## Key Benefits

1. **Simplified Configuration**: Only 3 environment variables needed
2. **Secure**: No OAuth credentials in frontend code
3. **Centralized**: OAuth managed entirely by Supabase
4. **Consistent**: Same Supabase project for both environments
5. **Maintainable**: Less configuration to manage and update
