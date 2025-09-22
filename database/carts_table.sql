create table cart (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  quantity int not null default 1,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Make sure a user cannot add the same product twice -
create unique index cart_user_product_unique 
on cart(user_id, product_id);
