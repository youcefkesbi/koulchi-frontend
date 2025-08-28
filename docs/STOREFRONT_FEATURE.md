# Storefront Feature Implementation

This document describes the implementation of the full storefront feature in the Koulchi frontend application.

## Overview

The storefront feature allows users to:
- Create and manage their own stores
- Display store information with logos and banners
- Browse all available stores
- View individual store pages with their products
- Associate products with specific stores

## New Components

### 1. Store Store (`src/stores/store.js`)
- Manages store CRUD operations
- Handles image uploads to Supabase storage buckets
- Maintains state for all stores and user stores

### 2. Stores Page (`src/views/Stores.vue`)
- Lists all available stores
- Displays store logos and banners
- Responsive grid layout with hover effects
- Loading and error states

### 3. Store Detail Page (`src/views/StoreDetail.vue`)
- Individual store page showing store information
- Lists all products belonging to that store
- Hero banner with store logo overlay
- Product grid using existing ProductCard component

### 4. Store Management Component (`src/components/StoreManagement.vue`)
- Integrated into user dashboard
- Create, edit, and delete stores
- Image upload for logos and banners
- Preview functionality for uploaded images

## New Routes

- `/stores` - Lists all stores
- `/stores/:id` - Individual store page

## Database Schema

The feature uses the existing database schema:

### Stores Table
```sql
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade,
  name text not null,
  description text,
  logo_url text,
  banner_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

### Products Table
- Added `store_id` field to link products to stores
- Products can be associated with a specific store or remain as profile products

## Storage Buckets

The feature uses two Supabase storage buckets:
- `stores-logos` - For store logo images
- `stores-banners` - For store banner images

## Features

### Store Creation
- Store name and description
- Logo upload (stored in stores-logos bucket)
- Banner upload (stored in stores-banners bucket)
- Image preview functionality

### Store Management
- Edit existing stores
- Update store information and images
- Delete stores (with confirmation)
- View store statistics

### Product Association
- When creating products, users can select a store
- Products are automatically linked to the selected store
- Store products are displayed on the store page

### Navigation
- Added "Stores" link in header navigation
- Integrated store management in user dashboard
- Breadcrumb navigation between store pages

## Usage

### For Store Owners
1. Navigate to Dashboard
2. Use "Manage Your Stores" section
3. Create new store with name, description, and images
4. When adding products, select the store to associate them with

### For Customers
1. Click "Stores" in header navigation
2. Browse available stores
3. Click on store cards to view store details
4. Browse products within each store

## Technical Implementation

### State Management
- Uses Pinia store for store management
- Reactive state for stores, user stores, and current store
- Error handling and loading states

### Image Handling
- File upload with preview
- Supabase storage integration
- Public URL generation for database storage

### Responsive Design
- Mobile-first approach
- Grid layouts that adapt to screen size
- Consistent styling with existing components

## Future Enhancements

- Store analytics and statistics
- Store categories and tags
- Store search and filtering
- Store reviews and ratings
- Store social media integration
- Store subscription plans

## Dependencies

- Vue 3 Composition API
- Pinia for state management
- Supabase for backend and storage
- Tailwind CSS for styling
- Font Awesome for icons
