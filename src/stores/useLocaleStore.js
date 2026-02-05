import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { supportedLocales, defaultLocale, languages } from '../i18n'

const STORAGE_KEY = 'locale'

/**
 * Single source of truth for app locale.
 * Persists to localStorage and stays in sync with vue-i18n.
 * Use this store (not only route or i18n) so language is consistent
 * across navigation, refresh, and direct URL access.
 */
export const useLocaleStore = defineStore('locale', () => {
  const locale = ref(getInitialLocale())

  function getInitialLocale() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved && supportedLocales.includes(saved) ? saved : defaultLocale
    } catch {
      return defaultLocale
    }
  }

  /**
   * Set app locale: updates store, localStorage, and document.
   * Callers (e.g. router guard) must also set i18n.global.locale.
   */
  function setLocale(newLocale) {
    if (!supportedLocales.includes(newLocale)) return
    if (locale.value === newLocale) return
    try {
      locale.value = newLocale
      localStorage.setItem(STORAGE_KEY, newLocale)
      const lang = languages[newLocale]
      if (lang) {
        document.documentElement.dir = lang.dir
        document.documentElement.lang = newLocale
      }
    } catch (e) {
      console.warn('LocaleStore: failed to persist locale', e)
    }
  }

  /**
   * Sync from store to localStorage (e.g. after hydration).
   * Does not change store value.
   */
  function persistCurrent() {
    try {
      localStorage.setItem(STORAGE_KEY, locale.value)
    } catch {}
  }

  return {
    locale,
    setLocale,
    persistCurrent,
    getInitialLocale,
    supportedLocales,
    defaultLocale
  }
})
