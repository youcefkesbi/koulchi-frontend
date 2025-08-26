import { supportedLocales, defaultLocale } from '../i18n'

// Get current locale from localStorage or default
export const getCurrentLocale = () => {
  try {
    const savedLocale = localStorage.getItem('locale')
    return savedLocale && supportedLocales.includes(savedLocale) ? savedLocale : defaultLocale
  } catch (error) {
    console.warn('Error getting locale from localStorage:', error)
    return defaultLocale
  }
}

// Get supported locales
export const getSupportedLocales = () => {
  return supportedLocales
}

// Check if a locale is supported
export const isLocaleSupported = (locale) => {
  return supportedLocales.includes(locale)
}

// Get language info by code
export const getLanguageInfo = (code) => {
  const { languages } = require('../i18n')
  return languages[code] || null
}

// Set locale in localStorage
export const setLocale = (locale) => {
  if (isLocaleSupported(locale)) {
    try {
      localStorage.setItem('locale', locale)
      return true
    } catch (error) {
      console.error('Error setting locale:', error)
      return false
    }
  }
  return false
}

// Get localized route path
export const getLocalizedPath = (path, locale) => {
  if (!locale || !isLocaleSupported(locale)) {
    locale = getCurrentLocale()
  }
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  // If it's already a localized path, replace the locale
  const localePattern = /^\/(en|fr|ar)\//
  if (localePattern.test(cleanPath)) {
    return cleanPath.replace(/^\/(en|fr|ar)/, `/${locale}`)
  }
  
  // Add locale prefix
  return `/${locale}${cleanPath}`
}

// Get current route locale from path
export const getRouteLocale = (path) => {
  const match = path.match(/^\/(en|fr|ar)/)
  return match ? match[1] : null
}

// Check if current route is localized
export const isRouteLocalized = (path) => {
  return getRouteLocale(path) !== null
}
