import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { validateOrderStatus, isValidStatusTransition, sanitizeOrderData, ORDER_STATUSES } from '../utils/orderValidation'

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
    orders.value.filter(order => order.status === ORDER_STATUSES.PENDING)
  )
  
  const confirmedOrders = computed(() => 
    orders.value.filter(order => order.status === ORDER_STATUSES.CONFIRMED)
  )
  
  const shippedOrders = computed(() => 
    orders.value.filter(order => order.status === ORDER_STATUSES.SHIPPED)
  )
  
  const deliveredOrders = computed(() => 
    orders.value.filter(order => order.status === ORDER_STATUSES.DELIVERED)
  )
  
  const canceledOrders = computed(() => 
    orders.value.filter(order => order.status === ORDER_STATUSES.CANCELLED)
  )

  // Actions
  const fetchOrders = async (userId = null) => {
    try {
      loading.value = true
      error.value = null
      
      await initUser()
      if (!currentUser.value) throw new Error('User not authenticated')

      // RLS automatically filters orders by current user
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles(*),
          order_items(
            *,
            product:products(
              *,
              seller:profiles(*)
            )
          )
        `)
        .order('created_at', { ascending: false })
      
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

      // RLS automatically filters orders by current user
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            product:products(
              *,
              seller:profiles(*)
            )
          )
        `)
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

      // RLS automatically filters products by current user as seller
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
      
      if (productsError) throw productsError
      
      if (!products || products.length === 0) {
        orders.value = []
        return
      }

      const productIds = products.map(p => p.id)
      
      // Get orders that contain these products
      // RLS automatically filters order_items by current user's orders
      const { data, error: fetchError } = await supabase
        .from('order_items')
        .select(`
          order:orders(
            *,
            buyer:profiles(*)
          ),
          product:products(
            *,
            seller:profiles(*)
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
      // RLS automatically sets user_id to auth.uid()
      const orderPayload = sanitizeOrderData({
        total_amount: orderData.total_amount,
        status: ORDER_STATUSES.PENDING,
        shipping_address: orderData.shipping_address,
        notes: orderData.notes
      })

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
          buyer:profiles(*),
          order_items(
            *,
            product:products(
              *,
              seller:profiles(*)
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

      // Validate the new status
      validateOrderStatus(newStatus)

      // Verify the user is the seller of this order
      const order = orders.value.find(o => o.id === orderId)
      if (!order) throw new Error('Order not found')
      
      // Check if any of the order items belong to the current user's products
      const isSeller = order.order_items?.some(item => item.product?.seller_id === currentUser.value.id)
      if (!isSeller) throw new Error('Unauthorized to update this order')

      // Validate status transition
      if (!isValidStatusTransition(order.status, newStatus)) {
        throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`)
      }

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
      if (order.status !== ORDER_STATUSES.PENDING) {
        throw new Error('Only pending orders can be canceled')
      }

      const { data, error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: ORDER_STATUSES.CANCELLED,
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
          buyer:profiles(*),
          order_items(
            *,
            product:products(
              *,
              seller:profiles(*)
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

  // Get order status history
  const getOrderStatusHistory = async (orderId) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase.rpc('get_order_status_history', {
        order_uuid: orderId
      })
      
      if (fetchError) throw fetchError
      
      return data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching order status history:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get order with Maystro details
  const getOrderWithMaystroDetails = async (orderId) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('id', orderId)
        .single()
      
      if (fetchError) throw fetchError
      
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching order with Maystro details:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch orders using the get_my_orders function
  const fetchMyOrders = async () => {
    try {
      loading.value = true
      error.value = null
      
      await initUser()
      if (!currentUser.value) throw new Error('User not authenticated')

      const { data, error: fetchError } = await supabase
        .rpc('get_my_orders')
      
      if (fetchError) throw fetchError
      
      orders.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching my orders:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch vendor orders using the get_vendor_orders function
  const fetchVendorOrders = async () => {
    try {
      loading.value = true
      error.value = null
      
      await initUser()
      if (!currentUser.value) throw new Error('User not authenticated')

      const { data, error: fetchError } = await supabase
        .rpc('get_vendor_orders')
      
      if (fetchError) throw fetchError
      
      orders.value = data || []
    } catch (err) {
      error.value = err.message
      console.error('Error fetching vendor orders:', err)
    } finally {
      loading.value = false
    }
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
    fetchMyOrders,
    fetchVendorOrders,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    getOrderById,
    clearOrders,
    getOrderStatusHistory,
    getOrderWithMaystroDetails,
    initUser
  }
})
