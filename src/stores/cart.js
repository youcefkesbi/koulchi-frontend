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
  
  const isProductInCart = (productId) => {
    return items.value.some(item => item.id === productId)
  }

  // Helper function to map cart item from database
  const mapCartItem = (dbItem, productData) => {
    return {
      id: dbItem.product_id,
      name: productData?.name || 'Unknown Product',
      price: productData?.price || 0, // Use product price, not cart item price
      image: productData?.image_urls?.[0] || '',
      quantity: dbItem.quantity,
      seller_id: productData?.seller_id || null
    }
  }

  // Actions
  const fetchCart = async () => {
    try {
      loading.value = true
      error.value = null
      console.log('Fetching cart...')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // If no user, try to load from localStorage for guest users
        const savedCart = localStorage.getItem('guest-cart')
        if (savedCart) {
          items.value = JSON.parse(savedCart)
        }
        return
      }

      // Ensure user has a profile (required for cart operations)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single()
      
      if (profileError || !profile) {
        // Create profile if it doesn't exist
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            role: 'user'
          })
        
        if (createError) {
          console.error('Failed to create profile:', createError)
          // Fallback to localStorage
          const savedCart = localStorage.getItem('guest-cart')
          if (savedCart) {
            items.value = JSON.parse(savedCart)
          }
          return
        }
      }

      // Fetch cart items using the user's profile ID
      const { data: cartItems, error: cartError } = await supabase
        .from('cart')
        .select('*')
        .eq('user_id', user.id)
      
      if (cartError) throw cartError

      if (cartItems && cartItems.length > 0) {
        console.log('Found', cartItems.length, 'cart items')
        
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
        
        console.log('Mapped', items.value.length, 'cart items with product data')
      } else {
        console.log('No cart items found')
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

      // Ensure user has a profile (required for cart operations)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single()
      
      if (profileError || !profile) {
        // Create profile if it doesn't exist
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            role: 'user'
          })
        
        if (createError) {
          console.error('Failed to create profile:', createError)
          // Fallback to localStorage
          localStorage.setItem('guest-cart', JSON.stringify(items.value))
          return
        }
      }

      // Use upsert to handle unique constraint properly
      if (items.value.length > 0) {
        const cartItems = items.value.map(item => ({
          user_id: user.id,
          product_id: item.id,
          quantity: item.quantity
        }))

        // First, clear existing items for this user
        await supabase
          .from('cart')
          .delete()
          .eq('user_id', user.id)

        // Then insert new items
        const { error: insertError } = await supabase
          .from('cart')
          .insert(cartItems)

        if (insertError) throw insertError
      } else {
        // Clear cart if no items
        await supabase
          .from('cart')
          .delete()
          .eq('user_id', user.id)
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
        // Update quantity of existing item
        existingItem.quantity += quantity
        
        // Update the existing item in the database
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { error: updateError } = await supabase
            .from('cart')
            .update({ quantity: existingItem.quantity })
            .eq('user_id', user.id)
            .eq('product_id', product.id)
          
          if (updateError) {
            console.error('Error updating quantity in database:', updateError)
            // Fallback to full sync
            await syncCartToDatabase()
          }
        }
      } else {
        // Add new item to cart
        const newItem = {
          id: product.id,
          name: product.name || product.name_ar,
          nameAr: product.name_ar || product.name,
          price: product.price,
          image: product.image_urls?.[0] || product.image || '',
          quantity,
          seller_id: product.seller_id || null
        }
        
        items.value.push(newItem)
        
        // Add the new item to the database
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { error: insertError } = await supabase
            .from('cart')
            .insert({
              user_id: user.id,
              product_id: product.id,
              quantity
            })
          
          if (insertError) {
            console.error('Error adding item to database:', insertError)
            
            // Handle unique constraint violation
            if (insertError.code === '23505') {
              // Product already exists in cart, update quantity instead
              const { error: updateError } = await supabase
                .from('cart')
                .update({ quantity })
                .eq('user_id', user.id)
                .eq('product_id', product.id)
              
              if (updateError) {
                console.error('Error updating existing cart item:', updateError)
                // Fallback to full sync
                await syncCartToDatabase()
              }
            } else {
              // Other error, fallback to full sync
              await syncCartToDatabase()
            }
          }
        }
      }
    } catch (err) {
      error.value = err.message
      console.error('Error adding to cart:', err)
    }
  }

  const removeFromCart = async (productId) => {
    try {
      items.value = items.value.filter(item => item.id !== productId)
      
      // Remove the specific item from the database
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error: deleteError } = await supabase
          .from('cart')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId)
        
        if (deleteError) {
          console.error('Error removing item from database:', deleteError)
          // Fallback to full sync
          await syncCartToDatabase()
        }
      }
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
          
          // Update the specific item in the database
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { error: updateError } = await supabase
              .from('cart')
              .update({ quantity })
              .eq('user_id', user.id)
              .eq('product_id', productId)
            
            if (updateError) {
              console.error('Error updating quantity in database:', updateError)
              // Fallback to full sync
              await syncCartToDatabase()
            }
          }
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
      
      // Clear cart from database
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error: deleteError } = await supabase
          .from('cart')
          .delete()
          .eq('user_id', user.id)
        
        if (deleteError) {
          console.error('Error clearing cart from database:', deleteError)
          // Fallback to full sync
          await syncCartToDatabase()
        }
      }
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
    isProductInCart,
    
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