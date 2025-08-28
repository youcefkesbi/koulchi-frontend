# OAuth Environment Quick Reference

## 🚀 Quick Setup

### Development (`.env.local`)
```bash
VITE_APP_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-dev-client-id
VITE_GOOGLE_CLIENT_SECRET=your-dev-client-secret
VITE_VERCEL=0
```

### Production (Vercel Environment Variables)
```bash
VITE_APP_URL=https://your-app.vercel.app
VITE_GOOGLE_CLIENT_ID=your-prod-client-id
VITE_GOOGLE_CLIENT_SECRET=your-prod-client-secret
VITE_VERCEL=1
```

## 🔑 Key Points

- **Callback Path**: Fixed as `/auth/v1/callback` for both environments
- **Environment Detection**: Automatic via `import.meta.env.PROD`
- **OAuth Credentials**: Different apps for dev vs prod
- **URLs**: localhost:3000 (dev) vs your-app.vercel.app (prod)

## 📁 Files

- `docs/env.local.example` → Copy to `.env.local` (dev)
- `docs/env.production.example` → Use for Vercel (prod)
- `src/config/environment.js` → Environment detection
- `src/config/oauth.js` → OAuth configuration

## 🔧 OAuth App Setup

### Development Redirect URIs
- `http://localhost:3000/auth/v1/callback`
- `http://localhost:54321/auth/v1/callback`

### Production Redirect URIs
- `https://your-app.vercel.app/auth/v1/callback`
- `https://your-project.supabase.co/auth/v1/callback`

## ✅ Validation

The app automatically validates:
- Required environment variables
- OAuth credentials
- Callback path consistency

## 🐛 Troubleshooting

1. **Check browser console** for environment logs
2. **Verify OAuth app** redirect URIs
3. **Ensure correct** environment file names
4. **Test OAuth flow** in both environments

## 📚 Full Documentation

See `OAUTH_ENVIRONMENT_SETUP.md` for complete setup guide.
