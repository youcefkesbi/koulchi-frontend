-- Supabase Database Setup for Koulchi E-commerce Platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  description_ar TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  in_stock BOOLEAN DEFAULT true,
  is_new BOOLEAN DEFAULT true,
  is_on_sale BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_postal_code TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist table
CREATE TABLE wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Products policies
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Sellers can view their own products" ON products
  FOR SELECT USING (seller_id = auth.uid());

CREATE POLICY "Sellers can insert their own products" ON products
  FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can update their own products" ON products
  FOR UPDATE USING (seller_id = auth.uid());

CREATE POLICY "Sellers can delete their own products" ON products
  FOR DELETE USING (seller_id = auth.uid());

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Buyers can create orders" ON orders
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Sellers can update orders they're involved in" ON orders
  FOR UPDATE USING (seller_id = auth.uid());

-- Wishlist policies
CREATE POLICY "Users can view their own wishlist" ON wishlist
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own wishlist" ON wishlist
  FOR ALL USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_wishlist_user ON wishlist(user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert seed data
INSERT INTO categories (name, name_ar, description, description_ar) VALUES
('Cars', 'السيارات', 'Automotive vehicles and parts', 'المركبات وقطع غيار السيارات'),
('Real Estate', 'العقارات', 'Properties for sale or rent', 'العقارات للبيع أو الإيجار'),
('Electronics', 'الإلكترونيات', 'Electronic devices and gadgets', 'الأجهزة الإلكترونية والأدوات'),
('Fashion', 'الموضة', 'Clothing and accessories', 'الملابس والإكسسوارات'),
('Home & Kitchen', 'المنزل والمطبخ', 'Home goods and kitchen items', 'مستلزمات المنزل والمطبخ'),
('Beauty & Personal Care', 'الجمال والرعاية الشخصية', 'Beauty products and personal care', 'منتجات التجميل والعناية الشخصية'),
('Kids', 'الأطفال', 'Children products and toys', 'منتجات الأطفال والألعاب'),
('Food & Beverages', 'الطعام والمشروبات', 'Food and drink items', 'الطعام والمشروبات');

-- Insert sample products
INSERT INTO products (seller_id, name, name_ar, description, description_ar, price, category_id, image) VALUES
(
  (SELECT id FROM profiles LIMIT 1),
  'iPhone 15 Pro',
  'آيفون 15 برو',
  'Latest iPhone with advanced features',
  'أحدث آيفون مع ميزات متقدمة',
  250000,
  (SELECT id FROM categories WHERE name = 'Electronics'),
  'https://via.placeholder.com/300x300?text=iPhone+15+Pro'
),
(
  (SELECT id FROM profiles LIMIT 1),
  'Toyota Camry 2024',
  'تويوتا كامري 2024',
  'Reliable family sedan',
  'سيارة عائلية موثوقة',
  8500000,
  (SELECT id FROM categories WHERE name = 'Cars'),
  'https://via.placeholder.com/300x300?text=Toyota+Camry'
),
(
  (SELECT id FROM profiles LIMIT 1),
  'Modern Apartment',
  'شقة عصرية',
  'Beautiful 3-bedroom apartment in city center',
  'شقة جميلة من 3 غرف نوم في وسط المدينة',
  45000000,
  (SELECT id FROM categories WHERE name = 'Real Estate'),
  'https://via.placeholder.com/300x300?text=Apartment'
);
