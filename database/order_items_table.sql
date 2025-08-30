-- Order items table
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity int not null check (quantity > 0),
  price numeric(10,2) not null,     -- snapshot of product price at purchase
  variant jsonb,                     -- size/color/etc.
  created_at timestamptz default now()
);

-- 🔹 Indexes for order_items
create index idx_order_items_order_id on order_items(order_id);           -- fetch items of an order
create index idx_order_items_product_id on order_items(product_id);       -- analytics / reports
create index idx_order_items_created_at on order_items(created_at);       -- recent items / reporting
create index idx_order_items_order_product on order_items(order_id, product_id) -- common join queries
;