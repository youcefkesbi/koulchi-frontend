import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref([])
  const loading = ref(false)
  const error = ref(null)
  const currentUser = ref(null)

  // Initialize current user
  const initUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      currentUser.value = user
    } catch (err) {
      console.error('Error getting user:', err)
    }
  }

  // Getters
  const buyerOrders = computed(() => 
    orders.value.filter(order => order.buyer_id === currentUser.value?.id)
  )
  
  const sellerOrders = computed(() => 
    orders.value.filter(order => order.seller_id === currentUser.value?.id)
  )
  
  const pendingOrders = computed(() => 
    orders.value.filter(order => order.status === 'pending')
  )
  
  const confirmedOrders = computed(() => 
    orders.value.filter(order => order.status === 'confirmed')
  )
  
  const shippedOrders = computed(() => 
    orders.value.filter(order => order.status === 'shipped')
  )
  
  const deliveredOrders = computed(() => 
    orders.value.filter(order => order.status === 'delivered')
  )
  
  const canceledOrders = computed(() => 
    orders.value.filter(order => order.status === 'canceled')
  )

  // Actions
  const fetchOrders = async (userId = null) => {
    try {
      loading.value = true
      error.value = null
      
      await initUser()
      if (!currentUser.value) throw new Error('User not authenticated')

      let query = supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles!orders_buyer_id_fkey(*),
          seller:profiles!orders_seller_id_fkey(*),
          product:products(*)
        `)
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('buyer_id', userId)
      }

      const { data, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      
      orders.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching orders:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchBuyerOrders = async () => {
    try {
      loading.value = true
      error.value = null
      
      await initUser()
      if (!currentUser.value) throw new Error('User not authenticated')

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          seller:profiles!orders_seller_id_fkey(*),
          product:products(*)
        `)
        .eq('buyer_id', currentUser.value.id)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      orders.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching buyer orders:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchSellerOrders = async () => {
    try {
      loading.value = true
      error.value = null
      
      await initUser()
      if (!currentUser.value) throw new Error('User not authenticated')

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles!orders_buyer_id_fkey(*),
          product:products(*)
        `)
        .eq('seller_id', currentUser.value.id)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      orders.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching seller orders:', err)
    } finally {
      loading.value = false
    }
  }

  const createOrder = async (orderData) => {
    try {
      loading.value = true
      error.value = null
      
      await initUser()
      if (!currentUser.value) throw new Error('User not authenticated')

      // Prepare order data according to database schema
      const orderPayload = {
        buyer_id: currentUser.value.id,
        seller_id: orderData.seller_id,
        product_id: orderData.product_id,
        quantity: orderData.quantity,
        total_price: orderData.total_price,
        status: 'pending',
        shipping_address: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_postal_code: orderData.shipping_postal_code,
        notes: orderData.notes
      }

      const { data, error: createError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select()
      
      if (createError) throw createError
      
      // Add the new order to the local state
      orders.value.unshift(data[0])
      
      return data[0]
    } catch (err) {
      error.value = err.message
      console.error('Error creating order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      loading.value = true
      error.value = null
      
      await initUser()
      if (!currentUser.value) throw new Error('User not authenticated')

      // Verify the user is the seller of this order
      const order = orders.value.find(o => o.id === orderId)
      if (!order) throw new Error('Order not found')
      if (order.seller_id !== currentUser.value.id) throw new Error('Unauthorized to update this order')

      const { data, error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
      
      if (updateError) throw updateError
      
      // Update the order in local state
      const orderIndex = orders.value.findIndex(o => o.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex] = data[0]
      }
      
      return data[0]
    } catch (err) {
      error.value = err.message
      console.error('Error updating order status:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const cancelOrder = async (orderId) => {
    try {
      loading.value = true
      error.value = null
      
      await initUser()
      if (!currentUser.value) throw new Error('User not authenticated')

      // Verify the user is the buyer of this order
      const order = orders.value.find(o => o.id === orderId)
      if (!order) throw new Error('Order not found')
      if (order.buyer_id !== currentUser.value.id) throw new Error('Unauthorized to cancel this order')

      // Only allow cancellation of pending orders
      if (order.status !== 'pending') {
        throw new Error('Only pending orders can be canceled')
      }

      const { data, error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
      
      if (updateError) throw updateError
      
      // Update the order in local state
      const orderIndex = orders.value.findIndex(o => o.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex] = data[0]
      }
      
      return data[0]
    } catch (err) {
      error.value = err.message
      console.error('Error canceling order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getOrderById = async (orderId) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles!orders_buyer_id_fkey(*),
          seller:profiles!orders_seller_id_fkey(*),
          product:products(*)
        `)
        .eq('id', orderId)
        .single()
      
      if (fetchError) throw fetchError
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearOrders = () => {
    orders.value = []
    error.value = null
  }

  return {
    // State
    orders,
    loading,
    error,
    currentUser,
    
    // Getters
    buyerOrders,
    sellerOrders,
    pendingOrders,
    confirmedOrders,
    shippedOrders,
    deliveredOrders,
    canceledOrders,
    
    // Actions
    fetchOrders,
    fetchBuyerOrders,
    fetchSellerOrders,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    getOrderById,
    clearOrders,
    initUser
  }
})
