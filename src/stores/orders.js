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
    orders.value.filter(order => order.user_id === currentUser.value?.id)
  )
  
  const sellerOrders = computed(() => 
    orders.value.filter(order => {
      // Seller orders are derived from products in order_items
      return order.order_items?.some(item => item.product?.seller_id === currentUser.value?.id)
    })
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
          buyer:profiles!orders_user_id_fkey(*),
          order_items(
            *,
            product:products(
              *,
              seller:profiles!products_seller_id_fkey(*)
            )
          )
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
          order_items(
            *,
            product:products(
              *,
              seller:profiles!products_seller_id_fkey(*)
            )
          )
        `)
        .eq('user_id', currentUser.value.id)
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

      // First get all products where current user is the seller
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('seller_id', currentUser.value.id)
      
      if (productsError) throw productsError
      
      if (!products || products.length === 0) {
        orders.value = []
        return
      }

      const productIds = products.map(p => p.id)
      
      // Get orders that contain these products
      const { data, error: fetchError } = await supabase
        .from('order_items')
        .select(`
          order:orders(
            *,
            buyer:profiles!orders_user_id_fkey(*)
          ),
          product:products(
            *,
            seller:profiles!products_seller_id_fkey(*)
          )
        `)
        .in('product_id', productIds)
        .order('created_at', { ascending: false })
      
      if (fetchError) throw fetchError
      
      // Transform the data to match the expected format
      const transformedOrders = data.map(item => ({
        ...item.order,
        order_items: [item]
      }))
      
      orders.value = transformedOrders || []
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

      // Create the order first
      const orderPayload = {
        user_id: currentUser.value.id,
        total_amount: orderData.total_amount,
        status: 'pending',
        shipping_address: orderData.shipping_address,
        notes: orderData.notes
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select()
        .single()
      
      if (orderError) throw orderError

      // Create order items for each product
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant || null
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
      
      if (itemsError) throw itemsError

      // Fetch the complete order with items
      const { data: completeOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles!orders_user_id_fkey(*),
          order_items(
            *,
            product:products(
              *,
              seller:profiles!products_seller_id_fkey(*)
            )
          )
        `)
        .eq('id', order.id)
        .single()
      
      if (fetchError) throw fetchError
      
      // Add the new order to the local state
      orders.value.unshift(completeOrder)
      
      return completeOrder
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
      
      // Check if any of the order items belong to the current user's products
      const isSeller = order.order_items?.some(item => item.product?.seller_id === currentUser.value.id)
      if (!isSeller) throw new Error('Unauthorized to update this order')

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
      if (order.user_id !== currentUser.value.id) throw new Error('Unauthorized to cancel this order')

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
          buyer:profiles!orders_user_id_fkey(*),
          order_items(
            *,
            product:products(
              *,
              seller:profiles!products_seller_id_fkey(*)
            )
          )
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
