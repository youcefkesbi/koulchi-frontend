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
              <div v-if="authStore.error" class="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
                <div class="flex items-start space-x-3 space-x-reverse">
                  <i class="fas fa-exclamation-triangle text-red-600 mt-0.5 flex-shrink-0"></i>
                  <div class="flex-1">
                    <h4 class="font-semibold text-red-800 mb-1">{{ $t('error') }}</h4>
                    <p class="text-red-700 text-sm">{{ getErrorMessage(authStore.error) }}</p>
                    
                    <!-- Resend confirmation button for email not confirmed errors -->
                    <div v-if="isEmailNotConfirmedError(authStore.error)" class="mt-3">
                      <button
                        @click="resendConfirmationEmail"
                        :disabled="authStore.loading"
                        class="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <i v-if="authStore.loading" class="fas fa-spinner fa-spin mr-2"></i>
                        <i v-else class="fas fa-envelope mr-2"></i>
                        {{ $t('resendConfirmation') }}
                      </button>
                    </div>
                  </div>
                  <button 
                    @click="clearError" 
                    class="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Success Message -->
              <div v-if="successMessage" class="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                <div class="flex items-start space-x-3 space-x-reverse">
                  <i class="fas fa-check-circle text-green-600 mt-0.5 flex-shrink-0"></i>
                  <div class="flex-1">
                    <h4 class="font-semibold text-green-800 mb-1">{{ $t('success') }}</h4>
                    <p class="text-green-700 text-sm">{{ successMessage }}</p>
                    
                    <!-- Resend Confirmation Email Button (only show when email confirmation is required) -->
                    <div v-if="emailForConfirmation && successMessage.includes('check your email')" class="mt-3">
                      <button
                        @click="handleResendConfirmation"
                        :disabled="authStore.loading"
                        class="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 border border-green-300 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <i v-if="authStore.loading" class="fas fa-spinner fa-spin mr-2"></i>
                        <i v-else class="fas fa-envelope mr-2"></i>
                        {{ $t('resendConfirmation') }}
                      </button>
                    </div>
                  </div>
                  <button 
                    @click="successMessage = ''" 
                    class="text-green-400 hover:text-green-600 transition-colors flex-shrink-0"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
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
                    :placeholder="$t('fullNamePlaceholder')"
                  />
                </div>
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('email') }}</label>
                  <input 
                    v-model="signupForm.email" 
                    type="email" 
                    required 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300" 
                    :placeholder="$t('emailPlaceholder')"
                  />
                </div>
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('password') }}</label>
                  <input 
                    v-model="signupForm.password" 
                    type="password" 
                    required 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300" 
                    :placeholder="$t('passwordPlaceholder')"
                  />
                </div>
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('confirmPassword') }}</label>
                  <input 
                    v-model="signupForm.confirmPassword" 
                    type="password" 
                    required 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300" 
                    :placeholder="$t('confirmPasswordPlaceholder')"
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
                    :placeholder="$t('emailPlaceholder')"
                  />
                </div>
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('password') }}</label>
                  <input 
                    v-model="loginForm.password" 
                    type="password" 
                    required 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300" 
                    :placeholder="$t('passwordPlaceholder')"
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

                <!-- Forgot Password Link -->
                <div class="text-center">
                  <button
                    @click="showForgotPassword = true"
                    class="text-primary hover:text-primary-dark underline text-sm focus:outline-none transition-colors"
                  >
                    {{ $t('errors.forgotPassword') }}
                  </button>
                </div>
              </form>

              <!-- Forgot Password Form -->
              <form v-if="showForgotPassword" @submit.prevent="handleForgotPassword" class="space-y-4 relative">
                <div class="text-center mb-4">
                  <button
                    @click="showForgotPassword = false"
                    class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i class="fas fa-times text-xl"></i>
                  </button>
                  <h4 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('resetPassword') }}</h4>
                  <p class="text-sm text-gray-600">{{ $t('enterEmailForReset') }}</p>
                </div>
                
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('email') }}</label>
                  <input 
                    v-model="forgotPasswordForm.email" 
                    type="email" 
                    required 
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300" 
                    :placeholder="$t('emailPlaceholder')"
                  />
                </div>

                <div class="flex space-x-3 space-x-reverse">
                  <button
                    type="button"
                    @click="showForgotPassword = false"
                    class="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-medium"
                  >
                    {{ $t('common.cancel') }}
                  </button>
                  <button 
                    type="submit" 
                    :disabled="authStore.loading || !forgotPasswordForm.email" 
                    class="flex-1 bg-primary text-white py-3 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    <i v-if="authStore.loading" class="fas fa-spinner fa-spin mr-2"></i>
                    {{ $t('resetPassword') }}
                  </button>
                </div>

                <!-- Back to Login -->
                <div class="text-center pt-2">
                  <button
                    @click="showForgotPassword = false"
                    class="text-primary hover:text-primary-dark underline text-sm focus:outline-none transition-colors"
                  >
                    ← {{ $t('login') }}
                  </button>
                </div>
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
                  <i v-if="authStore.loading" class="fas fa-spinner fa-spin mr-3"></i>
                  <!-- Google icon -->
                  <svg v-else class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {{ authStore.loading ? $t('connectingToGoogle') : $t('loginWithGoogle') }}
                </button>

                <!-- Facebook Login -->
                <button
                  @click="handleFacebookLogin"
                  :disabled="authStore.loading"
                  class="w-full flex items-center justify-center px-4 py-3 border-2 border-transparent rounded-xl shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                >
                  <i v-if="authStore.loading" class="fas fa-spinner fa-spin mr-3"></i>
                  <svg v-else class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  {{ authStore.loading ? $t('connectingToFacebook') : $t('loginWithFacebook') }}
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
import { useI18n } from 'vue-i18n'
import { supabase } from '@/lib/supabase'

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

  setup(props, { emit }) {
    const authStore = useAuthStore()
    const { t } = useI18n()
    
    const isSignup = ref(false)
    const showForgotPassword = ref(false)
    const emailForConfirmation = ref('')
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

    const forgotPasswordForm = reactive({
      email: ''
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
      Object.assign(forgotPasswordForm, { email: '' })
      successMessage.value = ''
      showForgotPassword.value = false
      authStore.clearError()
    }

    const toggleMode = () => {
      isSignup.value = !isSignup.value
      showForgotPassword.value = false
      authStore.clearError()
      successMessage.value = ''
    }

    const handleSignup = async () => {
      try {
        if (signupForm.password !== signupForm.confirmPassword) {
          authStore.error = t('errors.passwordsDoNotMatch')
          return
        }
        
        if (signupForm.password.length < 6) {
          authStore.error = t('errors.passwordTooShort')
          return
        }

        const result = await authStore.signUp(signupForm.email, signupForm.password, {
          full_name: signupForm.fullName
        })
        
        // Check if email confirmation is required
        if (result?.emailConfirmationRequired) {
          successMessage.value = result.message || t('errors.emailConfirmationRequired')
          // Show email confirmation instructions
          console.log('Email confirmation required for:', signupForm.email)
          // Store email for potential resend
          emailForConfirmation.value = signupForm.email
          // Don't close modal immediately, let user see the message
        } else if (result?.user && result?.session) {
          successMessage.value = result.message || t('errors.accountCreatedSuccess')
          // Close modal after a delay
          setTimeout(() => {
            closeModal()
          }, 3000)
        } else {
          // Fallback message
          successMessage.value = t('errors.accountCreatedSuccess')
        }
      } catch (error) {
        console.error('Signup error:', error)
      }
    }

    const handleLogin = async () => {
      try {
        await authStore.login(loginForm.email, loginForm.password)
        if (!authStore.error) {
          // Ensure profile exists
          try {
            await authStore.createProfileIfNotExists()
          } catch (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't block login if profile creation fails
          }
          closeModal()
        }
      } catch (error) {
        console.error('Login error:', error)
      }
    }

    const handleGoogleLogin = async () => {
      try {
        // Clear any previous errors
        authStore.clearError()
        
        const result = await authStore.loginWithGoogle()
        console.log('LoginModal: Google OAuth result:', result)
        
        // Check if we have a successful result
        if (result && !authStore.error) {
          console.log('LoginModal: Google OAuth successful, closing modal')
          // Ensure profile exists with OAuth data
          try {
            // Extract OAuth data from the result if available
            const oauthData = {}
            if (result?.user?.user_metadata) {
              oauthData.full_name = result.user.user_metadata.full_name
              oauthData.avatar_url = result.user.user_metadata.avatar_url
              oauthData.city = result.user.user_metadata.city
            }
            await authStore.createProfileIfNotExists(oauthData)
          } catch (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't block login if profile creation fails
          }
          closeModal()
        } else if (authStore.error) {
          console.log('LoginModal: Google OAuth error occurred:', authStore.error)
          // Error is already set in authStore, it will be displayed by the error message component
        }
      } catch (error) {
        console.error('LoginModal: Google login error:', error)
        console.error('Error details:', error.message, error.stack)
        
        // Set a user-friendly error message if none is set
        if (!authStore.error) {
          authStore.error = 'Google login failed. Please try again or use email/password login.'
        }
      }
    }

    const handleFacebookLogin = async () => {
      try {
        // Clear any previous errors
        authStore.clearError()
        
        const result = await authStore.loginWithFacebook()
        
        // Check if we have a successful result
        if (result && !authStore.error) {
          // Ensure profile exists with OAuth data
          try {
            // Extract OAuth data from the result if available
            const oauthData = {}
            if (result?.user?.user_metadata) {
              oauthData.full_name = result.user.user_metadata.full_name
              oauthData.avatar_url = result.user.user_metadata.avatar_url
              oauthData.city = result.user.user_metadata.city
            }
            await authStore.createProfileIfNotExists(oauthData)
          } catch (profileError) {
            console.error('Profile creation error:', profileError)
            // Don't block login if profile creation fails
          }
          closeModal()
        } else if (authStore.error) {
          console.log('LoginModal: Facebook OAuth error occurred:', authStore.error)
          // Error is already set in authStore, it will be displayed by the error message component
        }
      } catch (error) {
        console.error('Facebook login error:', error)
        
        // Set a user-friendly error message if none is set
        if (!authStore.error) {
          authStore.error = 'Facebook login failed. Please try again or use email/password login.'
        }
      }
    }

    // Function to get user-friendly error messages
    const getErrorMessage = (error) => {
      if (!error) return ''
      
      const errorLower = error.toLowerCase()
      
      // Handle specific error cases
      if (errorLower.includes('email not confirmed') || errorLower.includes('email not verified')) {
        return t('errors.emailNotConfirmed')
      }
      if (errorLower.includes('invalid login credentials') || errorLower.includes('invalid email or password')) {
        return t('errors.invalidCredentials')
      }
      if (errorLower.includes('user not found')) {
        return t('errors.userNotFound')
      }
      if (errorLower.includes('weak password') || errorLower.includes('password is too weak')) {
        return t('errors.weakPassword')
      }
      if (errorLower.includes('email already in use') || errorLower.includes('user already registered')) {
        return t('errors.emailAlreadyInUse')
      }
      if (errorLower.includes('too many requests') || errorLower.includes('rate limit')) {
        return t('errors.tooManyRequests')
      }
      if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('connection')) {
        return t('errors.networkError')
      }
      
      // Handle OAuth specific errors
      if (errorLower.includes('oauth error occurred') || errorLower.includes('google oauth failed')) {
        return t('errors.googleOAuthError')
      }
      if (errorLower.includes('oauth cancelled')) {
        return t('errors.oauthCancelled')
      }
      if (errorLower.includes('oauth timeout')) {
        return t('errors.oauthTimeout')
      }
      if (errorLower.includes('oauth provider error')) {
        return t('errors.oauthProviderError')
      }
      if (errorLower.includes('oauth') || errorLower.includes('google')) {
        return t('errors.oauthNotSupported')
      }
      
      // Default case
      return error || t('errors.unknownError')
    }

    // Function to clear error
    const clearError = () => {
      authStore.clearError()
    }

    // Function to check if error is email not confirmed
    const isEmailNotConfirmedError = (error) => {
      if (!error) return false
      const errorLower = error.toLowerCase()
      return errorLower.includes('email not confirmed') || errorLower.includes('email not verified')
    }

    // Function to resend confirmation email
    const resendConfirmationEmail = async () => {
      try {
        const email = isSignup.value ? signupForm.email : loginForm.email
        if (!email) {
          authStore.error = t('errors.unknownError')
          return
        }
        
        await authStore.resendConfirmationEmail(email)
        successMessage.value = t('resendConfirmationSent')
      } catch (error) {
        console.error('Resend confirmation error:', error)
      }
    }

    // Function to handle forgot password
    const handleForgotPassword = async () => {
      try {
        if (!forgotPasswordForm.email) {
          authStore.error = t('errors.unknownError')
          return
        }
        
        await authStore.resetPasswordForEmail(forgotPasswordForm.email)
        successMessage.value = t('resetPasswordSent')
        
        // Reset form and hide forgot password section
        forgotPasswordForm.email = ''
        showForgotPassword.value = false
        
        // Close modal after a delay
        setTimeout(() => {
          closeModal()
        }, 3000)
      } catch (error) {
        console.error('Forgot password error:', error)
      }
    }

    return {
      authStore,
      isSignup,
      showForgotPassword,
      signupForm,
      loginForm,
      forgotPasswordForm,
      successMessage,
      isFormValid,
      closeModal,
      toggleMode,
      handleSignup,
      handleLogin,
      handleForgotPassword,
      handleGoogleLogin,
      handleFacebookLogin,
      getErrorMessage,
      clearError,
      isEmailNotConfirmedError,
      resendConfirmationEmail
    }
  }
}
</script> 