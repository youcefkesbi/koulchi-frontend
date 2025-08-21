# Database Setup Guide

This guide will help you set up the database with proper Row Level Security (RLS) policies and sample data.

## Prerequisites

1. Supabase project created
2. Database connection established
3. Environment variables configured in `.env` file

## Step 1: Create Tables

Run the following SQL scripts in order:

### 1.1 Categories Table
```sql
-- Run the contents of categories_table.sql
```

### 1.2 Products Table
```sql
-- Run the contents of products_table.sql
```

### 1.3 Profiles Table
```sql
-- Run the contents of profiles_table_complete.sql
```

## Step 2: Insert Sample Data

### 2.1 Sample Categories and Products
```sql
-- Run the contents of sample_products.sql
```

## Step 3: Verify Setup

### 3.1 Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'products', 'profiles');
```

### 3.2 Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('categories', 'products', 'profiles');
```

### 3.3 Check Sample Data
```sql
-- Check categories
SELECT * FROM public.categories WHERE is_active = true;

-- Check products
SELECT id, name, price, stock_quantity, is_active FROM public.products WHERE is_active = true;
```

## Step 4: Test Product Detail Page

1. Navigate to the products page
2. Click on a product's eye button
3. Verify the product detail page loads correctly
4. Check browser console for any errors

## Troubleshooting

### Issue: Products not loading
- Check if RLS policies are properly set
- Verify sample data exists
- Check browser console for errors
- Verify Supabase connection

### Issue: Product detail page stuck on loading
- Check if product ID is being passed correctly
- Verify the product exists in the database
- Check RLS policies allow reading the product
- Look for console errors in the browser

### Issue: Permission denied errors
- Ensure RLS policies are properly configured
- Check if user is authenticated (if required)
- Verify table permissions are granted correctly

## Common RLS Policy Issues

1. **No policies defined**: If RLS is enabled but no policies exist, all queries fail
2. **Incorrect policy conditions**: Policies must match the actual data structure
3. **Missing permissions**: Ensure proper GRANT statements are executed

## Testing the Setup

After running all scripts:

1. Start the development server: `npm run dev`
2. Navigate to the home page
3. Verify products are displayed
4. Click on a product to view details
5. Verify the product detail page loads correctly

## Next Steps

Once the basic setup is working:

1. Add more sample products
2. Test user authentication
3. Test product creation/editing
4. Test cart functionality
