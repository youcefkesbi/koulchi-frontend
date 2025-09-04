# Supabase API Best Practices Implementation

This document outlines the implementation of Supabase best practices for your Vue.js application, including proper JWT handling, session management, and API structure.

## ✅ **Best Practices Implemented**

### 1. **Use Supabase JS Client (Not Manual Fetch)**
- ✅ All API calls use the official Supabase client
- ✅ JWT tokens are automatically attached to requests
- ✅ No manual header management required
- ✅ Automatic CORS handling

### 2. **Handle JWT Expiration Gracefully**
- ✅ Uses `supabase.auth.getSession()` before requests
- ✅ Automatic session refresh when tokens expire
- ✅ Proper error handling for expired sessions
- ✅ Auth state change listener for real-time updates

### 3. **Avoid CORS Issues**
- ✅ Uses official Supabase project URL from environment
- ✅ No hardcoded REST/Storage/Auth paths
- ✅ Relies on Supabase client library for endpoint handling

### 4. **Service Endpoint Correctness**
- ✅ DB operations use `/rest/v1` (handled automatically)
- ✅ Auth operations use `/auth/v1` (handled automatically)
- ✅ Storage operations use `/storage/v1` (handled automatically)
- ✅ No direct endpoint calls bypassing the client

## 📁 **File Structure**

```
src/
├── composables/
│   ├── useAuth.js          # Enhanced authentication composable
│   └── useStores.js        # Store operations composable
├── services/
│   └── api.js              # Centralized API service classes
├── examples/
│   └── StoreCreationExample.vue  # Example implementation
└── lib/
    └── supabase.js         # Supabase client configuration
```

## 🔧 **Usage Examples**

### **1. Using the Composable (Recommended for Vue Components)**

```javascript
// In your Vue component
import { useStores } from '@/composables/useStores'

export default {
  setup() {
    const { 
      createStoreWithImages, 
      loading, 
      error, 
      clearError 
    } = useStores()
    
    const handleCreateStore = async (storeData, logoFile, bannerFile) => {
      try {
        const newStore = await createStoreWithImages(storeData, logoFile, bannerFile)
        console.log('Store created:', newStore.id)
      } catch (err) {
        // Error is automatically handled
        console.error('Store creation failed:', err.message)
      }
    }
    
    return {
      createStoreWithImages,
      loading,
      error,
      clearError,
      handleCreateStore
    }
  }
}
```

### **2. Using the API Service (Alternative Approach)**

```javascript
// In your service or utility functions
import { storesAPI, storageAPI } from '@/services/api'

export const createStoreWithImages = async (storeData, logoFile, bannerFile) => {
  try {
    // Upload images first
    const uploadPromises = []
    
    if (logoFile) {
      const logoFileName = `logo-${Date.now()}-${logoFile.name}`
      uploadPromises.push(
        storageAPI.uploadFile(logoFile, 'stores-logos', logoFileName)
      )
    } else {
      uploadPromises.push(Promise.resolve(null))
    }
    
    if (bannerFile) {
      const bannerFileName = `banner-${Date.now()}-${bannerFile.name}`
      uploadPromises.push(
        storageAPI.uploadFile(bannerFile, 'stores-banners', bannerFileName)
      )
    } else {
      uploadPromises.push(Promise.resolve(null))
    }
    
    const [logoUrl, bannerUrl] = await Promise.all(uploadPromises)
    
    // Create store with image URLs
    const newStore = await storesAPI.create({
      ...storeData,
      logo_url: logoUrl,
      banner_url: bannerUrl
    })
    
    return newStore
  } catch (err) {
    console.error('Store creation failed:', err)
    throw err
  }
}
```

### **3. Authentication Handling**

```javascript
// Using the enhanced auth composable
import { useAuth } from '@/composables/useAuth'

export default {
  setup() {
    const { 
      getCurrentSession, 
      requireAuth, 
      isAuthenticated,
      user 
    } = useAuth()
    
    const performAuthenticatedAction = async () => {
      try {
        // Method 1: Check if authenticated
        if (!isAuthenticated.value) {
          throw new Error('Please log in to continue')
        }
        
        // Method 2: Require authentication (throws if not authenticated)
        const session = await requireAuth()
        console.log('User authenticated:', session.user.email)
        
        // Perform authenticated action
        // ...
      } catch (err) {
        console.error('Authentication error:', err)
        // User will be redirected to login automatically
      }
    }
    
    return {
      performAuthenticatedAction,
      isAuthenticated,
      user
    }
  }
}
```

## 🔐 **Session Management**

### **Automatic Session Refresh**

The implementation automatically handles JWT expiration:

```javascript
// This happens automatically in the background
const validateSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null
  
  // Check if token is expired
  const now = Math.floor(Date.now() / 1000)
  if (session.expires_at && session.expires_at < now) {
    // Automatically refresh the session
    const { data: refreshData } = await supabase.auth.refreshSession()
    return refreshData.session
  }
  
  return session
}
```

### **Auth State Change Listener**

```javascript
// Set up in your main app initialization
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state change:', event, session?.user?.email)
  
  if (session?.user) {
    // User signed in
    console.log('User authenticated:', session.user.email)
  } else {
    // User signed out or session expired
    console.log('User signed out')
  }
})
```

## 🚀 **Migration Guide**

### **From Current Implementation**

1. **Replace direct store calls:**
   ```javascript
   // Old way
   const { createStore } = useStoreStore()
   await createStore(storeData)
   
   // New way
   const { createStore } = useStores()
   await createStore(storeData)
   ```

2. **Update authentication checks:**
   ```javascript
   // Old way
   const { data: { user } } = await supabase.auth.getUser()
   
   // New way
   const session = await validateSession()
   const user = session?.user
   ```

3. **Use centralized error handling:**
   ```javascript
   // Old way
   try {
     await someAPICall()
   } catch (err) {
     if (err.message.includes('not authenticated')) {
       router.push('/login')
     }
   }
   
   // New way
   try {
     await someAPICall()
   } catch (err) {
     // Error handling is automatic
   }
   ```

## 🛡️ **Security Features**

### **1. Automatic JWT Attachment**
- All requests automatically include the JWT token
- No manual header management required
- Tokens are refreshed automatically

### **2. Session Validation**
- Every authenticated request validates the session
- Automatic refresh when tokens expire
- Graceful handling of expired sessions

### **3. Error Handling**
- Consistent error handling across all API calls
- Automatic redirect to login on authentication errors
- User-friendly error messages

### **4. Input Validation**
- Server-side validation for all inputs
- File type and size validation for uploads
- SQL injection protection via Supabase client

## 📊 **Performance Optimizations**

### **1. Parallel Uploads**
```javascript
// Upload multiple files in parallel
const [logoUrl, bannerUrl] = await Promise.all([
  uploadStoreImage(logoFile, 'stores-logos', logoFileName),
  uploadStoreImage(bannerFile, 'stores-banners', bannerFileName)
])
```

### **2. Optimistic Updates**
```javascript
// Update local state immediately
userStores.value.unshift(newStore)
stores.value.unshift(newStore)
```

### **3. Caching**
```javascript
// Supabase client handles caching automatically
// No additional caching layer needed
```

## 🧪 **Testing**

### **Unit Tests**
```javascript
// Test session validation
import { useAuth } from '@/composables/useAuth'

test('should validate session correctly', async () => {
  const { validateSession } = useAuth()
  const session = await validateSession()
  expect(session).toBeDefined()
})
```

### **Integration Tests**
```javascript
// Test store creation
import { storesAPI } from '@/services/api'

test('should create store successfully', async () => {
  const storeData = { name: 'Test Store', description: 'Test Description' }
  const store = await storesAPI.create(storeData)
  expect(store.id).toBeDefined()
})
```

## 🔍 **Debugging**

### **Console Logging**
The implementation includes comprehensive logging:

```javascript
// Session validation
console.log('Valid session found', { 
  userId: session.user.id, 
  email: session.user.email,
  expiresAt: new Date(session.expires_at * 1000).toISOString()
})

// Store creation
console.log('Creating store with data:', { 
  ...storeInsertData, 
  owner_id: '***' // Hide user ID in logs for security
})
```

### **Error Tracking**
```javascript
// Detailed error logging
console.error('Error creating store:', {
  message: err.message,
  code: err.code,
  details: err.details,
  hint: err.hint
})
```

## 📝 **Best Practices Summary**

1. **Always use the Supabase client** - Never make direct fetch calls
2. **Validate sessions before authenticated requests** - Use `getSession()` and handle refresh
3. **Handle errors consistently** - Use centralized error handling
4. **Use composables for Vue components** - Better integration with Vue's reactivity
5. **Use API services for complex logic** - Better separation of concerns
6. **Log authentication status** - Helps with debugging
7. **Validate inputs** - Both client and server-side validation
8. **Handle file uploads properly** - Validate types and sizes
9. **Use parallel operations** - Upload multiple files simultaneously
10. **Test thoroughly** - Unit and integration tests

This implementation ensures your Vue.js application follows all Supabase best practices while maintaining clean, maintainable code.
