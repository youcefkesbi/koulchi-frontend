<template>
  <div class="flex items-center">
    <!-- Simple toggle switch -->
    <button
      @click="themeStore.toggleTheme"
      :class="[
        'relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        themeStore.isDark 
          ? 'bg-gray-600' 
          : 'bg-gray-300'
      ]"
      :aria-pressed="themeStore.isDark"
      aria-label="Toggle dark mode"
    >
      <span
        :class="[
          'h-4 w-4 transform rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center',
          themeStore.isDark ? 'translate-x-6' : 'translate-x-1'
        ]"
      >
        <i 
          :class="[
            'text-xs transition-all duration-300',
            themeStore.isDark ? 'fas fa-moon text-gray-600' : 'fas fa-sun text-yellow-500'
          ]"
        ></i>
      </span>
    </button>
  </div>
</template>

<script setup>
import { useThemeStore } from '../stores/theme'

const themeStore = useThemeStore()
</script>
