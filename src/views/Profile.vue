<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Page Header -->
      <div class="mb-8 text-center">
        <h1 class="text-4xl font-bold text-dark mb-4">{{ $t('profile.title') }}</h1>
        <p class="text-gray-600 text-lg">{{ $t('profile.subtitle') }}</p>
      </div>

      <!-- Profile Form -->
      <div class="bg-white rounded-3xl shadow-soft p-8">
        <form @submit.prevent="handleUpdateProfile" class="space-y-6">
          <!-- Personal Information Section -->
          <div class="border-b border-gray-200 pb-6">
            <h2 class="text-2xl font-bold text-dark mb-6">{{ $t('profile.personalInfo') }}</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Full Name -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.fullName') }}</label>
                <input
                  v-model="profileForm.fullName"
                  type="text"
                  required
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                  :placeholder="$t('profile.fullNamePlaceholder')"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.email') }}</label>
                <input
                  v-model="profileForm.email"
                  type="email"
                  required
                  disabled
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  :placeholder="$t('profile.emailPlaceholder')"
                />
                <p class="text-xs text-gray-500 mt-1">{{ $t('profile.emailNote') }}</p>
              </div>

              <!-- Phone Number (Managed by Supabase Auth) -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.phone') }}</label>
                <input
                  :value="authStore.user?.phone || ''"
                  type="tel"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                  :placeholder="$t('profile.phoneNote')"
                  disabled
                />
                <p class="text-xs text-gray-500 mt-1">{{ $t('profile.phoneNote') }}</p>
              </div>

              <!-- Date of Birth -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.dateOfBirth') }}</label>
                <input
                  v-model="profileForm.dateOfBirth"
                  type="date"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                />
              </div>
            </div>
          </div>

          <!-- Address Information Section -->
          <div class="border-b border-gray-200 pb-6">
            <h2 class="text-2xl font-bold text-dark mb-6">{{ $t('profile.addressInfo') }}</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Wilaya (Province) -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.wilaya') }}</label>
                <select
                  v-model="profileForm.wilaya"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                >
                  <option value="">{{ $t('profile.selectWilaya') }}</option>
                  <option v-for="wilaya in wilayas" :key="wilaya.value" :value="wilaya.value">
                    {{ wilaya.label }}
                  </option>
                </select>
              </div>

              <!-- City -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.city') }}</label>
                <input
                  v-model="profileForm.city"
                  type="text"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                  :placeholder="$t('profile.cityPlaceholder')"
                />
              </div>

              <!-- Address -->
              <div class="md:col-span-2">
                <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.address') }}</label>
                <textarea
                  v-model="profileForm.address"
                  rows="3"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300 resize-none"
                  :placeholder="$t('profile.addressPlaceholder')"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Preferences Section -->
          <div class="border-b border-gray-200 pb-6">
            <h2 class="text-2xl font-bold text-dark mb-6">{{ $t('profile.preferences') }}</h2>
            
            <div class="space-y-4">
              <!-- Language Preference -->
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700">{{ $t('profile.language') }}</label>
                <select
                  v-model="profileForm.language"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-300"
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <!-- Newsletter Subscription -->
              <div class="flex items-center">
                <input
                  v-model="profileForm.newsletter"
                  type="checkbox"
                  id="newsletter"
                  class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <label for="newsletter" class="ml-2 text-sm text-gray-700">
                  {{ $t('profile.newsletter') }}
                </label>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 pt-6">
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

        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="mt-6 p-4 bg-green-100 text-green-700 rounded-xl text-center">
          {{ successMessage }}
        </div>
        
        <div v-if="errorMessage" class="mt-6 p-4 bg-red-100 text-red-700 rounded-xl text-center">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'Profile',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const loading = ref(false)
    const successMessage = ref('')
    const errorMessage = ref('')
    
    const profileForm = reactive({
      fullName: '',
      email: '',
      dateOfBirth: '',
      wilaya: '',
      city: '',
      address: '',
      language: 'en',
      newsletter: false
    })

    // Algerian provinces
    const wilayas = [
      { value: 'adrar', label: 'Adrar' },
      { value: 'chlef', label: 'Chlef' },
      { value: 'laghouat', label: 'Laghouat' },
      { value: 'oum_el_bouaghi', label: 'Oum El Bouaghi' },
      { value: 'batna', label: 'Batna' },
      { value: 'bejaia', label: 'Bejaia' },
      { value: 'biskra', label: 'Biskra' },
      { value: 'bechar', label: 'Bechar' },
      { value: 'blida', label: 'Blida' },
      { value: 'bouira', label: 'Bouira' },
      { value: 'tamanrasset', label: 'Tamanrasset' },
      { value: 'tebessa', label: 'Tebessa' },
      { value: 'tlemcen', label: 'Tlemcen' },
      { value: 'tiaret', label: 'Tiaret' },
      { value: 'tizi_ouzou', label: 'Tizi Ouzou' },
      { value: 'alger', label: 'Alger' },
      { value: 'djelfa', label: 'Djelfa' },
      { value: 'jijel', label: 'Jijel' },
      { value: 'setif', label: 'Setif' },
      { value: 'saida', label: 'Saida' },
      { value: 'skikda', label: 'Skikda' },
      { value: 'sidi_bel_abbes', label: 'Sidi Bel Abbes' },
      { value: 'annaba', label: 'Annaba' },
      { value: 'guelma', label: 'Guelma' },
      { value: 'constantine', label: 'Constantine' },
      { value: 'medea', label: 'Medea' },
      { value: 'mostaganem', label: 'Mostaganem' },
      { value: 'msila', label: 'Msila' },
      { value: 'mascara', label: 'Mascara' },
      { value: 'ouargla', label: 'Ouargla' },
      { value: 'oran', label: 'Oran' },
      { value: 'el_bayadh', label: 'El Bayadh' },
      { value: 'illizi', label: 'Illizi' },
      { value: 'bordj_bou_arreridj', label: 'Bordj Bou Arreridj' },
      { value: 'boumerdes', label: 'Boumerdes' },
      { value: 'el_tarf', label: 'El Tarf' },
      { value: 'tindouf', label: 'Tindouf' },
      { value: 'tissemsilt', label: 'Tissemsilt' },
      { value: 'el_oued', label: 'El Oued' },
      { value: 'khenchela', label: 'Khenchela' },
      { value: 'souk_ahras', label: 'Souk Ahras' },
      { value: 'tipaza', label: 'Tipaza' },
      { value: 'mila', label: 'Mila' },
      { value: 'ain_defla', label: 'Ain Defla' },
      { value: 'naama', label: 'Naama' },
      { value: 'ain_temouchent', label: 'Ain Temouchent' },
      { value: 'ghardaia', label: 'Ghardaia' },
      { value: 'relizane', label: 'Relizane' },
      { value: 'el_m_ghair', label: 'El M\'ghair' },
      { value: 'el_meniaa', label: 'El Meniaa' },
      { value: 'ouled_djellal', label: 'Ouled Djellal' },
      { value: 'bordj_badji_mokhtar', label: 'Bordj Badji Mokhtar' },
      { value: 'béni_abbès', label: 'Béni Abbès' },
      { value: 'timimoun', label: 'Timimoun' },
      { value: 'touggourt', label: 'Touggourt' },
      { value: 'djanet', label: 'Djanet' },
      { value: 'ain_salah', label: 'Ain Salah' },
      { value: 'ain_guezzam', label: 'Ain Guezzam' },
      { value: 'in_salah', label: 'In Salah' }
    ]

    // Load user profile data
    const loadProfile = async () => {
      try {
        if (authStore.user) {
          const userData = authStore.user.user_metadata || {}
          profileForm.fullName = userData.full_name || ''
          profileForm.email = authStore.user.email || ''
          profileForm.dateOfBirth = userData.date_of_birth || ''
          profileForm.wilaya = userData.wilaya || ''
          profileForm.city = userData.city || ''
          profileForm.address = userData.address || ''
          profileForm.language = userData.language || 'en'
          profileForm.newsletter = userData.newsletter || false
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        errorMessage.value = 'Error loading profile data'
      }
    }

    // Update profile
    const handleUpdateProfile = async () => {
      try {
        loading.value = true
        errorMessage.value = ''
        successMessage.value = ''

        const { error } = await authStore.updateProfile({
          full_name: profileForm.fullName,
          date_of_birth: profileForm.dateOfBirth,
          wilaya: profileForm.wilaya,
          city: profileForm.city,
          address: profileForm.address,
          language: profileForm.language,
          newsletter: profileForm.newsletter
        })

        if (error) {
          errorMessage.value = error
        } else {
          successMessage.value = 'Profile updated successfully!'
          // Clear success message after 3 seconds
          setTimeout(() => {
            successMessage.value = ''
          }, 3000)
        }
      } catch (error) {
        console.error('Error updating profile:', error)
        errorMessage.value = 'Error updating profile'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      if (!authStore.isAuthenticated) {
        router.push('/')
        return
      }
      loadProfile()
    })

    return {
      profileForm,
      wilayas,
      loading,
      successMessage,
      errorMessage,
      handleUpdateProfile
    }
  }
}
</script>
