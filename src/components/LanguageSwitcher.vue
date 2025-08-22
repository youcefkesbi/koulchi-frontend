<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center space-x-2 space-x-reverse px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
    >
      <span class="w-5 h-5 rounded-full overflow-hidden">
        <img 
          :src="currentLanguage.flag" 
          :alt="currentLanguage.name"
          class="w-full h-full object-cover"
        />
      </span>
      <span>{{ currentLanguage.code.toUpperCase() }}</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
    >
      <div class="py-1">
        <button
          v-for="language in languages"
          :key="language.code"
          @click="selectLanguage(language.code)"
          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          :class="{ 'bg-blue-50 text-blue-700': currentLanguage.code === language.code }"
        >
          <span class="w-5 h-5 rounded-full overflow-hidden mr-3">
            <img 
              :src="language.flag" 
              :alt="language.name"
              class="w-full h-full object-cover"
            />
          </span>
          <span>{{ language.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { languages } from '../i18n'

export default {
  name: 'LanguageSwitcher',
  setup() {
    const { locale } = useI18n()
    const isOpen = ref(false)



    // Convert languages object to array for iteration
    const languagesArray = Object.keys(languages).map(code => ({
      code,
      ...languages[code]
    }))

    const currentLanguage = computed(() => {
      return languagesArray.find(lang => lang.code === locale.value) || languagesArray[0]
    })

    const selectLanguage = (code) => {
      locale.value = code
      isOpen.value = false
      // Save to localStorage
      localStorage.setItem('locale', code)
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        isOpen.value = false
      }
    }

    onMounted(() => {
      // Load saved language preference
      const savedLocale = localStorage.getItem('locale')
      if (savedLocale && languagesArray.some(lang => lang.code === savedLocale)) {
        locale.value = savedLocale
      }
      
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      isOpen,
      languages: languagesArray,
      currentLanguage,
      selectLanguage
    }
  }
}
</script> 