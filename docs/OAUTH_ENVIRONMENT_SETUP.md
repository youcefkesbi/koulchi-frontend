# OAuth Environment Setup

This guide explains how to configure OAuth for different environments in the Koulchi Frontend application.

## Overview

The OAuth setup supports different environment configurations:
- **Development**: Uses `.env.local` with localhost URLs
- **Production**: Uses Vercel environment variables with production URLs
- **OAuth**: Handled entirely by Supabase Dashboard

## Environment Variables

### Required Variables (Same for both environments)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### Environment-Specific Variables
- `VITE_APP_URL` - Application URL (differs between dev/prod)

## Development Environment Setup

### 1. Create `.env.local` file
```bash
cp docs/env.local.example .env.local
```

### 2. Configure development values
```bash
VITE_APP_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_VERCEL=0
```

### 3. Configure OAuth in Supabase Dashboard
1. Go to Authentication → Providers
2. Enable Google OAuth provider
3. Add your Google OAuth app credentials
4. Set redirect URL to: `https://your-project.supabase.co/auth/v1/callback`

## Production Environment Setup

### 1. Configure Vercel environment variables
```bash
VITE_APP_URL=https://koulchi-frontend.vercel.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_VERCEL=1
```

## OAuth Callback Path

The OAuth callback path is always `/auth/v1/callback` (Supabase's built-in path).

## Testing

### Development Testing
```bash
npm run dev
# Verify OAuth redirects to: http://localhost:3000/auth/v1/callback
```

### Production Testing
```bash
npm run build
# Deploy to Vercel
# Verify OAuth redirects to: https://koulchi-frontend.vercel.app/auth/v1/callback
```

## Troubleshooting

### Common Issues
1. **OAuth redirect mismatch**
   - Ensure callback path is exactly `/auth/v1/callback`
   - Verify redirect URIs in Supabase Dashboard

2. **Environment variables not loading**
   - Check file names: `.env.local` for dev, `.env` for prod

3. **OAuth not working**
   - Check OAuth provider configuration in Supabase Dashboard
   - Verify redirect URIs are set correctly in Supabase

## Key Benefits

1. **Simplified Configuration**: Only 3 environment variables
2. **Enhanced Security**: No OAuth credentials in frontend code
3. **Centralized Management**: OAuth handled entirely by Supabase
4. **Consistent Behavior**: Same Supabase project for both environments
