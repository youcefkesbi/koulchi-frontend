# **Upgrade/Downgrade Implementation Flow**

## **Scenario 1: Customer (no store) → Basic Pack Store**

### **Phase 1: Pre-Upgrade Validation**
1. Check user authentication status
2. Verify user has `customer` role (from `user_roles` table)
3. Verify user has NO existing store:
   - Query `stores` table: no `owner_id` match with status `pending` or `approved`
4. Verify user has products without store:
   - Query `products` table: `seller_id = user_id` AND `store_id IS NULL`
5. Fetch Basic Pack details from `packs` table
6. Validate Basic Pack exists and is active

### **Phase 2: Store Creation**
1. Create store record in `stores` table:
   - `owner_id` = user_id
   - `pack_id` = basic_pack_id
   - `status` = 'pending'
   - `name` = user input
   - `description` = user input (optional)
   - `current_announcements` = 0 (will be updated on approval)
   - `current_images` = 0 (will be updated on approval)
2. Get `store_id` from INSERT response

**Note:** Phases 3-6 are now handled during store approval, NOT during store creation.
This ensures:
- No redundancy if store is rejected
- Better data integrity
- All activation happens atomically on approval
- Vendor role only granted after approval (security best practice)

---

### **Phases 3-6: Store Activation (During Store Approval)**

**When store is approved by employee:**

### **Phase 3: Product Migration**
1. Count products to migrate:
   ```sql
   SELECT COUNT(*) FROM products 
   WHERE seller_id = owner_id AND store_id IS NULL AND status = 'approved'
   ```
2. Check if count exceeds Basic Pack limits:
   - If `count > max_announcements`: Allow migration anyway (grandfathered)
3. Update products:
   ```sql
   UPDATE products 
   SET store_id = approved_store_id, updated_at = NOW()
   WHERE seller_id = owner_id AND store_id IS NULL
   ```
4. Count migrated products (for store stats)

### **Phase 4: Store Statistics Update**
1. Calculate total images from migrated products:
   ```sql
   SELECT COALESCE(SUM(array_length(image_urls, 1)), 0)
   FROM products
   WHERE store_id = approved_store_id AND seller_id = owner_id
   ```
2. Update store:
   ```sql
   UPDATE stores 
   SET current_announcements = migrated_product_count,
       current_images = total_images_count,
       updated_at = NOW()
   WHERE id = approved_store_id
   ```

### **Phase 5: Role Update**
1. Add vendor role:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES (owner_id, 'vendor')
   ON CONFLICT (user_id, role) DO NOTHING
   ```

### **Phase 6: Subscription Record**
1. Get store pack information:
   ```sql
   SELECT pack_id, packs(name_en) FROM stores WHERE id = approved_store_id
   ```
2. Determine plan type from pack name:
   - If pack name contains "pro" or "premium" → `plan_type = 'pro'`
   - Otherwise → `plan_type = 'basic'`
3. Create subscription history:
   ```sql
   INSERT INTO vendor_subscriptions (vendor_id, plan_type, start_date, end_date, status)
   VALUES (owner_id, plan_type, NOW(), NULL, 'active')
   ```
   - `start_date` = approval date (when store becomes active)
   - `end_date` = NULL (lifetime subscription)
   - `status` = 'active'

**Why during approval?**
- Subscription should start when store is actually usable (approved)
- Avoids refunds/cancellations if store is rejected
- Aligns with industry best practices (Shopify, Amazon Seller, etc.)
- Accurate billing period reflects actual usage time
- All activation happens atomically (products, stats, role, subscription)

### **Phase 7: Notifications**
1. Database trigger automatically creates admin notifications (already implemented)
2. Create user notification:
   ```sql
   INSERT INTO notifications (user_id, type, template_key, metadata, link)
   VALUES (user_id, 'store_created', 'notifications.storeCreated', 
           jsonb_build_object('store_id', store_id, 'store_name', store_name), 
           '/subscription')
   ```

### **Phase 7: Notifications (Store Creation)**
1. Database trigger automatically creates admin notifications (already implemented)
2. Create user notification:
   ```sql
   INSERT INTO notifications (user_id, type, template_key, metadata, link)
   VALUES (user_id, 'store_created', 'notifications.storeCreated', 
           jsonb_build_object('store_id', store_id, 'store_name', store_name, 'store_status', 'pending'), 
           '/subscription')
   ```

### **Phase 8: Response (Store Creation)**
1. Return success with:
   - `store_id`
   - `store_status` = 'pending'
   - `message`: "Store created successfully. Awaiting employee approval."

**Note:** Phases 3-6 (Product Migration, Store Statistics, Role Update, Subscription) will be executed when employee approves the store.

---

### **Phase 9: Store Approval Notification (After Employee Approval)**
1. Create user notification when store is approved:
   ```sql
   INSERT INTO notifications (user_id, type, template_key, metadata, link)
   VALUES (owner_id, 'store_approved', 'notifications.storeApproved', 
           jsonb_build_object(
             'store_id', approved_store_id,
             'store_name', store_name,
             'plan_type', plan_type,
             'migrated_products_count', migrated_products_count,
             'subscription_start', approval_date
           ), 
           '/subscription')
   ```

---

## **Scenario 2: Basic Pack Store → Pro Pack Store (Upgrade)**

### **Phase 1: Pre-Upgrade Validation**
1. Check user authentication status
2. Verify user has `vendor` role
3. Verify user has approved store:
   ```sql
   SELECT id, pack_id, status, current_announcements, current_images
   FROM stores 
   WHERE owner_id = user_id AND status = 'approved'
   ```
4. Verify current pack is Basic:
   - Check `pack_id` matches Basic pack
   - Or check pack name contains "Basic"
5. Fetch Pro Pack details from `packs` table
6. Validate Pro Pack exists and is active
7. Check payment/verification (if required for Pro pack)

### **Phase 2: Document and Information Collection**
**Note:** When upgrading from Basic to Pro, the user must provide the same documents/information required for Pro pack creation, EXCEPT for the ID document (already provided during Basic store creation).

**Required for Pro Pack Upgrade:**
1. **Payment Receipt** (new - not provided during Basic creation):
   - Upload payment receipt document
   - Verify payment was successful
   - Store in `verifications` table with type `payment_receipt`

2. **Commercial Register** (new - not provided during Basic creation):
   - Upload commercial register document
   - Store in `verifications` table with type `commerce_register`

3. **Store Name** (new - Basic stores don't have names):
   - User must provide a store name
   - Validate: required, max 100 characters
   - Update `stores.name` field

4. **Store Logo** (new - Basic stores don't have logos):
   - Upload logo image
   - Validate: image file, max size 5MB
   - Store in `stores.logo_url`

5. **Store Banner** (new - Basic stores don't have banners):
   - Upload banner image
   - Validate: image file, max size 5MB
   - Store in `stores.banner_url`

6. **Store Description** (optional - can be updated):
   - User can provide/update store description
   - Validate: max 500 characters
   - Update `stores.description` field

**NOT Required:**
- **ID Document**: Already provided during Basic store creation, no need to re-upload

**Validation:**
- All required documents must be uploaded
- Payment receipt must be valid
- Store name must be provided and valid
- Logo and banner must be uploaded
- If any validation fails → abort with error

**Database Operations:**
```sql
-- Update store with new information
UPDATE stores 
SET name = new_store_name,
    description = new_description,
    logo_url = new_logo_url,
    banner_url = new_banner_url,
    updated_at = NOW()
WHERE id = store_id

-- Insert new verification documents
INSERT INTO verifications (user_id, verification_type, document_url, status)
VALUES 
  (user_id, 'payment_receipt', payment_receipt_url, 'pending'),
  (user_id, 'commerce_register', commerce_register_url, 'pending')
```

### **Phase 3: Store Pack and Information Update**
1. Update store with new pack and Pro pack information:
   ```sql
   UPDATE stores 
   SET pack_id = pro_pack_id,
       name = new_store_name,  -- From Phase 2
       description = new_description,  -- From Phase 2 (optional)
       logo_url = new_logo_url,  -- From Phase 2
       banner_url = new_banner_url,  -- From Phase 2
       updated_at = NOW()
   WHERE id = store_id
   ```
2. No product changes needed (same store - products remain linked)
3. Store status remains `approved` (no need for re-approval if already approved)

### **Phase 4: Subscription History Update**
1. Mark old subscription as ended:
   ```sql
   UPDATE vendor_subscriptions 
   SET end_date = NOW(), 
       status = 'expired',
       updated_at = NOW()
   WHERE vendor_id = user_id 
     AND status = 'active'
     AND plan_type = 'basic'
   ```
2. Create new subscription:
   ```sql
   INSERT INTO vendor_subscriptions (vendor_id, plan_type, start_date, status)
   VALUES (user_id, 'pro', NOW(), 'active')
   ```

### **Phase 5: Feature Activation**
1. Pro features activate immediately:
   - Custom branding enabled
   - Advanced analytics enabled
   - Unlimited social links enabled
   - Higher limits apply
2. Update store limits (if needed):
   - `max_announcements` and `max_images` come from new pack
   - Existing products remain (grandfathered)

### **Phase 6: Notifications**
1. Create user notification:
   ```sql
   INSERT INTO notifications (user_id, type, template_key, metadata, link)
   VALUES (user_id, 'pack_upgraded', 'notifications.packUpgraded',
           jsonb_build_object('from_pack', 'basic', 'to_pack', 'pro', 'store_id', store_id),
           '/subscription')
   ```

### **Phase 7: Response**
1. Return success with:
   - `new_pack_id`
   - `new_pack_name`
   - `upgrade_date`
   - `message`: "Successfully upgraded to Pro Plan. New features are now active."

---

## **Scenario 3: Pro Pack Store → Basic Pack Store (Downgrade)**

### **Phase 1: Pre-Downgrade Validation**
1. Check user authentication status
2. Verify user has `vendor` role
3. Verify user has approved store:
   ```sql
   SELECT id, pack_id, status, current_announcements, current_images, created_at
   FROM stores 
   WHERE owner_id = user_id AND status = 'approved'
   ```
4. Verify current pack is Pro:
   - Check `pack_id` matches Pro pack
   - Or check pack name contains "Pro"
5. Fetch Basic Pack details from `packs` table
6. Check current subscription end date:
   ```sql
   SELECT end_date, start_date 
   FROM vendor_subscriptions 
   WHERE vendor_id = user_id AND status = 'active' AND plan_type = 'pro'
   ```

### **Phase 2: Downgrade Timing Decision**
1. Check if subscription has end date:
   - If `end_date IS NULL` (lifetime/unlimited): Schedule for immediate or future date
   - If `end_date IS NOT NULL`: Schedule for `end_date`
2. Calculate effective date:
   - **Option A:** Immediate (not recommended)
   - **Option B:** End of current period (recommended)
   - **Option C:** User-selected future date

### **Phase 3: Limit Validation (Warning)**
1. Check if current usage exceeds Basic limits:
   ```sql
   SELECT 
     current_announcements,
     current_images,
     (SELECT max_announcements FROM packs WHERE id = basic_pack_id) as basic_max_announcements,
     (SELECT max_images FROM packs WHERE id = basic_pack_id) as basic_max_images
   FROM stores 
   WHERE id = store_id
   ```
2. If exceeds limits:
   - Show warning: "You have X products, Basic plan allows Y. Existing products will remain active (grandfathered), but you cannot add more until below limit."
   - Allow user to proceed or cancel

### **Phase 4: Schedule Downgrade**
1. If immediate downgrade:
   - Go to Phase 5
2. If scheduled downgrade:
   - Store downgrade request:
     ```sql
     INSERT INTO store_downgrade_requests (store_id, from_pack_id, to_pack_id, scheduled_date, status)
     VALUES (store_id, pro_pack_id, basic_pack_id, effective_date, 'scheduled')
     ```
   - Show confirmation: "Downgrade scheduled for [date]. Pro features will remain active until then."
   - Exit flow (actual downgrade happens via scheduled job/trigger)

### **Phase 5: Immediate Downgrade Execution**
1. Update store pack:
   ```sql
   UPDATE stores 
   SET pack_id = basic_pack_id,
       updated_at = NOW()
   WHERE id = store_id
   ```
2. No product changes (products stay in store)

### **Phase 6: Feature Deactivation**
1. Disable Pro features:
   - Custom branding: Keep existing but disable editing
   - Advanced analytics: Hide/disable
   - Unlimited social links: Keep existing but disable adding more
2. Update store limits:
   - `max_announcements` and `max_images` come from Basic pack
   - Existing products remain (grandfathered)

### **Phase 7: Subscription History Update**
1. Mark old subscription as ended:
   ```sql
   UPDATE vendor_subscriptions 
   SET end_date = NOW(), 
       status = 'expired',
       updated_at = NOW()
   WHERE vendor_id = user_id 
     AND status = 'active'
     AND plan_type = 'pro'
   ```
2. Create new subscription:
   ```sql
   INSERT INTO vendor_subscriptions (vendor_id, plan_type, start_date, status)
   VALUES (user_id, 'basic', NOW(), 'active')
   ```

### **Phase 8: Notifications**
1. Create user notification:
   ```sql
   INSERT INTO notifications (user_id, type, template_key, metadata, link)
   VALUES (user_id, 'pack_downgraded', 'notifications.packDowngraded',
           jsonb_build_object('from_pack', 'pro', 'to_pack', 'basic', 'store_id', store_id, 
                            'effective_date', effective_date),
           '/subscription')
   ```

### **Phase 9: Response**
1. Return success with:
   - `new_pack_id`
   - `new_pack_name`
   - `downgrade_date`
   - `effective_date` (if scheduled)
   - `grandfathered_products_count`
   - `message`: "Downgraded to Basic Plan. [X] products remain active. Pro features disabled."

---

## **Implementation Phases Summary**

### **Phase A: Database Preparation**
1. Create `store_downgrade_requests` table (if scheduling downgrades)
2. Add indexes for performance
3. Create helper functions for validation

### **Phase B: API/RPC Functions**
1. `upgrade_customer_to_basic_store()`
2. `upgrade_store_to_pro()`
3. `downgrade_store_to_basic()`
4. `schedule_store_downgrade()`

### **Phase C: Frontend Components**
1. Upgrade button in Subscription.vue
2. Downgrade button with confirmation modal
3. Plan comparison component
4. Migration progress indicator

### **Phase D: Scheduled Jobs (if needed)**
1. Cron job/trigger to process scheduled downgrades
2. Check `store_downgrade_requests` table daily
3. Execute downgrades on scheduled date

### **Phase E: Testing**
1. Test each scenario end-to-end
2. Test edge cases (limits exceeded, payment failures)
3. Test notifications
4. Test historical data preservation

---

## **Notes**

- All database operations should be wrapped in transactions for atomicity
- Product migration preserves all product data and relationships
- Grandfathered products remain active even if they exceed new plan limits
- Notifications should be created for both user and admin (where applicable)
- Subscription history should always be preserved for audit purposes
- Payment processing should be handled securely and verified before pack changes
- Scheduled downgrades require a background job or database trigger to execute

