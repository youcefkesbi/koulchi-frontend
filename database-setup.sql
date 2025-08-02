-- Koulchi Frontend Database Setup for Supabase
-- Run this script in your Supabase SQL Editor

-- Create seller_profiles table
CREATE TABLE IF NOT EXISTS seller_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_name VARCHAR NOT NULL,
  business_description TEXT,
  phone VARCHAR NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR NOT NULL,
  wilaya VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  name_ar VARCHAR NOT NULL,
  price INTEGER NOT NULL,
  original_price INTEGER NOT NULL,
  image VARCHAR,
  category VARCHAR NOT NULL,
  description TEXT,
  description_ar TEXT,
  in_stock BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT false,
  is_on_sale BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Seller profiles table policies
CREATE POLICY "Users can view own seller profile" ON seller_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own seller profile" ON seller_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own seller profile" ON seller_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Products table policies (public read access, sellers can manage their own)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Sellers can insert their own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own products" ON products
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own products" ON products
  FOR DELETE USING (auth.uid() = seller_id);

-- Cart items table policies
CREATE POLICY "Users can view own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- Insert sample products (without seller_id for now)
INSERT INTO products (name, name_ar, price, original_price, image, category, description, description_ar, in_stock, is_new, is_on_sale, rating, reviews) VALUES
('Smartphone Samsung Galaxy A54', 'هاتف ذكي سامسونج جالكسي A54', 45000, 50000, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop', 'electronics', 'Latest Samsung smartphone with excellent camera and performance', 'أحدث هاتف سامسونج مع كاميرا ممتازة وأداء عالي', true, true, true, 4.5, 128),
('Traditional Algerian Dress', 'فستان جزائري تقليدي', 15000, 18000, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop', 'fashion', 'Beautiful traditional Algerian dress for special occasions', 'فستان جزائري تقليدي جميل للمناسبات الخاصة', true, false, true, 4.8, 89),
('Coffee Maker', 'ماكينة قهوة', 8000, 8000, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop', 'home', 'Automatic coffee maker for perfect coffee every time', 'ماكينة قهوة أوتوماتيكية لقهوة مثالية في كل مرة', true, false, false, 4.2, 156),
('Algerian Dates - 1kg', 'تمر جزائري - 1 كيلو', 1200, 1200, 'https://images.unsplash.com/photo-1603046891744-76e6300df9d9?w=400&h=400&fit=crop', 'food', 'Fresh Algerian dates, perfect for Ramadan and daily consumption', 'تمر جزائري طازج، مثالي لرمضان والاستهلاك اليومي', true, false, false, 4.9, 234),
('Gaming Headset', 'سماعات ألعاب', 12000, 15000, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', 'electronics', 'High-quality gaming headset with noise cancellation', 'سماعات ألعاب عالية الجودة مع إلغاء الضوضاء', true, true, true, 4.3, 67),
('Traditional Pottery Set', 'طقم فخار تقليدي', 3500, 4000, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop', 'home', 'Beautiful traditional Algerian pottery for home decoration', 'فخار جزائري تقليدي جميل لتزيين المنزل', true, false, true, 4.6, 45);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_status ON seller_profiles(status);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);
CREATE INDEX IF NOT EXISTS idx_products_is_on_sale ON products(is_on_sale);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id); 