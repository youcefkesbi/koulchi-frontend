<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-dark mb-2">{{ $t('stores.notifications.title') }}</h1>
        <p class="text-gray-600">{{ $t('stores.notifications.subtitle') }}</p>
      </div>

      <!-- Tabs (only show if user has admin role) -->
      <div v-if="hasAdminRole" class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8" aria-label="Tabs">
            <button
              @click="activeTab = 'vendor'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'vendor'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <i class="fas fa-store mr-2"></i>
              {{ $t('stores.notifications.myStore') }}
            </button>
            <button
              @click="activeTab = 'admin'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'admin'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <i class="fas fa-shield-alt mr-2"></i>
              {{ $t('stores.notifications.admin') }}
              <span v-if="adminUnreadCount > 0" class="ml-2 bg-accent text-white text-xs rounded-full px-2 py-0.5">
                {{ adminUnreadCount > 99 ? '99+' : adminUnreadCount }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Actions Bar -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">
            {{ $t('stores.notifications.total') }}: 
            <span class="font-semibold">{{ filteredNotifications.length }}</span>
          </span>
          <span v-if="unreadCount > 0" class="text-sm text-gray-600">
            {{ $t('stores.notifications.unread') }}: 
            <span class="font-semibold text-primary">{{ unreadCount }}</span>
          </span>
        </div>
        <div class="flex gap-2">
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            :disabled="loading"
            class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-check-double mr-2"></i>
            {{ $t('stores.notifications.markAllRead') }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-600">{{ $t('stores.notifications.loading') }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredNotifications.length === 0" class="bg-white rounded-2xl shadow-soft p-12 text-center">
        <i class="fas fa-bell-slash text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">
          {{ $t('stores.notifications.emptyTitle') }}
        </h3>
        <p class="text-gray-500">
          {{ $t('stores.notifications.emptyMessage') }}
        </p>
      </div>

      <!-- Notifications List -->
      <div v-else class="space-y-4">
        <!-- Group by Date -->
        <div v-for="(group, dateKey) in groupedNotifications" :key="dateKey" class="mb-8">
          <!-- Date Header -->
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-gray-700">{{ formatDateGroup(dateKey) }}</h2>
          </div>

          <!-- Notifications in this group -->
          <div class="space-y-3">
            <div
              v-for="notification in group"
              :key="notification.id"
              @click="handleNotificationClick(notification)"
              :class="[
                'bg-white rounded-xl shadow-soft p-4 cursor-pointer transition-all duration-200 hover:shadow-md',
                !notification.is_read ? 'border-l-4 border-primary' : 'border-l-4 border-transparent'
              ]"
            >
              <div class="flex items-start gap-4">
                <!-- Notification Icon -->
                <div class="flex-shrink-0 mt-1">
                  <div
                    :class="[
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      getNotificationIconClass(notification.type)
                    ]"
                  >
                    <i :class="getNotificationIcon(notification.type)" class="text-lg"></i>
                  </div>
                </div>

                <!-- Notification Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <p
                        :class="[
                          'text-base mb-1',
                          !notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'
                        ]"
                      >
                        {{ getNotificationMessage(notification) }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ formatRelativeTime(notification.created_at) }}
                      </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <!-- Unread Indicator -->
                      <div
                        v-if="!notification.is_read"
                        class="w-2 h-2 bg-primary rounded-full"
                        :title="$t('stores.notifications.unread')"
                      ></div>

                      <!-- Mark as Read Button -->
                      <button
                        v-if="!notification.is_read"
                        @click.stop="markAsRead(notification.id)"
                        class="p-2 text-gray-400 hover:text-primary transition-colors"
                        :title="$t('stores.notifications.markRead')"
                      >
                        <i class="fas fa-check text-sm"></i>
                      </button>

                      <!-- Delete Button -->
                      <button
                        @click.stop="deleteNotification(notification.id)"
                        class="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        :title="$t('stores.notifications.delete')"
                      >
                        <i class="fas fa-trash text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useNotificationStore } from '../stores/useNotificationStore'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase } from '../lib/supabase'

const { t } = useI18n()
const router = useRouter()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

// State
const activeTab = ref('vendor') // 'vendor' or 'admin'
const loading = ref(false)
const hasAdminRole = ref(false)
const hasVendorRole = ref(false)

// Check user roles
const checkUserRoles = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) {
      hasAdminRole.value = false
      hasVendorRole.value = false
      return
    }

    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Error fetching user roles:', error)
      return
    }

    const roleList = roles?.map(r => r.role?.toLowerCase()) || []
    hasAdminRole.value = roleList.includes('admin')
    hasVendorRole.value = roleList.includes('vendor')

    // Set default tab based on roles
    if (hasAdminRole.value && hasVendorRole.value) {
      activeTab.value = 'vendor' // Default to vendor tab if both roles
    } else if (hasAdminRole.value) {
      activeTab.value = 'admin'
    }
  } catch (err) {
    console.error('Error checking user roles:', err)
  }
}

// Computed properties
const allNotifications = computed(() => notificationStore.notifications)

const filteredNotifications = computed(() => {
  if (!hasAdminRole.value) {
    // Vendor only - show vendor notifications (target_role = 'vendor' or null)
    return allNotifications.value.filter(n => 
      n.target_role === 'vendor' || n.target_role === null
    )
  } else {
    // Admin with or without vendor role - filter by active tab and target_role
    if (activeTab.value === 'admin') {
      // Admin tab - show admin notifications
      return allNotifications.value.filter(n => 
        n.target_role === 'admin' || n.target_role === null
      )
    } else {
      // Vendor tab - show vendor notifications
      return allNotifications.value.filter(n => 
        n.target_role === 'vendor' || n.target_role === null
      )
    }
  }
})

const unreadCount = computed(() => {
  return filteredNotifications.value.filter(n => !n.is_read).length
})

const adminUnreadCount = computed(() => {
  if (!hasAdminRole.value) return 0
  return allNotifications.value
    .filter(n => (n.target_role === 'admin' || n.target_role === null) && !n.is_read)
    .length
})

const groupedNotifications = computed(() => {
  const groups = {}
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const thisWeek = new Date(today)
  thisWeek.setDate(thisWeek.getDate() - 7)

  filteredNotifications.value.forEach(notification => {
    const notificationDate = new Date(notification.created_at)
    let groupKey

    if (notificationDate >= today) {
      groupKey = 'today'
    } else if (notificationDate >= yesterday) {
      groupKey = 'yesterday'
    } else if (notificationDate >= thisWeek) {
      groupKey = 'thisWeek'
    } else {
      groupKey = 'older'
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(notification)
  })

  return groups
})

// Methods
const formatDateGroup = (key) => {
  const groups = {
    today: t('stores.notifications.today'),
    yesterday: t('stores.notifications.yesterday'),
    thisWeek: t('stores.notifications.thisWeek'),
    older: t('stores.notifications.older')
  }
  return groups[key] || key
}

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) {
    return t('stores.notifications.justNow')
  } else if (diffMins < 60) {
    return `${diffMins} ${t('stores.notifications.minutesAgo')}`
  } else if (diffHours < 24) {
    return `${diffHours} ${t('stores.notifications.hoursAgo')}`
  } else if (diffDays < 7) {
    return `${diffDays} ${t('stores.notifications.daysAgo')}`
  } else {
    return date.toLocaleDateString()
  }
}

const getNotificationIcon = (type) => {
  const iconMap = {
    // Vendor icons
    store_status: 'fas fa-store',
    store_approved: 'fas fa-check-circle',
    store_rejected: 'fas fa-times-circle',
    store_created: 'fas fa-store',
    order: 'fas fa-shopping-bag',
    order_placed: 'fas fa-shopping-cart',
    order_cancelled: 'fas fa-ban',
    product_review: 'fas fa-star',
    subscription_expiring: 'fas fa-clock',
    subscription_expired: 'fas fa-exclamation-triangle',
    store_update: 'fas fa-edit',
    // Admin icons
    store_approval: 'fas fa-clipboard-check',
    store_approval_request: 'fas fa-bell',
    new_store_created: 'fas fa-store',
    user_report: 'fas fa-flag',
    system_alert: 'fas fa-exclamation-circle',
    new_vendor_registration: 'fas fa-user-plus',
    store_review_needed: 'fas fa-eye',
    admin_task: 'fas fa-tasks'
  }
  return iconMap[type] || 'fas fa-bell'
}

const getNotificationIconClass = (type) => {
  const classMap = {
    // Vendor classes
    store_status: 'bg-blue-100 text-blue-600',
    store_approved: 'bg-green-100 text-green-600',
    store_rejected: 'bg-red-100 text-red-600',
    store_created: 'bg-blue-100 text-blue-600',
    order: 'bg-purple-100 text-purple-600',
    order_placed: 'bg-purple-100 text-purple-600',
    order_cancelled: 'bg-red-100 text-red-600',
    product_review: 'bg-yellow-100 text-yellow-600',
    subscription_expiring: 'bg-orange-100 text-orange-600',
    subscription_expired: 'bg-red-100 text-red-600',
    store_update: 'bg-blue-100 text-blue-600',
    // Admin classes
    store_approval: 'bg-indigo-100 text-indigo-600',
    store_approval_request: 'bg-blue-100 text-blue-600',
    new_store_created: 'bg-green-100 text-green-600',
    user_report: 'bg-red-100 text-red-600',
    system_alert: 'bg-yellow-100 text-yellow-600',
    new_vendor_registration: 'bg-green-100 text-green-600',
    store_review_needed: 'bg-purple-100 text-purple-600',
    admin_task: 'bg-gray-100 text-gray-600'
  }
  return classMap[type] || 'bg-gray-100 text-gray-600'
}

// Get notification message using template_key and metadata
const getNotificationMessage = (notification) => {
  // If template_key exists, use i18n translation with metadata
  if (notification.template_key) {
    try {
      return t(notification.template_key, notification.metadata || {})
    } catch (err) {
      console.warn('Translation not found for:', notification.template_key)
      // Fallback: use metadata message if available
      if (notification.metadata?.message) {
        return notification.metadata.message
      }
      // Fallback: use template_key as message
      return notification.template_key
    }
  }
  
  // Fallback to old message field if it exists (for backward compatibility)
  if (notification.message) {
    return notification.message
  }
  
  // Final fallback
  return t('stores.notifications.defaultMessage') || 'New notification'
}

const handleNotificationClick = async (notification) => {
  // Mark as read if unread
  if (!notification.is_read) {
    await markAsRead(notification.id)
  }

  // Navigate to link if provided
  if (notification.link) {
    router.push(notification.link)
  }
}

const markAsRead = async (notificationId) => {
  try {
    await notificationStore.markAsRead(notificationId)
  } catch (err) {
    console.error('Error marking notification as read:', err)
  }
}

const markAllAsRead = async () => {
  try {
    loading.value = true
    const unreadNotifications = filteredNotifications.value.filter(n => !n.is_read)
    for (const notification of unreadNotifications) {
      await notificationStore.markAsRead(notification.id)
    }
  } catch (err) {
    console.error('Error marking all notifications as read:', err)
  } finally {
    loading.value = false
  }
}

const deleteNotification = async (notificationId) => {
  if (!confirm(t('stores.notifications.confirmDelete'))) {
    return
  }

  try {
    await notificationStore.deleteNotification(notificationId)
  } catch (err) {
    console.error('Error deleting notification:', err)
  }
}

// Watch for tab changes to refresh if needed
watch(activeTab, () => {
  // Tab change handled by computed property
})

// Lifecycle
onMounted(async () => {
  await checkUserRoles()
  
  if (authStore.isAuthenticated) {
    loading.value = true
    try {
      await notificationStore.fetchNotifications({ limit: 100 })
      notificationStore.subscribeToNotifications()
    } catch (err) {
      console.error('Error loading notifications:', err)
    } finally {
      loading.value = false
    }
  }
})

onUnmounted(() => {
  notificationStore.unsubscribeFromNotifications()
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
