<template>
  <div v-if="showDebugger" class="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
    <h3 class="font-bold mb-2">Role Debugger</h3>
    <div class="text-sm space-y-1">
      <div><strong>Authenticated:</strong> {{ authStore.isAuthenticated }}</div>
      <div><strong>User Role:</strong> {{ authStore.userRole }}</div>
      <div><strong>User Email:</strong> {{ authStore.userEmail }}</div>
      <div><strong>Available Tabs:</strong> {{ availableTabs.map(t => t.id).join(', ') }}</div>
      <div><strong>Raw User:</strong> {{ JSON.stringify(authStore.user, null, 2) }}</div>
    </div>
    <button 
      @click="setAdminRole" 
      class="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs"
    >
      Set Admin Role
    </button>
    <button 
      @click="setEmployeeRole" 
      class="mt-2 ml-2 px-3 py-1 bg-green-600 text-white rounded text-xs"
    >
      Set Employee Role
    </button>
    <button 
      @click="refreshProfile" 
      class="mt-2 ml-2 px-3 py-1 bg-yellow-600 text-white rounded text-xs"
    >
      Refresh Profile
    </button>
    <button 
      @click="forceRoleRefresh" 
      class="mt-2 ml-2 px-3 py-1 bg-purple-600 text-white rounded text-xs"
    >
      Force Role Refresh
    </button>
    <button 
      @click="showDebugger = false" 
      class="mt-2 ml-2 px-3 py-1 bg-red-600 text-white rounded text-xs"
    >
      Close
    </button>
  </div>
  <button 
    v-else
    @click="showDebugger = true"
    class="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50"
  >
    🐛
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabase'

const authStore = useAuthStore()
const showDebugger = ref(false)

const availableTabs = computed(() => {
  const userRole = authStore.userRole || 'customer'
  const tabs = ['buying', 'selling']
  
  if (userRole === 'admin') {
    tabs.push('admin')
  }
  if (userRole === 'employee') {
    tabs.push('employee')
  }
  
  return tabs.map(id => ({ id }))
})

const setAdminRole = async () => {
  try {
    const { data, error } = await supabase.rpc('set_user_role', {
      user_email: authStore.userEmail,
      new_role: 'admin'
    })
    
    if (error) {
      console.error('Error setting admin role:', error)
      alert('Error setting admin role: ' + error.message)
    } else {
      console.log('Admin role set successfully')
      // Refresh the user profile
      await authStore.refreshAuth()
      alert('Admin role set successfully! Please refresh the page.')
    }
  } catch (err) {
    console.error('Error setting admin role:', err)
    alert('Error setting admin role: ' + err.message)
  }
}

const setEmployeeRole = async () => {
  try {
    const { data, error } = await supabase.rpc('set_user_role', {
      user_email: authStore.userEmail,
      new_role: 'employee'
    })
    
    if (error) {
      console.error('Error setting employee role:', error)
      alert('Error setting employee role: ' + error.message)
    } else {
      console.log('Employee role set successfully')
      // Refresh the user profile
      await authStore.refreshAuth()
      alert('Employee role set successfully! Please refresh the page.')
    }
  } catch (err) {
    console.error('Error setting employee role:', err)
    alert('Error setting employee role: ' + err.message)
  }
}

const refreshProfile = async () => {
  try {
    console.log('Refreshing profile...')
    const success = await authStore.refreshProfile()
    if (success) {
      alert('Profile refreshed! Check the debug info.')
    } else {
      alert('Failed to refresh profile. Check console for details.')
    }
  } catch (err) {
    console.error('Error refreshing profile:', err)
    alert('Error refreshing profile: ' + err.message)
  }
}

const forceRoleRefresh = async () => {
  try {
    console.log('Force refreshing role...')
    const success = await authStore.forceRoleRefresh()
    if (success) {
      alert('Role force refreshed! Check the debug info.')
    } else {
      alert('Failed to force refresh role. Check console for details.')
    }
  } catch (err) {
    console.error('Error force refreshing role:', err)
    alert('Error force refreshing role: ' + err.message)
  }
}
</script>
