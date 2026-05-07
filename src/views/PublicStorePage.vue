<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="notFound" class="text-center py-16">
        <div class="text-gray-400 text-6xl mb-4">
          <i class="fas fa-store-slash"></i>
        </div>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">Store not found</h2>
        <p class="text-gray-600 mb-6">The store you are looking for does not exist or is unavailable.</p>
        <router-link :to="getLocalizedPath('/stores')" class="px-5 py-2.5 rounded-lg bg-primary text-white">
          Browse stores
        </router-link>
      </div>

      <div v-else-if="errorMessage" class="text-center py-16">
        <div class="text-red-500 text-5xl mb-4"><i class="fas fa-exclamation-triangle"></i></div>
        <p class="text-red-700">{{ errorMessage }}</p>
      </div>

      <div v-else-if="store">
        <header class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div class="flex items-center gap-4">
            <img
              v-if="store.logo_url"
              :src="store.logo_url"
              :alt="store.name"
              class="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ store.name }}</h1>
              <p class="text-gray-600">{{ store.location }}</p>
            </div>
          </div>
          <p v-if="store.description" class="mt-4 text-gray-700">{{ store.description }}</p>
        </header>

        <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Products</h2>
          <div v-if="products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <ProductCard v-for="product in products" :key="product.id" :product="product" />
          </div>
          <p v-else class="text-gray-600">No products available for this store yet.</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import ProductCard from '../components/ProductCard.vue'

const route = useRoute()
const { getLocalizedPath } = useLocaleRouter()

const store = ref(null)
const products = ref([])
const loading = ref(true)
const notFound = ref(false)
const errorMessage = ref('')

const toSlug = (value) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const loadBySlug = async () => {
  loading.value = true
  notFound.value = false
  errorMessage.value = ''
  store.value = null
  products.value = []

  try {
    const slug = String(route.params.slug || '').trim()
    if (!slug) {
      notFound.value = true
      return
    }

    let storeData = null

    // 1) Backward compatibility: old links may pass a store UUID.
    const { data: storeById, error: idLookupError } = await supabase
      .from('stores')
      .select('id, name, description, location, logo_url, banner_url, status')
      .eq('id', slug)
      .eq('status', 'approved')
      .maybeSingle()

    if (idLookupError) throw idLookupError
    if (storeById?.id) {
      storeData = storeById
    } else {
      // 2) Slug route without DB slug column: resolve from store name.
      const { data: allStores, error: storesError } = await supabase
        .from('stores')
        .select('id, name, description, location, logo_url, banner_url, status')
        .eq('status', 'approved')

      if (storesError) throw storesError
      storeData = (allStores || []).find((candidate) => toSlug(candidate.name) === slug) || null
    }

    if (!storeData?.id) {
      notFound.value = true
      return
    }

    store.value = storeData

    const { data: productData, error: productsError } = await supabase
      .from('products')
      .select('*, categories(id, name_en, name_ar, name_fr, description, icon_url, is_active)')
      .eq('store_id', storeData.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (productsError) throw productsError
    products.value = productData || []
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to load store.'
  } finally {
    loading.value = false
  }
}

onMounted(loadBySlug)
watch(() => route.params.slug, loadBySlug)
</script>
