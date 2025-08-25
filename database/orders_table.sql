-- Create ENUM for order statuses
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'canceled'
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 

  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE ON UPDATE NO ACTION,

  quantity INT4 NOT NULL DEFAULT 1,
  total_price NUMERIC NOT NULL,

  status order_status NOT NULL DEFAULT 'pending',

  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index to quickly find all orders for a user
CREATE INDEX idx_orders_buyer_id ON orders (buyer_id);
CREATE INDEX idx_orders_seller_id ON orders (seller_id);
CREATE INDEX idx_orders_product_id ON orders (product_id);