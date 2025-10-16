<template>
  <div class="min-h-screen bg-white">
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Category Management</h1>
        <p class="mt-2 text-gray-600">Manage all product categories and their details</p>
      </div>

      <!-- Category Management Table -->
      <div class="bg-white rounded-lg shadow-md">
        <!-- Table Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800">All Categories</h2>
            
            <!-- Add Category Button -->
            <button 
              @click="openAddCategoryModal"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <i class="fas fa-plus"></i>
              <span>Add Category</span>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <i class="fas fa-spinner fa-spin text-blue-600 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Loading Categories</h3>
          <p class="text-gray-600">Please wait while we fetch category data...</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="text-center py-12">
          <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-4"></i>
          <h3 class="text-lg font-semibold text-red-800 mb-2">Error Loading Categories</h3>
          <p class="text-red-600">{{ error }}</p>
          <button 
            @click="fetchCategories"
            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
        
        <!-- Categories Table -->
        <div v-else-if="categories.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Icon
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50">
                <!-- Icon -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img 
                        v-if="category.icon_url" 
                        :src="category.icon_url" 
                        :alt="getCategoryName(category)"
                        class="h-10 w-10 rounded-lg object-cover"
                      >
                      <div v-else class="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                        <i class="fas fa-tag text-gray-400"></i>
                      </div>
                    </div>
                  </div>
                </td>
                
                <!-- Name -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ getCategoryName(category) }}
                  </div>
                </td>
                
                <!-- Description -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 max-w-xs truncate" :title="category.description">
                    {{ category.description || 'No description' }}
                  </div>
                </td>
                
                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="{
                          'bg-green-100 text-green-800': category.is_active,
                          'bg-red-100 text-red-800': !category.is_active
                        }">
                    {{ category.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                
                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button 
                      @click="editCategory(category)"
                      class="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                      title="Edit Category"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      @click="deleteCategory(category.id)"
                      class="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                      title="Delete Category"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- No Categories State -->
        <div v-else class="text-center py-12">
          <i class="fas fa-tags text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No Categories Found</h3>
          <p class="text-gray-600">No categories have been created yet.</p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Category Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ editingCategory ? 'Edit Category' : 'Add New Category' }}
          </h3>
        </div>
        
        <form @submit.prevent="saveCategory" class="p-6">
          <!-- Two Column Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-4">
              <!-- English Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">English Name *</label>
                <input
                  v-model="categoryForm.name_en"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter English name"
                >
              </div>
              
              <!-- Arabic Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Arabic Name</label>
                <input
                  v-model="categoryForm.name_ar"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter Arabic name"
                >
              </div>
              
              <!-- French Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">French Name</label>
                <input
                  v-model="categoryForm.name_fr"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter French name"
                >
              </div>
            </div>
            
            <!-- Right Column -->
            <div class="space-y-4">
              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  v-model="categoryForm.description"
                  rows="4"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category description"
                ></textarea>
              </div>
              
              <!-- Icon URL -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
                <input
                  v-model="categoryForm.icon_url"
                  type="url"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter icon URL"
                >
              </div>
              
              <!-- Status -->
              <div>
                <label class="flex items-center">
                  <input
                    v-model="categoryForm.is_active"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                  <span class="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>
              {{ saving ? 'Saving...' : (editingCategory ? 'Update' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'

const { t } = useI18n()
const route = useRoute()

// Reactive data
const categories = ref([])
const loading = ref(false)
const error = ref(null)
const showModal = ref(false)
const editingCategory = ref(null)
const saving = ref(false)

// Category form
const categoryForm = ref({
  name_en: '',
  name_ar: '',
  name_fr: '',
  description: '',
  icon_url: '',
  is_active: true
})

// Get category name based on current locale
const getCategoryName = (category) => {
  const currentLocale = route.meta.locale || 'en'
  
  if (currentLocale === 'ar' && category.name_ar) {
    return category.name_ar
  }
  
  if (currentLocale === 'fr' && category.name_fr) {
    return category.name_fr
  }
  
  // Fall back to English name
  return category.name_en
}

// Methods
const fetchCategories = async () => {
  try {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (fetchError) throw fetchError
    
    categories.value = data || []
  } catch (err) {
    console.error('Error fetching categories:', err)
    error.value = err.message || 'Failed to fetch categories'
  } finally {
    loading.value = false
  }
}

const openAddCategoryModal = () => {
  editingCategory.value = null
  categoryForm.value = {
    name_en: '',
    name_ar: '',
    name_fr: '',
    description: '',
    icon_url: '',
    is_active: true
  }
  showModal.value = true
}

const editCategory = (category) => {
  editingCategory.value = category
  categoryForm.value = {
    name_en: category.name_en || '',
    name_ar: category.name_ar || '',
    name_fr: category.name_fr || '',
    description: category.description || '',
    icon_url: category.icon_url || '',
    is_active: category.is_active
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingCategory.value = null
  categoryForm.value = {
    name_en: '',
    name_ar: '',
    name_fr: '',
    description: '',
    icon_url: '',
    is_active: true
  }
}

const saveCategory = async (retryCount = 0) => {
  try {
    saving.value = true
    error.value = null // Clear any previous errors
    
    // Check if user has admin role before proceeding
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      throw new Error('You must be logged in to perform this action')
    }
    
    // Verify admin role
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
    
    if (roleError) {
      console.error('Error checking user roles:', roleError)
      throw new Error('Unable to verify permissions')
    }
    
    const hasAdminRole = userRoles?.some(ur => ur.role === 'admin')
    if (!hasAdminRole) {
      throw new Error('Admin access required to manage categories')
    }
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - please try again')), 15000) // 15 second timeout
    })
    
    let operationPromise
    
    if (editingCategory.value) {
      // Update existing category - let the trigger handle updated_at
      operationPromise = supabase
        .from('categories')
        .update(categoryForm.value)
        .eq('id', editingCategory.value.id)
        .select()
    } else {
      // Create new category
      operationPromise = supabase
        .from('categories')
        .insert([categoryForm.value])
        .select()
    }
    
    // Race between operation and timeout
    const { data, error: operationError } = await Promise.race([
      operationPromise,
      timeoutPromise
    ])
    
    if (operationError) {
      console.error('Database operation error:', operationError)
      
      // Handle specific error types
      if (operationError.code === 'PGRST301') {
        throw new Error('Permission denied - you may not have admin access')
      } else if (operationError.code === '23505') {
        throw new Error('A category with this name already exists')
      } else if (operationError.code === '23514') {
        throw new Error('Invalid data provided - please check all fields')
      } else if (operationError.code === 'PGRST116') {
        // Retry on connection issues
        if (retryCount < 2) {
          console.log(`Retrying operation (attempt ${retryCount + 1})`)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          return saveCategory(retryCount + 1)
        }
        throw new Error('Connection issue - please try again')
      } else {
        throw new Error(operationError.message || 'Database operation failed')
      }
    }
    
    // Update local state
    if (editingCategory.value) {
      // Update existing category in local state
      const index = categories.value.findIndex(c => c.id === editingCategory.value.id)
      if (index !== -1) {
        categories.value[index] = { ...categories.value[index], ...categoryForm.value }
      }
    } else {
      // Add new category to local state
      if (data && data[0]) {
        categories.value.unshift(data[0])
      }
    }
    
    closeModal()
  } catch (err) {
    console.error('Error saving category:', err)
    error.value = err.message || 'Failed to save category'
    
    // Show user-friendly error message
    alert(`Error: ${err.message}`)
  } finally {
    saving.value = false
  }
}

const deleteCategory = async (categoryId, retryCount = 0) => {
  if (!confirm('Are you sure you want to delete this category?')) {
    return
  }
  
  try {
    // Check if user has admin role before proceeding
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      throw new Error('You must be logged in to perform this action')
    }
    
    // Verify admin role
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
    
    if (roleError) {
      console.error('Error checking user roles:', roleError)
      throw new Error('Unable to verify permissions')
    }
    
    const hasAdminRole = userRoles?.some(ur => ur.role === 'admin')
    if (!hasAdminRole) {
      throw new Error('Admin access required to manage categories')
    }
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout - please try again')), 15000) // 15 second timeout
    })
    
    const deletePromise = supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
    
    // Race between operation and timeout
    const { error: deleteError } = await Promise.race([
      deletePromise,
      timeoutPromise
    ])
    
    if (deleteError) {
      console.error('Delete operation error:', deleteError)
      
      // Handle specific error types
      if (deleteError.code === 'PGRST301') {
        throw new Error('Permission denied - you may not have admin access')
      } else if (deleteError.code === '23503') {
        throw new Error('Cannot delete category - it may be in use by products')
      } else if (deleteError.code === 'PGRST116') {
        // Retry on connection issues
        if (retryCount < 2) {
          console.log(`Retrying delete operation (attempt ${retryCount + 1})`)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          return deleteCategory(categoryId, retryCount + 1)
        }
        throw new Error('Connection issue - please try again')
      } else {
        throw new Error(deleteError.message || 'Failed to delete category')
      }
    }
    
    // Remove from local state
    categories.value = categories.value.filter(c => c.id !== categoryId)
  } catch (err) {
    console.error('Error deleting category:', err)
    error.value = err.message || 'Failed to delete category'
    alert(`Error: ${err.message}`)
  }
}

// Lifecycle
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
/* Custom styles if needed */
</style>