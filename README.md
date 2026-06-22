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

### 🏪 Multi-Store Marketplace

* Multiple independent stores
* Store profiles
* Store product listings
* Store ratings
* Browse products by store

### 💼 Seller Dashboard

* Manage store profile
* Add new products
* Edit products
* Delete products
* Upload product images
* Manage inventory
* View customer orders
* Track sales performance
* View earnings
* Product analytics

### 🛠️ Admin Dashboard

* User management
* Seller management
* Product moderation
* Category management
* Store approval
* Order management
* Advertisement management
* Platform analytics
* Reports dashboard
* Role management

### 📢 Advertisements

* Homepage banners
* Featured products
* Promotional campaigns
* Sponsored stores
* Discount campaigns

### 🔔 Notifications

* Order updates
* New promotions
* Wishlist price changes
* Seller notifications
* System announcements
* In-app notifications

### 🌍 Language Support
* English
* Arabic
* French
* Easy language switching
* Localized interface

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

# Screenshots of Some Important Sections

* Home page
  
<img width="1440" height="704" alt="Screenshot 2026-05-22 at 13 37 03" src="https://github.com/user-attachments/assets/ba929cae-08b5-424e-9d88-81ed58651966" />

* Product page

  <img width="1440" height="848" alt="Screenshot 2026-06-22 at 12 52 23" src="https://github.com/user-attachments/assets/c9dbe36e-87c8-44b5-9485-ecc4c775d678" />

* Shopping cart

<img width="1440" height="846" alt="Screenshot 2026-06-22 at 12 53 35" src="https://github.com/user-attachments/assets/7b1e7603-7717-46c3-96da-47bee545c1db" />

* Checkout

<img width="1440" height="847" alt="Screenshot 2026-06-22 at 12 55 07" src="https://github.com/user-attachments/assets/8ce4c8ea-cfbd-4fbc-b4fe-e641195f5f3d" />

* Profile

<img width="1440" height="776" alt="Screenshot 2026-06-22 at 12 58 58" src="https://github.com/user-attachments/assets/4231c12a-4054-4dcc-8ebc-f5ab86a459a0" />

  
* Admin Dashboard

  <img width="1440" height="775" alt="Screenshot 2026-06-22 at 13 02 15" src="https://github.com/user-attachments/assets/b4dbcbda-6e9a-4eaf-a857-fee39c4e44c1" />


* Seller Dashboard

<img width="1440" height="773" alt="Screenshot 2026-06-22 at 13 05 00" src="https://github.com/user-attachments/assets/86d56927-4f2c-435d-aa4e-aa330cab528c" />


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
