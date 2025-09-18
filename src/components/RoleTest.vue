<template>
  <div class="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-sm">
    <h3 class="font-bold text-lg mb-2">Role Test</h3>
    <div class="space-y-2 text-sm">
      <div><strong>Authenticated:</strong> {{ authStore.isAuthenticated }}</div>
      <div><strong>User Role:</strong> {{ authStore.userRole }}</div>
      <div><strong>User ID:</strong> {{ authStore.user?.id }}</div>
      <div><strong>User Email:</strong> {{ authStore.userEmail }}</div>
      <div><strong>Raw User Role:</strong> {{ authStore.user?.role }}</div>
      <div><strong>Profile Loading:</strong> {{ authStore.profileLoading }}</div>
    </div>
    <div class="mt-4 space-x-2">
      <button 
        @click="testRoleRefresh" 
        class="px-3 py-1 bg-blue-600 text-white rounded text-xs"
      >
        Test Role Refresh
      </button>
      <button 
        @click="testForceRefresh" 
        class="px-3 py-1 bg-purple-600 text-white rounded text-xs"
      >
        Force Refresh
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const testRoleRefresh = async () => {
  console.log('Testing role refresh...')
  await authStore.refreshProfile()
}

const testForceRefresh = async () => {
  console.log('Testing force role refresh...')
  await authStore.forceRoleRefresh()
}
</script>
