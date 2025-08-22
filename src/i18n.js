import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import fr from '../locales/fr.json'
import ar from '../locales/ar.json'

// Language configuration with RTL support
const languages = {
  ar: {
    name: 'العربية',
    flag: 'https://flagcdn.com/w40/dz.png',
    dir: 'rtl',
    locale: 'ar-DZ'
  },
  en: {
    name: 'English',
    flag: 'https://flagcdn.com/w40/gb.png',
    dir: 'ltr',
    locale: 'en-US'
  },
  fr: {
    name: 'Français',
    flag: 'https://flagcdn.com/w40/fr.png',
    dir: 'ltr',
    locale: 'fr-FR'
  }
}

// Get saved locale or default to Arabic
const savedLocale = localStorage.getItem('locale') || 'ar'
const defaultLocale = languages[savedLocale] ? savedLocale : 'ar'

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    fr,
    ar
  },
  // Add number and date formatting
  numberFormats: {
    'en': {
      currency: {
        style: 'currency',
        currency: 'DZD',
        minimumFractionDigits: 0
      }
    },
    'fr': {
      currency: {
        style: 'currency',
        currency: 'DZD',
        minimumFractionDigits: 0
      }
    },
    'ar': {
      currency: {
        style: 'currency',
        currency: 'DZD',
        minimumFractionDigits: 0
      }
    }
  },
  // Add datetime formatting
  datetimeFormats: {
    'en': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    },
    'fr': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    },
    'ar': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    }
  }
})

// Export languages config for use in components
export { languages }
export default i18n 