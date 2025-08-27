#!/bin/bash

# Koulchi Frontend Development Environment Setup Script
# This script helps set up the local development environment

echo "🚀 Setting up Koulchi Frontend development environment..."

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local file
echo "📝 Creating .env.local file..."

cat > .env.local << EOF
# Development Environment Configuration
# This file contains development-specific environment variables

# App Configuration
VITE_APP_URL=http://localhost:3000

# Supabase Configuration (Local Development)
# Replace these with your local Supabase project values
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key-here

# Environment Detection
VITE_VERCEL=0
EOF

echo "✅ .env.local created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local"
echo "2. Start your local Supabase instance (if using local Supabase)"
echo "3. Run 'npm install' to install dependencies"
echo "4. Run 'npm run dev' to start development server"
echo ""
echo "🔧 For local Supabase setup, visit: https://supabase.com/docs/guides/getting-started/local"
echo "📚 For more information, see: ENVIRONMENT_SETUP.md"
echo ""
echo "⚠️  Remember: .env.local is already in .gitignore and won't be committed"
