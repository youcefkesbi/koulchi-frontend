# Best Selling Products Integration

This document explains how to use the best-selling products integration in the Koulchi frontend application.

## Overview

The integration provides:
- `useProducts` composable for fetching best-selling products from the backend API
- `BestSellingProducts` Vue component for displaying products in a responsive grid
- Support for both general and category-specific best-selling products
- Proper error handling and loading states
- Internationalization support (English, Arabic, French)

## Components

### 1. useProducts Composable

Located at `src/composables/useProducts.js`

**Features:**
- `fetchBestSellingProducts()` - Fetches all best-selling products
- `fetchBestSellingProductsByCategory(categoryId)` - Fetches best-selling products by category
- Loading states and error handling
- Automatic retry functionality
- Search and utility functions

**Usage:**
```javascript
import { useProducts } from '@/composables/useProducts'

const {
  bestSellingProducts,
  bestSellingByCategory,
  loading,
  error,
  fetchBestSellingProducts,
  fetchBestSellingProductsByCategory
} = useProducts()
```

### 2. BestSellingProducts Component

Located at `src/components/BestSellingProducts.vue`

**Props:**
- `categoryId` (String, optional) - Filter by specific category
- `showCategoryFilter` (Boolean, default: false) - Show category filter buttons
- `categories` (Array, optional) - Available categories for filtering
- `limit` (Number, optional) - Limit number of products displayed

**Features:**
- Responsive grid layout (1-4 columns based on screen size)
- Loading spinner and error states
- Empty state handling
- Category filtering
- Product search and navigation
- Internationalization support

**Usage:**
```vue
<template>
  <BestSellingProducts
    :show-category-filter="true"
    :categories="categories"
    :limit="12"
  />
</template>
```

### 3. Integration in Existing Pages

The BestSellingProducts component is integrated into:
- **Home Page**: Shows global best-selling products in the main section
- **Category Pages**: Shows category-specific best-selling products at the top
- **Browse by Category**: Each category section shows its best-selling products

## Environment Configuration

### Required Environment Variables

Add to your `.env` file:

```env
# Backend API URL
VITE_BACKEND_URL=https://koulchi-backend.onrender.com

# Other existing variables...
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

### Backend API Endpoints

The integration expects these endpoints:

- `GET /products/best-selling` - Returns all best-selling products
- `GET /products/best-selling/:categoryId` - Returns best-selling products by category

**Expected Response Format:**
```json
[
  {
    "id": "product-uuid",
    "name": "Product Name",
    "description": "Product Description",
    "price": 99.99,
    "original_price": 149.99,
    "image_url": "https://example.com/image.jpg",
    "store_name": "Store Name",
    "total_sold": 150,
    "rating": 4.5,
    "category_id": "electronics"
  }
]
```

## Usage Examples

### 1. Basic Usage in Home Page

```vue
<template>
  <BestSellingProducts :limit="10" />
</template>

<script setup>
import BestSellingProducts from '@/components/BestSellingProducts.vue'
</script>
```

### 2. With Category Filtering

```vue
<template>
  <BestSellingProducts
    :show-category-filter="true"
    :categories="categories"
    :limit="20"
  />
</template>

<script setup>
import BestSellingProducts from '@/components/BestSellingProducts.vue'

const categories = [
  { id: 'electronics', name: 'Electronics' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'home', name: 'Home & Garden' }
]
</script>
```

### 3. Using the Composable Directly

```vue
<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-for="product in bestSellingProducts" :key="product.id">
        {{ product.name }} - ${{ product.price }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useProducts } from '@/composables/useProducts'

const {
  bestSellingProducts,
  loading,
  error,
  fetchBestSellingProducts
} = useProducts()

onMounted(async () => {
  await fetchBestSellingProducts()
})
</script>
```

## Internationalization

The component supports multiple languages. Add translations to your locale files:

**English (en.json):**
```json
{
  "bestSelling": {
    "title": "Best Selling Products",
    "subtitle": "Discover our most popular products",
    "loading": "Loading best-selling products...",
    "errorTitle": "Failed to load products",
    "retry": "Try Again",
    "emptyTitle": "No products found",
    "emptyMessage": "There are no best-selling products available at the moment.",
    "allCategories": "All Categories",
    "soldBy": "Sold by",
    "sold": "Sold",
    "viewProduct": "View Product",
    "loadMore": "Load More",
    "refresh": "Refresh"
  }
}
```

## Error Handling

The integration includes comprehensive error handling:

1. **Network Errors** - Shows user-friendly messages for connection issues
2. **Server Errors** - Handles 404, 500, and other HTTP errors
3. **Timeout Errors** - 10-second timeout with retry option
4. **Empty States** - Graceful handling when no products are available

## Testing

### Development Testing

1. Set `VITE_BACKEND_URL` to your backend URL
2. Run the development server: `npm run dev`
3. Navigate to the home page to test the best-selling products section
4. Test category pages to verify category-specific best-selling products
5. Check browser console for any errors

### Production Testing

1. Deploy to Vercel with proper environment variables
2. Verify the backend API is accessible from Vercel
3. Test both general and category-specific endpoints
4. Check error handling with network issues

## Troubleshooting

### Common Issues

1. **CORS Errors** - Ensure backend allows requests from your domain
2. **Network Timeouts** - Check backend API response times
3. **Empty Results** - Verify backend API returns data in expected format
4. **Environment Variables** - Ensure `VITE_BACKEND_URL` is set correctly

### Debug Mode

Enable debug logging by setting `VITE_APP_VERSION` in your environment:

```env
VITE_APP_VERSION=1.0.0
```

This will show additional console logs for debugging API calls.

## Performance Considerations

- Products are cached in the composable state
- Parallel loading for multiple categories
- Lazy loading for images
- Responsive grid optimizes for different screen sizes
- 10-second timeout prevents hanging requests

## Future Enhancements

- Pagination support for large product lists
- Advanced filtering options
- Product comparison features
- Analytics integration
- Caching strategies for better performance
