# OAuth Branding for Koulchi Frontend

## 🎯 **What This Solves**

Your OAuth consent screens currently show:
- ❌ "to continue to my VITE_SUPABASE_URL"
- ❌ "You're signing back in to my VITE_SUPABASE_URL"

After configuration, they will show:
- ✅ "to continue to Koulchi"
- ✅ "You're signing back in to Koulchi"

## 📚 **Documentation Overview**

### **Essential Guides**
- **[`OAUTH_BRANDING_GUIDE.md`](./OAUTH_BRANDING_GUIDE.md)** - Complete step-by-step configuration
- **[`OAUTH_BRANDING_QUICK_REFERENCE.md`](./OAUTH_BRANDING_QUICK_REFERENCE.md)** - Quick 3-step fix
- **[`OAUTH_BRANDING_TROUBLESHOOTING.md`](./OAUTH_BRANDING_TROUBLESHOOTING.md)** - Debug and fix issues

### **Environment Setup**
- **[`OAUTH_ENVIRONMENT_SETUP.md`](./OAUTH_ENVIRONMENT_SETUP.md)** - Complete environment configuration guide
- **[`OAUTH_ENVIRONMENT_QUICK_REFERENCE.md`](./OAUTH_ENVIRONMENT_QUICK_REFERENCE.md)** - Quick environment setup reference

### **Setup & Deployment**
- **[`ENVIRONMENT_SETUP.md`](./ENVIRONMENT_SETUP.md)** - Environment configuration
- **[`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)** - Vercel deployment
- **[`OAUTH_BRANDING_SUMMARY.md`](./OAUTH_BRANDING_SUMMARY.md)** - Complete solution overview

### **Scripts**
- **[`scripts/setup-oauth-branding.sh`](./scripts/setup-oauth-branding.sh)** - Interactive setup script
- **[`scripts/setup-dev.sh`](./scripts/setup-dev.sh)** - Development environment setup

## 🚀 **Quick Start**

### **Option 1: Interactive Setup (Recommended)**
```bash
# Run the interactive setup script
./scripts/setup-oauth-branding.sh

# Follow the checklist and configure your OAuth providers
```

### **Option 2: Manual Configuration**
1. **Supabase**: Change Project Name to "Koulchi"
2. **Google OAuth**: Update Application name to "Koulchi"
3. **Facebook OAuth**: Update App Display Name to "Koulchi"
4. **Test**: Verify "Koulchi" appears in consent screens

## 🔧 **What Needs to Be Configured**

### **1. Environment Setup**
- **Development**: Create `.env.local` with development OAuth credentials
- **Production**: Configure Vercel environment variables with production OAuth credentials
- **Callback Path**: Fixed as `/auth/v1/callback` for both environments

### **2. Supabase Project**
- Project Name: `Koulchi`
- Site URL: Your app domain
- Redirect URLs: `[your-domain]/auth/v1/callback`

### **3. Google OAuth App**
- Application name: `Koulchi`
- Application home page: Your app domain
- Redirect URIs: Include both dev and production
  - Development: `http://localhost:3000/auth/v1/callback`
  - Production: `https://your-app.vercel.app/auth/v1/callback`

### **4. Facebook OAuth App**
- App Display Name: `Koulchi`
- App Description: Your app description
- Redirect URIs: Include both dev and production
  - Development: `http://localhost:3000/auth/v1/callback`
  - Production: `https://your-app.vercel.app/auth/v1/callback`

## 🧪 **Testing**

### **Development**
```bash
npm run dev
# Visit http://localhost:3000
# Try Google/Facebook OAuth
# Verify "Koulchi" appears
```

### **Production**
```bash
npm run build
# Deploy to Vercel
# Test OAuth flows
# Verify "Koulchi" appears
```

## 🔍 **Verification**

### **Environment Detection**
Check browser console for:
```
🔍 Environment Diagnostics
Environment: {isProduction: false, isVercel: false, ...}
Configuration: {appUrl: "http://localhost:3000", ...}
Feature Support: {authentication: true, oauth: true, ...}
```

### **OAuth Consent Screen**
- Should show "Koulchi" instead of Supabase URLs
- App name should be consistent across all providers
- No sensitive URLs should be visible

## 🐛 **Common Issues**

### **Still showing Supabase URL**
1. Clear browser cache and cookies
2. Wait 5-10 minutes for changes to propagate
3. Verify all configuration changes are saved
4. Check redirect URI format matches exactly

### **OAuth flow breaks**
1. Verify redirect URIs in both Supabase and OAuth providers
2. Check Site URL configuration
3. Ensure OAuth app is in production mode
4. Verify environment detection is working

## 🔒 **Security Features**

- Environment variables never committed to Git
- Supabase URLs never exposed in UI
- OAuth redirect URIs automatically generated and validated
- App branding controlled by OAuth provider settings
- Environment detection prevents configuration errors
- **New**: Automatic environment-specific OAuth configuration
- **New**: Fixed callback path (`/auth/v1/callback`) for consistency
- **New**: Environment validation for OAuth credentials

## 📱 **Code Changes Made**

### **Files Updated**
- `src/config/oauth.js` - Added app branding and enhanced OAuth parameters
- `src/config/environment.js` - Added app branding, OAuth features, and environment-specific OAuth configuration
- `src/lib/supabase.js` - Updated to use environment system
- `src/stores/auth.js` - Updated password reset URLs
- `src/main.js` - Added environment testing
- `vite.config.js` - Enhanced environment variable handling and OAuth environment loading

### **New Files Created**
- Environment configuration system
- OAuth branding configuration
- Setup and troubleshooting scripts
- Comprehensive documentation
- **New**: `docs/env.local.example` - Development environment template
- **New**: `docs/env.production.example` - Production environment template
- **New**: `docs/OAUTH_ENVIRONMENT_SETUP.md` - Complete environment setup guide
- **New**: `docs/OAUTH_ENVIRONMENT_QUICK_REFERENCE.md` - Quick environment reference

## 🎉 **Expected Results**

After completing the configuration:

1. **OAuth consent screens** will show "Koulchi" instead of Supabase URLs
2. **App branding** will be consistent across all environments
3. **Authentication flows** will work seamlessly in both development and production
4. **User experience** will be professional and branded
5. **No sensitive URLs** will be exposed to users

## 🚀 **Next Steps**

1. **Set up environment configuration**:
   - Copy `docs/env.local.example` to `.env.local` for development
   - Configure Vercel environment variables for production
2. **Follow the environment setup guide**: `OAUTH_ENVIRONMENT_SETUP.md`
3. **Run the setup script**: `./scripts/setup-oauth-branding.sh`
4. **Follow the configuration guide**: `OAUTH_BRANDING_GUIDE.md`
5. **Configure your OAuth providers** (Google, Facebook)
6. **Update Supabase project** settings
7. **Test in both environments**
8. **Verify branding appears correctly**

## 📞 **Support**

If you encounter issues:

1. Check the troubleshooting guide: `OAUTH_BRANDING_TROUBLESHOOTING.md`
2. Verify all configuration changes are saved
3. Clear browser cache and cookies
4. Wait for OAuth changes to propagate
5. Test in both development and production environments

## 🔗 **Related Documentation**

- [Supabase Authentication Guide](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Facebook OAuth Setup](https://developers.facebook.com/docs/facebook-login)

---

**Your OAuth branding is now fully configured and ready to display "Koulchi" instead of Supabase URLs! 🎯**

Start with the setup script: `./scripts/setup-oauth-branding.sh`
