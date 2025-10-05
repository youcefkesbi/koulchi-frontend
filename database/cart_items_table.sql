-- 10/04/2025
create table cart_items (
  id uuid primary key default uuid_generate_v4(),
  cart_id uuid references cart(id) on delete cascade,
  product_id uuid references products(id),
  quantity int default 1,
  unique(cart_id, product_id) -- prevents duplicate product entries
);

-- RLS policies

-- Enable RLS
alter table public.cart_items enable row level security;

-- Admin: Full access
create policy "Admin can manage all cart items"
on public.cart_items
for all
to authenticated
using (
  exists (
    select 1 from user_roles ur
    where ur.user_id = auth.uid()
    and ur.role = 'admin'
  )
)
with check (
  exists (
    select 1 from user_roles ur
    where ur.user_id = auth.uid()
    and ur.role = 'admin'
  )
);

-- Customer: SELECT own items
create policy "Customers can view own cart items"
on public.cart_items
for select
to authenticated
using (
  exists (
    select 1 from public.cart
    where cart.id = cart_items.cart_id
    and cart.user_id = auth.uid()
  )
);

-- Customer: INSERT into own cart
create policy "Customers can insert into own cart"
on public.cart_items
for insert
to authenticated
with check (
  exists (
    select 1 from public.cart
    where cart.id = cart_items.cart_id
    and cart.user_id = auth.uid()
  )
);

-- Customer: UPDATE own cart items
create policy "Customers can update own cart items"
on public.cart_items
for update
to authenticated
using (
  exists (
    select 1 from public.cart
    where cart.id = cart_items.cart_id
    and cart.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.cart
    where cart.id = cart_items.cart_id
    and cart.user_id = auth.uid()
  )
);

-- Customer: DELETE own cart items
create policy "Customers can delete own cart items"
on public.cart_items
for delete
to authenticated
using (
  exists (
    select 1 from public.cart
    where cart.id = cart_items.cart_id
    and cart.user_id = auth.uid()
  )
);



-- Indexes

-- speed up product lookups inside a cart
create index cart_items_cart_id_idx on cart_items(cart_id);

-- speed up product filtering
create index cart_items_product_id_idx on cart_items(product_id);

-- unique constraint (prevents duplicate products in same cart)
create unique index cart_items_unique_idx on cart_items(cart_id, product_id);



-- Triggers

-- Auto-clean cart_items when product is deleted
alter table cart_items
add constraint fk_product_cascade
foreign key (product_id) references products(id) on delete cascade;

-- Auto-clean cart_items when cart is deleted
alter table cart_items
add constraint fk_cart_cascade
foreign key (cart_id) references cart(id) on delete cascade;