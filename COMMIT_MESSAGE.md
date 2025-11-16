feat: Implement Pro Pack downgrade flow, enhance notifications, and fix subscription display

## Database Changes

### RPC Functions - Store Management

- create_store(): 

  - Added pack name variables (pack_name_en_val, pack_name_ar_val, pack_name_fr_val) to DECLARE block

  - Extended SELECT query to fetch pack names (name_en, name_ar, name_fr) from packs table

  - Updated user notification metadata to include pack name information in all three languages

  - Modified notification message to explicitly include Status: pending. text

- downgrade_store_to_basic() (NEW):

  - Implemented scenario 3: Pro Pack Store → Basic Pack Store downgrade

  - Validates user ownership and store pack type

  - Updates store pack_id to Basic pack

  - Marks old Pro subscription as ended in vendor_subscriptions

  - Creates new Basic subscription record with active status

  - Maintains grandfathered product limits (existing products remain active)

  - Disables Pro features (custom branding, advanced analytics, unlimited social links)

  - Returns store_id on success

- get_store_details_for_admin():

  - Fixed JSONB extraction for shipping_address.owner_city

  - Changed from direct ::TEXT cast to safe JSONB extraction using ->> operator

  - Added fallback to Unknown Address if both commune_name and wilaya_name are null

  - Resolves invalid input syntax for type json (22P02) error

- get_stores_by_pack_type():

  - Fixed JSONB extraction for shipping_address.owner_city (same fix as above)

  - Added LEFT JOIN with verifications table to retrieve document URLs and IDs

  - Now returns: id_document_url, id_document_id, commerce_register_url, 

    commerce_register_id, payment_receipt_url, payment_receipt_id

  - Fixes missing document display in EmployeeDashboard.vue for basic pack stores

### Database Triggers

- notify_admins_on_store_creation():

  - Changed admin notification template_key from notifications.storeCreated to notifications.adminStoreCreated

  - Added pack information (pack_name_en, pack_name_ar, pack_name_fr) to notification metadata

  - Admin notifications now display: User {owner_id} has created a {pack_name_en} store successfully

  - Ensures admins receive different notification content than store owners

## Frontend Changes

### Components

- StoreDowngrade.vue (NEW):

  - Created component for handling Pro Pack to Basic Pack downgrade

  - Displays warning message about feature loss

  - Shows current plan vs new plan comparison

  - Handles grandfathered product limits with visual indicators

  - Requires explicit confirmation checkbox before downgrade

  - Mirrors StoreUpgrade.vue structure and authentication patterns

- Subscription.vue:

  - Added getEndDateDisplay() function to calculate end date for Pro packs

  - Pro packs with null end_date now display one year from start_date

  - Basic packs with null end_date continue to show Lifetime

  - Added upgrade/downgrade action buttons:

    - Upgrade to Pro Pack button (visible for Basic pack stores)

    - Downgrade to Basic Pack button (visible for Pro pack stores)

  - Buttons link to /store/:id/upgrade and /store/:id/downgrade routes

- StoreUpgrade.vue:

  - Updated props to use id instead of storeId for consistency

  - Updated RPC call to use props.id

### Routing

- router/index.js:

  - Added route: /store/:id/downgrade → StoreDowngrade.vue

  - Route requires authentication and passes id as prop

  - Matches existing /store/:id/upgrade route pattern

## Internationalization (i18n)

### English (locales/en.json)

- stores section:

  - Added upgradeToPro, upgradeDescription, upgradeDocsNote, upgradeSuccess, upgrading

  - Added downgradeToBasic, downgradeDescription, downgradeWarning, downgradeWarningMessage

  - Added downgradeFeature1-5 (detailed feature loss descriptions)

  - Added currentPlan, newPlan, grandfathered, downgradeConfirmation

  - Added downgrading, confirmDowngrade, downgradeSuccess, confirmDowngradeFirst

- notifications section:

  - Updated storeCreated: Your store store_name has been created successfully. Status: pending.

  - Added adminStoreCreated: User {owner_id} has created a {pack_name_en} store successfully

### French (locales/fr.json)

- Added all corresponding French translations for upgrade/downgrade flows

- Updated notification translations with French pack names

### Arabic (locales/ar.json)

- Added all corresponding Arabic translations for upgrade/downgrade flows

- Updated notification translations with Arabic pack names

## Bug Fixes

- Fixed JSONB parsing error (22P02) in store admin functions when shipping_address contains non-JSON text

- Fixed missing document URLs/IDs in EmployeeDashboard.vue for basic pack stores

- Ensured all Notifications.vue translation keys are present (unread, hoursAgo, markRead, delete)

## Technical Details

- All RPC functions maintain SECURITY DEFINER pattern for proper authentication

- Notification system now differentiates between admin and vendor notifications using template_key

- Pack information is included in notification metadata for proper i18n rendering

- Downgrade flow follows same authentication and validation patterns as upgrade flow

- All database changes are backward compatible


