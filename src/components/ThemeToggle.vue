<template>
  <div class="flex items-center space-x-3">
    <!-- Light mode icon -->
    <i 
      v-if="!themeStore.isDark" 
      class="fas fa-sun text-yellow-500 text-lg transition-all duration-300"
    ></i>
    
    <!-- Toggle switch -->
    <button
      @click="themeStore.toggleTheme"
      :class="[
        'relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:scale-105 active:scale-95',
        themeStore.isDark 
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg' 
          : 'bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg'
      ]"
      :aria-pressed="themeStore.isDark"
      aria-label="Toggle dark mode"
    >
      <span
        :class="[
          'h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 flex items-center justify-center',
          themeStore.isDark ? 'translate-x-6' : 'translate-x-1'
        ]"
      >
        <i 
          :class="[
            'text-xs transition-all duration-300',
            themeStore.isDark ? 'fas fa-moon text-blue-600' : 'fas fa-sun text-yellow-500'
          ]"
        ></i>
      </span>
    </button>
    
    <!-- Dark mode icon -->
    <i 
      v-if="themeStore.isDark" 
      class="fas fa-moon text-blue-400 text-lg transition-all duration-300"
    ></i>
  </div>
</template>

<script setup>
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
</script>
