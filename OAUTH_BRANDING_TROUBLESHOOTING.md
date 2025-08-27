# OAuth Branding Troubleshooting Checklist

## 🔍 **Diagnostic Steps**

### **Step 1: Check Environment Detection**
Open browser console and look for:
```
🔍 Environment Diagnostics
Environment: {isProduction: false, isVercel: false, ...}
Configuration: {appUrl: "http://localhost:3000", ...}
Feature Support: {authentication: true, oauth: true, ...}
```

**If missing**: Check `src/main.js` imports and `src/utils/environment-test.js`

### **Step 2: Verify OAuth Configuration**
Check `src/config/oauth.js`:
- [ ] `appConfig.name` is "Koulchi"
- [ ] `redirectTo` uses `getOAuthRedirectUrl()`
- [ ] OAuth parameters are properly configured

### **Step 3: Check Supabase Client**
Verify `src/lib/supabase.js`:
- [ ] Imports environment configuration
- [ ] Uses `environment.supabase.url` and `environment.supabase.anonKey`
- [ ] Exports environment for use in other components

## 🐛 **Common Issues & Solutions**

### **Issue: Still showing "my VITE_SUPABASE_URL"**

#### **Possible Causes:**
1. **Browser Cache**: OAuth providers cache branding information
2. **OAuth App Not Updated**: Changes not saved in Google/Facebook consoles
3. **Supabase Project Name**: Not changed from default
4. **Redirect URI Mismatch**: URIs don't match exactly

#### **Solutions:**
```bash
# 1. Clear browser cache and cookies
# 2. Wait 5-10 minutes for OAuth changes to propagate
# 3. Verify all configuration changes are saved
# 4. Check redirect URI format matches exactly
```

### **Issue: OAuth flow breaks after branding changes**

#### **Possible Causes:**
1. **Redirect URIs**: Not properly configured in OAuth providers
2. **Site URL**: Mismatch between Supabase and OAuth settings
3. **Environment Variables**: Not properly set in Vercel

#### **Solutions:**
```bash
# 1. Verify redirect URIs in both Supabase and OAuth providers
# 2. Check Site URL configuration matches exactly
# 3. Ensure OAuth app is in production mode (not development)
# 4. Verify environment variables are set in Vercel
```

### **Issue: Different branding in dev vs production**

#### **Possible Causes:**
1. **Different OAuth Apps**: Using separate apps for each environment
2. **Environment-Specific Settings**: Different configurations per environment
3. **Redirect URI Mismatch**: URIs don't include both environments

#### **Solutions:**
```bash
# 1. Use same OAuth app for both environments
# 2. Ensure redirect URIs include both localhost and production URLs
# 3. Verify environment detection is working correctly
# 4. Check Supabase Site URL configuration
```

## 🔧 **Configuration Verification**

### **Supabase Project Settings**
```
✅ Project Name: Koulchi
✅ Site URL: [your-app-domain]
✅ Redirect URLs: [your-app-domain]/auth/callback
```

### **Google OAuth App**
```
✅ Application name: Koulchi
✅ Application home page: [your-app-domain]
✅ Authorized redirect URIs: [your-project.supabase.co/auth/v1/callback
✅ Authorized JavaScript origins: [your-app-domain]
```

### **Facebook OAuth App**
```
✅ App Display Name: Koulchi
✅ App Description: [your-app-description]
✅ Valid OAuth Redirect URIs: [your-project.supabase.co/auth/v1/callback
✅ App Domains: [your-app-domain]
```

## 🧪 **Testing Checklist**

### **Development Environment**
- [ ] Visit `http://localhost:3000`
- [ ] Open browser console
- [ ] Check environment diagnostics
- [ ] Try Google OAuth login
- [ ] Verify "Koulchi" appears in consent screen
- [ ] Try Facebook OAuth login
- [ ] Verify "Koulchi" appears in consent screen

### **Production Environment**
- [ ] Visit your Vercel app
- [ ] Open browser console
- [ ] Check environment diagnostics
- [ ] Try Google OAuth login
- [ ] Verify "Koulchi" appears in consent screen
- [ ] Try Facebook OAuth login
- [ ] Verify "Koulchi" appears in consent screen

## 🚨 **Emergency Fixes**

### **If OAuth Completely Broken:**
1. **Revert to Default**: Change project name back to default
2. **Test Basic Flow**: Ensure OAuth works with default settings
3. **Apply Changes Gradually**: Make one change at a time
4. **Test After Each Change**: Verify OAuth still works

### **If Branding Still Wrong:**
1. **Force Refresh**: Clear all browser data
2. **Wait Longer**: OAuth changes can take 15-30 minutes
3. **Check OAuth App Status**: Ensure app is in production mode
4. **Verify Redirect URIs**: Must match exactly (no trailing slashes)

## 📞 **Debug Commands**

### **Check Environment Configuration**
```bash
# Run environment diagnostics
./scripts/setup-oauth-branding.sh

# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
echo $VITE_APP_URL
```

### **Test OAuth Flow**
```bash
# Development
npm run dev

# Production
npm run build
npm run preview
```

## 🔒 **Security Checklist**

- [ ] Environment variables not committed to Git
- [ ] Supabase URLs not exposed in UI
- [ ] OAuth redirect URIs properly configured
- [ ] App branding controlled by OAuth provider settings
- [ ] Environment detection working correctly

## 📚 **Reference Documents**

- **`OAUTH_BRANDING_GUIDE.md`** - Complete configuration guide
- **`OAUTH_BRANDING_QUICK_REFERENCE.md`** - Quick fix steps
- **`ENVIRONMENT_SETUP.md`** - Environment configuration
- **`DEPLOYMENT_GUIDE.md`** - Deployment instructions

## 🎯 **Success Criteria**

After troubleshooting, you should see:
- ✅ OAuth consent screens show "Koulchi"
- ✅ No Supabase URLs visible to users
- ✅ OAuth flows work in both environments
- ✅ Environment detection working correctly
- ✅ App branding consistent across all flows

## 🚀 **Next Steps After Fixing**

1. **Test thoroughly** in both environments
2. **Monitor OAuth flows** for any issues
3. **Update documentation** if you found additional solutions
4. **Share solutions** with your team
5. **Set up monitoring** for OAuth success rates

Your OAuth branding should now work perfectly! 🎉
