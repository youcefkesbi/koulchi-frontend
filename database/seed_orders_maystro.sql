-- ================================
-- Cleanup: Delete existing test orders
-- ================================
-- WARNING: This will delete ALL orders and their order_items
-- Only run this in development/test environment

-- Delete order_items first (due to foreign key constraint)
DELETE FROM public.order_items 
WHERE order_id IN (
  SELECT id FROM public.orders 
  WHERE user_id = 'feb5ee84-9c81-4598-9e3c-83912c105e3f'
);

-- Delete orders
DELETE FROM public.orders 
WHERE user_id = 'feb5ee84-9c81-4598-9e3c-83912c105e3f';

-- ================================
-- Seed 3 test orders for Maystro integration testing
-- ================================
-- Required columns for Maystro:
-- - phone_num: Customer phone number (now in profiles.phone_num, not orders.customer_phone)
-- - customer_wilaya_id: Maystro wilaya code (integer)
-- - customer_commune_id: Maystro commune code (integer)
-- - shipping_address: Delivery address

-- First, ensure the user's profile has a phone number
-- Using the first order's phone as the default profile phone
UPDATE public.profiles
SET phone_num = '0555123456'
WHERE id = 'feb5ee84-9c81-4598-9e3c-83912c105e3f';

-- Create test products for the store (if they don't exist)
-- Product 1
INSERT INTO public.products (id, name, description, price, seller_id, store_id, status)
VALUES (
  '811def7c-6107-48f3-bb76-fbd71f748512',
  'Test Product 1',
  'Test product for Maystro integration - Product 1',
  2500.00,
  'feb5ee84-9c81-4598-9e3c-83912c105e3f',
  'ad0bed6a-9b03-43ea-ae6b-718fea05aaf6',
  'approved'
)
ON CONFLICT (id) DO NOTHING;

-- Product 2
INSERT INTO public.products (id, name, description, price, seller_id, store_id, status)
VALUES (
  '5f8eab5e-8511-4198-8260-3b54687aefc1',
  'Test Product 2',
  'Test product for Maystro integration - Product 2',
  7500.00,
  'feb5ee84-9c81-4598-9e3c-83912c105e3f',
  'ad0bed6a-9b03-43ea-ae6b-718fea05aaf6',
  'approved'
)
ON CONFLICT (id) DO NOTHING;

-- Product 3
INSERT INTO public.products (id, name, description, price, seller_id, store_id, status)
VALUES (
  '1a95a278-c0f3-4cda-8dd7-db164293ac0d',
  'Test Product 3',
  'Test product for Maystro integration - Product 3',
  4000.00,
  'feb5ee84-9c81-4598-9e3c-83912c105e3f',
  'ad0bed6a-9b03-43ea-ae6b-718fea05aaf6',
  'approved'
)
ON CONFLICT (id) DO NOTHING;

-- Order 1: Algiers (Wilaya 16, example commune 1)
WITH new_order AS (
  INSERT INTO public.orders (
    user_id, 
    store_id, 
    status, 
    total_amount, 
    shipping_address, 
    customer_wilaya_id,
    customer_commune_id,
    notes
  )
  VALUES (
    'feb5ee84-9c81-4598-9e3c-83912c105e3f', 
    'ad0bed6a-9b03-43ea-ae6b-718fea05aaf6', 
    'pending', 
    5000.00, 
    '123 Main Street, Algiers', 
    16,  -- Wilaya code for Algiers (example)
    1,   -- Commune code (example - adjust based on your Maystro mapping)
    'Please deliver in the morning'
  )
  RETURNING id
)
INSERT INTO public.order_items (order_id, product_id, quantity, price)
SELECT new_order.id, '811def7c-6107-48f3-bb76-fbd71f748512', 2, 2500.00
FROM new_order;

-- Order 2: Oran (Wilaya 31, example commune 1)
WITH new_order AS (
  INSERT INTO public.orders (
    user_id, 
    store_id, 
    status, 
    total_amount, 
    shipping_address, 
    customer_wilaya_id,
    customer_commune_id,
    notes
  )
  VALUES (
    'feb5ee84-9c81-4598-9e3c-83912c105e3f', 
    'ad0bed6a-9b03-43ea-ae6b-718fea05aaf6', 
    'confirmed', 
    7500.00, 
    '456 Oak Avenue, Oran', 
    31,  -- Wilaya code for Oran (example)
    1,   -- Commune code (example - adjust based on your Maystro mapping)
    NULL
  )
  RETURNING id
)
INSERT INTO public.order_items (order_id, product_id, quantity, price)
SELECT new_order.id, '5f8eab5e-8511-4198-8260-3b54687aefc1', 1, 7500.00
FROM new_order;

-- Order 3: Constantine (Wilaya 25, example commune 1)
WITH new_order AS (
  INSERT INTO public.orders (
    user_id, 
    store_id, 
    status, 
    total_amount, 
    shipping_address, 
    customer_wilaya_id,
    customer_commune_id,
    notes
  )
  VALUES (
    'feb5ee84-9c81-4598-9e3c-83912c105e3f', 
    'ad0bed6a-9b03-43ea-ae6b-718fea05aaf6', 
    'pending', 
    12000.00, 
    '789 Pine Road, Constantine', 
    25,  -- Wilaya code for Constantine (example)
    1,   -- Commune code (example - adjust based on your Maystro mapping)
    'Fragile items'
  )
  RETURNING id
)
INSERT INTO public.order_items (order_id, product_id, quantity, price)
SELECT new_order.id, '1a95a278-c0f3-4cda-8dd7-db164293ac0d', 3, 4000.00
FROM new_order;

-- ================================
-- Verify seeded orders
-- ================================
SELECT 
  o.id,
  o.status,
  o.total_amount,
  p.phone_num as customer_phone,
  o.customer_wilaya_id,
  o.customer_commune_id,
  o.shipping_address,
  COUNT(oi.id) as items_count
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE o.user_id = 'feb5ee84-9c81-4598-9e3c-83912c105e3f'
GROUP BY o.id, o.status, o.total_amount, p.phone_num, o.customer_wilaya_id, o.customer_commune_id, o.shipping_address
ORDER BY o.created_at DESC;
