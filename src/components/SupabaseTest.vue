<template>
  <div class="p-6 bg-white rounded-2xl shadow-soft max-w-4xl mx-auto">
    <h2 class="text-2xl font-bold text-dark mb-4">Supabase Connection Test & Debug</h2>
    
    <!-- Environment Variables Check -->
    <div class="mb-6 p-4 bg-gray-100 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">Environment Variables Check:</h3>
      <div class="space-y-2 text-sm">
        <div class="flex items-center space-x-2">
          <span class="font-medium">VITE_SUPABASE_URL:</span>
          <span :class="supabaseUrl ? 'text-green-600' : 'text-red-600'">
            {{ supabaseUrl ? '✅ Set' : '❌ Missing' }}
          </span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="font-medium">VITE_SUPABASE_ANON_KEY:</span>
          <span :class="supabaseAnonKey ? 'text-green-600' : 'text-red-600'">
            {{ supabaseAnonKey ? '✅ Set' : '❌ Missing' }}
          </span>
        </div>
        <div v-if="supabaseUrl" class="text-xs text-gray-600 break-all">
          URL: {{ supabaseUrl }}
        </div>
        <div v-if="supabaseAnonKey" class="text-xs text-gray-600 break-all">
          Key: {{ supabaseAnonKey.substring(0, 20) }}...
        </div>
      </div>
    </div>

    <!-- Connection Status -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold mb-2">Connection Status:</h3>
      <div class="flex items-center space-x-2">
        <div :class="connectionStatus === 'connected' ? 'w-3 h-3 bg-green-500 rounded-full' : 'w-3 h-3 bg-red-500 rounded-full'"></div>
        <span>{{ connectionStatus === 'connected' ? 'Connected to Supabase' : 'Not connected' }}</span>
      </div>
      <div v-if="connectionError" class="mt-2 text-sm text-red-600">
        Error: {{ connectionError }}
      </div>
    </div>

    <!-- Test Buttons -->
    <div class="space-y-4 mb-6">
      <button @click="testConnection" class="btn-primary w-full">
        Test Supabase Connection
      </button>
      <button @click="testBasicQuery" class="btn-secondary w-full">
        Test Basic Query (SELECT 1)
      </button>
      <button @click="fetchCategories" class="btn-outline w-full">
        Fetch Categories
      </button>
      <button @click="fetchProducts" class="btn-outline w-full">
        Fetch Products
      </button>
      <button @click="testTableAccess" class="btn-outline w-full">
        Test Table Access
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

    <!-- Debug Info -->
    <div v-if="debugInfo" class="mt-6 p-4 bg-blue-100 text-blue-700 rounded text-sm">
      <h4 class="font-semibold mb-2">Debug Information:</h4>
      <pre class="whitespace-pre-wrap">{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabase'

export default {
  name: 'SupabaseTest',
  setup() {
    const connectionStatus = ref('checking')
    const connectionError = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const successMessage = ref('')
    const debugInfo = ref('')
    const categories = ref([])
    const products = ref([])

    // Check environment variables
    const supabaseUrl = computed(() => import.meta.env.VITE_SUPABASE_URL)
    const supabaseAnonKey = computed(() => import.meta.env.VITE_SUPABASE_ANON_KEY)

    const testConnection = async () => {
      loading.value = true
      error.value = null
      successMessage.value = ''
      debugInfo.value = ''
      
      try {
        // Test basic connection
        const { data, error: connError } = await supabase.from('categories').select('count').limit(1)
        
        if (connError) {
          throw connError
        }
        
        connectionStatus.value = 'connected'
        connectionError.value = null
        successMessage.value = 'Successfully connected to Supabase!'
        debugInfo.value = `Connection successful. Data: ${JSON.stringify(data, null, 2)}`
      } catch (err) {
        connectionStatus.value = 'error'
        connectionError.value = err.message
        error.value = err.message
        debugInfo.value = `Connection failed: ${err.message}\nCode: ${err.code}\nDetails: ${err.details}`
        console.error('Connection error:', err)
      } finally {
        loading.value = false
      }
    }

    const testBasicQuery = async () => {
      loading.value = true
      error.value = null
      successMessage.value = ''
      
      try {
        // Test with a simple query
        const { data, error: queryError } = await supabase.rpc('version')
        
        if (queryError) {
          // Try a different approach
          const { data: data2, error: queryError2 } = await supabase
            .from('categories')
            .select('count')
            .limit(1)
            .single()
          
          if (queryError2) throw queryError2
          
          successMessage.value = 'Basic query successful!'
          debugInfo.value = `Basic query worked. Count: ${data2.count}`
        } else {
          successMessage.value = 'RPC query successful!'
          debugInfo.value = `RPC query worked. Data: ${JSON.stringify(data, null, 2)}`
        }
      } catch (err) {
        error.value = err.message
        debugInfo.value = `Basic query failed: ${err.message}`
        console.error('Basic query error:', err)
      } finally {
        loading.value = false
      }
    }

    const testTableAccess = async () => {
      loading.value = true
      error.value = null
      successMessage.value = ''
      
      try {
        // Test table access with different approaches
        const results = {}
        
        // Test 1: Simple count
        try {
          const { count, error: countError } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true })
          
          if (countError) throw countError
          results.categoriesCount = count
        } catch (e) {
          results.categoriesCount = `Error: ${e.message}`
        }

        // Test 2: Check if table exists
        try {
          const { data, error: tableError } = await supabase
            .from('categories')
            .select('id')
            .limit(1)
          
          if (tableError) throw tableError
          results.categoriesAccess = data ? 'Accessible' : 'No data'
        } catch (e) {
          results.categoriesAccess = `Error: ${e.message}`
        }

        successMessage.value = 'Table access test completed!'
        debugInfo.value = `Table access results:\n${JSON.stringify(results, null, 2)}`
      } catch (err) {
        error.value = err.message
        debugInfo.value = `Table access test failed: ${err.message}`
        console.error('Table access test error:', err)
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
        debugInfo.value = `Categories fetched: ${JSON.stringify(data, null, 2)}`
      } catch (err) {
        error.value = err.message
        debugInfo.value = `Categories fetch failed: ${err.message}`
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
        debugInfo.value = `Products fetched: ${JSON.stringify(data, null, 2)}`
      } catch (err) {
        error.value = err.message
        debugInfo.value = `Products fetch failed: ${err.message}`
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
      connectionError,
      loading,
      error,
      successMessage,
      debugInfo,
      categories,
      products,
      supabaseUrl,
      supabaseAnonKey,
      testConnection,
      testBasicQuery,
      testTableAccess,
      fetchCategories,
      fetchProducts
    }
  }
}
</script>
