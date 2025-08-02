import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { auth, googleProvider, facebookProvider } from '../firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const userDisplayName = computed(() => user.value?.displayName || '')
  const userEmail = computed(() => user.value?.email || '')
  const userPhotoURL = computed(() => user.value?.photoURL || '')

  // Initialize auth state listener
  const initAuth = () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
    })
  }

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      loading.value = true
      error.value = null
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      error.value = err.message
      console.error('Google login error:', err)
    } finally {
      loading.value = false
    }
  }

  // Login with Facebook
  const loginWithFacebook = async () => {
    try {
      loading.value = true
      error.value = null
      await signInWithPopup(auth, facebookProvider)
    } catch (err) {
      error.value = err.message
      console.error('Facebook login error:', err)
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = async () => {
    try {
      loading.value = true
      error.value = null
      await signOut(auth)
    } catch (err) {
      error.value = err.message
      console.error('Logout error:', err)
    } finally {
      loading.value = false
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userDisplayName,
    userEmail,
    userPhotoURL,
    initAuth,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    clearError
  }
}) 