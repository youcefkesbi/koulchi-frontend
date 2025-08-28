# Koulchi Frontend

A modern e-commerce platform built with Vue.js, featuring OAuth authentication, internationalization, and responsive design.

## Features

- **Authentication**: OAuth (Google, Facebook) + Email/Password via Supabase
- **Internationalization**: Multi-language support (English, Arabic, French)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **State Management**: Pinia for reactive state management
- **Database**: Supabase backend with real-time subscriptions

## Environment Setup

The OAuth system uses simplified environment configuration:

- **Development**: `.env.local` with localhost URLs
- **Production**: Vercel environment variables with production URLs
- **OAuth**: Handled entirely by Supabase Dashboard

### Environment Variables

#### Development (`.env.local`)
```bash
VITE_APP_URL=http://localhost:3000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_VERCEL=0
```

#### Production (Vercel)
```bash
VITE_APP_URL=https://koulchi-frontend.vercel.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_VERCEL=1
```

## Quick Start

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd koulchi-frontend
   npm install
   ```

2. **Environment setup**
   ```bash
   cp docs/env.local.example .env.local
   # Edit .env.local with your values
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

## OAuth Configuration

1. **Configure OAuth providers** in Supabase Dashboard
2. **Set redirect URL** to: `https://your-project.supabase.co/auth/v1/callback`
3. **Test OAuth flow** in both environments

## Documentation

- [OAuth Environment Setup](OAUTH_ENVIRONMENT_SETUP.md) - Complete setup guide
- [OAuth Environment Quick Reference](OAUTH_ENVIRONMENT_QUICK_REFERENCE.md) - Quick setup reference
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Vercel deployment instructions
- [Routing Improvements](ROUTING_IMPROVEMENTS.md) - Frontend routing and unknown route handling

## Project Structure

```
koulchi-frontend/
├── src/
│   ├── components/          # Vue components
│   ├── config/             # Configuration files
│   ├── stores/             # Pinia stores
│   ├── views/              # Page components
│   └── utils/              # Utility functions
├── docs/                   # Documentation
├── locales/                # i18n translations
└── database/               # Database schema
```

## License

MIT License
