<template>
  <div class="min-h-screen bg-white">
    <LoginModal variant="page" :is-open="true" @close="onClose" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import LoginModal from '../components/LoginModal.vue'
import { useAuthStore } from '../stores/useAuthStore'
import { useLocaleRouter } from '../composables/useLocaleRouter'

const authStore = useAuthStore()
const { navigateToPath } = useLocaleRouter()

const onClose = () => {
  navigateToPath('/')
}

onMounted(async () => {
  const ok = await authStore.checkAuthStatus()
  if (ok && authStore.isAuthenticated) {
    navigateToPath('/')
  }
})
</script>
