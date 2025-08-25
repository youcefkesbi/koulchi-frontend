import { createI18n } from 'vue-i18n'
import en from '../locales/en.json'
import fr from '../locales/fr.json'
import ar from '../locales/ar.json'

// Language configuration without flags
const languages = {
  fr: {
    name: 'Français',
    dir: 'ltr',
    locale: 'fr-FR'
  },
  en: {
    name: 'English',
    dir: 'ltr',
    locale: 'en-US'
  },
  ar: {
    name: 'العربية',
    dir: 'rtl',
    locale: 'ar-DZ'
  }
}

// Language detection logic
const detectLanguage = () => {
  // Check localStorage first
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && languages[savedLocale]) {
    return savedLocale
  }
  
  // Check browser language
  const browserLang = navigator.language || navigator.userLanguage
  if (browserLang) {
    const langCode = browserLang.split('-')[0]
    if (languages[langCode]) {
      return langCode
    }
  }
  
  // Default to French
  return 'fr'
}

const defaultLocale = detectLanguage()

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'fr',
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