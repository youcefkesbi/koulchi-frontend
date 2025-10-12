CREATE TABLE ad_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES profiles(id),
    item_type VARCHAR(10) NOT NULL,        -- 'product' or 'store'
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
    slot_type VARCHAR(50) NOT NULL,
    category_id UUID NULL,
    priority INT DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
    ad_id uuid NULL REFERENCES ads(id),        -- filled when request is approved and ad created
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- ================================
-- Triggers
-- ================================

-- Attach triggers for updated_at to the ad_requests table
CREATE TRIGGER trg_set_updated_at_on_ad_requests
BEFORE UPDATE ON ad_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to call the function AFTER UPDATE
CREATE TRIGGER trg_handle_ad_request_approval
AFTER UPDATE ON ad_requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION handle_ad_request_approval();




-- ================================
-- Functions
-- ================================

-- Trigger function that will create an ads row when an ad_request is APPROVED
-- This runs AFTER UPDATE, SECURITY DEFINER, so it can insert into ads even when RLS prevents normal users
CREATE OR REPLACE FUNCTION handle_ad_request_approval()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER AS $$
DECLARE
  created_ad_id uuid;
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    IF (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved') THEN
      IF NEW.ad_id IS NULL THEN

        IF NEW.item_type = 'product' THEN
          INSERT INTO ads (
            item_type,
            product_id,
            slot_type,
            category_id,
            priority,
            start_date,
            end_date,
            created_at,
            updated_at
          )
          VALUES (
            NEW.item_type,
            NEW.product_id,
            NEW.slot_type,
            NEW.category_id,
            NEW.priority,
            COALESCE(NEW.start_date, now()),
            NEW.end_date,
            now(),
            now()
          )
          RETURNING id INTO created_ad_id;

        ELSIF NEW.item_type = 'store' THEN
          INSERT INTO ads (
            item_type,
            store_id,
            slot_type,
            category_id,
            priority,
            start_date,
            end_date,
            created_at,
            updated_at
          )
          VALUES (
            NEW.item_type,
            NEW.store_id,
            NEW.slot_type,
            NEW.category_id,
            NEW.priority,
            COALESCE(NEW.start_date, now()),
            NEW.end_date,
            now(),
            now()
          )
          RETURNING id INTO created_ad_id;
        END IF;

        UPDATE ad_requests SET ad_id = created_ad_id WHERE id = NEW.id;
      END IF;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;


-- ================================
-- RLS policies
-- ================================

-- INSERT: vendors and customers can create requests BUT status must be 'pending' and requester_id must match auth.uid()
-- Name: policy_ar_insert_requester_pending
CREATE POLICY policy_ar_insert_requester_pending
ON ad_requests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('vendor','customer')
  )
  AND requester_id = auth.uid()
  AND status = 'pending'
);


-- Admins can insert anything (optional: admin may create/seed requests)
-- Name: policy_ar_insert_admin
CREATE POLICY policy_ar_insert_admin
ON ad_requests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
  )
);


-- SELECT: vendors/customers can SELECT only their own requests
-- Name: policy_ar_select_requester_own
CREATE POLICY policy_ar_select_requester_own
ON ad_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('vendor','customer')
  )
  AND requester_id = auth.uid()
);


-- SELECT: employees and admins can view all requests
-- Name: policy_ar_select_employee_admin
CREATE POLICY policy_ar_select_employee_admin
ON ad_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('employee','admin')
  )
);


-- UPDATE: requesters (vendor/customer) can UPDATE their own request only while it's still pending,
-- and they cannot change status to anything else than 'pending' (prevents self-approval)
-- Name: policy_ar_update_requester_own_pending
CREATE POLICY policy_ar_update_requester_own_pending
ON ad_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('vendor','customer')
  )
  AND requester_id = auth.uid()
  AND status = 'pending'
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('vendor','customer')
  )
  AND requester_id = auth.uid()
  AND status = 'pending'
);


-- DELETE: requesters can delete their own pending requests
-- Name: policy_ar_delete_requester_own_pending
CREATE POLICY policy_ar_delete_requester_own_pending
ON ad_requests
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('vendor','customer')
  )
  AND requester_id = auth.uid()
  AND status = 'pending'
);


-- UPDATE: employees and admins can change status (approve/reject) and edit requests
-- Name: policy_ar_update_employee_admin
CREATE POLICY policy_ar_update_employee_admin
ON ad_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('employee','admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('employee','admin')
  )
);


-- DELETE: employees and admins can delete any ad request
-- Name: policy_ar_delete_employee_admin
CREATE POLICY policy_ar_delete_employee_admin
ON ad_requests
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('employee','admin')
  )
);

-- ===================================================================
-- INDEXES
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_ad_requests_status ON ad_requests (status);
CREATE INDEX IF NOT EXISTS idx_ad_requests_requester ON ad_requests (requester_id);