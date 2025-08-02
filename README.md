# Koulchi Frontend

A modern Vue.js e-commerce frontend application tailored for the Algerian market with Cash on Delivery (COD) payment support.

## Features

- 🛒 **E-commerce Platform**: Complete shopping experience with product browsing, cart management, and checkout
- 🌍 **Multi-language Support**: English, French, and Arabic with RTL support
- 🔐 **Modern Authentication**: Google and Facebook login integration
- 💳 **Cash on Delivery**: COD payment method support
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS
- 🎨 **Modern UI**: Beautiful and intuitive user interface
- 🚀 **Fast Performance**: Built with Vite for optimal performance

## New Features Added

### Authentication System
- **Google Login**: Seamless authentication with Google accounts
- **Facebook Login**: Social login with Facebook
- **User Profile Management**: View profile, orders, and settings
- **Secure Logout**: Proper session management

### Language Support
- **English**: Full English localization
- **French**: Complete French translation
- **Arabic**: RTL support with Arabic translation
- **Language Switcher**: Easy language switching with flag icons
- **Persistent Language**: Remembers user's language preference

### Seller Features
- **Become a Seller Button**: Prominent call-to-action for seller registration
- **Modern Design**: Gradient button with hover effects

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd koulchi-frontend-cursor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase Authentication**
   
   Create a Firebase project and update the configuration in `src/firebase.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-messaging-sender-id",
     appId: "your-app-id"
   }
   ```

   **Enable Authentication Providers:**
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable Google provider
   - Enable Facebook provider (requires Facebook App setup)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Firebase Setup

### Google Authentication
1. In Firebase Console, go to Authentication > Sign-in method
2. Enable Google provider
3. Add your domain to authorized domains

### Facebook Authentication
1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com)
2. Add Facebook Login product
3. Configure OAuth redirect URIs
4. Add Facebook App ID and Secret to Firebase

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
├── firebase.js           # Firebase configuration
└── ...
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Technologies Used

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Vue I18n** - Internationalization
- **Firebase** - Authentication and backend services
- **Headless UI** - Accessible UI components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team. 