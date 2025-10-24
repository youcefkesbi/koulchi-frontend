CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type VARCHAR(10) NOT NULL,        -- 'product' or 'store'
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
    slot_type VARCHAR(50) NOT NULL,        -- 'homepage_banner', 'homepage_featured_products', 'homepage_featured_stores', 'homepage_browse_by_category_products', 'category_banner'
    category_id UUID NULL,
    priority INT DEFAULT 0,                 -- ordering inside slot
    start_date TIMESTAMP DEFAULT now(),
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);



-- ================================
-- Triggers
-- ================================

-- Attach triggers for updated_at to the ads table
CREATE TRIGGER trg_set_updated_at_on_ads
BEFORE UPDATE ON ads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();



-- ================================
-- RLS policies
-- ================================

-- Public SELECT for currently visible ads (frontend customers, anonymous)
-- Name: policy_ads_select_public_visible
CREATE POLICY policy_ads_select_public_visible
ON ads
FOR SELECT
USING (
  (start_date IS NULL OR start_date <= now())
  AND (end_date IS NULL OR end_date >= now())
);

-- Admin & Employee can SELECT all ads (see drafts/expired)
-- Name: policy_ads_select_admin_employee
CREATE POLICY policy_ads_select_admin_employee
ON ads
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin','employee')
  )
);


-- INSERT into ads: only admin (we rely on trigger to insert from ad_requests)
-- Name: policy_ads_insert_admin_only
CREATE POLICY policy_ads_insert_admin_only
ON ads
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  )
);

-- UPDATE on ads: admin or employee
-- Employees need to be able to remove or adjust live ads (priority/dates). Admins can do everything.
-- Name: policy_ads_update_admin_employee
CREATE POLICY policy_ads_update_admin_employee
ON ads
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin','employee')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin','employee')
  )
);


-- DELETE on ads: admin or employee
-- Name: policy_ads_delete_admin_employee
CREATE POLICY policy_ads_delete_admin_employee
ON ads
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin','employee')
  )
);

-- ===================================================================
-- INDEXES
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_ads_slot_priority ON ads (slot_type, priority);
CREATE INDEX IF NOT EXISTS idx_ads_dates ON ads (start_date, end_date);


-- ================================
-- Constraints
-- ================================

ALTER TABLE ads
ADD CONSTRAINT ads_product_id_fkey
FOREIGN KEY (product_id)
REFERENCES products(id)
ON DELETE CASCADE;

ALTER TABLE ads
ADD CONSTRAINT ads_store_id_fkey
FOREIGN KEY (store_id)
REFERENCES stores(id)
ON DELETE CASCADE;
