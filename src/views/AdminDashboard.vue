<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <h2 class="text-xl font-semibold text-gray-800 mb-2">{{ $t('common.loading') }}</h2>
      <p class="text-gray-600">{{ $t('admin.redirectingToAdminPanel') }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLocaleRouter } from '../composables/useLocaleRouter'

const { t: $t } = useI18n()
const router = useRouter()
const { navigateToPath } = useLocaleRouter()

// Redirect to /admintab on component mount
onMounted(() => {
  // Get current locale from the route
  const currentLocale = router.currentRoute.value.meta.locale || 'en'
  
  // Redirect to the admintab route with the current locale
  navigateToPath('/admintab')
})
</script>

<style scoped>
.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color, #3B82F6);
  color: white;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: var(--primary-dark, #2563EB);
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
</style>
