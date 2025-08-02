# Koulchi Frontend

A modern Vue.js e-commerce frontend application tailored for the Algerian market, featuring Cash on Delivery (COD) payment and multi-language support.

## Features

- 🌍 **Multi-language Support** - Arabic, French, and English
- 🛒 **Shopping Cart** - Persistent cart with Supabase backend
- 🔐 **Authentication** - Google and Facebook OAuth via Supabase
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 💳 **COD Payment** - Cash on Delivery for Algerian market
- 🚚 **Fast Delivery** - Optimized for Algerian delivery networks
- 🎨 **Modern UI** - Beautiful and intuitive user interface

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vue Router** - Official router for Vue.js
- **Pinia** - Intuitive, type safe store for Vue
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Open source Firebase alternative
- **Vue I18n** - Internationalization plugin
- **Vite** - Next generation frontend tooling

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd koulchi-frontend-cursor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   
   Create a Supabase project and update the configuration in `src/supabase.js`:
   ```javascript
   const supabaseUrl = 'your-supabase-url'
   const supabaseAnonKey = 'your-supabase-anon-key'
   ```

   **Enable Authentication Providers:**
   - Go to Supabase Dashboard > Authentication > Providers
   - Enable Google provider
   - Enable Facebook provider (requires Facebook App setup)

4. **Set up Database Tables**
   
   Create the following tables in your Supabase database:
   
   **products table:**
   ```sql
   CREATE TABLE products (
     id SERIAL PRIMARY KEY,
     name VARCHAR NOT NULL,
     name_ar VARCHAR NOT NULL,
     price INTEGER NOT NULL,
     original_price INTEGER NOT NULL,
     image VARCHAR,
     category VARCHAR NOT NULL,
     description TEXT,
     description_ar TEXT,
     in_stock BOOLEAN DEFAULT true,
     is_new BOOLEAN DEFAULT false,
     is_on_sale BOOLEAN DEFAULT false,
     rating DECIMAL(3,2) DEFAULT 0,
     reviews INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```
   
   **cart_items table:**
   ```sql
   CREATE TABLE cart_items (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
     quantity INTEGER NOT NULL DEFAULT 1,
     price INTEGER NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Supabase Setup

### Google Authentication
1. In Supabase Dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your domain to authorized domains
4. Configure OAuth credentials from Google Cloud Console

### Facebook Authentication
1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com)
2. Add Facebook Login product
3. Configure OAuth redirect URIs
4. Add Facebook App ID and Secret to Supabase

### Database Policies
Set up Row Level Security (RLS) policies for your tables:

**cart_items table:**
```sql
-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their cart items
CREATE POLICY "Users can view own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own cart items
CREATE POLICY "Users can insert own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own cart items
CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for users to delete their own cart items
CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);
```

## Project Structure

```
src/
├── components/
│   ├── Header.vue          # Main header with auth and language switcher
│   ├── LoginModal.vue      # Authentication modal
│   ├── LanguageSwitcher.vue # Language selection component
│   └── ...
├── stores/
│   ├── auth.js            # Authentication state management
│   ├── cart.js            # Shopping cart management
│   └── products.js        # Product data management
├── locales/
│   ├── en.json           # English translations
│   ├── fr.json           # French translations
│   └── ar.json           # Arabic translations
├── i18n.js               # Internationalization configuration
├── supabase.js           # Supabase configuration
└── ...
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Dependencies

- **Vue 3** - Progressive JavaScript framework
- **Vue Router** - Official router for Vue.js
- **Pinia** - Intuitive, type safe store for Vue
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Open source Firebase alternative
- **Vue I18n** - Internationalization plugin
- **Headless UI** - Unstyled, accessible UI components
- **VueUse** - Collection of Vue composition utilities

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 