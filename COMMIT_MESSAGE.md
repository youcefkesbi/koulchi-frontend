feat: Fix MyPurchases database schema issues and enhance order filtering with new Profile component

## Database Changes:
- Fix get_buyer_orders_with_details RPC function in orders_table.sql
  - Resolve "column p.is_active does not exist" error by using correct category join condition
  - Change json_agg to jsonb_agg and json_build_object to jsonb_build_object for proper JSONB return type
  - Fix return type mismatch: change '[]'::json to '[]'::jsonb to match function signature
  - Update function to properly join categories using c.is_active = true instead of non-existent p.is_active
  - Enhance JSON structure: return category as object with name_en name_ar name_fr instead of single category_name
  - Add store information to product JSON with store id and name
  - Fix join with stores table using store_id from products

## Frontend Changes:

### MyPurchases.vue:
- Fix getLocalizedRoute function definition error
  - Add missing getLocalizedRoute wrapper function using useLocaleRouter composable
  - Fix function to properly use getLocalizedPath with locale options
- Update category fetching to match database schema
  - Change from status = 'approved' to is_active = true (matching categories_table.sql structure)
  - Select all category columns: id name_en name_ar name_fr description icon_url is_active created_at updated_at
  - Ensure frontend matches exact database structure
- Improve layout and UX
  - Remove grid layout constraint: change from grid-cols-1 lg:grid-cols-2 to single column
  - Add w-full class to orders card for full page width
  - Update category select styling: remove absolute positioning make inline with status filter
- Add status filter functionality
  - Add statusFilter reactive variable and status filter dropdown
  - Create setStatusFilter function and unified applyFilters function
  - Enable filtering by status: All Pending Confirmed Shipped Delivered Cancelled
  - Allow combined filtering: users can filter by both category and status simultaneously
  - Update initializeFilteredOrders to use new unified filter logic
- Enhance category helper functions
  - Add fallback to category_id in getProductCategory if category object missing
  - Improve getCategoryName to handle new category structure with multilingual support

### Profile.vue (New Component):
- Create new Profile page component for store owners
  - Display profile information: full_name email city store_name
  - Show store information: status pack_plan with multilingual pack names
  - Access control: only accessible to users with vendor or customer roles
  - Authentication check and error handling
  - Loading states and user-friendly error messages
  - Integration with useAuthStore and useStoresStore
  - Fetch profile data from profiles table and store data from stores table
  - Display store status with color-coded badges (approved pending rejected suspended)
  - Show subscription plan with locale-aware pack name display
  - Action buttons: Go Back to Dashboard and View Store links
  - Responsive design matching Account.vue styling patterns
- Add translations for Profile component
  - English: profile.storeOwnerTitle profile.storeOwnerSubtitle profile.personalInformation profile.storeInformation profile.city profile.storeName profile.storeStatus profile.packPlan profile.viewStore profile.notProvided profile.notStoreOwner profile.notStoreOwnerMessage profile.notAuthenticated profile.loadError profile.statusApproved profile.statusPending profile.statusRejected profile.statusSuspended profile.noPack
  - French: All corresponding translations
  - Arabic: All corresponding translations with RTL support

## Technical Improvements:
- Fix database schema mismatches between frontend and backend
- Ensure type consistency: JSONB return types match function signatures
- Improve error handling with proper fallbacks
- Enhance data fetching to include all required fields
- Better separation of concerns with unified filter logic
- Improved code maintainability with helper functions

## User Experience:
- Full-width orders table for better visibility
- Combined filtering capabilities (category + status)
- Clear access control messages for unauthorized users
- Comprehensive profile view for store owners
- Multilingual support throughout new features

