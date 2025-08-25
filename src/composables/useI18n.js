import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { setLocale, getLocalizedPath, getCurrentLocale } from '../lib/i18n-utils'

export function useLocalizedI18n() {
  const { t, locale, d, n } = useI18n()
  const router = useRouter()
  const route = useRoute()

  // Get current language info
  const currentLanguage = computed(() => {
    return {
      code: locale.value,
      name: t('language') // This will be translated
    }
  })

  // Change language and navigate
  const changeLanguage = async (newLocale) => {
    if (newLocale === locale.value) return

    // Update i18n locale
    locale.value = newLocale
    
    // Set locale using utility function
    setLocale(newLocale)
    
    // Navigate to localized version of current route
    const currentPath = route.path
    const currentLocale = route.meta.locale
    
    if (currentLocale && currentLocale !== newLocale) {
      const newPath = getLocalizedPath(currentPath, newLocale)
      await router.push(newPath)
    }
  }

  // Get localized route path
  const getLocalizedRoute = (path, targetLocale = null) => {
    return getLocalizedPath(path, targetLocale || locale.value)
  }

  // Navigate to localized route
  const navigateToLocalized = async (path, targetLocale = null) => {
    const localizedPath = getLocalizedRoute(path, targetLocale)
    await router.push(localizedPath)
  }

  // Check if current route is localized
  const isCurrentRouteLocalized = computed(() => {
    return route.meta.locale !== undefined
  })

  // Get current route locale
  const currentRouteLocale = computed(() => {
    return route.meta.locale || getCurrentLocale()
  })

  return {
    // i18n functions
    t,
    d,
    n,
    locale,
    
    // Language management
    currentLanguage,
    changeLanguage,
    
    // Routing
    getLocalizedRoute,
    navigateToLocalized,
    isCurrentRouteLocalized,
    currentRouteLocale
  }
}
