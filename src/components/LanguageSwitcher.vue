<template>
  <div class="language-switcher-root relative">
    <button
      @click="isOpen = !isOpen"
      :title="`Language: ${currentLanguage.name}`"
      :class="buttonClass"
    >
    <template v-if="compact">
        <!-- Globe icon (compact) -->
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </template>
      <template v-else>
        <span class="text-primary-600 font-medium hidden sm:block">{{ currentLanguage.name }}</span>
        <span class="text-primary-600 font-medium sm:hidden">{{ currentLanguage.code.toUpperCase() }}</span>
        <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </template>
    </button>
    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
    >
      <div class="py-1">
        <button
          v-for="language in languagesArray"
          :key="language.code"
          @click="selectLanguage(language.code)"
          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          :class="{ 'bg-primary-50 text-primary-700': currentLanguage.code === language.code }"
        >
          <span class="w-2 h-2 rounded-full mr-3"
                :class="currentLanguage.code === language.code ? 'bg-primary-600' : 'bg-gray-300'">
          </span>
          <span>{{ language.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  compact: { type: Boolean, default: false }
})
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import { languages, supportedLocales } from '../i18n'

const router = useRouter()
const route = useRoute()
const { locale } = useI18n()
const { switchLocale } = useLocaleRouter()
const isOpen = ref(false)

const buttonClass = computed(() => {
  if (props.compact) {
    return 'flex items-center justify-center p-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
  }
  return 'flex items-center space-x-1 sm:space-x-2 space-x-reverse px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors'
})

// Convert languages object to array for iteration
const languagesArray = Object.keys(languages).map(code => ({
  code,
  ...languages[code]
}))

// Current language info
const currentLanguage = computed(() => {
  const currentLocale = route.params.locale || route.meta.locale || locale.value || 'en'
  return {
    code: currentLocale,
    name: languages[currentLocale]?.name || 'English'
  }
})

// Select and switch language
const selectLanguage = async (newLocale) => {
  if (newLocale === currentLanguage.value.code) {
    isOpen.value = false
    return
  }

  try {
    // Use the new locale router composable for switching
    await switchLocale(newLocale)
    isOpen.value = false
  } catch (error) {
    console.error('Error switching language:', error)
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  const t = event.target
  if (!(t instanceof Element)) return
  if (!t.closest('.language-switcher-root')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script> 