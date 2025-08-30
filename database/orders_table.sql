-- Create ENUM for order statuses
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'canceled'
);
-- Orders table
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references profiles(id) on delete cascade, -- buyer
  status order_status default 'pending' not null,
  total_amount numeric(10,2) not null default 0,
  shipping_address text,
  notes text,                        -- buyer notes
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);