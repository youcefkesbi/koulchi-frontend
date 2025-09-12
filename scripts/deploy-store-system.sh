#!/bin/bash

# Store System Deployment Script
# This script deploys the enhanced store system to Supabase

set -e

echo "🚀 Starting Store System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in to Supabase
if ! supabase status &> /dev/null; then
    print_error "Not logged in to Supabase. Please run:"
    echo "supabase login"
    exit 1
fi

print_status "Deploying database schema..."

# Deploy database migration
if [ -f "database/migration_store_system.sql" ]; then
    print_status "Running database migration..."
    supabase db reset --linked
    supabase db push --linked
    
    if [ $? -eq 0 ]; then
        print_success "Database migration completed successfully"
    else
        print_error "Database migration failed"
        exit 1
    fi
else
    print_error "Migration file not found: database/migration_store_system.sql"
    exit 1
fi

print_status "Creating storage buckets..."

# Create storage buckets
supabase storage create verification-documents --public false
supabase storage create stores-logos --public true
supabase storage create stores-banners --public true

if [ $? -eq 0 ]; then
    print_success "Storage buckets created successfully"
else
    print_warning "Storage buckets may already exist or creation failed"
fi

print_status "Setting up storage policies..."

# Create storage policies
cat > storage_policies.sql << 'EOF'
-- Storage policies for verification documents
CREATE POLICY "Users can upload own verification documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'verification-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own verification documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'verification-documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Employees can view verification documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'verification-documents' 
    AND auth.jwt()->>'role' IN ('admin', 'employee')
);

-- Storage policies for store logos
CREATE POLICY "Users can upload store logos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'stores-logos' 
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "Public can view store logos" ON storage.objects
FOR SELECT USING (bucket_id = 'stores-logos');

-- Storage policies for store banners
CREATE POLICY "Users can upload store banners" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'stores-banners' 
    AND auth.uid() IS NOT NULL
);

CREATE POLICY "Public can view store banners" ON storage.objects
FOR SELECT USING (bucket_id = 'stores-banners');
EOF

# Apply storage policies
supabase db push --linked --file storage_policies.sql

if [ $? -eq 0 ]; then
    print_success "Storage policies applied successfully"
else
    print_warning "Storage policies may have failed to apply"
fi

# Clean up temporary file
rm -f storage_policies.sql

print_status "Deploying Edge Functions..."

# Deploy edge functions if they exist
if [ -d "supabase/functions" ]; then
    for func_dir in supabase/functions/*/; do
        if [ -d "$func_dir" ]; then
            func_name=$(basename "$func_dir")
            print_status "Deploying function: $func_name"
            supabase functions deploy "$func_name" --linked
        fi
    done
    print_success "Edge functions deployed successfully"
else
    print_warning "No edge functions found to deploy"
fi

print_status "Setting up initial data..."

# Insert initial data
cat > initial_data.sql << 'EOF'
-- Insert default packs
INSERT INTO public.packs (name, description, price, max_announcements, max_images) VALUES
('Basic Pack', 'Free pack with basic features', 0.00, 150, 300),
('Pro Pack', 'Premium pack with advanced features', 1000.00, 3000, 6000)
ON CONFLICT (name) DO NOTHING;

-- Insert default features
INSERT INTO public.features (name, display_name, description) VALUES
('store_logo', 'Store Logo', 'Ability to upload and display a store logo'),
('store_banner', 'Store Banner', 'Ability to upload and display a store banner'),
('color_customization', 'Color Customization', 'Ability to customize store colors and design'),
('external_buttons', 'External Buttons', 'Ability to add external buttons (WhatsApp, Telegram, etc.)'),
('store_name', 'Store Name', 'Ability to set a custom store name'),
('location_input', 'Location Input', 'Single large input for store location (3 lines)')
ON CONFLICT (name) DO NOTHING;

-- Insert pack-feature relationships
INSERT INTO public.pack_features (pack_id, feature_id, is_enabled)
SELECT p.id, f.id, true
FROM public.packs p, public.features f
WHERE p.name = 'Basic Pack' 
AND f.name IN ('external_buttons', 'location_input')
ON CONFLICT (pack_id, feature_id) DO NOTHING;

INSERT INTO public.pack_features (pack_id, feature_id, is_enabled)
SELECT p.id, f.id, true
FROM public.packs p, public.features f
WHERE p.name = 'Pro Pack'
ON CONFLICT (pack_id, feature_id) DO NOTHING;
EOF

# Apply initial data
supabase db push --linked --file initial_data.sql

if [ $? -eq 0 ]; then
    print_success "Initial data inserted successfully"
else
    print_warning "Initial data insertion may have failed"
fi

# Clean up temporary file
rm -f initial_data.sql

print_status "Running final checks..."

# Test database connection
if supabase db ping --linked &> /dev/null; then
    print_success "Database connection successful"
else
    print_error "Database connection failed"
    exit 1
fi

# Test storage access
if supabase storage ls &> /dev/null; then
    print_success "Storage access successful"
else
    print_warning "Storage access test failed"
fi

print_success "🎉 Store System Deployment Completed Successfully!"

echo ""
echo "📋 Next Steps:"
echo "1. Update your frontend environment variables"
echo "2. Deploy your frontend application"
echo "3. Create admin and employee user accounts"
echo "4. Test the complete store creation flow"
echo "5. Monitor the system for any issues"
echo ""
echo "🔗 Useful Links:"
echo "- Supabase Dashboard: https://supabase.com/dashboard"
echo "- Documentation: STORE_SYSTEM_DOCUMENTATION.md"
echo ""

print_status "Deployment completed at $(date)"
