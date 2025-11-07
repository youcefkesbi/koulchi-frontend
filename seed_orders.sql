-- Seed 3 test orders for Maystro integration testing
-- Order IDs are auto-generated and automatically used for order_items

-- Order 1
WITH new_order AS (
  INSERT INTO public.orders (user_id, store_id, status, total_amount, shipping_address, notes)
  VALUES ('feb5ee84-9c81-4598-9e3c-83912c105e3f', 'ad0bed6a-9b03-43ea-ae6b-718fea05aaf6', 'pending', 5000.00, '123 Main Street, Algiers', 'Please deliver in the morning')
  RETURNING id
)
INSERT INTO public.order_items (order_id, product_id, quantity, price)
SELECT new_order.id, '811def7c-6107-48f3-bb76-fbd71f748512', 2, 2500.00
FROM new_order;

-- Order 2
WITH new_order AS (
  INSERT INTO public.orders (user_id, store_id, status, total_amount, shipping_address, notes)
  VALUES ('feb5ee84-9c81-4598-9e3c-83912c105e3f', 'ad0bed6a-9b03-43ea-ae6b-718fea05aaf6', 'confirmed', 7500.00, '456 Oak Avenue, Oran', NULL)
  RETURNING id
)
INSERT INTO public.order_items (order_id, product_id, quantity, price)
SELECT new_order.id, '5f8eab5e-8511-4198-8260-3b54687aefc1', 1, 7500.00
FROM new_order;

-- Order 3
WITH new_order AS (
  INSERT INTO public.orders (user_id, store_id, status, total_amount, shipping_address, notes)
  VALUES ('feb5ee84-9c81-4598-9e3c-83912c105e3f', 'ad0bed6a-9b03-43ea-ae6b-718fea05aaf6', 'pending', 12000.00, '789 Pine Road, Constantine', 'Fragile items')
  RETURNING id
)
INSERT INTO public.order_items (order_id, product_id, quantity, price)
SELECT new_order.id, '1a95a278-c0f3-4cda-8dd7-db164293ac0d', 3, 4000.00
FROM new_order;

