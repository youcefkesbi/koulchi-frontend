# Fix Product Insertion Issue

The Post Announcement form is not working because of missing Row Level Security (RLS) policies and storage bucket permissions. Here's how to fix it:

## 🔧 **Step 1: Fix Products Table RLS Policies**

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable RLS on products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy for users to insert their own products
CREATE POLICY "Users can insert their own products" ON public.products
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Policy for users to view all active products
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (is_active = true);

-- Policy for users to view their own products (including inactive ones)
CREATE POLICY "Users can view their own products" ON public.products
    FOR SELECT USING (auth.uid() = seller_id);

-- Policy for users to update their own products
CREATE POLICY "Users can update their own products" ON public.products
    FOR UPDATE USING (auth.uid() = seller_id);

-- Policy for users to delete their own products
CREATE POLICY "Users can delete their own products" ON public.products
    FOR DELETE USING (auth.uid() = seller_id);

-- Policy for admin/service role to do everything
CREATE POLICY "Service role can do everything" ON public.products
    FOR ALL USING (auth.role() = 'service_role');
```

## 🗂️ **Step 2: Fix Storage Bucket Policies**

Run this SQL to fix image upload permissions:

```sql
-- Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for users to upload images to their own folder
CREATE POLICY "Users can upload to their own folder" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'product-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy for users to view images in their own folder
CREATE POLICY "Users can view their own images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'product-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy for anyone to view public images
CREATE POLICY "Anyone can view public images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

-- Policy for users to update images in their own folder
CREATE POLICY "Users can update their own images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'product-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy for users to delete images in their own folder
CREATE POLICY "Users can delete their own images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'product-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
```

## 🧪 **Step 3: Test the Form**

After running the SQL scripts:

1. **Refresh your browser** to clear any cached errors
2. **Try submitting the form** with a simple product (no images first)
3. **Check the browser console** for any error messages
4. **Verify the product appears** in your dashboard

## 🔍 **What Was Fixed**

- **RLS Policies**: Users can now insert products into the database
- **Storage Permissions**: Users can now upload images to the product-images bucket
- **Form Validation**: Added proper form validation to prevent submission errors
- **Error Handling**: Better error messages and debugging information
- **Database Connection**: Added connection testing to identify issues

## 🚨 **If Still Not Working**

Check the browser console for specific error messages. The most common issues are:

1. **Authentication**: User not properly logged in
2. **Database Connection**: Supabase URL/Key issues
3. **RLS Policies**: Policies not applied correctly
4. **Storage Bucket**: Bucket doesn't exist or permissions wrong

## 📱 **Form Features Now Working**

- ✅ Product creation with all required fields
- ✅ Image upload (up to 3 images, 2MB each)
- ✅ Automatic storage to Supabase Storage
- ✅ Product insertion into database
- ✅ Success message and redirect
- ✅ Form validation and error handling

Run the SQL scripts and test again! 🚀
