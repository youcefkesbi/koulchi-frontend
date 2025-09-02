<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <!-- Page Header -->
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-dark mb-4">{{ $t('profile.title') }}</h1>
        <p class="text-gray-600 text-lg">{{ $t('profile.subtitle') }}</p>
      </div>

      <!-- Profile Form -->
      <div class="bg-white rounded-3xl shadow-soft p-8">
        <form @submit.prevent="saveProfile" class="space-y-6">
          <!-- Full Name Field -->
          <div>
            <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.fullName') }}</label>
            <input
              v-model="fullName"
              type="text"
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
              :placeholder="$t('profile.fullNamePlaceholder')"
            />
            <p class="text-xs text-gray-500 mt-1">{{ $t('profile.fullNameNote') }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 bg-primary text-white py-3 px-6 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ loading ? $t('profile.updating') : $t('profile.updateProfile') }}
            </button>
            
            <router-link
              to="/dashboard"
              class="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 font-semibold text-center"
            >
              {{ $t('common.cancel') }}
            </router-link>
          </div>
        </form>

        <!-- Message Display -->
        <div v-if="message" class="mt-6 p-4 rounded-xl text-center" :class="messageClass">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

// State
const fullName = ref('')
const message = ref('')
const loading = ref(false)
const isError = ref(false)

// Computed message class for styling
const messageClass = computed(() => {
  return isError.value 
    ? 'bg-red-100 text-red-700' 
    : 'bg-green-100 text-green-700'
})

// Fetch current profile on mount
const fetchProfile = async () => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      router.push('/')
      return
    }

    // Fetch profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError)
      return
    }

    // Set full name if profile exists, otherwise keep empty
    fullName.value = profile?.full_name || ''
  } catch (error) {
    console.error('Error in fetchProfile:', error)
  }
}

// Save profile using upsert
const saveProfile = async () => {
  try {
    loading.value = true
    message.value = ''
    isError.value = false

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Not authenticated')
    }

    // Upsert profile
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName.value
      }, {
        onConflict: 'id'
      })

    if (upsertError) {
      throw upsertError
    }

    // Success
    message.value = 'Profile updated successfully!'
    
    // Clear message after 3 seconds
    setTimeout(() => {
      message.value = ''
    }, 3000)

  } catch (error) {
    console.error('Error saving profile:', error)
    isError.value = true
    message.value = error.message || 'Error saving profile'
  } finally {
    loading.value = false
  }
}

// Initialize on mount
onMounted(() => {
  fetchProfile()
})
</script>

