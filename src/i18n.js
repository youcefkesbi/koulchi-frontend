import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import fr from '../locales/fr.json'
import ar from '../locales/ar.json'

// Supported locales configuration
export const supportedLocales = ['en', 'fr', 'ar']
export const defaultLocale = 'en'

// Initial locale from localStorage so first paint respects user choice (before router runs)
function getInitialLocale() {
  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('locale') : null
    return saved && supportedLocales.includes(saved) ? saved : defaultLocale
  } catch {
    return defaultLocale
  }
}

// Language metadata for UI display and RTL support
export const languages = {
  en: {
    name: 'English',
    dir: 'ltr',
    locale: 'en-US'
  },
  fr: {
    name: 'Français',
    dir: 'ltr',
    locale: 'fr-FR'
  },
  ar: {
    name: 'العربية',
    dir: 'rtl',
    locale: 'ar-DZ'
  }
}

// Create i18n instance (locale from localStorage so language is consistent on load/refresh)
const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: defaultLocale,
  messages: {
    en,
    fr,
    ar
  },
  // Number formatting
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
  // Date/time formatting
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
  },
  // Ensure proper reactivity
  globalInjection: true,
  allowComposition: true
})

export default i18n 