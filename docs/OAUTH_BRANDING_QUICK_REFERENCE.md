# OAuth Branding Quick Reference

## 🎯 **Goal**
Replace "my VITE_SUPABASE_URL" with "Koulchi" in OAuth consent screens.

## ⚡ **Quick Fix (3 Steps)**

### **1. Supabase Project**
```
Dashboard → Settings → General → Project Name: Koulchi
Authentication → Settings → Site URL: [your-app-domain]
```

### **2. Google OAuth**
```
Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID
Application name: Koulchi
Application home page: [your-app-domain]
```

### **3. Facebook OAuth**
```
Developers → App Settings → Basic
App Display Name: Koulchi
App Description: [your-app-description]
```

## 🔗 **Required URLs**

### **Development**
- Site URL: `http://localhost:3000`
- Redirect: `http://localhost:3000/auth/callback`

### **Production**
- Site URL: `https://your-app.vercel.app`
- Redirect: `https://your-app.vercel.app/auth/callback`

## 🧪 **Test**
1. Clear browser cache
2. Try OAuth login
3. Verify "Koulchi" appears (not Supabase URL)

## 📚 **Full Guide**
See `OAUTH_BRANDING_GUIDE.md` for detailed steps.

## 🚀 **Setup Script**
Run: `./scripts/setup-oauth-branding.sh`
