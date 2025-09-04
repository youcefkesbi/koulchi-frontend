<template>
  <div class="store-creation-example">
    <h2>Store Creation Example</h2>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Creating your store...</p>
    </div>
    
    <!-- Error State -->
    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="clearError">Dismiss</button>
    </div>
    
    <!-- Success State -->
    <div v-if="successMessage" class="success">
      <p>{{ successMessage }}</p>
    </div>
    
    <!-- Form -->
    <form v-if="!loading && !successMessage" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="storeName">Store Name *</label>
        <input
          id="storeName"
          v-model="formData.name"
          type="text"
          required
          maxlength="100"
          placeholder="Enter your store name"
        />
      </div>
      
      <div class="form-group">
        <label for="storeDescription">Description</label>
        <textarea
          id="storeDescription"
          v-model="formData.description"
          maxlength="500"
          placeholder="Describe your store (optional)"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label for="logoFile">Store Logo</label>
        <input
          id="logoFile"
          type="file"
          accept="image/*"
          @change="handleLogoChange"
        />
        <div v-if="logoPreview" class="preview">
          <img :src="logoPreview" alt="Logo preview" />
        </div>
      </div>
      
      <div class="form-group">
        <label for="bannerFile">Store Banner</label>
        <input
          id="bannerFile"
          type="file"
          accept="image/*"
          @change="handleBannerChange"
        />
        <div v-if="bannerPreview" class="preview">
          <img :src="bannerPreview" alt="Banner preview" />
        </div>
      </div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Creating Store...' : 'Create Store' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStores } from '../composables/useStores'
import { storesAPI, storageAPI } from '../services/api'

const router = useRouter()
const { loading, error, clearError } = useStores()

// Form data
const formData = reactive({
  name: '',
  description: ''
})

// File handling
const logoFile = ref(null)
const bannerFile = ref(null)
const logoPreview = ref('')
const bannerPreview = ref('')

// Success message
const successMessage = ref('')

/**
 * Handle logo file selection
 */
const handleLogoChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    logoFile.value = file
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

/**
 * Handle banner file selection
 */
const handleBannerChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    bannerFile.value = file
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      bannerPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

/**
 * Handle form submission
 * Demonstrates the best practices for store creation
 */
const handleSubmit = async () => {
  try {
    // Clear previous states
    clearError()
    successMessage.value = ''
    
    // Validate form
    if (!formData.name.trim()) {
      throw new Error('Store name is required')
    }
    
    // Prepare store data
    const storeData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null
    }
    
    console.log('Creating store with data:', {
      name: storeData.name,
      description: storeData.description ? 'Present' : 'Null',
      hasLogo: !!logoFile.value,
      hasBanner: !!bannerFile.value
    })
    
    // Method 1: Using the composable (recommended for Vue components)
    const { createStoreWithImages } = useStores()
    const newStore = await createStoreWithImages(
      storeData,
      logoFile.value,
      bannerFile.value
    )
    
    // Method 2: Using the API service directly (alternative approach)
    // let newStore
    // if (logoFile.value || bannerFile.value) {
    //   // Upload images first
    //   const uploadPromises = []
    //   
    //   if (logoFile.value) {
    //     const logoFileName = `logo-${Date.now()}-${logoFile.value.name}`
    //     uploadPromises.push(
    //       storageAPI.uploadFile(logoFile.value, 'stores-logos', logoFileName)
    //     )
    //   } else {
    //     uploadPromises.push(Promise.resolve(null))
    //   }
    //   
    //   if (bannerFile.value) {
    //     const bannerFileName = `banner-${Date.now()}-${bannerFile.value.name}`
    //     uploadPromises.push(
    //       storageAPI.uploadFile(bannerFile.value, 'stores-banners', bannerFileName)
    //     )
    //   } else {
    //     uploadPromises.push(Promise.resolve(null))
    //   }
    //   
    //   const [logoUrl, bannerUrl] = await Promise.all(uploadPromises)
    //   
    //   // Create store with image URLs
    //   newStore = await storesAPI.create({
    //     ...storeData,
    //     logo_url: logoUrl,
    //     banner_url: bannerUrl
    //   })
    // } else {
    //   // Create store without images
    //   newStore = await storesAPI.create(storeData)
    // }
    
    if (!newStore?.id) {
      throw new Error('Store creation failed: No store data returned')
    }
    
    console.log('Store created successfully:', newStore.id)
    
    // Show success message
    successMessage.value = 'Your store has been created successfully!'
    
    // Reset form
    formData.name = ''
    formData.description = ''
    logoFile.value = null
    bannerFile.value = null
    logoPreview.value = ''
    bannerPreview.value = ''
    
    // Redirect to store dashboard after delay
    setTimeout(() => {
      router.push(`/dashboard/store/${newStore.id}`)
    }, 1500)
    
  } catch (err) {
    console.error('Error creating store:', err)
    // Error is automatically handled by the composable/service
  }
}
</script>

<style scoped>
.store-creation-example {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.success {
  background-color: #efe;
  border: 1px solid #cfc;
  color: #3c3;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.preview {
  margin-top: 10px;
}

.preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

button {
  background-color: #3498db;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #2980b9;
}

button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}
</style>
