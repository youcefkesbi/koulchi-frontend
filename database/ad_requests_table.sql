CREATE TABLE ad_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES profiles(id),
    item_type VARCHAR(10) NOT NULL,        -- 'product' or 'store'
    item_id UUID NOT NULL,
    slot_type VARCHAR(50) NOT NULL,
    category_id UUID NULL,
    priority INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
    ad_id uuid NULL REFERENCES ads(id),        -- filled when request is approved and ad created
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Attach triggers for updated_at to the ad_requests table
CREATE TRIGGER trg_set_updated_at_on_ad_requests
BEFORE UPDATE ON ad_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();