import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleStore } from '../stores/useLocaleStore'
import { supportedLocales, defaultLocale, languages } from '../i18n'

/**
 * Locale-aware router composable for multilingual navigation
 * Provides consistent navigation across components with locale parameter support
 */
export function useLocaleRouter() {
  const router = useRouter()
  const route = useRoute()
  const { locale } = useI18n()

  // Current locale: route params > store (persisted) > i18n
  const localeStore = useLocaleStore()
  const currentLocale = computed(() => {
    if (route.params.locale && supportedLocales.includes(route.params.locale)) {
      return route.params.locale
    }
    return localeStore.locale || locale.value
  })

  // Get language info for current locale
  const currentLanguageInfo = computed(() => {
    return languages[currentLocale.value] || languages[defaultLocale]
  })

  // Check if current route is RTL
  const isRTL = computed(() => {
    return currentLanguageInfo.value?.dir === 'rtl'
  })

  /**
   * Navigate to a route with locale parameter
   * @param {string|Object} routeConfig - Route name or route configuration object
   * @param {Object} options - Navigation options
   * @param {string} options.locale - Target locale (defaults to current locale)
   * @param {Object} options.params - Route parameters
   * @param {Object} options.query - Query parameters
   * @param {Object} options.replace - Whether to replace current route
   */
  const navigateTo = async (routeConfig, options = {}) => {
    const {
      locale: localeOption = currentLocale.value,
      params = {},
      query = {},
      replace = false
    } = options

    // Ensure locale is supported
    let targetLocale = localeOption
    if (!supportedLocales.includes(targetLocale)) {
      console.warn(`Unsupported locale: ${targetLocale}, falling back to ${defaultLocale}`)
      targetLocale = defaultLocale
    }

    let routeName, routeParams, routeQuery

    if (typeof routeConfig === 'string') {
      // Simple route name
      routeName = routeConfig
      routeParams = { locale: targetLocale, ...params }
      routeQuery = query
    } else if (routeConfig.name) {
      // Route configuration object
      routeName = routeConfig.name
      routeParams = { locale: targetLocale, ...routeConfig.params, ...params }
      routeQuery = { ...routeConfig.query, ...query }
    } else {
      throw new Error('Invalid route configuration')
    }

    try {
      const navigationOptions = {
        name: routeName,
        params: routeParams,
        query: routeQuery
      }

      if (replace) {
        await router.replace(navigationOptions)
      } else {
        await router.push(navigationOptions)
      }

      // Update i18n locale if different
      if (targetLocale !== locale.value) {
        locale.value = targetLocale
        updateDocumentAttributes(targetLocale)
      }

    } catch (error) {
      console.error('Navigation error:', error)
      throw error
    }
  }

  /**
   * Navigate to a route by path with locale prefix
   * @param {string} path - Route path (without locale prefix)
   * @param {Object} options - Navigation options
   * @param {string} options.locale - Target locale (defaults to current locale)
   * @param {Object} options.query - Query parameters
   * @param {Object} options.replace - Whether to replace current route
   */
  const navigateToPath = async (path, options = {}) => {
    const {
      locale: localeOption = currentLocale.value,
      query = {},
      replace = false
    } = options

    // Ensure locale is supported
    let targetLocale = localeOption
    if (!supportedLocales.includes(targetLocale)) {
      console.warn(`Unsupported locale: ${targetLocale}, falling back to ${defaultLocale}`)
      targetLocale = defaultLocale
    }

    // Clean path
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    
    // Remove existing locale prefix if present
    const pathWithoutLocale = cleanPath.replace(/^\/(en|fr|ar)/, '')
    
    // Add target locale prefix
    const localizedPath = `/${targetLocale}${pathWithoutLocale}`

    try {
      const navigationOptions = {
        path: localizedPath,
        query
      }

      if (replace) {
        await router.replace(navigationOptions)
      } else {
        await router.push(navigationOptions)
      }

      // Update i18n locale if different
      if (targetLocale !== locale.value) {
        locale.value = targetLocale
        updateDocumentAttributes(targetLocale)
      }

    } catch (error) {
      console.error('Navigation error:', error)
      throw error
    }
  }

  /**
   * Get localized route configuration for router-link
   * @param {string|Object} routeConfig - Route name or route configuration object
   * @param {Object} options - Options
   * @param {string} options.locale - Target locale (defaults to current locale)
   * @param {Object} options.params - Route parameters
   * @param {Object} options.query - Query parameters
   */
  const getLocalizedRoute = (routeConfig, options = {}) => {
    const {
      locale: localeOption = currentLocale.value,
      params = {},
      query = {}
    } = options

    // Ensure locale is supported
    let targetLocale = localeOption
    if (!supportedLocales.includes(targetLocale)) {
      console.warn(`Unsupported locale: ${targetLocale}, falling back to ${defaultLocale}`)
      targetLocale = defaultLocale
    }

    if (typeof routeConfig === 'string') {
      // Simple route name
      return {
        name: routeConfig,
        params: { locale: targetLocale, ...params },
        query
      }
    } else if (routeConfig.name) {
      // Route configuration object
      return {
        name: routeConfig.name,
        params: { locale: targetLocale, ...routeConfig.params, ...params },
        query: { ...routeConfig.query, ...query }
      }
    } else {
      throw new Error('Invalid route configuration')
    }
  }

  /**
   * Get localized path for router-link
   * @param {string} path - Route path (without locale prefix)
   * @param {Object} options - Options
   * @param {string} options.locale - Target locale (defaults to current locale)
   * @param {Object} options.query - Query parameters
   */
  const getLocalizedPath = (path, options = {}) => {
    const {
      locale: localeOption = currentLocale.value,
      query = {}
    } = options

    // Ensure locale is supported
    let targetLocale = localeOption
    if (!supportedLocales.includes(targetLocale)) {
      console.warn(`Unsupported locale: ${targetLocale}, falling back to ${defaultLocale}`)
      targetLocale = defaultLocale
    }

    // Clean path
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    
    // Remove existing locale prefix if present
    const pathWithoutLocale = cleanPath.replace(/^\/(en|fr|ar)/, '')
    
    // Add target locale prefix
    const localizedPath = `/${targetLocale}${pathWithoutLocale}`

    return {
      path: localizedPath,
      query
    }
  }

  /**
   * Switch locale and navigate to equivalent route in new locale
   * @param {string} newLocale - Target locale
   */
  const switchLocale = async (newLocale) => {
    if (!supportedLocales.includes(newLocale)) {
      console.warn(`Unsupported locale: ${newLocale}`)
      return
    }

    if (newLocale === currentLocale.value) {
      return
    }

    try {
      // Get current route info
      const currentRoute = route
      const currentParams = { ...currentRoute.params }
      const currentQuery = { ...currentRoute.query }

      // Update locale in params
      currentParams.locale = newLocale

      // Navigate to same route with new locale
      await router.push({
        name: currentRoute.name,
        params: currentParams,
        query: currentQuery
      })

      // Persist and sync: store + i18n (guard also does this; ensure consistency)
      localeStore.setLocale(newLocale)
      locale.value = newLocale
      updateDocumentAttributes(newLocale)

    } catch (error) {
      console.error('Locale switch error:', error)
      throw error
    }
  }

  /**
   * Update document attributes for locale
   * @param {string} locale - Locale code
   */
  const updateDocumentAttributes = (locale) => {
    const langInfo = languages[locale]
    if (langInfo) {
      document.documentElement.lang = locale
      document.documentElement.dir = langInfo.dir
    }
  }

  /**
   * Get all supported locales with their info
   */
  const supportedLocalesInfo = computed(() => {
    return supportedLocales.map(code => ({
      code,
      ...languages[code]
    }))
  })

  return {
    // Current state
    currentLocale,
    currentLanguageInfo,
    isRTL,
    supportedLocalesInfo,

    // Navigation methods
    navigateTo,
    navigateToPath,
    getLocalizedRoute,
    getLocalizedPath,
    switchLocale,

    // Utility methods
    updateDocumentAttributes
  }
}
