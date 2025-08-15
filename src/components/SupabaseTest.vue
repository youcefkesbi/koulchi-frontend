<template>
  <div class="p-6 bg-white rounded-2xl shadow-soft max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold text-dark mb-4">Supabase Connection Test</h2>
    
    <!-- Connection Status -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">Connection Status:</h3>
      <div class="flex items-center space-x-2">
        <div :class="connectionStatus === 'connected' ? 'w-3 h-3 bg-green-500 rounded-full' : 'w-3 h-3 bg-red-500 rounded-full'"></div>
        <span>{{ connectionStatus === 'connected' ? 'Connected to Supabase' : 'Not connected' }}</span>
      </div>
    </div>

    <!-- Test Buttons -->
    <div class="space-y-4 mb-6">
      <button @click="testConnection" class="btn-primary w-full">
        Test Supabase Connection
      </button>
      <button @click="fetchCategories" class="btn-secondary w-full">
        Fetch Categories
      </button>
      <button @click="fetchProducts" class="btn-outline w-full">
        Fetch Products
      </button>
    </div>

    <!-- Results -->
    <div v-if="loading" class="text-center py-4">
      <i class="fas fa-spinner fa-spin text-2xl text-primary"></i>
      <p class="mt-2">Loading...</p>
    </div>

    <!-- Categories -->
    <div v-if="categories.length > 0" class="mb-6">
      <h3 class="text-lg font-semibold mb-2">Categories ({{ categories.length }}):</h3>
      <div class="grid grid-cols-2 gap-2">
        <div v-for="category in categories" :key="category.id" class="p-2 bg-gray-100 rounded text-sm">
          {{ category.name }} ({{ category.name_ar }})
        </div>
      </div>
    </div>

    <!-- Products -->
    <div v-if="products.length > 0" class="mb-6">
      <h3 class="text-lg font-semibold mb-2">Products ({{ products.length }}):</h3>
      <div class="space-y-2">
        <div v-for="product in products" :key="product.id" class="p-3 bg-gray-100 rounded text-sm">
          <div class="font-semibold">{{ product.name }}</div>
          <div class="text-gray-600">{{ product.name_ar }}</div>
          <div class="text-primary font-bold">{{ product.price }} DZD</div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="p-4 bg-red-100 text-red-700 rounded">
      <strong>Error:</strong> {{ error }}
    </div>

    <!-- Success -->
    <div v-if="successMessage" class="p-4 bg-green-100 text-green-700 rounded">
      {{ successMessage }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

export default {
  name: 'SupabaseTest',
  setup() {
    const connectionStatus = ref('checking')
    const loading = ref(false)
    const error = ref(null)
    const successMessage = ref('')
    const categories = ref([])
    const products = ref([])

    const testConnection = async () => {
      loading.value = true
      error.value = null
      successMessage.value = ''
      
      try {
        // Test basic connection
        const { data, error: connError } = await supabase.from('categories').select('count').limit(1)
        
        if (connError) {
          throw connError
        }
        
        connectionStatus.value = 'connected'
        successMessage.value = 'Successfully connected to Supabase!'
      } catch (err) {
        connectionStatus.value = 'error'
        error.value = err.message
        console.error('Connection error:', err)
      } finally {
        loading.value = false
      }
    }

    const fetchCategories = async () => {
      loading.value = true
      error.value = null
      successMessage.value = ''
      
      try {
        const { data, error: fetchError } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (fetchError) throw fetchError

        categories.value = data || []
        successMessage.value = `Successfully fetched ${categories.value.length} categories!`
      } catch (err) {
        error.value = err.message
        console.error('Error fetching categories:', err)
      } finally {
        loading.value = false
      }
    }

    const fetchProducts = async () => {
      loading.value = true
      error.value = null
      successMessage.value = ''
      
      try {
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*, categories(name, name_ar)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        products.value = data || []
        successMessage.value = `Successfully fetched ${products.value.length} products!`
      } catch (err) {
        error.value = err.message
        console.error('Error fetching products:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      testConnection()
    })

    return {
      connectionStatus,
      loading,
      error,
      successMessage,
      categories,
      products,
      testConnection,
      fetchCategories,
      fetchProducts
    }
  }
}
</script>
