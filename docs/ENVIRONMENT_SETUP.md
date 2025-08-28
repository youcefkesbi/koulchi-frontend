# Environment Setup Guide for Koulchi Frontend

This guide explains how to configure environment variables for both development and production environments.

## Overview

The app automatically detects whether it's running in production (Vercel) or development (localhost) and uses the appropriate configuration values.

## Environment Variables

### Required Variables

| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Local project URL | Production project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Local project key | Production project key |
| `VITE_APP_URL` | App base URL | `http://localhost:3000` | Your Vercel domain |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_VERCEL` | Set to `1` in Vercel | Auto-detected |

## Development Setup

### 1. Create Local Environment File

Create a `.env.local` file in your project root:

```bash
# .env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
VITE_APP_URL=http://localhost:3000
VITE_VERCEL=0
```

### 2. Local Supabase Setup

If you're running Supabase locally:

1. Start your local Supabase instance
2. Get the project URL and anon key from your local dashboard
3. Update `.env.local` with these values

### 3. Fallback Values

If no environment variables are set, the app will use these fallbacks for development:
- `VITE_SUPABASE_URL`: `http://localhost:54321`
- `VITE_SUPABASE_ANON_KEY`: `your-local-anon-key`
- `VITE_APP_URL`: `http://localhost:3000`

## Production Setup (Vercel)

### 1. Set Environment Variables in Vercel

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_APP_URL=https://your-app.vercel.app
```

### 2. Supabase Production Configuration

1. Go to your Supabase production project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon public key
4. Add these to Vercel environment variables

### 3. Redirect URIs

In your Supabase production project:

1. Go to Authentication > URL Configuration
2. Set Site URL to your Vercel domain
3. Add redirect URIs:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/reset-password`

## How It Works

### Environment Detection

The app automatically detects the environment:

```javascript
const isProduction = import.meta.env.PROD
const isVercel = import.meta.env.VITE_VERCEL === '1' || 
                 window.location.hostname.includes('vercel.app')

// App URL is automatically determined
const appUrl = isProduction && isVercel 
  ? import.meta.env.VITE_APP_URL || window.location.origin
  : 'http://localhost:3000'
```

### Dynamic Configuration

- **Development**: Uses localhost:3000 and local Supabase
- **Production**: Uses Vercel environment variables
- **Fallback**: Automatically falls back to development values if production variables are missing

### Authentication Flows

All authentication redirects automatically use the correct domain:

- OAuth callbacks
- Password reset emails
- Email confirmations
- Magic link emails

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure `.env.local` is in project root
   - Restart your development server
   - Check Vercel environment variable names

2. **Wrong redirect URLs**
   - Verify `VITE_APP_URL` is set correctly
   - Check Supabase redirect URI configuration
   - Ensure environment detection is working

3. **Supabase connection errors**
   - Verify Supabase URL and key are correct
   - Check if local Supabase is running
   - Ensure production Supabase is accessible

### Debug Mode

In development, the app logs environment configuration to the console. Check the browser console for:

```
Environment Configuration: {
  appUrl: "http://localhost:3000",
  isProduction: false,
  isVercel: false,
  isDevelopment: true,
  isLocalhost: true,
  supabaseUrl: "Configured",
  supabaseAnonKey: "Configured"
}
```

## Security Notes

- Never commit `.env.local` files to version control
- Production environment variables are automatically set by Vercel
- Supabase keys are safe to expose in the browser (they're designed for this)
- The app automatically validates required environment variables

## File Structure

```
koulchi-frontend/
├── src/
│   ├── config/
│   │   ├── environment.js      # Environment detection & configuration
│   │   └── oauth.js           # OAuth configuration
│   └── lib/
│       └── supabase.js        # Supabase client with environment config
├── .env.local                 # Local development variables (create this)
├── env.example               # Example environment file
└── ENVIRONMENT_SETUP.md      # This guide
```
