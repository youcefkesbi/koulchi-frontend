-- Cart details view

CREATE OR REPLACE VIEW cart_details AS
SELECT 
  c.id AS cart_id,
  c.user_id,
  c.product_id,
  c.quantity,
  p.name AS product_name,
  p.price AS product_price,
  (c.quantity * p.price) AS total_price,
  c.created_at,
  c.updated_at
FROM cart c
JOIN products p ON c.product_id = p.id;
