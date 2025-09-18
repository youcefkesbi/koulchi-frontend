import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // State
  const isDarkMode = ref(false)
  const systemPreference = ref('light') // 'light', 'dark', or 'system'

  // Persistence configuration
  const persist = {
    paths: ['isDarkMode', 'systemPreference']
  }

  // Getters
  const currentTheme = computed(() => {
    if (systemPreference.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return systemPreference.value
  })

  const isDark = computed(() => {
    return currentTheme.value === 'dark'
  })

  // Actions
  const toggleTheme = () => {
    console.log('🎨 Toggling theme from', isDarkMode.value ? 'dark' : 'light', 'to', !isDarkMode.value ? 'dark' : 'light')
    isDarkMode.value = !isDarkMode.value
    systemPreference.value = isDarkMode.value ? 'dark' : 'light'
    applyTheme()
  }

  const setTheme = (theme) => {
    if (theme === 'system') {
      systemPreference.value = 'system'
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      systemPreference.value = theme
      isDarkMode.value = theme === 'dark'
    }
    applyTheme()
  }

  const applyTheme = () => {
    const theme = currentTheme.value
    const root = document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Add current theme class
    root.classList.add(theme)
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.content = theme === 'dark' ? '#1f2937' : '#ffffff'
    }
    
    console.log(`🎨 Theme applied: ${theme}`)
  }

  const initializeTheme = () => {
    // Check for saved theme preference from Pinia persistence
    const savedThemeData = localStorage.getItem('pinia_theme')
    
    if (savedThemeData) {
      try {
        const parsed = JSON.parse(savedThemeData)
        if (parsed.isDarkMode !== undefined) {
          isDarkMode.value = parsed.isDarkMode
        }
        if (parsed.systemPreference) {
          systemPreference.value = parsed.systemPreference
        }
        console.log('🎨 Loaded saved theme:', parsed)
      } catch (e) {
        console.warn('Failed to parse saved theme data:', e)
      }
    }
    
    // If no saved preference, default to light mode
    if (!savedThemeData) {
      isDarkMode.value = false
      systemPreference.value = 'light'
      console.log('🎨 No saved theme, defaulting to light mode')
    }
    
    applyTheme()
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (systemPreference.value === 'system') {
        isDarkMode.value = e.matches
        applyTheme()
      }
    })
  }

  return {
    // State
    isDarkMode,
    systemPreference,
    persist,
    
    // Getters
    currentTheme,
    isDark,
    
    // Actions
    toggleTheme,
    setTheme,
    applyTheme,
    initializeTheme
  }
})
