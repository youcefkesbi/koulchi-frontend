import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'

export const useNotificationStore = defineStore('notifications', () => {
  // State
  const notifications = ref([])
  const loading = ref(false)
  const error = ref(null)
  const subscription = ref(null)

  // Getters
  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.is_read).length
  )

  const hasUnread = computed(() => unreadCount.value > 0)

  /**
   * Validates active Supabase session
   * @returns {Promise<Object>} Authenticated user object
   * @throws {Error} If session is invalid or expired
   */
  const validateActiveSession = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      throw new Error('Authentication session error. Please log in again.')
    }

    if (!session || !session.user) {
      throw new Error('Please log in to view notifications')
    }

    // Verify session is not expired
    const now = Math.floor(Date.now() / 1000)
    if (session.expires_at && session.expires_at < now) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError || !refreshData.session) {
        throw new Error('Your session has expired. Please log in again.')
      }
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Please log in to view notifications')
    }

    return user
  }

  // Actions
  /**
   * Fetches notifications for the authenticated user
   * @param {Object} options - Fetch options
   * @param {number} options.limit - Maximum number of notifications to fetch
   * @param {boolean} options.onlyUnread - Fetch only unread notifications
   * @returns {Promise<void>}
   */
  const fetchNotifications = async (options = {}) => {
    try {
      loading.value = true
      error.value = null

      const user = await validateActiveSession()

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (options.onlyUnread) {
        query = query.eq('is_read', false)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      notifications.value = data || []
    } catch (err) {
      console.error('Error fetching notifications:', err)
      error.value = err.message || 'Failed to fetch notifications'
      notifications.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Marks a notification as read
   * @param {string} notificationId - ID of the notification to mark as read
   * @returns {Promise<void>}
   */
  const markAsRead = async (notificationId) => {
    try {
      await validateActiveSession()

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      if (updateError) {
        throw updateError
      }

      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification) {
        notification.is_read = true
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
      error.value = err.message || 'Failed to mark notification as read'
      throw err
    }
  }

  /**
   * Marks all notifications as read for the current user
   * @returns {Promise<void>}
   */
  const markAllAsRead = async () => {
    try {
      await validateActiveSession()

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false)

      if (updateError) {
        throw updateError
      }

      // Update local state
      notifications.value.forEach(n => {
        n.is_read = true
      })
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      error.value = err.message || 'Failed to mark all notifications as read'
      throw err
    }
  }

  /**
   * Deletes a notification
   * @param {string} notificationId - ID of the notification to delete
   * @returns {Promise<void>}
   */
  const deleteNotification = async (notificationId) => {
    try {
      await validateActiveSession()

      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (deleteError) {
        throw deleteError
      }

      // Update local state
      notifications.value = notifications.value.filter(n => n.id !== notificationId)
    } catch (err) {
      console.error('Error deleting notification:', err)
      error.value = err.message || 'Failed to delete notification'
      throw err
    }
  }

  /**
   * Subscribes to real-time notification changes
   * @returns {Function} Unsubscribe function
   */
  const subscribeToNotifications = () => {
    // Unsubscribe from previous subscription if exists
    if (subscription.value) {
      subscription.value.unsubscribe()
      subscription.value = null
    }

    validateActiveSession()
      .then((user) => {
        // Use a unique channel name per user to avoid conflicts
        const channelName = `notifications_changes_${user.id}_${Date.now()}`
        
        try {
          subscription.value = supabase
            .channel(channelName)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
              },
              (payload) => {
                console.log('📬 Notification change received:', payload)

                // RLS ensures we only receive notifications for the current user
                // But double-check to be safe
                if (payload.new && payload.new.user_id !== user.id) {
                  console.warn('⚠️ Received notification for different user, ignoring')
                  return
                }

                if (payload.eventType === 'INSERT') {
                  // Add new notification at the beginning
                  notifications.value.unshift(payload.new)
                } else if (payload.eventType === 'UPDATE') {
                  // Update existing notification
                  const index = notifications.value.findIndex(n => n.id === payload.new.id)
                  if (index !== -1) {
                    notifications.value[index] = payload.new
                  } else {
                    // If not in list, add it (might be a new notification)
                    notifications.value.unshift(payload.new)
                  }
                } else if (payload.eventType === 'DELETE') {
                  // Remove deleted notification
                  notifications.value = notifications.value.filter(n => n.id !== payload.old.id)
                }
              }
            )
            .subscribe((status, err) => {
              if (status === 'SUBSCRIBED') {
                console.log('✅ Subscribed to notification changes')
                error.value = null
              } else if (status === 'CHANNEL_ERROR') {
                // Handle mismatch error gracefully - disable subscription if Realtime is misconfigured
                if (err?.message?.includes('mismatch')) {
                  console.warn('⚠️ Realtime subscription error (mismatch). Realtime may need to be refreshed in Supabase dashboard.')
                  console.warn('⚠️ Notifications will still work, but real-time updates are disabled.')
                  error.value = null // Don't show error to user, just disable real-time
                  subscription.value = null
                } else {
                  console.error('❌ Error subscribing to notification changes:', err)
                  error.value = err?.message || 'Failed to subscribe to notifications'
                }
              } else if (status === 'TIMED_OUT') {
                console.error('❌ Subscription timed out')
                error.value = 'Subscription timed out'
              } else if (status === 'CLOSED') {
                console.log('📴 Notification subscription closed')
              }
            })
        } catch (subscribeError) {
          console.error('❌ Error creating subscription:', subscribeError)
          error.value = subscribeError?.message || 'Failed to create subscription'
        }
      })
      .catch((err) => {
        console.error('❌ Error setting up notification subscription:', err)
        error.value = err?.message || 'Failed to set up notification subscription'
      })

    // Return unsubscribe function
    return () => {
      if (subscription.value) {
        subscription.value.unsubscribe()
        subscription.value = null
      }
    }
  }

  /**
   * Unsubscribes from notification changes
   */
  const unsubscribeFromNotifications = () => {
    if (subscription.value) {
      subscription.value.unsubscribe()
      subscription.value = null
    }
  }

  /**
   * Clears error state
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Clears all notifications from store
   */
  const clearNotifications = () => {
    notifications.value = []
  }

  return {
    // State
    notifications,
    loading,
    error,

    // Getters
    unreadCount,
    hasUnread,

    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    clearError,
    clearNotifications
  }
})


