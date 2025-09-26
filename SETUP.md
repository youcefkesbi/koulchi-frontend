# Koulchi Frontend Setup

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

4. Start development server:
```bash
npm run dev
```

## Environment Variables

The app requires the following environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Development Mode

The app will run in development mode even without proper Supabase configuration, but with limited functionality. You'll see warnings in the console about missing environment variables.

## Production Deployment

Make sure to set the environment variables in your production environment (Vercel, Netlify, etc.).
