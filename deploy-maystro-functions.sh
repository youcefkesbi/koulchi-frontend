#!/bin/bash

# Maystro Integration Edge Functions Deployment Script
# This script deploys the Maystro integration Edge Functions to Supabase

set -e

echo "🚀 Deploying Maystro Integration Edge Functions..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if project is linked
if ! supabase status &> /dev/null; then
    echo "❌ Project not linked. Please link your project first:"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "📦 Deploying connect-maystro function..."
supabase functions deploy connect-maystro

echo "📦 Deploying disconnect-maystro function..."
supabase functions deploy disconnect-maystro

echo "🔐 Setting environment variables..."
echo "   Please set the MAYSTRO_ENCRYPTION_SECRET environment variable:"
echo "   supabase secrets set MAYSTRO_ENCRYPTION_SECRET=your-32-character-secret-key"

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Set the encryption secret: supabase secrets set MAYSTRO_ENCRYPTION_SECRET=your-secret"
echo "   2. Test the functions in your Supabase dashboard"
echo "   3. Update your frontend to use the new integration component"
echo ""
echo "🔗 Function URLs:"
echo "   - connect-maystro: https://your-project.supabase.co/functions/v1/connect-maystro"
echo "   - disconnect-maystro: https://your-project.supabase.co/functions/v1/disconnect-maystro"
