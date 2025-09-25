<template>
  <div :class="containerClass">
    <!-- Logo Image -->
    <img 
      :src="logoSrc" 
      :alt="logoAlt"
      :class="logoImageClass"
      @error="handleImageError"
    />
    
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
  'en': 'Logo-English-French-Black.png',
  'fr': 'Logo-English-French-Black.png', 
  'ar': 'Logo-Arabic-Black.png'
}

// Fallback logo (default to English/French)
const fallbackLogo = 'Logo-English-French-Black.png'

// Size configurations with responsive sizing - increased sizes for better visibility
const sizeConfig = {
  small: {
    image: 'w-16 h-16 sm:w-20 sm:h-20',
    text: 'text-lg sm:text-xl'
  },
  default: {
    image: 'w-20 h-20 sm:w-24 sm:h-24',
    text: 'text-2xl sm:text-3xl'
  },
  large: {
    image: 'w-24 h-24 sm:w-28 sm:h-28',
    text: 'text-3xl sm:text-4xl'
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
    return 'flex items-center justify-center'
  }
  
  const baseClasses = 'flex items-center space-x-3 space-x-reverse'
  
  if (props.variant === 'minimal') {
    return baseClasses.replace('space-x-3', 'space-x-2')
  }
  
  return baseClasses
})

const logoImageClass = computed(() => {
  const sizeClasses = sizeConfig[props.size]
  return `${sizeClasses.image} object-contain`
})

const brandNameClass = computed(() => {
  const sizeClasses = sizeConfig[props.size]
  const baseClasses = `${sizeClasses.text} font-bold text-primary`
  
  if (props.variant === 'footer') {
    return baseClasses
  }
  
  return baseClasses
})

// Error handling for missing logo files
const handleImageError = (event) => {
  console.warn(`Logo not found for locale: ${locale.value}, falling back to default`)
  event.target.src = `/${fallbackLogo}`
}
</script>
