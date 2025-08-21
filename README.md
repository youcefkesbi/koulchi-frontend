# Koulchi E-commerce Platform

A modern, multi-language e-commerce platform built with Vue 3, Supabase, and Tailwind CSS.

## Features

- 🛒 **E-commerce Platform**: Buy and sell products with a user-friendly interface
- 🌍 **Multi-language Support**: Arabic, English, and French
- 🔐 **Supabase Authentication**: Secure user authentication and authorization
- 👥 **User System**: Users can buy and sell products with full control over their listings
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🚀 **Modern Tech Stack**: Vue 3, Pinia, Vue Router, Vite

## Tech Stack

- **Frontend**: Vue 3, Pinia, Vue Router, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Styling**: Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd koulchi-frontend
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Database

1. Go to your Supabase project SQL editor
2. Copy and paste the contents of `supabase-setup.sql`
3. Run the SQL script to create tables and seed data

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application.

## Project Structure

```
src/
├── components/          # Reusable Vue components
├── views/              # Page components
├── stores/             # Pinia stores for state management
├── router/             # Vue Router configuration
├── lib/                # Utility libraries (Supabase client)
├── locales/            # Internationalization files
└── main.js             # Application entry point
```

## Database Schema

### Tables

- **profiles**: User profiles with role-based access
- **categories**: Product categories
- **products**: Product listings
- **orders**: Purchase orders
- **wishlist**: User wishlists

### Key Features

- **Row Level Security (RLS)**: Secure data access
- **User Permissions**: Users can manage their own profiles and listings
- **Automatic User Creation**: Trigger-based profile creation

## User Features

- Can buy and sell products
- Manage their own profile
- View and manage orders
- Maintain wishlist
- Full control over their listings

## API Endpoints

All data operations go through Supabase:

- **Authentication**: `supabase.auth.*`
- **Products**: `supabase.from('products')`
- **Categories**: `supabase.from('categories')`
- **Orders**: `supabase.from('orders')`
- **Wishlist**: `supabase.from('wishlist')`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel/Netlify

1. Connect your repository
2. Set environment variables
3. Deploy automatically on push

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue in the repository or contact the development team.
