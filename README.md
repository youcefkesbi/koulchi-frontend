# Koulchi Frontend

A modern e-commerce platform built with Vue 3, Tailwind CSS, and Supabase for authentication and data management.

## Features

- **User Authentication**: Supabase-powered authentication system
- **Multi-language Support**: Arabic, English, and French
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **User Dashboard**: Combined buying and selling functionality
- **Product Management**: Post announcements and manage listings
- **Shopping Cart**: Full cart functionality with persistence

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Supabase account and project

## Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable Vue components
├── views/              # Page components
├── stores/             # Pinia state management
├── router/             # Vue Router configuration
├── lib/                # External library configurations
├── locales/            # Internationalization files
└── style.css           # Global styles and Tailwind
```

## Key Components

- **Header**: Navigation and authentication
- **UserDashboard**: Combined buying/selling dashboard
- **PostAnnouncement**: Product announcement form
- **ProductCard**: Product display component

## Authentication

The app uses Supabase for authentication with two main roles:
- **User**: Can buy and sell products
- **Admin**: Full administrative access (set in Supabase dashboard)

## Styling

- Tailwind CSS for utility-first styling
- Custom CSS variables for brand colors
- RTL support for Arabic language
- Responsive design patterns

## Development

- Vue 3 Composition API
- Pinia for state management
- Vue Router for navigation
- Vue I18n for internationalization
- Headless UI for accessible components

## Contributing

1. Follow Vue 3 best practices
2. Use Composition API
3. Maintain responsive design
4. Add proper TypeScript types (if applicable)
5. Test on multiple devices and languages
