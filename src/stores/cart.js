import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase'

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
      if (!user) return

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
    } finally {
      loading.value = false
    }
  }

  const syncCartToDatabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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
      console.error('Error syncing cart to database:', err)
    }
  }

  const addToCart = async (product) => {
    const existingItem = items.value.find(item => item.id === product.id)
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        nameAr: product.nameAr,
        price: product.price,
        image: product.image,
        quantity: 1
      })
    }

    // Sync to database
    await syncCartToDatabase()
  }

  const removeFromCart = async (productId) => {
    const index = items.value.findIndex(item => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }

    // Sync to database
    await syncCartToDatabase()
  }

  const updateQuantity = async (productId, quantity) => {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        await removeFromCart(productId)
      } else {
        item.quantity = quantity
        // Sync to database
        await syncCartToDatabase()
      }
    }
  }

  const clearCart = async () => {
    items.value = []
    deliveryAddress.value = null
    customerInfo.value = null

    // Clear from database
    await syncCartToDatabase()
  }

  const setDeliveryAddress = (address) => {
    deliveryAddress.value = address
  }

  const setCustomerInfo = (info) => {
    customerInfo.value = info
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
    setDeliveryAddress,
    setCustomerInfo,
    clearError
  }
}) 