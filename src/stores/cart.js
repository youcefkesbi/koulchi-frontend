import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const deliveryAddress = ref(null)
  const customerInfo = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  
  const subtotal = computed(() => items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0))
  
  const deliveryFee = computed(() => {
    // Algerian delivery fees based on wilaya (province)
    const baseFee = 500 // 500 DZD base delivery fee
    return baseFee
  })
  
  const total = computed(() => subtotal.value + deliveryFee.value)
  
  const hasItems = computed(() => items.value.length > 0)

  // Helper function to map cart item from database
  const mapCartItem = (dbItem, productData) => {
    return {
      id: dbItem.product_id,
      name: productData?.name || 'Unknown Product',
      nameAr: productData?.name_ar || 'منتج غير معروف',
      price: dbItem.price,
      image: productData?.image || '',
      quantity: dbItem.quantity
    }
  }

  // Actions
  const fetchCart = async () => {
    try {
      loading.value = true
      error.value = null
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // If no user, try to load from localStorage for guest users
        const savedCart = localStorage.getItem('guest-cart')
        if (savedCart) {
          items.value = JSON.parse(savedCart)
        }
        return
      }

      // Fetch cart items
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
      
      if (cartError) throw cartError

      if (cartItems && cartItems.length > 0) {
        // Fetch product details for each cart item
        const productIds = cartItems.map(item => item.product_id)
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds)
        
        if (productsError) throw productsError

        // Map cart items with product data
        items.value = cartItems.map(cartItem => {
          const product = products.find(p => p.id === cartItem.product_id)
          return mapCartItem(cartItem, product)
        })
      } else {
        items.value = []
      }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching cart:', err)
      // Fallback to localStorage for guest users
      const savedCart = localStorage.getItem('guest-cart')
      if (savedCart) {
        items.value = JSON.parse(savedCart)
      }
    } finally {
      loading.value = false
    }
  }

  const syncCartToDatabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // For guest users, save to localStorage
        localStorage.setItem('guest-cart', JSON.stringify(items.value))
        return
      }

      // Clear existing cart items for this user
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)

      // Insert new cart items
      if (items.value.length > 0) {
        const cartItems = items.value.map(item => ({
          user_id: user.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))

        const { error: insertError } = await supabase
          .from('cart_items')
          .insert(cartItems)

        if (insertError) throw insertError
      }
    } catch (err) {
      error.value = err.message
      console.error('Error syncing cart to database:', err)
      // Fallback to localStorage
      localStorage.setItem('guest-cart', JSON.stringify(items.value))
    }
  }

  const addToCart = async (product, quantity = 1) => {
    try {
      const existingItem = items.value.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        items.value.push({
          id: product.id,
          name: product.name || product.name_ar,
          nameAr: product.name_ar || product.name,
          price: product.price,
          image: product.image,
          quantity
        })
      }

      await syncCartToDatabase()
    } catch (err) {
      error.value = err.message
      console.error('Error adding to cart:', err)
    }
  }

  const removeFromCart = async (productId) => {
    try {
      items.value = items.value.filter(item => item.id !== productId)
      await syncCartToDatabase()
    } catch (err) {
      error.value = err.message
      console.error('Error removing from cart:', err)
    }
  }

  const updateQuantity = async (productId, quantity) => {
    try {
      const item = items.value.find(item => item.id === productId)
      if (item) {
        if (quantity <= 0) {
          await removeFromCart(productId)
        } else {
          item.quantity = quantity
          await syncCartToDatabase()
        }
      }
    } catch (err) {
      error.value = err.message
      console.error('Error updating quantity:', err)
    }
  }

  const clearCart = async () => {
    try {
      items.value = []
      await syncCartToDatabase()
    } catch (err) {
      error.value = err.message
      console.error('Error clearing cart:', err)
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    items,
    deliveryAddress,
    customerInfo,
    loading,
    error,
    
    // Getters
    totalItems,
    subtotal,
    deliveryFee,
    total,
    hasItems,
    
    // Actions
    fetchCart,
    syncCartToDatabase,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearError
  }
}) 