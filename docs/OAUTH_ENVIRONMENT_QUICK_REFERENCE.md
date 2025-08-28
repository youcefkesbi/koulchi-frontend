# OAuth Environment Quick Reference

## 🚀 Quick Setup

### Development (`.env.local`)
```bash
VITE_APP_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_VERCEL=0
```

### Production (Vercel Environment Variables)
```bash
VITE_APP_URL=https://koulchi-frontend.vercel.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_VERCEL=1
```

## 🔑 Key Points

- **Callback Path**: Always `/auth/v1/callback` (Supabase's built-in path)
- **Environment Detection**: Automatic via `import.meta.env.PROD`
- **OAuth Credentials**: Managed entirely in Supabase Dashboard
- **URLs**: localhost:3000 (dev) vs koulchi-frontend.vercel.app (prod)
- **Supabase**: Same project for both environments

## 📁 Files

- `docs/env.local.example` → Copy to `.env.local` (dev)
- `docs/env.production.example` → Use for Vercel (prod)
- `src/config/environment.js` → Environment detection
- `src/config/oauth.js` → OAuth configuration

## 🔧 OAuth Setup

### Supabase Dashboard Configuration
1. Go to Authentication → Providers
2. Enable Google OAuth provider
3. Add your Google OAuth app credentials
4. Set redirect URL to: `https://your-project.supabase.co/auth/v1/callback`

### No Frontend OAuth Configuration Needed
- OAuth credentials are managed in Supabase
- Frontend only needs Supabase URL and anon key
- OAuth flow handled entirely by Supabase

## ✅ Validation

The app automatically validates:
- Required Supabase environment variables
- OAuth callback path consistency

## 🐛 Troubleshooting

1. **Check browser console** for environment logs
2. **Verify OAuth provider** configuration in Supabase Dashboard
3. **Ensure correct** environment file names
4. **Test OAuth flow** in both environments

## 📚 Full Documentation

See `OAUTH_ENVIRONMENT_SETUP.md` for complete setup guide.
