<template>
  <div :class="containerClass">
    <!-- Logo Image -->
    <div :class="logoContainerClass">
      <img 
        :src="logoSrc" 
        :alt="logoAlt"
        :class="logoImageClass"
        @error="handleImageError"
      />
    </div>
    
    <!-- Brand Name -->
    <div v-if="showBrandName">
      <h1 :class="brandNameClass">
        {{ brandName }}
      </h1>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// Props for customization
const props = defineProps({
  size: {
    type: String,
    default: 'default', // 'small', 'default', 'large'
    validator: (value) => ['small', 'default', 'large'].includes(value)
  },
  showBrandName: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'default', // 'default', 'footer', 'minimal'
    validator: (value) => ['default', 'footer', 'minimal'].includes(value)
  }
})

// Logo mapping configuration
const logoMapping = {
  'en': 'Logo English:French Black.png',
  'fr': 'Logo English:French Black.png', 
  'ar': 'Logo Arabic Black.png'
}

// Fallback logo (default to English/French)
const fallbackLogo = 'Logo English:French Black.png'

// Size configurations with responsive sizing
const sizeConfig = {
  small: {
    container: 'w-8 h-8 sm:w-10 sm:h-10',
    image: 'w-6 h-6 sm:w-8 sm:h-8',
    text: 'text-sm sm:text-lg'
  },
  default: {
    container: 'w-12 h-12 sm:w-14 sm:h-14',
    image: 'w-8 h-8 sm:w-10 sm:h-10',
    text: 'text-xl sm:text-2xl'
  },
  large: {
    container: 'w-16 h-16 sm:w-20 sm:h-20',
    image: 'w-12 h-12 sm:w-16 sm:h-16',
    text: 'text-2xl sm:text-3xl'
  }
}

// Computed properties
const logoSrc = computed(() => {
  const logoFile = logoMapping[locale.value] || fallbackLogo
  return `/${logoFile}`
})

const logoAlt = computed(() => {
  const languageNames = {
    'en': 'English',
    'fr': 'French', 
    'ar': 'Arabic'
  }
  const languageName = languageNames[locale.value] || locale.value.toUpperCase()
  return `Koulchi - ${languageName} Logo`
})

const brandName = computed(() => {
  // You can customize brand name per language if needed
  return 'Koulchi'
})

// Computed classes based on props
const containerClass = computed(() => {
  if (!props.showBrandName) {
    // When no brand name, just center the logo
    return 'flex items-center justify-center group'
  }
  
  const baseClasses = 'flex items-center space-x-3 space-x-reverse group'
  
  if (props.variant === 'minimal') {
    return baseClasses.replace('space-x-3', 'space-x-2')
  }
  
  return baseClasses
})

const logoContainerClass = computed(() => {
  const sizeClasses = sizeConfig[props.size]
  let baseClasses = `${sizeClasses.container} rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300 group-hover:scale-105 overflow-hidden`
  
  if (props.variant === 'footer') {
    baseClasses = baseClasses.replace('bg-white dark:bg-gray-800', 'bg-primary')
  } else if (props.variant === 'minimal') {
    baseClasses = baseClasses.replace('rounded-2xl shadow-soft group-hover:shadow-glow group-hover:scale-105', 'rounded-lg')
  } else {
    baseClasses = `${baseClasses} bg-white dark:bg-gray-800`
  }
  
  // Add extra padding when no brand name is shown for better visual balance
  if (!props.showBrandName) {
    baseClasses += ' p-1'
  }
  
  return baseClasses
})

const logoImageClass = computed(() => {
  const sizeClasses = sizeConfig[props.size]
  return `${sizeClasses.image} object-contain transition-all duration-300`
})

const brandNameClass = computed(() => {
  const sizeClasses = sizeConfig[props.size]
  const baseClasses = `${sizeClasses.text} font-bold text-primary dark:text-primary transition-colors duration-300`
  
  if (props.variant === 'footer') {
    return baseClasses.replace('text-primary dark:text-primary', 'text-primary')
  }
  
  return baseClasses
})

// Error handling for missing logo files
const handleImageError = (event) => {
  console.warn(`Logo not found for locale: ${locale.value}, falling back to default`)
  event.target.src = `/${fallbackLogo}`
}
</script>
