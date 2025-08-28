# Koulchi Frontend

A modern e-commerce platform built with Vue.js, featuring OAuth authentication, internationalization, and a responsive design.

## 🚀 Features

- **Authentication**: OAuth (Google, Facebook) + Email/Password
- **Internationalization**: Multi-language support (English, Arabic, French)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **State Management**: Pinia for reactive state management
- **Database**: Supabase backend with real-time subscriptions
- **Environment Support**: Separate configurations for development and production

## 🔧 OAuth Environment Setup

The OAuth system has been refactored to support different environment configurations:

- **Development**: Uses `.env.local` with localhost URLs and development OAuth credentials
- **Production**: Uses Vercel environment variables with production URLs and OAuth credentials
- **Callback Path**: Fixed as `/auth/v1/callback` for consistency across environments

### Quick Setup

1. **Development**: Copy `docs/env.local.example` to `.env.local`
2. **Production**: Configure Vercel environment variables using `docs/env.production.example`
3. **OAuth Apps**: Set up separate OAuth apps for development and production

See [OAuth Environment Setup Guide](docs/OAUTH_ENVIRONMENT_SETUP.md) for complete instructions.

## 📁 Project Structure

```
koulchi-frontend/
├── src/
│   ├── components/          # Vue components
│   ├── config/             # Configuration files
│   │   ├── environment.js  # Environment detection & OAuth config
│   │   └── oauth.js        # OAuth provider configuration
│   ├── stores/             # Pinia stores
│   ├── views/              # Page components
│   └── utils/              # Utility functions
├── docs/                   # Documentation
│   ├── OAUTH_ENVIRONMENT_SETUP.md
│   ├── OAUTH_ENVIRONMENT_QUICK_REFERENCE.md
│   └── OAUTH_REFACTORING_SUMMARY.md
├── locales/                # i18n translations
└── database/               # Database schema
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project (local or hosted)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd koulchi-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Development
   cp docs/env.local.example .env.local
   # Edit .env.local with your development values
   
   # Production (Vercel)
   # Set environment variables in Vercel dashboard
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Environment Variables

#### Development (`.env.local`)
```bash
VITE_APP_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-dev-google-oauth-client-id
VITE_GOOGLE_CLIENT_SECRET=your-dev-google-oauth-client-secret
VITE_VERCEL=0
```

#### Production (Vercel)
```bash
VITE_APP_URL=https://your-app.vercel.app
VITE_GOOGLE_CLIENT_ID=your-prod-google-oauth-client-id
VITE_GOOGLE_CLIENT_SECRET=your-prod-google-oauth-client-secret
VITE_VERCEL=1
```

## 🚀 Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables Required

- `VITE_APP_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_GOOGLE_CLIENT_SECRET`

## 📚 Documentation

- [OAuth Environment Setup](docs/OAUTH_ENVIRONMENT_SETUP.md) - Complete environment configuration guide
- [OAuth Environment Quick Reference](docs/OAUTH_ENVIRONMENT_QUICK_REFERENCE.md) - Quick setup reference
- [OAuth Refactoring Summary](docs/OAUTH_REFACTORING_SUMMARY.md) - What was changed and why
- [Environment Setup](docs/ENVIRONMENT_SETUP.md) - General environment configuration
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - Vercel deployment instructions

## 🔍 Testing

### Environment Configuration Test

Run the environment test script to verify configuration:

```bash
# This will be available in the browser console during development
# Check browser console for environment validation logs
```

### OAuth Flow Testing

1. **Development**: Test OAuth redirects to `http://localhost:3000/auth/v1/callback`
2. **Production**: Test OAuth redirects to `https://your-app.vercel.app/auth/v1/callback`

## 🐛 Troubleshooting

### Common Issues

1. **OAuth redirect mismatch**
   - Ensure callback path is exactly `/auth/v1/callback`
   - Verify redirect URIs in Google Cloud Console

2. **Environment variables not loading**
   - Check file names: `.env.local` for dev, `.env` for prod
   - Verify Vite configuration loads correct environment

3. **OAuth credentials error**
   - Ensure correct client ID/secret for each environment
   - Verify OAuth app is properly configured

### Debug Mode

Development mode includes debug logging. Check browser console for:
- Environment configuration details
- OAuth configuration status
- Validation results

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in both development and production environments
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting guides in the `docs/` folder
2. Verify environment configuration
3. Test OAuth flow in both environments
4. Check browser console for validation logs

---

**Koulchi Frontend** - Modern e-commerce with OAuth authentication and environment-aware configuration.
