<template>
  <div class="fixed bottom-4 left-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 z-50 max-w-sm">
    <h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">Theme Test</h3>
    <div class="space-y-2 text-sm">
      <div class="text-gray-700 dark:text-gray-300">
        <strong>Current Theme:</strong> {{ themeStore.currentTheme }}
      </div>
      <div class="text-gray-700 dark:text-gray-300">
        <strong>Is Dark:</strong> {{ themeStore.isDark }}
      </div>
      <div class="text-gray-700 dark:text-gray-300">
        <strong>System Preference:</strong> {{ themeStore.systemPreference }}
      </div>
    </div>
    <div class="mt-4 space-x-2">
      <button 
        @click="themeStore.setTheme('light')" 
        class="px-3 py-1 bg-yellow-500 text-white rounded text-xs"
      >
        Light
      </button>
      <button 
        @click="themeStore.setTheme('dark')" 
        class="px-3 py-1 bg-gray-800 text-white rounded text-xs"
      >
        Dark
      </button>
      <button 
        @click="themeStore.setTheme('system')" 
        class="px-3 py-1 bg-blue-500 text-white rounded text-xs"
      >
        System
      </button>
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
</script>
