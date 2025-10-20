# Ads System Documentation

## Overview

The ads system provides a comprehensive solution for managing and displaying advertisements throughout the application. It uses Pinia for state management, provides caching, and organizes ads by slot types for different sections of the application.

## Architecture

### Core Components

1. **Pinia Store** (`src/stores/useAdsStore.js`) - Centralized state management
2. **Ad Components** (`src/components/ads/`) - Reusable UI components for different ad slots
3. **Composable** (`src/composables/useAds.js`) - Backward compatibility layer
4. **Database Schema** - Supabase tables for ads and ad_requests

### Slot Types

The system supports the following slot types:

- `homepage_banner` - Banner ads at the top of the homepage
- `homepage_featured_products` - Featured products on homepage
- `homepage_featured_stores` - Featured stores on homepage
- `homepage_browse_by_category_products` - Category products on homepage
- `category_banner` - Banner ads inside category pages
- `category_featured_products` - Featured products inside category pages

## Database Schema

### ads Table

```sql
CREATE TABLE ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type VARCHAR(10) NOT NULL,        -- 'product' or 'store'
    product_id uuid REFERENCES products(id) ON DELETE CASCADE,
    store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
    slot_type VARCHAR(50) NOT NULL,
    category_id UUID NULL,
    priority INT DEFAULT 0,
    start_date TIMESTAMP DEFAULT now(),
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

### ad_requests Table

```sql
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
    ad_id uuid NULL REFERENCES ads(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

## Usage

### 1. Using the Pinia Store

```javascript
import { useAdsStore } from '../stores/useAdsStore'

const adsStore = useAdsStore()

// Fetch all ads
await adsStore.fetchAds()

// Get ads by slot type
const bannerAds = adsStore.homepageBannerAds
const featuredProducts = adsStore.homepageFeaturedProducts

// Get ads for a specific category
const categoryAds = adsStore.getAdsByCategory('electronics')

// Transform ads for display
const displayAds = adsStore.transformAdsForDisplay(rawAds)
```

### 2. Using Ad Components

#### Homepage Banner

```vue
<template>
  <HomepageBanner
    :show-main-banner="true"
    main-banner-title="Welcome to Our Store"
    main-banner-subtitle="Discover amazing products"
    @retry="handleRetry"
    @scroll-to-content="handleScrollToContent"
  />
</template>
```

#### Homepage Featured Products

```vue
<template>
  <HomepageFeaturedProducts
    title="Featured Products"
    :show-view-all="true"
    view-all-link="/products"
    :max-products="8"
    @retry="handleRetry"
  />
</template>
```

#### Category Banner

```vue
<template>
  <CategoryBanner
    category-id="electronics"
    :show-main-banner="true"
    main-banner-title="Electronics"
    main-banner-subtitle="Latest gadgets and devices"
    @retry="handleRetry"
  />
</template>
```

### 3. Backward Compatibility

The existing `useAds` composable continues to work:

```javascript
import { useAds } from '../composables/useAds'

const { 
  fetchHomepageBannerAds,
  fetchHomepageFeaturedProducts,
  transformAdsForDisplay 
} = useAds()

// These methods now use the Pinia store internally
const bannerAds = await fetchHomepageBannerAds()
```

## Features

### Caching

- Ads are cached for 5 minutes to avoid repeated API calls
- Cache can be cleared manually with `adsStore.clearCache()`
- Force refresh with `adsStore.refreshAds()`

### Date Filtering

- Only active ads are displayed (within start_date and end_date range)
- Ads with no end_date are considered permanent

### Priority System

- Ads are ordered by priority (higher priority first)
- Secondary ordering by creation date

### Data Consistency

- `category_featured_products` and `homepage_browse_by_category_products` share the same data source
- Products are deduplicated when combining different slot types

## Component Props

### HomepageBanner

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| showMainBanner | Boolean | true | Show the main banner slide |
| mainBannerTitle | String | 'Welcome to Koulchi' | Title for main banner |
| mainBannerSubtitle | String | 'Discover amazing products and stores' | Subtitle for main banner |
| autoPlay | Boolean | true | Enable auto-play |
| autoPlayInterval | Number | 5000 | Auto-play interval in ms |

### HomepageFeaturedProducts

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | String | 'Featured Products' | Section title |
| subtitle | String | null | Section subtitle |
| showViewAll | Boolean | true | Show "View All" link |
| viewAllLink | String | '/products' | Link for "View All" |
| maxProducts | Number | 8 | Maximum products to display |

### CategoryBanner

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| categoryId | String | required | Category ID for filtering ads |
| showMainBanner | Boolean | true | Show the main banner slide |
| mainBannerTitle | String | 'Category' | Title for main banner |
| mainBannerSubtitle | String | 'Explore products in this category' | Subtitle for main banner |

## Events

All ad components emit the following events:

- `retry` - Emitted when user clicks retry button
- `scroll-to-content` - Emitted when user clicks scroll to content button

## Error Handling

- Loading states are handled automatically
- Error states display retry buttons
- Empty states show appropriate messages
- All errors are logged to console

## Performance Considerations

- Ads are fetched once and cached
- Components use computed properties for reactive updates
- Images are lazy-loaded
- Skeleton loading states provide good UX

## Internationalization

All text content supports i18n through the existing translation system. Add new keys to `locales/en.json`:

```json
{
  "ads": {
    "noBannerAds": "No banner ads available",
    "noFeaturedProducts": "No featured products available",
    "noFeaturedStores": "No featured stores available"
  }
}
```

## Testing

The system includes comprehensive error handling and loading states. Test with:

1. Network failures
2. Empty ad results
3. Invalid category IDs
4. Date range filtering
5. Priority ordering

## Migration Guide

### From Old System

1. Replace direct `useAds` calls with ad components
2. Update imports to use new component paths
3. Remove manual ad fetching logic
4. Use the Pinia store for direct access when needed

### Example Migration

**Before:**
```vue
<script setup>
import { useAds } from '../composables/useAds'

const { fetchHomepageBannerAds, transformAdsForDisplay } = useAds()
const bannerAds = ref([])

onMounted(async () => {
  const ads = await fetchHomepageBannerAds()
  bannerAds.value = transformAdsForDisplay(ads)
})
</script>

<template>
  <AdCarousel :ads="bannerAds" />
</template>
```

**After:**
```vue
<script setup>
import HomepageBanner from '../components/ads/HomepageBanner.vue'
</script>

<template>
  <HomepageBanner />
</template>
```

## Troubleshooting

### Common Issues

1. **Ads not loading**: Check network connection and Supabase configuration
2. **Empty sections**: Verify ads exist in database with correct slot_type
3. **Date filtering**: Ensure ads have valid start_date and end_date
4. **Category filtering**: Verify category_id matches existing categories

### Debug Mode

Enable debug logging by setting `localStorage.debug = 'ads:*'` in browser console.

## Future Enhancements

- A/B testing for ad placement
- Real-time ad updates via WebSocket
- Advanced targeting based on user behavior
- Ad performance analytics
- Dynamic ad pricing
