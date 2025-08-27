#!/bin/bash

# OAuth Branding Setup Script for Koulchi Frontend
# This script helps configure OAuth branding to show "Koulchi" instead of Supabase URLs

echo "🎨 Setting up OAuth branding for Koulchi..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 OAuth Branding Configuration Checklist${NC}"
echo "================================================"
echo ""

echo -e "${YELLOW}🔧 Step 1: Supabase Project Configuration${NC}"
echo "   [ ] Go to Supabase Dashboard → Settings → General"
echo "   [ ] Change Project Name to: Koulchi"
echo "   [ ] Go to Authentication → Settings"
echo "   [ ] Update Site URL to your app domain"
echo "   [ ] Add redirect URIs for both dev and production"
echo ""

echo -e "${YELLOW}🔧 Step 2: Google OAuth App Configuration${NC}"
echo "   [ ] Go to Google Cloud Console → APIs & Services → Credentials"
echo "   [ ] Update OAuth 2.0 Client ID settings"
echo "   [ ] Change Application name to: Koulchi"
echo "   [ ] Update Application home page URL"
echo "   [ ] Add redirect URIs and JavaScript origins"
echo ""

echo -e "${YELLOW}🔧 Step 3: Facebook OAuth App Configuration${NC}"
echo "   [ ] Go to Facebook Developers → App Settings → Basic"
echo "   [ ] Update App Display Name to: Koulchi"
echo "   [ ] Update App Description"
echo "   [ ] Add redirect URIs for both environments"
echo ""

echo -e "${YELLOW}🔧 Step 4: Test Configuration${NC}"
echo "   [ ] Clear browser cache and cookies"
echo "   [ ] Test OAuth flow in development"
echo "   [ ] Test OAuth flow in production"
echo "   [ ] Verify 'Koulchi' appears in consent screens"
echo ""

echo -e "${GREEN}📚 For detailed instructions, see: OAUTH_BRANDING_GUIDE.md${NC}"
echo ""

# Check if environment is configured
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local found - environment is configured${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local not found - run ./scripts/setup-dev.sh first${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Quick Commands:${NC}"
echo "   Development: npm run dev"
echo "   Production: npm run build"
echo "   Test OAuth: Visit your app and try Google/Facebook login"
echo ""

echo -e "${GREEN}🎯 Expected Result:${NC}"
echo "   OAuth consent screens should show 'Koulchi' instead of Supabase URLs"
echo ""

echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "   - Changes may take 5-10 minutes to propagate"
echo "   - Clear browser cache after making changes"
echo "   - Ensure redirect URIs match exactly"
echo "   - Test in both development and production environments"
echo ""

echo -e "${BLUE}📞 Need Help?${NC}"
echo "   - Check OAUTH_BRANDING_GUIDE.md for detailed steps"
echo "   - Verify all configuration changes are saved"
echo "   - Ensure OAuth apps are in production mode"
echo ""
