import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import fr from '../locales/fr.json'
import ar from '../locales/ar.json'

// Supported locales configuration
export const supportedLocales = ['en', 'fr', 'ar']
export const defaultLocale = 'en'

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

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
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