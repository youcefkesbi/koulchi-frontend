# Koulchi 🛒

A modern e-commerce web application built for the Algerian market using **Vue.js** and **Supabase**. Koulchi allows users to browse products, search by category, manage a shopping cart, authenticate securely, and place orders through a fast and responsive interface.

## Features

### 👤 Authentication

* User registration
* Secure login/logout
* Password reset
* Session persistence
* Protected pages

### 🛍️ Product Catalog

* Browse products
* Product details page
* Product categories
* Product images
* Product pricing

### 🛒 Shopping Cart

* Add products to cart
* Remove products
* Update quantities
* Persistent cart
* Cart total calculation

### ❤️ Wishlist

* Save favorite products
* Remove favorites
* User-specific wishlist

### 📦 Orders

* Checkout process
* Order creation
* Order history
* Order status tracking

🏪 Multi-Store Marketplace

Multiple independent stores
Store profiles
Store product listings
Store ratings
Browse products by store

💼 Seller Dashboard

Manage store profile
Add new products
Edit products
Delete products
Upload product images
Manage inventory
View customer orders
Track sales performance
View earnings
Product analytics

🛠️ Admin Dashboard

User management
Seller management
Product moderation
Category management
Store approval
Order management
Advertisement management
Platform analytics
Reports dashboard
Role management

📢 Advertisements

Homepage banners
Featured products
Promotional campaigns
Sponsored stores
Discount campaigns

🔔 Notifications

Order updates
New promotions
Wishlist price changes
Seller notifications
System announcements
In-app notifications

🌍 Language Support
English
Arabic
French
Easy language switching
Localized interface

### 👤 User Profile

* Update personal information
* Manage addresses
* View previous orders

### ⚡ Responsive Design

* Desktop support
* Tablet support
* Mobile support

---

# Tech Stack

## Frontend

* Vue.js
* Vue Router
* Pinia
* JavaScript
* HTML5
* CSS3

## Backend

All backend functionality is powered by **Supabase**.

* Supabase Authentication
* Supabase Database (PostgreSQL)
* Supabase Storage
* Row Level Security (RLS)

---

# Project Structure

```
koulchi/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── layouts/
│   ├── pages/
│   ├── router/
│   ├── stores/
│   ├── services/
│   ├── utils/
│   ├── App.vue
│   └── main.js
│
├── supabase/
│
├── package.json
└── README.md
```

---

# Database

The application uses PostgreSQL through Supabase.

Example tables:

* users
* products
* categories
* product_images
* carts
* cart_items
* wishlists
* orders
* order_items
* addresses

---

# Security

* Supabase Authentication
* Row Level Security (RLS)
* User-specific data access
* Secure API communication
* Environment variables for secrets

---

# Installation

Clone the repository

```bash
git clone https://github.com/youcefkesbi/koulchi-frontend.git
```

Go to the project

```bash
cd koulchi-frontend
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
VITE_SUPABASE_URL=your_supabase_url

VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server

```bash
npm run dev
```

Build for production

```bash
npm run build
```

Preview production build

```bash
npm run preview
```

---

# Environment Variables

```
VITE_SUPABASE_URL=

VITE_SUPABASE_ANON_KEY=
```

---

# Screenshots

* Home page
* Product page
* Shopping cart
* Checkout
* Profile
* Orders

---

# Performance

* Lazy-loaded routes
* Optimized images
* Efficient Supabase queries
* Component reusability
* Responsive UI
* Fast client-side navigation using Vue router

---

# License

This project is licensed under the MIT License, Contributions and improvements are welcomed 🤗 

---

# Author

**Youcef Kesbi**

Full Stack Engineer

Passionate about building scalable web applications and modern full-stack solutions.
