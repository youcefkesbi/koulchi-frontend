# OAuth Branding Configuration Guide

This guide explains how to configure your OAuth setup so that "Koulchi" appears in the Google/Facebook consent screens instead of Supabase URLs.

## 🎯 **Goal**

Replace these messages in OAuth consent screens:
- ❌ "to continue to my VITE_SUPABASE_URL"
- ❌ "You're signing back in to my VITE_SUPABASE_URL"

With:
- ✅ "to continue to Koulchi"
- ✅ "You're signing back in to Koulchi"

## 🔧 **Required Changes**

### 1. Supabase Project Configuration

#### **Step 1: Update Project Name**

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **General**
3. Update **Project Name** from default to: `Koulchi`
4. Click **Save**

#### **Step 2: Update Authentication Settings**

1. Go to **Authentication** → **Settings**
2. Update **Site URL** to your app domain:
   - **Development**: `http://localhost:3000`
   - **Production**: `https://your-app.vercel.app`
3. Update **Redirect URLs** to include:
   - `http://localhost:3000/auth/callback`
   - `https://your-app.vercel.app/auth/callback`
4. Click **Save**

### 2. Google OAuth App Configuration

#### **Step 1: Update Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID and click on it

#### **Step 2: Update App Information**

1. **Application name**: `Koulchi`
2. **Application home page**: Your app URL
   - **Development**: `http://localhost:3000`
   - **Production**: `https://your-app.vercel.app`
3. **Application description**: `Simplified e-commerce platform for buying and selling`
4. **Application privacy policy link**: `https://your-app.vercel.app/privacy-policy` (optional)
5. **Application terms of service link**: `https://your-app.vercel.app/terms-of-service` (optional)

#### **Step 3: Update Authorized Redirect URIs**

Add these redirect URIs:
- `https://your-project.supabase.co/auth/v1/callback`
- `http://localhost:3000/auth/callback` (for development)

#### **Step 4: Update Authorized JavaScript Origins**

Add these origins:
- `http://localhost:3000` (development)
- `https://your-app.vercel.app` (production)

### 3. Facebook OAuth App Configuration

#### **Step 1: Update Facebook Developers Console**

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app
3. Go to **App Settings** → **Basic**

#### **Step 2: Update App Information**

1. **App Display Name**: `Koulchi`
2. **App Namespace**: `koulchi` (unique identifier)
3. **App Description**: `Simplified e-commerce platform for buying and selling`
4. **App Domains**: Your app domain
5. **Privacy Policy URL**: `https://your-app.vercel.app/privacy-policy`
6. **Terms of Service URL**: `https://your-app.vercel.app/terms-of-service`

#### **Step 3: Update Valid OAuth Redirect URIs**

Add these redirect URIs:
- `https://your-project.supabase.co/auth/v1/callback`
- `http://localhost:3000/auth/callback` (for development)

## 🚀 **Implementation Steps**

### **Step 1: Update Supabase Project**

```bash
# 1. Go to Supabase Dashboard → Settings → General
# 2. Change Project Name to: Koulchi
# 3. Go to Authentication → Settings
# 4. Update Site URL and Redirect URLs
```

### **Step 2: Update Google OAuth**

```bash
# 1. Go to Google Cloud Console → APIs & Services → Credentials
# 2. Update OAuth 2.0 Client ID settings
# 3. Change Application name to: Koulchi
# 4. Update redirect URIs and JavaScript origins
```

### **Step 3: Update Facebook OAuth**

```bash
# 1. Go to Facebook Developers → App Settings → Basic
# 2. Update App Display Name to: Koulchi
# 3. Update redirect URIs
# 4. Add privacy policy and terms URLs
```

### **Step 4: Test Configuration**

1. **Clear browser cache and cookies**
2. **Test OAuth flow in development**:
   - Visit `http://localhost:3000`
   - Try Google/Facebook login
   - Verify "Koulchi" appears in consent screen
3. **Test OAuth flow in production**:
   - Visit your Vercel app
   - Try Google/Facebook login
   - Verify "Koulchi" appears in consent screen

## 🔍 **Verification Checklist**

- [ ] Supabase project name is "Koulchi"
- [ ] Google OAuth app name is "Koulchi"
- [ ] Facebook OAuth app display name is "Koulchi"
- [ ] Redirect URIs are correctly configured
- [ ] Site URLs are correctly configured
- [ ] OAuth consent screen shows "Koulchi"
- [ ] Works in both development and production

## 🐛 **Troubleshooting**

### **Issue: Still showing Supabase URL**

**Possible causes:**
1. Browser cache/cookies not cleared
2. OAuth app not updated in Google/Facebook
3. Supabase project name not changed
4. Redirect URIs not updated

**Solutions:**
1. Clear browser cache and cookies
2. Wait 5-10 minutes for OAuth changes to propagate
3. Verify all configuration changes are saved
4. Check redirect URI format matches exactly

### **Issue: OAuth flow breaks**

**Possible causes:**
1. Redirect URIs mismatch
2. Site URL not configured
3. OAuth app not properly configured

**Solutions:**
1. Verify redirect URIs in both Supabase and OAuth providers
2. Check Site URL configuration
3. Ensure OAuth app is in production mode (not development)

### **Issue: Different branding in dev vs production**

**Possible causes:**
1. Different OAuth app configurations
2. Environment-specific settings

**Solutions:**
1. Use same OAuth app for both environments
2. Ensure redirect URIs include both localhost and production URLs
3. Verify environment detection is working

## 📱 **Additional Branding Options**

### **Custom Logo**

1. Add your logo to `src/assets/logo.png`
2. Update the logo path in `src/config/oauth.js`
3. The logo will be available for use in OAuth flows

### **Privacy Policy & Terms**

1. Create privacy policy page at `/privacy-policy`
2. Create terms page at `/terms-of-service`
3. Update URLs in OAuth provider settings
4. These will appear in OAuth consent screens

### **Custom OAuth Scopes**

You can customize OAuth scopes in `src/config/oauth.js`:

```javascript
// Google OAuth
queryParams: {
  scope: 'email profile', // Customize scopes
  access_type: 'offline',
  prompt: 'consent'
}

// Facebook OAuth
queryParams: {
  scope: 'email,public_profile,user_friends', // Customize scopes
  display: 'popup'
}
```

## 🔒 **Security Notes**

- **Never expose Supabase URLs** in user-facing interfaces
- **OAuth redirect URIs** must be exact matches
- **Environment variables** are automatically handled
- **App branding** is controlled by OAuth provider settings

## 📚 **Related Documentation**

- [Supabase Authentication Guide](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [Facebook OAuth Setup](https://developers.facebook.com/docs/facebook-login)
- [Environment Setup Guide](./ENVIRONMENT_SETUP.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

## 🎉 **Expected Result**

After completing these steps, your OAuth consent screens should display:

- **App Name**: "Koulchi"
- **App Description**: "Simplified e-commerce platform for buying and selling"
- **Your Logo**: If configured
- **Privacy Policy & Terms**: If configured

Instead of generic Supabase URLs and project names.
