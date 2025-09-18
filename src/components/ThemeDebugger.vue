<template>
  <div class="fixed top-4 left-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 z-50 max-w-sm">
    <h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">Theme Debugger</h3>
    <div class="space-y-2 text-sm">
      <div class="text-gray-700 dark:text-gray-300">
        <strong>isDarkMode:</strong> {{ themeStore.isDarkMode }}
      </div>
      <div class="text-gray-700 dark:text-gray-300">
        <strong>isDark:</strong> {{ themeStore.isDark }}
      </div>
      <div class="text-gray-700 dark:text-gray-300">
        <strong>currentTheme:</strong> {{ themeStore.currentTheme }}
      </div>
      <div class="text-gray-700 dark:text-gray-300">
        <strong>systemPreference:</strong> {{ themeStore.systemPreference }}
      </div>
      <div class="text-gray-700 dark:text-gray-300">
        <strong>HTML Classes:</strong> {{ document.documentElement.className }}
      </div>
    </div>
    <div class="mt-4 space-x-2">
      <button 
        @click="themeStore.toggleTheme()" 
        class="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
      >
        Toggle Theme
      </button>
      <button 
        @click="themeStore.setTheme('light')" 
        class="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
      >
        Light
      </button>
      <button 
        @click="themeStore.setTheme('dark')" 
        class="px-3 py-1 bg-gray-800 text-white rounded text-xs hover:bg-gray-700"
      >
        Dark
      </button>
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
</script>
