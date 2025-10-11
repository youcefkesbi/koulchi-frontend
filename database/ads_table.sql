CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type VARCHAR(10) NOT NULL,        -- 'product' or 'store'
    item_id UUID NOT NULL,                  -- references products(id) OR stores(id)
    slot_type VARCHAR(50) NOT NULL,        -- e.g., 'homepage_banner', 'homepage_featured_products', 'category_banner'
    category_id UUID NULL,                  -- only for category-specific slots
    priority INT DEFAULT 0,                 -- ordering inside slot
    start_date TIMESTAMP DEFAULT now(),
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Attach triggers for updated_at to the ads table
CREATE TRIGGER trg_set_updated_at_on_ads
BEFORE UPDATE ON ads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();