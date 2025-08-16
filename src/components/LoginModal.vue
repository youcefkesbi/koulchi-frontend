<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <!-- Header -->
              <div class="flex justify-between items-center mb-6">
                <DialogTitle as="h3" class="text-xl font-bold text-gray-900">
                  {{ isSignup ? $t('signup') : $t('login') }}
                </DialogTitle>
                <button
                  @click="closeModal"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>

              <!-- Toggle Mode Button -->
              <div class="text-center mb-6">
                <button
                  class="text-primary hover:text-primary-dark underline text-sm focus:outline-none transition-colors"
                  @click="toggleMode"
                >
                  {{ isSignup ? $t('haveAccount') : $t('noAccount') }}
                </button>
              </div>

              <!-- Error Message -->
              <div v-if="authStore.error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {{ authStore.error }}
              </div>

              <!-- Signup Form -->
              <form v-if="isSignup" @submit.prevent="handleSignup" class="space-y-4">
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('fullName') }}</label>
                  <input 
                    v-model="signupForm.fullName" 
                    type="text" 
                    required 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300" 
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('email') }}</label>
                  <input 
                    v-model="signupForm.email" 
                    type="email" 
                    required 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300" 
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('password') }}</label>
                  <input 
                    v-model="signupForm.password" 
                    type="password" 
                    required 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300" 
                    placeholder="Enter your password"
                  />
                </div>
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('confirmPassword') }}</label>
                  <input 
                    v-model="signupForm.confirmPassword" 
                    type="password" 
                    required 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300" 
                    placeholder="Confirm your password"
                  />
                </div>
                <button 
                  type="submit" 
                  :disabled="authStore.loading || !isFormValid" 
                  class="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  <i v-if="authStore.loading" class="fas fa-spinner fa-spin mr-2"></i>
                  {{ $t('signup') }}
                </button>
              </form>

              <!-- Login Form -->
              <form v-else @submit.prevent="handleLogin" class="space-y-4">
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('email') }}</label>
                  <input 
                    v-model="loginForm.email" 
                    type="email" 
                    required 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300" 
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('password') }}</label>
                  <input 
                    v-model="loginForm.password" 
                    type="password" 
                    required 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300" 
                    placeholder="Enter your password"
                  />
                </div>
                <button 
                  type="submit" 
                  :disabled="authStore.loading || !loginForm.email || !loginForm.password" 
                  class="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  <i v-if="authStore.loading" class="fas fa-spinner fa-spin mr-2"></i>
                  {{ $t('login') }}
                </button>
              </form>

              <!-- Divider -->
              <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">{{ $t('or') }}</span>
                </div>
              </div>

              <!-- OAuth Buttons -->
              <div class="space-y-3">
                <!-- Google Login -->
                <button
                  @click="handleGoogleLogin"
                  :disabled="authStore.loading"
                  class="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                >
                  <span class="text-xs text-gray-500">Click me!</span>
                  <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {{ $t('loginWithGoogle') }}
                </button>

                <!-- Facebook Login -->
                <button
                  @click="handleFacebookLogin"
                  :disabled="authStore.loading"
                  class="w-full flex items-center justify-center px-4 py-3 border-2 border-transparent rounded-xl shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                >
                  <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  {{ $t('loginWithFacebook') }}
                </button>
              </div>

              <!-- Success Message -->
              <div v-if="successMessage" class="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                {{ successMessage }}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'LoginModal',
  components: {
    TransitionRoot,
    TransitionChild,
    Dialog,
    DialogPanel,
    DialogTitle
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  
  mounted() {
    console.log('LoginModal mounted, isOpen:', this.isOpen)
  },
  
  watch: {
    isOpen(newVal) {
      console.log('LoginModal isOpen changed to:', newVal)
    }
  },

  setup(props, { emit }) {
    const authStore = useAuthStore()
    
    const isSignup = ref(false)
    const successMessage = ref('')
    
    const signupForm = reactive({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    
    const loginForm = reactive({
      email: '',
      password: ''
    })

    // Form validation
    const isFormValid = computed(() => {
      if (!isSignup.value) return true
      return signupForm.fullName && 
             signupForm.email && 
             signupForm.password && 
             signupForm.confirmPassword &&
             signupForm.password === signupForm.confirmPassword &&
             signupForm.password.length >= 6
    })

    const closeModal = () => {
      emit('close')
      // Reset forms and messages
      Object.assign(signupForm, { fullName: '', email: '', password: '', confirmPassword: '' })
      Object.assign(loginForm, { email: '', password: '' })
      successMessage.value = ''
      authStore.clearError()
    }

    const toggleMode = () => {
      isSignup.value = !isSignup.value
      authStore.clearError()
      successMessage.value = ''
    }

    const handleSignup = async () => {
      try {
        if (signupForm.password !== signupForm.confirmPassword) {
          authStore.error = 'Passwords do not match'
          return
        }
        
        if (signupForm.password.length < 6) {
          authStore.error = 'Password must be at least 6 characters'
          return
        }

        await authStore.signUp(signupForm.email, signupForm.password, {
          full_name: signupForm.fullName
        })
        
        successMessage.value = 'Account created successfully! Please check your email to verify your account.'
        
        // Close modal after a delay
        setTimeout(() => {
          closeModal()
        }, 3000)
      } catch (error) {
        console.error('Signup error:', error)
      }
    }

    const handleLogin = async () => {
      try {
        await authStore.login(loginForm.email, loginForm.password)
        if (!authStore.error) {
          closeModal()
        }
      } catch (error) {
        console.error('Login error:', error)
      }
    }

    const handleGoogleLogin = async () => {
      try {
        console.log('=== LOGIN MODAL: GOOGLE OAUTH CLICKED ===')
        console.log('LoginModal: Starting Google OAuth...')
        console.log('Button clicked at:', new Date().toISOString())
        console.log('Auth store:', authStore)
        
        const result = await authStore.loginWithGoogle()
        console.log('LoginModal: Google OAuth result:', result)
        
        if (!authStore.error) {
          console.log('LoginModal: No error, closing modal')
          closeModal()
        } else {
          console.log('LoginModal: Error occurred:', authStore.error)
        }
      } catch (error) {
        console.error('LoginModal: Google login error:', error)
        console.error('Error details:', error.message, error.stack)
      }
    }

    const handleFacebookLogin = async () => {
      try {
        await authStore.loginWithFacebook()
        if (!authStore.error) {
          closeModal()
        }
      } catch (error) {
        console.error('Facebook login error:', error)
      }
    }

    return {
      authStore,
      isSignup,
      signupForm,
      loginForm,
      successMessage,
      isFormValid,
      closeModal,
      toggleMode,
      handleSignup,
      handleLogin,
      handleGoogleLogin,
      handleFacebookLogin
    }
  }
}
</script> 