<template>
  <div class="flex items-center space-x-2">
    <!-- Light mode icon -->
    <i 
      v-if="!themeStore.isDark" 
      class="fas fa-sun text-yellow-500 text-lg"
    ></i>
    
    <!-- Toggle switch -->
    <button
      @click="themeStore.toggleTheme"
      :class="[
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        themeStore.isDark ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
      ]"
      :aria-pressed="themeStore.isDark"
      aria-label="Toggle dark mode"
    >
      <span
        :class="[
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
          themeStore.isDark ? 'translate-x-6' : 'translate-x-1'
        ]"
      />
    </button>
    
    <!-- Dark mode icon -->
    <i 
      v-if="themeStore.isDark" 
      class="fas fa-moon text-blue-400 text-lg"
    ></i>
  </div>
</template>

<script setup>
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
</script>
