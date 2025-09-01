# Most Sold Products Feature - Database Setup

This document outlines the database changes required to implement the "Most Sold Products" feature on the homepage.

## Database Changes Required

### 1. Add `sold_count` field to products table

Run the following SQL to add the `sold_count` field to the existing products table:

```sql
-- Add sold_count column to products table
ALTER TABLE products ADD COLUMN sold_count INTEGER DEFAULT 0;
```

### 2. Create functions and triggers for automatic sold_count updates

Run the SQL from `update_sold_count.sql` to create:
- Function to update sold_count for all products
- Function to update sold_count for a single product
- Trigger to automatically update sold_count when order_items change

### 3. Initial data population

After running the above, execute this to populate initial sold_count values:

```sql
-- Update sold_count for all existing products
SELECT update_product_sold_count();
```

## How it works

1. **Automatic Updates**: The trigger automatically updates the `sold_count` field whenever order_items are inserted, updated, or deleted
2. **Order Status Filtering**: Only orders with status 'confirmed', 'shipped', or 'delivered' are counted toward sold_count
3. **Quantity Aggregation**: The sold_count represents the total quantity sold, not just the number of orders
4. **Performance**: The sold_count field is indexed and updated in real-time, ensuring fast queries for the homepage

## Verification

To verify the setup is working:

```sql
-- Check that sold_count is being populated
SELECT id, name, sold_count FROM products ORDER BY sold_count DESC LIMIT 10;

-- Check that the trigger is working by creating a test order
-- (The sold_count should update automatically)
```

## Notes

- The `sold_count` field defaults to 0 for new products
- Only completed orders (confirmed, shipped, delivered) count toward sold_count
- The homepage will show the top 10 most sold products
- The feature includes proper loading states, error handling, and empty states
