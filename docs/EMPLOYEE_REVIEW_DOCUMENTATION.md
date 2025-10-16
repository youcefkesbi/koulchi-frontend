# Employee Review Documentation

## Overview
This documentation outlines the complete review process for employees to evaluate and moderate three types of items in the system:
1. **Pro Pack Stores** - Full-featured stores with multiple verification documents
2. **Basic Pack Stores** - Simple stores with minimal verification requirements
3. **Products** - Individual product listings without store association

---

## Table of Contents
- [Pro Pack Stores Review Process](#pro-pack-stores-review-process)
- [Basic Pack Stores Review Process](#basic-pack-stores-review-process)
- [Products Review Process](#products-review-process)
- [Common Elements](#common-elements)
- [Status Definitions](#status-definitions)
- [Troubleshooting](#troubleshooting)

---

## Pro Pack Stores Review Process

### Accessing Pro Pack Stores
1. Navigate to **Employee Dashboard**
2. Click on **"Pro Pack Stores"** tab
3. View list of pending pro pack stores

### Store Information Displayed
- **Store Name** (with reject button)
- **Store Description** (with reject button)
- **Logo** (with reject button)
- **Banner** (with reject button)
- **ID Document** (with reject button)
- **Commerce Register** (with reject button)
- **Payment Receipt** (with reject button)
- **Owner Information**
- **Created Date**

### Review Process

#### Step 1: Open Store Details
- Click on any **pending** store container
- Store details modal will open with all information

#### Step 2: Review Individual Elements
Each element has its own reject button:

**For Text Elements (Name, Description):**
1. Click **"Reject"** button next to the element
2. Rejection reason form opens
3. Select rejection category:
   - Invalid Documents
   - Expired Documents
   - Incomplete Information
   - Policy Violation
   - Poor Quality
   - Multiple Issues
   - Inappropriate Content
   - Not Descriptive
   - Too Short
   - Too Long
   - Unclear Language
   - Other
4. Provide additional details (optional)
5. Click **"Reject"** to save reason temporarily
6. Element rejection reason is stored temporarily
7. Store details modal remains open

**For Document Elements (Logo, Banner, ID Document, Commerce Register, Payment Receipt):**
1. Click **"Reject"** button next to the document
2. Rejection reason form opens
3. Select rejection category (same options as above)
4. Provide additional details (optional)
5. Click **"Reject"** to save reason temporarily
6. Document rejection reason is stored temporarily
7. Store details modal remains open

#### Step 3: Final Decision

**To Approve the Store:**
1. Click **"Approve"** button at bottom of modal
2. Store status → `'approved'`
3. All non-rejected documents → `'approved'`
4. Store owner gets `'vendor'` role
5. Modal closes and data refreshes

**To Reject the Store:**
1. Click **"Reject"** button at bottom of modal
2. If elements were rejected individually:
   - All rejection reasons are combined
   - Store status → `'rejected'`
   - Combined reasons saved to `stores.rejection_reason`
3. If no elements were rejected:
   - Rejection reason form opens for manual input
   - Store status → `'rejected'`
   - Manual reason saved to `stores.rejection_reason`
4. Modal closes and data refreshes

---

## Basic Pack Stores Review Process

### Accessing Basic Pack Stores
1. Navigate to **Employee Dashboard**
2. Click on **"Basic Pack Stores"** tab
3. View list of pending basic pack stores

### Store Information Displayed
- **Store ID**
- **Status**
- **Owner Name**
- **Created Date**

### Review Process

#### Step 1: Open Store Details
- Click on any basic store container
- Store details modal will open

#### Step 2: Review Available Information
**Basic stores only have:**
- **Store ID**
- **Owner Name**
- **ID Document** (with reject button)

**Note:** Basic stores do NOT have:
- Store Name
- Store Description
- Logo
- Banner
- Commerce Register
- Payment Receipt

#### Step 3: Review ID Document
**For ID Document:**
1. Click **"Reject"** button next to ID document
2. Rejection reason form opens
3. Select rejection category
4. Provide additional details (optional)
5. Click **"Reject"** to save reason temporarily
6. Document rejection reason is stored temporarily
7. Store details modal remains open

#### Step 4: Final Decision

**To Approve the Store:**
1. Click **"Approve"** button at bottom of modal
2. Store status → `'approved'`
3. ID document → `'approved'`
4. Store owner gets `'vendor'` role
5. Modal closes and data refreshes

**To Reject the Store:**
1. Click **"Reject"** button at bottom of modal
2. If ID document was rejected:
   - ID document rejection reason is used
   - Store status → `'rejected'`
   - Reason saved to `stores.rejection_reason`
3. If no elements were rejected:
   - Rejection reason form opens for manual input
   - Store status → `'rejected'`
   - Manual reason saved to `stores.rejection_reason`
4. Modal closes and data refreshes

---

## Products Review Process

### Accessing Products
1. Navigate to **Employee Dashboard**
2. Click on **"Products"** tab
3. View list of pending products

### Product Information Displayed
- **Product Name**
- **Owner Name**
- **Created Date**
- **Status**

### Review Process

#### Step 1: Open Product Details
- Click on any product container
- Product details modal will open

#### Step 2: Review Product Information
**Product details include:**
- **Product Name** (with reject button)
- **Product Description** (with reject button)
- **Product Price**
- **Product Image** (with reject button)
- **Stock Quantity**
- **Category**

#### Step 3: Review Individual Elements
Each element has its own reject button:

**For Text Elements (Name, Description):**
1. Click **"Reject"** button next to the element
2. Rejection reason form opens
3. Select rejection category (same options as stores)
4. Provide additional details (optional)
5. Click **"Reject"** to save reason temporarily
6. Element rejection reason is stored temporarily
7. Product details modal remains open

**For Image Element:**
1. Click **"Reject"** button next to the image
2. Rejection reason form opens
3. Select rejection category
4. Provide additional details (optional)
5. Click **"Reject"** to save reason temporarily
6. Image rejection reason is stored temporarily
7. Product details modal remains open

#### Step 4: Final Decision

**To Approve the Product:**
1. Click **"Approve"** button at bottom of modal
2. Product status → `'approved'`
3. Product rejection_reason → `null`
4. Product is_active → `true`
5. Modal closes and data refreshes

**To Reject the Product:**
1. Click **"Reject"** button at bottom of modal
2. If elements were rejected individually:
   - All rejection reasons are combined with " | " separator
   - Product status → `'rejected'`
   - Combined reasons saved to `products.rejection_reason`
3. If no elements were rejected:
   - Default reason "Product rejected by employee" is used
   - Product status → `'rejected'`
   - Reason saved to `products.rejection_reason`
4. Modal closes and data refreshes

---

## Common Elements

### Rejection Reason Categories
All rejection forms use the same categories:
- **Invalid Documents** - Documents are fake, illegible, or don't match business
- **Expired Documents** - Documents have expired and need renewal
- **Incomplete Information** - Missing required information or fields
- **Policy Violation** - Violated platform policies
- **Poor Quality** - Quality issues that need improvement
- **Multiple Issues** - Several problems that need addressing
- **Inappropriate Content** - Content violates community guidelines
- **Not Descriptive** - Information lacks sufficient detail
- **Too Short** - Information is too brief
- **Too Long** - Information is unnecessarily lengthy
- **Unclear Language** - Information is confusing or unclear
- **Other** - Custom reason with specific details

### Status Definitions
- **Pending** - Awaiting review (yellow badge)
- **Approved** - Approved by employee (green badge)
- **Rejected** - Rejected by employee (red badge)
- **Active** - Product is active and visible (blue badge)
- **Inactive** - Product is inactive (gray badge)

### Visual Indicators
- **Clickable containers** - Hover effects indicate clickable items
- **Status badges** - Color-coded status indicators
- **Reject buttons** - Red buttons next to reviewable elements
- **Action buttons** - Green (Approve) and Red (Reject) at bottom of modals

---

## Troubleshooting

### Common Issues

**Q: Rejection form doesn't open**
- Ensure you're clicking the correct reject button
- Check if the element has a reject button (not all elements are rejectable)

**Q: Can't reject multiple elements**
- Each element must be rejected individually
- Rejection reasons are stored temporarily until main reject button is clicked

**Q: Store/Product not updating after approval/rejection**
- Check if the action was successful (success message should appear)
- Refresh the page if needed
- Check browser console for any errors

**Q: Rejection reasons not combining properly**
- Ensure you're clicking the main reject button (not individual element reject buttons)
- Check that rejection reasons were saved for individual elements first

### Best Practices

1. **Review thoroughly** - Check all available information before making a decision
2. **Use specific rejection reasons** - Provide clear feedback for rejections
3. **Be consistent** - Apply the same standards across similar items
4. **Document issues** - Use the additional details field for complex rejections
5. **Test functionality** - Ensure all buttons and forms work as expected

### Support
If you encounter issues not covered in this documentation, contact the development team with:
- Screenshot of the issue
- Steps to reproduce
- Browser and version information
- Any error messages displayed

---

*Last updated: [Current Date]*
*Version: 1.0*
