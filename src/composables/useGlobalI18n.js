import { getCurrentInstance, computed } from 'vue'
import i18n from '../i18n'

export function useGlobalI18n() {
  const instance = getCurrentInstance()
  
  // Try to get from global properties first
  if (instance && instance.appContext.config.globalProperties.$i18n) {
    const globalI18n = instance.appContext.config.globalProperties.$i18n
    return {
      locale: computed(() => globalI18n.locale.value),
      t: globalI18n.t.bind(globalI18n),
      d: globalI18n.d.bind(globalI18n),
      n: globalI18n.n.bind(globalI18n)
    }
  }
  
  // Fallback to direct import with computed locale
  return {
    locale: computed(() => i18n.global.locale.value),
    t: i18n.global.t.bind(i18n.global),
    d: i18n.global.d.bind(i18n.global),
    n: i18n.global.n.bind(i18n.global)
  }
}
