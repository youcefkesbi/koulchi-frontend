import { languages } from '../i18n'

// Get current locale from localStorage or default to English
export const getCurrentLocale = () => {
  const savedLocale = localStorage.getItem('locale')
  return savedLocale && languages[savedLocale] ? savedLocale : 'en'
}

// Get supported locales
export const getSupportedLocales = () => {
  return Object.keys(languages)
}

// Check if a locale is supported
export const isLocaleSupported = (locale) => {
  return getSupportedLocales().includes(locale)
}

// Get language info by code
export const getLanguageInfo = (code) => {
  return languages[code] || null
}

// Detect browser language
export const detectBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage
  if (browserLang) {
    const langCode = browserLang.split('-')[0]
    if (isLocaleSupported(langCode)) {
      return langCode
    }
  }
  return 'en' // Default to English
}

// Get the best locale to use (localStorage > browser > default)
export const getBestLocale = () => {
  const savedLocale = getCurrentLocale()
  if (savedLocale) {
    return savedLocale
  }
  
  const browserLocale = detectBrowserLanguage()
  if (browserLocale) {
    return browserLocale
  }
  
  return 'en'
}

// Set locale and persist to localStorage
export const setLocale = (locale) => {
  if (!isLocaleSupported(locale)) {
    console.warn(`Unsupported locale: ${locale}`)
    return false
  }
  
  localStorage.setItem('locale', locale)
  
  // Update document attributes
  const langInfo = getLanguageInfo(locale)
  if (langInfo) {
    document.documentElement.lang = locale
    document.documentElement.dir = langInfo.dir
  }
  
  return true
}

// Get localized route path
export const getLocalizedPath = (path, locale) => {
  if (!locale || !isLocaleSupported(locale)) {
    locale = getCurrentLocale()
  }
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  // If it's already a localized path, replace the locale
  const localePattern = /^\/(fr|en|ar)\//
  if (localePattern.test(cleanPath)) {
    return cleanPath.replace(/^\/(fr|en|ar)/, `/${locale}`)
  }
  
  // Add locale prefix
  return `/${locale}${cleanPath}`
}

// Get current route locale from path
export const getRouteLocale = (path) => {
  const match = path.match(/^\/(fr|en|ar)/)
  return match ? match[1] : null
}

// Check if current route is localized
export const isRouteLocalized = (path) => {
  return getRouteLocale(path) !== null
}
