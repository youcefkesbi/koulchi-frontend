# Implementation Flow: Single Address with Real-time Delivery Fee Calculation

## Overview
This document outlines the implementation flow for handling delivery addresses and calculating delivery fees based on the Maystro API, following common e-commerce practices and aligning with the database structure.

---

## Phase 1: Account.vue - Add Address Form

### Goal
Allow users to save/update their delivery address in their profile.

### Tasks

#### Add address form section to Account.vue
- Fields: wilaya (dropdown), commune (text/autocomplete), street, postal code, floor (optional)
- Use Algerian wilayas data from Maystro API
- Address form is part of the main profile form

#### Database integration
- Use existing `shipping_address` JSONB column in `profiles` table
- Store address as JSONB object with structure:
  ```json
  {
    "wilaya_id": integer,
    "wilaya_name": string,
    "commune_id": integer,
    "commune_name": string,
    "street": string,
    "postal_code": string (optional),
    "floor": string (optional)
  }
  ```
- No new columns needed

#### Save functionality
- Address is saved when user clicks "Update Profile" button
- Address form does NOT have separate save/cancel buttons
- Only "Update Profile" and "Cancel" buttons at the bottom of the form
- When "Update Profile" is clicked:
  - Update `full_name` and `phone_num` fields
  - Update `shipping_address` JSONB column with address data
  - Show success message after save
- Handle validation (required fields: wilaya, commune, street)

#### Display saved address
- Show current saved address in read-only mode
- "Edit Address" button to toggle edit mode
- When editing, address form fields are shown inline

---

## Phase 2: Checkout.vue - Pre-fill Form with Saved Address

### Goal
Pre-populate checkout form with user's saved address.

### Tasks

#### Load saved address on checkout page mount
- Fetch user profile data
- Extract address fields (wilaya, commune, street, etc.)
- Pre-fill form fields if address exists

#### Form pre-fill logic
- If address exists → pre-fill all fields
- If no address → show empty form (current behavior)
- User can still edit any field

#### Handle address updates
- If user changes address during checkout, allow editing
- Don't auto-save during checkout (save after order)

---

## Phase 3: Checkout.vue - Real-time Delivery Fee Calculation

### Goal
Calculate delivery fee using Maystro API when commune is selected.

### Tasks

#### Create Maystro service/utility
- Function to call `GET /delivery-options/?commune={commune_id}`
- Handle API errors (404, network errors)
- Return delivery options array

#### Add delivery fee calculation trigger
- When user selects/enters commune → trigger calculation
- Show loading state while fetching
- Display delivery options (Home, Stop-Desk, Pickup) with prices

#### Update cart store delivery fee
- Replace hardcoded 500 DZD with calculated fee
- Update `deliveryFee` computed property to use selected fee
- Default to "Home" delivery type if multiple options

#### UI updates
- Show delivery options as radio buttons or dropdown
- Display selected delivery fee
- Update total amount in real-time
- Show error if delivery not available to selected commune

#### Commune ID mapping
- Map commune name to Maystro `commune_id`
- May need to fetch communes from Maystro API or maintain mapping
- Store `commune_id` when user selects commune

---

## Phase 4: Cart.vue - Display Calculated Delivery Fee (Optional)

### Goal
Show estimated delivery fee in cart (if commune is already known).

### Tasks

#### Option A: Calculate in Cart
- Check if user has saved address
- If yes → fetch delivery fee for saved commune
- Display estimated fee in cart summary
- Note: "Final fee calculated at checkout"

#### Option B: Keep Simple (Recommended)
- Show message: "Delivery fee calculated at checkout"
- Don't calculate in cart (only at checkout)

---

## Phase 5: Order Creation - Save Address After Order

### Goal
Save/update user's address after successful order placement.

### Tasks

#### After order creation in Checkout.vue
- Extract address from checkout form
- Update user profile with new address
- This becomes the saved address for next order

#### Database update
- Update profiles table with address fields
- Handle errors gracefully (order still created even if profile update fails)

#### Address persistence
- Next checkout will pre-fill with this address
- User can update in Account.vue anytime

---

## Phase 6: Error Handling & Edge Cases

### Goal
Handle all edge cases and errors.

### Tasks

#### Maystro API errors
- Handle 404 (pricing not found) → show error, disable checkout
- Handle network errors → show retry option
- Handle invalid `commune_id` → validate before API call

#### Address validation
- Validate required fields before order
- Validate commune exists in Maystro before calculating fee
- Show clear error messages

#### Fallback behavior
- If Maystro API fails → use default fee (500 DZD) or disable checkout
- If no saved address → user must fill form
- If commune not found → show error, allow user to change commune

---

## Implementation Notes

### Maystro API Endpoints Used
- `GET /api/base/wilayas/` - Get all wilayas
- `GET /api/base/communes/` - Get communes by wilaya
- `GET /api/base/delivery-options/` - Get delivery options by commune
- `GET /api/base/delivery-prices/` - Get delivery price by commune and type

### Database Considerations
- Ensure `profiles` table supports address fields
- Consider using JSONB for `shipping_address` if flexible structure needed
- Maintain referential integrity with wilaya/commune IDs

### User Experience
- Provide clear feedback during API calls (loading states)
- Show validation errors inline
- Allow users to edit address at any point
- Save address automatically after successful order

---

## Testing Checklist

- [ ] User can save address in Account.vue
- [ ] Saved address pre-fills in Checkout.vue
- [ ] Delivery fee calculates correctly when commune selected
- [ ] Multiple delivery options display correctly
- [ ] Address saves after order creation
- [ ] Error handling works for API failures
- [ ] Validation prevents invalid addresses
- [ ] Fallback behavior works when API unavailable

