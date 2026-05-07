<template>
  <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
    <div v-if="loading" class="text-center py-10">
      <i class="fas fa-spinner fa-spin text-primary text-2xl"></i>
      <p class="text-gray-600 mt-3">{{ $t('common.loading') }}</p>
    </div>

    <div v-else-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
      {{ errorMessage }}
    </div>

    <form v-else @submit.prevent="saveSettings" class="space-y-5 max-w-3xl">
      <h2 class="text-xl font-semibold text-gray-900">{{ $t('profile.settings') }}</h2>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('stores.storeName') }}</label>
        <input
          v-model="form.name"
          type="text"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('stores.location') }}</label>
        <input
          v-model="form.location"
          type="text"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('stores.storeDescription') }}</label>
        <textarea
          v-model="form.description"
          rows="4"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div class="flex items-center gap-3">
        <button
          type="submit"
          :disabled="saving"
          class="px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>
          {{ saving ? ($t('common.saving') || 'Saving...') : ($t('stores.saveChanges') || 'Save Changes') }}
        </button>
        <span v-if="successMessage" class="text-green-700 text-sm">{{ successMessage }}</span>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

const loading = ref(true)
const saving = ref(false)
const storeId = ref(null)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  name: '',
  location: '',
  description: ''
})

const loadOwnerStore = async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session?.user?.id) {
    throw new Error('Authentication required')
  }

  const { data: store, error } = await supabase
    .from('stores')
    .select('id, name, location, description, owner_id')
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!store?.id) throw new Error('No store found for this account')

  storeId.value = store.id
  form.name = store.name || ''
  form.location = store.location || ''
  form.description = store.description || ''
}

const saveSettings = async () => {
  if (!storeId.value) return
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const updates = {
      name: form.name?.trim() || null,
      location: form.location?.trim() || null,
      description: form.description?.trim() || null
    }

    const { error } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', storeId.value)

    if (error) throw error
    successMessage.value = 'Store settings updated successfully.'
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to update store settings.'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    await loadOwnerStore()
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to load store settings.'
  } finally {
    loading.value = false
  }
})
</script>
