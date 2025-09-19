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
    default: true
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

// Size configurations
const sizeConfig = {
  small: {
    container: 'w-8 h-8',
    image: 'w-6 h-6',
    text: 'text-lg'
  },
  default: {
    container: 'w-12 h-12',
    image: 'w-8 h-8',
    text: 'text-2xl'
  },
  large: {
    container: 'w-16 h-16',
    image: 'w-12 h-12',
    text: 'text-3xl'
  }
}

// Computed properties
const logoSrc = computed(() => {
  const logoFile = logoMapping[locale.value] || fallbackLogo
  return `/${logoFile}`
})

const logoAlt = computed(() => {
  return `Koulchi Logo - ${locale.value.toUpperCase()}`
})

const brandName = computed(() => {
  // You can customize brand name per language if needed
  return 'Koulchi'
})

// Computed classes based on props
const containerClass = computed(() => {
  const baseClasses = 'flex items-center space-x-3 space-x-reverse group'
  
  if (props.variant === 'minimal') {
    return baseClasses.replace('space-x-3', 'space-x-2')
  }
  
  return baseClasses
})

const logoContainerClass = computed(() => {
  const sizeClasses = sizeConfig[props.size]
  const baseClasses = `${sizeClasses.container} rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300 group-hover:scale-105 overflow-hidden`
  
  if (props.variant === 'footer') {
    return baseClasses.replace('bg-white dark:bg-gray-800', 'bg-primary')
  }
  
  if (props.variant === 'minimal') {
    return baseClasses.replace('rounded-2xl shadow-soft group-hover:shadow-glow group-hover:scale-105', 'rounded-lg')
  }
  
  return `${baseClasses} bg-white dark:bg-gray-800`
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
