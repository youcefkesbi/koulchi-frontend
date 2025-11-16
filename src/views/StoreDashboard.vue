<template>
  <div class="min-h-screen bg-white overflow-hidden">
  <div 
  :class="packInfo.is_pro ? 'grid grid-cols-[1fr_1fr]' : 'block w-full'"
    >
    <!-- Dashboard stats -->
    <div :class="packInfo.is_pro ? 'grid grid-cols-2 gap-6 w-140 max-w-4xl h-60 p-6' : 'flex gap-4 w-full h-40 p-6'">
      <!-- Loading State for Statistics -->
        <div v-if="statsLoading" :class="packInfo.is_pro ? 'col-span-2 text-center py-8' : 'w-full text-center py-8'">
        <i class="fas fa-spinner fa-spin text-blue-600 text-2xl mb-2"></i>
        <p class="text-gray-600">{{ t('dashboard.stats.loadingStats') }}</p>
      </div>

      <!-- Statistics Cards -->
      <template v-else class="h-60">
        <!-- Total Orders Card -->
        <div :class="packInfo.is_pro ? 'bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500' : 'bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 flex-1'">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ t('dashboard.stats.totalOrders') }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ storeStatistics.totalOrders }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <i class="fas fa-shopping-cart text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Total Products Card -->
        <div :class="packInfo.is_pro ? 'bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500' : 'bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 flex-1'">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ t('dashboard.stats.totalProducts') }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ storeStatistics.totalProducts }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <i class="fas fa-box text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Total Sales Card -->
        <div :class="packInfo.is_pro ? 'bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500' : 'bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 flex-1'">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ t('dashboard.stats.totalSales') }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ formatCurrency(storeStatistics.totalSales) }}</p>
            </div>
            <div class="p-3 bg-yellow-100 rounded-full">
              <i class="fas fa-coins text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Total Visitors Card -->
        <div :class="packInfo.is_pro ? 'bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500' : 'bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 flex-1'">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">{{ t('dashboard.stats.totalVisitors') }}</p>
              <p class="text-3xl font-bold text-gray-900">{{ storeStatistics.totalVisitors }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <i class="fas fa-users text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- No Store Message -->
        <div v-if="!storeStatistics.storeId && !statsLoading" :class="packInfo.is_pro ? 'col-span-2 text-center py-8' : 'w-full text-center py-8'">
          <div class="bg-gray-50 rounded-lg p-6">
            <i class="fas fa-store text-gray-400 text-4xl mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('dashboard.stats.noStoreFound') }}</h3>
            <p class="text-gray-600 mb-4">{{ t('dashboard.stats.noStoreMessage') }}</p>
            <router-link 
              to="/create-store" 
              class="btn-primary inline-block"
            >
              {{ t('dashboard.stats.createStore') }}
            </router-link>
          </div>
        </div>
        
      </template>
      </div>

      <!-- Line chart - Only show for Pro pack users -->
      <div v-if="packInfo.is_pro" class="w-full overflow-hidden pt-2" style="height: 240px;">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('dashboard.monthlySales') }}</h3>
        <div class="w-full" style="height: 200px;">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>      
  </div>

    <!-- Maystro Integration Section -->
    <div class="px-4 mt-8 sm:px-6 lg:px-8">
      <MaystroIntegration />
    </div>

    <!-- Orders tab + best selling products tab -->
    <div :class="packInfo.is_pro ? 'grid grid-cols-[3fr_1fr] px-4 mt-12 sm:px-6 lg:px-8 pb-8 gap-4' : 'px-4 mt-2 sm:px-6 lg:px-8 pb-8'">
      <!-- Loading State -->
      <div v-if="statsLoading" :class="packInfo.is_pro ? 'col-span-2 text-center py-12' : 'text-center py-12'">
        <i class="fas fa-spinner fa-spin text-blue-600 text-3xl mb-4"></i>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('common.loading') }}</h3>
        <p class="text-gray-600">{{ t('dashboard.loadingProfile') }}</p>
      </div>
      <!-- Manage orders -->
      <div :class="packInfo.is_pro ? 'relative bg-white rounded-lg shadow-md px-3 pb-6 overflow-hidden' : 'relative bg-white rounded-lg shadow-md px-3 pb-6 w-full overflow-hidden'">
        <div class="flex pb-2 items-center">
        <h3 
        class="ml-4 mt-3 text-lg font-semibold text-gray-800 mb-4">{{ t('dashboard.orders.title') }}</h3>
        
        <!-- Orders Filtering tab -->
        <div class="flex justify-center gap-4 absolute" :class="route.meta.locale === 'ar' ? 'left-8' : 'right-8'">
        <button 
          @click="setSortFilter('date')"
          :class="sortFilter === 'date' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
          class="w-32 rounded-md px-4 py-2 transition-colors text-center">
           <span>{{ t('dashboard.orders.filters.date') }}</span><span class="ml-1">{{ sortOrder === 'desc' ? '↓' : '↑' }}</span>
          
        </button>
        <button 
          @click="setSortFilter('quantity')"
          :class="sortFilter === 'quantity' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
          class="w-32 rounded-md px-4 py-2 transition-colors text-center">
          <span>{{ t('dashboard.orders.filters.quantity') }}</span><span class="ml-1">{{ sortOrder === 'desc' ? '↓' : '↑' }}</span>
        </button>
        <div class="relative">
          <select 
            @change="setStatusFilter($event.target.value)"
            :value="statusFilter"
            class="w-32 rounded-md px-4 py-2 transition-colors bg-gray-200 text-gray-700 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-center">
            <option value="">{{ t('dashboard.orders.filters.allStatus') }}</option>
            <option value="pending">{{ t('dashboard.orders.filters.pending') }}</option>
            <option value="confirmed">{{ t('dashboard.orders.filters.confirmed') }}</option>
            <option value="shipped">{{ t('dashboard.orders.filters.shipped') }}</option>
            <option value="delivered">{{ t('dashboard.orders.filters.delivered') }}</option>
            <option value="cancelled">{{ t('dashboard.orders.filters.cancelled') }}</option>
          </select>
        </div>
        </div>
        </div>
        <!-- Loading State -->
        <div v-if="ordersStore.loading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-blue-600 text-2xl mb-2"></i>
          <p class="text-gray-600">{{ t('dashboard.orders.loading') }}</p>
        </div>
        
        <!-- Error State -->
        <div v-else-if="ordersStore.error" class="text-center py-8">
          <i class="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
          <p class="text-red-600">{{ ordersStore.error }}</p>
        </div>
        
        <!-- Orders Table -->
        <div v-else-if="ordersStore.orders.length > 0" class="max-h-64 overflow-y-auto overflow-x-auto">
          <table class="divide-y divide-gray-200 min-w-full table-auto">

            <thead class=" bg-gray-50">
              <tr>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ t('dashboard.orders.table.product') }}</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ t('dashboard.orders.table.customer') }}</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ t('dashboard.orders.table.date') }}</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ t('dashboard.orders.table.price') }}</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ t('dashboard.orders.table.qty') }}</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ t('dashboard.orders.table.status') }}</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ t('maystro.orders.table.maystroStatus') }}</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ t('dashboard.orders.table.total') }}</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ t('maystro.orders.table.actions') }}</th>
              </tr>
            </thead>
            <tbody class=" bg-white divide-y divide-gray-200">
              <tr v-for="order in ordersStore.orders" :key="`${order.order_id}-${order.product_id}`" class="hover:bg-gray-50">
                <td class="px-3 py-4 text-xs font-medium text-gray-900 truncate whitespace-nowrap" :title="order.product_name">
                  {{ order.product_name }}
                </td>
                <td class="px-3 py-4 text-xs text-gray-900 truncate whitespace-nowrap" :title="order.customer_name">{{ order.customer_name }}</td>
                <td class="px-3 py-4 text-xs text-gray-900 whitespace-nowrap">{{ formatDate(order.order_date) }}</td>
                <td class="px-3 py-4 text-xs text-gray-900 whitespace-nowrap">{{ formatCurrency(order.product_price) }}</td>
                <td class="px-3 py-4 text-xs text-gray-900 text-center whitespace-nowrap">{{ order.quantity }}</td>
                <td class="px-3 py-4">
                  <select 
                    :value="order.order_status"
                    @change="updateOrderStatus(order.order_id, order.product_id, $event.target.value)"
                    class="text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    :class="{
                      'bg-yellow-100 text-yellow-800': order.order_status === 'pending',
                      'bg-blue-100 text-blue-800': order.order_status === 'confirmed',
                      'bg-purple-100 text-purple-800': order.order_status === 'shipped',
                      'bg-green-100 text-green-800': order.order_status === 'delivered',
                      'bg-red-100 text-red-800': order.order_status === 'cancelled'
                    }">
                    <option value="pending" class="bg-white text-gray-900">{{ t('dashboard.orders.filters.pending') }}</option>
                    <option value="confirmed" class="bg-white text-gray-900">{{ t('dashboard.orders.filters.confirmed') }}</option>
                    <option value="shipped" class="bg-white text-gray-900">{{ t('dashboard.orders.filters.shipped') }}</option>
                    <option value="delivered" class="bg-white text-gray-900">{{ t('dashboard.orders.filters.delivered') }}</option>
                    <option value="cancelled" class="bg-white text-gray-900">{{ t('dashboard.orders.filters.cancelled') }}</option>
                  </select>
                </td>
                <!-- Maystro Status Column -->
                <td class="px-3 py-4">
                  <div class="flex flex-col gap-1">
                    <span
                      v-if="isOrderInMaystro(order.order_id)"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      {{ t('maystro.orders.status.synced') }}
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {{ t('maystro.orders.status.notInMaystro') }}
                    </span>
                    <span
                      v-if="getMaystroDisplayId(order.order_id)"
                      class="text-xs text-gray-500"
                    >
                      #{{ getMaystroDisplayId(order.order_id) }}
                    </span>
                  </div>
                </td>
                <td class="px-3 py-4 text-xs font-medium text-gray-900 whitespace-nowrap">{{ formatCurrency(order.item_total || 0) }}</td>
                <!-- Actions Column -->
                <td class="px-3 py-4">
                  <div class="flex flex-col gap-1">
                    <!-- View History Button -->
                    <button
                      @click="openStatusHistory(order.order_id)"
                      class="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      :title="t('maystro.orders.actions.viewHistory')"
                    >
                      <i class="fas fa-history mr-1"></i>
                      {{ t('maystro.orders.actions.history') }}
                    </button>
                    <!-- Create in Maystro Button -->
                    <button
                      v-if="!isOrderInMaystro(order.order_id) && order.order_status !== 'cancelled'"
                      @click="createOrderInMaystro(order.order_id)"
                      :disabled="maystroActionsLoading[order.order_id]"
                      class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      :title="t('maystro.orders.actions.createInMaystro')"
                    >
                      <i v-if="maystroActionsLoading[order.order_id]" class="fas fa-spinner fa-spin mr-1"></i>
                      <i v-else class="fas fa-plus mr-1"></i>
                      {{ t('maystro.orders.actions.createMaystro') }}
                    </button>
                    <!-- Cancel in Maystro Button -->
                    <button
                      v-if="isOrderInMaystro(order.order_id) && ['confirmed', 'shipped'].includes(order.order_status)"
                      @click="cancelOrderInMaystro(order.order_id)"
                      :disabled="maystroActionsLoading[order.order_id]"
                      class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      :title="t('maystro.orders.actions.cancelInMaystro')"
                    >
                      <i v-if="maystroActionsLoading[order.order_id]" class="fas fa-spinner fa-spin mr-1"></i>
                      <i v-else class="fas fa-times mr-1"></i>
                      Maystro
                    </button>
                    <!-- Notification Buttons -->
                    <div v-if="getAvailableNotifications(order.order_status).length > 0" class="mt-1 pt-1 border-t border-gray-200">
                      <button
                        v-for="notifType in getAvailableNotifications(order.order_status)"
                        :key="notifType"
                        @click="sendNotification(order.order_id, notifType)"
                        :disabled="sendingNotification[`${order.order_id}-${notifType}`]"
                        :class="[
                          'text-xs px-2 py-1 rounded focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed w-full mb-1',
                          notifType === 'cancelled' ? 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500' :
                          notifType === 'urgent' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 focus:ring-orange-500' :
                          'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
                        ]"
                        :title="t(`maystro.notifications.actions.${notifType}`)"
                      >
                        <i v-if="sendingNotification[`${order.order_id}-${notifType}`]" class="fas fa-spinner fa-spin mr-1"></i>
                        <i v-else class="fas fa-paper-plane mr-1"></i>
                        {{ getNotificationButtonLabel(notifType) }}
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- No Orders State -->
        <div v-else class="text-center py-8">
          <i class="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('dashboard.orders.noOrders') }}</h3>
          <p class="text-gray-600">{{ t('dashboard.orders.noOrdersMessage') }}</p>
        </div>
      </div>

      <!-- Best selling products - Only show for Pro pack users -->
      <div v-if="packInfo.is_pro" class="bg-white rounded-lg shadow-md px-3 pb-6">
        <h3 class="text-lg mt-3 font-semibold text-gray-800 mb-4">{{ t('bestSelling.title') }}</h3>
        
        <!-- Loading State -->
        <div v-if="bestSellingLoading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-blue-600 text-2xl mb-2"></i>
          <p class="text-gray-600">{{ t('bestSelling.loading') }}</p>
        </div>
        
        <!-- Best Selling Products List -->
        <div v-else-if="bestSellingProducts.length > 0" 
        class="space-y-4">
          <div 
            v-for="(product, index) in bestSellingProducts" 
            :key="product.product_id"
            class="flex items-center space-x-3 py-3  rounded-lg transition-colors">
            <!-- Rank Badge -->
            <div class="flex-shrink-0">
              <span class="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white rounded-full"
                    :class="{
                      'bg-yellow-500': index === 0,
                      'bg-blue-400': index === 1,
                      'bg-orange-500': index === 2
                    }">
                {{ index + 1 }}
              </span>
            </div>
            
            <!-- Product Image -->
            <div class="flex-shrink-0">
              <img 
                v-if="product.product_image" 
                :src="product.product_image" 
                :alt="product.product_name"
                class="w-10 h-10 rounded-lg object-cover">
              <div v-else class="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <i class="fas fa-image text-gray-400 text-xs"></i>
              </div>
            </div>
            
            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-gray-900 truncate" :title="product.product_name">
                {{ product.product_name }}
              </h4>
              <div class="flex items-center space-x-2 mt-1">
                <span class="text-xs text-gray-500">
                  {{ product.total_quantity_sold }} {{ t('bestSelling.sold') }}
                </span>
                <span class="text-xs text-gray-500">•</span>
                <span class="text-xs font-medium text-green-600">
                  {{ formatCurrency(product.total_revenue) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- No Products State -->
        <div v-else class="text-center py-8">
          <i class="fas fa-chart-line text-gray-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ t('bestSelling.noSales') }}</h3>
          <p class="text-gray-600">{{ t('bestSelling.noSalesMessage') }}</p>
        </div>
      </div>

      <!-- Status History Modal -->
      <OrderStatusHistoryModal
        :show="showStatusHistoryModal"
        :orderId="selectedOrderId"
        @close="closeStatusHistoryModal"
      />

      <!-- Urgent Notification Modal -->
      <div
        v-if="showUrgentModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
        @click.self="closeUrgentModal"
      >
        <div class="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          <div class="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
              <!-- Header -->
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {{ t('maystro.notifications.urgentModal.title') }}
                </h3>
                <button
                  @click="closeUrgentModal"
                  :disabled="sendingUrgentNotification"
                  class="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Form Content -->
              <div>
                <p class="text-sm text-gray-500 mb-4">
                  {{ t('maystro.notifications.urgentModal.description') }}
                </p>
                <label for="urgent-reason" class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('maystro.notifications.urgentModal.reasonLabel') }}
                </label>
                <textarea
                  id="urgent-reason"
                  v-model="urgentReason"
                  rows="4"
                  class="block w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-y"
                  :placeholder="t('maystro.notifications.urgentModal.reasonPlaceholder')"
                  :disabled="sendingUrgentNotification"
                ></textarea>
                <p v-if="urgentReasonError" class="mt-2 text-sm text-red-600">
                  {{ urgentReasonError }}
                </p>
              </div>

              <!-- Actions -->
              <div class="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  @click="closeUrgentModal"
                  :disabled="sendingUrgentNotification"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ t('maystro.notifications.urgentModal.cancelButton') }}
                </button>
                <button
                  type="button"
                  @click="sendUrgentNotification"
                  :disabled="sendingUrgentNotification || !urgentReason.trim()"
                  class="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i v-if="sendingUrgentNotification" class="fas fa-spinner fa-spin mr-2"></i>
                  <i v-else class="fas fa-paper-plane mr-2"></i>
                  {{ t('maystro.notifications.urgentModal.sendButton') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      
    
    </div>


</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/useAuthStore'
import { useStoreStore } from '../stores/useStoresStore'
import { useOrdersStore } from '../stores/useOrdersStore'
import { supabase } from '../lib/supabase'
import SellingTab from '../components/dashboard/SellingTab.vue'
import AdminTab from '../components/dashboard/AdminTab.vue'
import EmployeeTab from '../components/dashboard/EmployeeTab.vue'
import MaystroIntegration from '../components/MaystroIntegration.vue'
import OrderStatusHistoryModal from '../components/OrderStatusHistoryModal.vue'
import { getLocalizedPath } from '../lib/i18n-utils'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const storeStore = useStoreStore()
const ordersStore = useOrdersStore()

// Default to selling dashboard
const activeTab = ref('selling')

// Store statistics
const storeStatistics = computed(() => storeStore.storeStatistics)
const statsLoading = ref(false)

// Best selling products
const bestSellingProducts = ref([])
const bestSellingLoading = ref(false)

// Pack information
const packInfo = ref({
  has_vendor_role: false,
  store_id: null,
  pack_name_en: null,
  pack_name_ar: null,
  pack_name_fr: null,
  pack_id: null,
  is_pro: false
})
const packLoading = ref(false)

// Filtering state
const sortFilter = ref('date')
const sortOrder = ref('desc')
const statusFilter = ref('')

// Maystro and Status History state
const showStatusHistoryModal = ref(false)
const selectedOrderId = ref(null)
const orderMaystroDetails = ref({}) // Cache for Maystro details by order_id
const maystroActionsLoading = ref({}) // Loading state for each order
const sendingNotification = ref({}) // Loading state for sending notifications by orderId-notificationType
const pollingInterval = ref(null)

// Urgent notification modal state
const showUrgentModal = ref(false)
const urgentOrderId = ref(null)
const urgentReason = ref('')
const urgentReasonError = ref('')
const sendingUrgentNotification = ref(false)

// Chart data
const chartData = ref({
  labels: [],
  datasets: [{
    label: 'Monthly Sales',
    data: [],
    borderColor: 'rgb(59, 130, 246)',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    tension: 0.4
  }]
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }
  },
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        autoSkip: false,
        font: {
          size: 10
        }
      }
    },
    y: {
      beginAtZero: true,
      min: 0,
      max: 50000,
      ticks: {
        stepSize: 20000,
        maxTicksLimit: 6,
        font: {
          size: 10
        },
        callback: function(value) {
          return value.toLocaleString();
        }
      },
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)'
      }
    }
  }
})

// Format currency function using i18n
const formatCurrency = (amount) => {
  const currentLocale = route.meta.locale || 'en'
  
  // Get currency symbol from translations
  const currencySymbol = t('dashboard.currency.dzdSymbol')
  
  // For Arabic locale, use custom formatting with Arabic currency symbol
  if (currentLocale === 'ar') {
    return `${amount.toLocaleString('ar-DZ')} ${currencySymbol}`
  }
  
  // For other locales, use standard currency formatting
  const currencyCode = 'DZD'
  const formatted = new Intl.NumberFormat(currentLocale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0
  }).format(amount)
  
  return formatted
}

// Format date function using i18n
const formatDate = (dateString) => {
  const currentLocale = route.meta.locale || 'en'
  const date = new Date(dateString)
  
  // Use locale-specific formatting
  const localeMap = {
    'en': 'en-US',
    'fr': 'fr-FR',
    'ar': 'ar-DZ'
  }
  
  const locale = localeMap[currentLocale] || 'en-US'
  
  return date.toLocaleDateString(locale, { 
    month: 'short', 
    day: 'numeric' 
  })
}

// Available tabs based on user role
const availableTabs = computed(() => {
  const userRole = authStore.userRole || 'customer'
  
  const tabs = [
    {
      id: 'selling',
      name: t('dashboard.sellingDashboard'),
      icon: 'fas fa-store',
      roles: ['customer', 'admin', 'employee', 'vendor']
    }
  ]

  // Add admin tab for admins
  if (userRole === 'admin') {
    tabs.push({
      id: 'admin',
      name: t('admin.dashboard'),
      icon: 'fas fa-crown',
      roles: ['admin']
    })
  } else {
  }

  // Add employee tab for employees
  if (userRole === 'employee') {
    tabs.push({
      id: 'employee',
      name: t('employee.dashboard'),
      icon: 'fas fa-user-tie',
      roles: ['employee']
    })
  } else {
  }
  return tabs
})

// Handle admin navigation
const handleAdminNavigation = (section) => {
  // Navigate to admin section or show admin modal
  // This could open a modal or navigate to a different route
  // For now, we'll just log it
}

// Handle employee navigation
const handleEmployeeNavigation = (section) => {
  // Navigate to employee section or show employee modal
  // This could open a modal or navigate to a different route
  // For now, we'll just log it
}

// Get localized route path
const getLocalizedRoute = (path) => {
  const currentLocale = route.meta.locale || 'en'
  return getLocalizedPath(path, currentLocale)
}

// Check if user has access to a specific tab
const hasAccessToTab = (tabId) => {
  const tab = availableTabs.value.find(t => t.id === tabId)
  return tab && tab.roles.includes(authStore.userRole)
}

// Redirect to appropriate tab if current tab is not accessible
const validateTabAccess = () => {
  if (!hasAccessToTab(activeTab.value)) {
    // Redirect to first available tab
    activeTab.value = availableTabs.value[0]?.id || 'selling'
  }
}

// Watch for role changes and refresh tabs
watch(() => authStore.userRole, (newRole, oldRole) => {
  validateTabAccess()
}, { immediate: true })

// Set sort filter and toggle order
const setSortFilter = async (filter) => {
  if (sortFilter.value === filter) {
    // Toggle order if same filter is clicked
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    // Set new filter with default desc order
    sortFilter.value = filter
    sortOrder.value = 'desc'
  }
  
  // Fetch filtered orders
  await fetchFilteredOrders()
}

// Set status filter
const setStatusFilter = async (status) => {
  statusFilter.value = status
  await fetchFilteredOrders()
}

// Update order status
const updateOrderStatus = async (orderId, productId, newStatus) => {
  try {
    // Get the current order to find old status
    const currentOrder = ordersStore.orders.find(
      order => order.order_id === orderId && order.product_id === productId
    )
    
    if (!currentOrder) {
      throw new Error('Order not found')
    }
    
    const oldStatus = currentOrder.order_status
    
    // If status hasn't changed, do nothing
    if (oldStatus === newStatus) {
      return
    }
    
    // Update the order status in the orders table
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
    
    if (updateError) throw updateError
    
    // Log the status change in order_status_logs
    const { error: logError } = await supabase
      .from('order_status_logs')
      .insert({
        order_id: orderId,
        old_status: oldStatus,
        new_status: newStatus,
        triggered_by: 'manual'
      })
    
    // Log error is non-critical, but log it for debugging
    if (logError) {
      console.warn('Failed to log status change:', logError)
    }
    
    // Refetch orders from database to ensure synchronization
    await fetchFilteredOrders()
    
    console.log(`Order status updated from ${oldStatus} to ${newStatus}`)
  } catch (error) {
    console.error('Error updating order status:', error)
    alert('Failed to update order status: ' + error.message)
  }
}

// Fetch filtered orders using the new RPC function
const fetchFilteredOrders = async () => {
  try {
    console.log('🔍 [StoreDashboard] Fetching filtered orders...')
    console.log('🔍 [StoreDashboard] Filter params:', {
      sort_by: sortFilter.value,
      sort_order: sortOrder.value,
      status_filter: statusFilter.value || null
    })
    
    // DEBUG: First, check if user has a store
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userStore, error: storeError } = await supabase
        .from('stores')
        .select('id, name, status, owner_id')
        .eq('owner_id', user.id)
        .eq('status', 'approved')
        .limit(1)
      
      if (storeError) {
        console.error('❌ [StoreDashboard] Error fetching user store:', storeError)
      } else if (!userStore || userStore.length === 0) {
        console.warn('⚠️ [StoreDashboard] User has no approved store!')
      } else {
        console.log('✅ [StoreDashboard] User store found:', userStore[0])
      }
    }
    
    const { data, error } = await supabase.rpc('get_vendor_orders_filtered', {
      p_sort_by: sortFilter.value,
      p_sort_order: sortOrder.value,
      p_status_filter: statusFilter.value || null
    })
    
    if (error) {
      console.error('❌ [StoreDashboard] Error fetching filtered orders:', error)
      throw error
    }
    
    console.log('🔍 [StoreDashboard] Orders fetched from RPC:', {
      count: data?.length || 0,
      orders: data?.map(order => ({
        order_id: order.order_id,
        product_id: order.product_id,
        product_name: order.product_name,
        order_status: order.order_status,
        quantity: order.quantity,
        item_total: order.item_total
      })) || []
    })
    
    // DEBUG: If no orders returned, check why
    if (!data || data.length === 0) {
      console.warn('⚠️ [StoreDashboard] No orders returned from RPC function!')
      console.warn('⚠️ [StoreDashboard] Possible reasons:')
      console.warn('  1. Products in orders have NULL store_id')
      console.warn('  2. Products in orders belong to a different store')
      console.warn('  3. User has no approved store')
      console.warn('  4. No orders exist with products matching this store')
      
      // Check if there are any orders at all with products from this store
      if (user) {
        const { data: userStore } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', user.id)
          .eq('status', 'approved')
          .limit(1)
          .single()
        
        if (userStore) {
          console.log('🔍 [StoreDashboard] DEBUG: Checking if any products have this store_id...')
          const { data: productsWithStore, error: productsError } = await supabase
            .from('products')
            .select('id, name, store_id')
            .eq('store_id', userStore.id)
            .limit(5)
          
          if (productsError) {
            console.error('❌ [StoreDashboard] Error checking products:', productsError)
          } else {
            console.log(`🔍 [StoreDashboard] Found ${productsWithStore?.length || 0} products with store_id ${userStore.id}`)
            if (productsWithStore && productsWithStore.length > 0) {
              console.log('🔍 [StoreDashboard] Sample products:', productsWithStore.map(p => ({
                id: p.id,
                name: p.name,
                store_id: p.store_id
              })))
            }
          }
        }
      }
    }
    
    // Update orders store with filtered data
    ordersStore.orders = data || []
    
    // Load Maystro details for unique orders
    await loadMaystroDetailsForOrders()
  } catch (error) {
    console.error('❌ [StoreDashboard] Error fetching filtered orders:', error)
  }
}

// Load Maystro details for orders
const loadMaystroDetailsForOrders = async () => {
  try {
    // Get unique order IDs
    const uniqueOrderIds = [...new Set(ordersStore.orders.map(order => order.order_id))]
    
    // Fetch Maystro details for each order (batch query would be better, but this works)
    const ordersData = await Promise.all(
      uniqueOrderIds.map(async (orderId) => {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('id, maystro_order_id, maystro_display_id, maystro_status_code, maystro_last_update')
            .eq('id', orderId)
            .single()
          
          if (error) throw error
          return { orderId, data }
        } catch (err) {
          console.error(`Error loading Maystro details for order ${orderId}:`, err)
          return { orderId, data: null }
        }
      })
    )
    
    // Cache Maystro details
    ordersData.forEach(({ orderId, data }) => {
      if (data) {
        orderMaystroDetails.value[orderId] = data
      }
    })
  } catch (error) {
    console.error('Error loading Maystro details:', error)
  }
}

// Open status history modal
const openStatusHistory = (orderId) => {
  selectedOrderId.value = orderId
  showStatusHistoryModal.value = true
}

// Close status history modal
const closeStatusHistoryModal = () => {
  showStatusHistoryModal.value = false
  selectedOrderId.value = null
}

// Create order in Maystro
const createOrderInMaystro = async (orderId) => {
  try {
    maystroActionsLoading.value[orderId] = true
    
    // Get full order details
    const orderData = await ordersStore.getOrderWithMaystroDetails(orderId)
    
    // Call backend to create order in Maystro
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/maystro/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        orderId: orderData.id,
        storeId: orderData.store_id
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create order in Maystro')
    }
    
    const result = await response.json()
    
    // Refresh orders to get updated Maystro data
    await fetchFilteredOrders()
    
    alert(t('maystro.orders.success.created'))
  } catch (error) {
    console.error('Error creating order in Maystro:', error)
    alert(t('maystro.orders.error.createFailed') + ': ' + error.message)
  } finally {
    maystroActionsLoading.value[orderId] = false
  }
}

// Cancel order in Maystro
const cancelOrderInMaystro = async (orderId) => {
  try {
    if (!confirm(t('maystro.orders.confirm.cancel'))) {
      return
    }
    
    maystroActionsLoading.value[orderId] = true
    
    // Get order data first
    const orderData = await ordersStore.getOrderWithMaystroDetails(orderId)
    
    // Get Maystro order ID
    const maystroDetails = orderMaystroDetails.value[orderId]
    if (!maystroDetails?.maystro_order_id) {
      throw new Error('Order not found in Maystro')
    }
    
    // Call backend to cancel order in Maystro
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/maystro/orders/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        orderId: orderData.id,
        maystroOrderId: maystroDetails.maystro_order_id
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to cancel order in Maystro')
    }
    
    // Refresh orders
    await fetchFilteredOrders()
    
    alert(t('maystro.orders.success.cancelled'))
  } catch (error) {
    console.error('Error canceling order in Maystro:', error)
    alert(t('maystro.orders.error.cancelFailed') + ': ' + error.message)
  } finally {
    maystroActionsLoading.value[orderId] = false
  }
}

// Start real-time polling for order status updates
const startOrderPolling = () => {
  // Poll every 30 seconds
  pollingInterval.value = setInterval(async () => {
    try {
      await fetchFilteredOrders()
    } catch (error) {
      console.error('Error polling orders:', error)
    }
  }, 30000) // 30 seconds
}

// Stop real-time polling
const stopOrderPolling = () => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

// Check if order is synced with Maystro
const isOrderInMaystro = (orderId) => {
  return orderMaystroDetails.value[orderId]?.maystro_order_id != null
}

// Get Maystro display ID for order
const getMaystroDisplayId = (orderId) => {
  return orderMaystroDetails.value[orderId]?.maystro_display_id || null
}

// Send notification manually
const sendNotification = async (orderId, notificationType) => {
  // If urgent notification, open modal first
  if (notificationType === 'urgent') {
    openUrgentModal(orderId)
    return
  }

  try {
    sendingNotification.value[`${orderId}-${notificationType}`] = true
    
    const session = await supabase.auth.getSession()
    if (!session.data.session) {
      throw new Error('Not authenticated')
    }

    // Map notification types to endpoints
    const endpointMap = {
      confirmation: '/api/notifications/order-confirmation',
      shipped: '/api/notifications/order-shipped',
      delivered: '/api/notifications/order-delivered',
      cancelled: '/api/notifications/order-cancelled',
      urgent: '/api/notifications/urgent-delivery'
    }

    const endpoint = endpointMap[notificationType]
    if (!endpoint) {
      throw new Error(`Unknown notification type: ${notificationType}`)
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`
      },
      body: JSON.stringify({
        orderId: orderId
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Failed to send ${notificationType} notification`)
    }

    const result = await response.json()
    
    alert(t('maystro.notifications.success.sent'))
  } catch (error) {
    console.error(`Error sending ${notificationType} notification:`, error)
    alert(t('maystro.notifications.error.sendFailed') + ': ' + error.message)
  } finally {
    sendingNotification.value[`${orderId}-${notificationType}`] = false
  }
}

// Open urgent notification modal
const openUrgentModal = (orderId) => {
  urgentOrderId.value = orderId
  urgentReason.value = ''
  urgentReasonError.value = ''
  showUrgentModal.value = true
}

// Close urgent notification modal
const closeUrgentModal = () => {
  if (sendingUrgentNotification.value) return // Prevent closing while sending
  
  showUrgentModal.value = false
  urgentOrderId.value = null
  urgentReason.value = ''
  urgentReasonError.value = ''
}

// Send urgent notification with reason
const sendUrgentNotification = async () => {
  // Validate reason
  if (!urgentReason.value || !urgentReason.value.trim()) {
    urgentReasonError.value = t('maystro.notifications.urgentModal.reasonRequired')
    return
  }

  urgentReasonError.value = ''
  sendingUrgentNotification.value = true

  try {
    const session = await supabase.auth.getSession()
    if (!session.data.session) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/notifications/urgent-delivery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session.access_token}`
      },
      body: JSON.stringify({
        orderId: urgentOrderId.value,
        reason: urgentReason.value.trim()
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to send urgent notification')
    }

    const result = await response.json()
    
    // Show success message and close modal
    alert(t('maystro.notifications.success.sent'))
    closeUrgentModal()
    
    // Update sending notification state
    sendingNotification.value[`${urgentOrderId.value}-urgent`] = false
  } catch (error) {
    console.error('Error sending urgent notification:', error)
    urgentReasonError.value = error.message || t('maystro.notifications.error.sendFailed')
  } finally {
    sendingUrgentNotification.value = false
  }
}

// Get available notification actions for an order based on its status
const getAvailableNotifications = (orderStatus) => {
  const statusMap = {
    pending: ['confirmation'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['shipped', 'delivered', 'urgent'], // Show shipped button + delivered/urgent options
    delivered: [],
    cancelled: ['cancelled'] // IMPORTANT: Keep cancelled button visible so store owner can notify customer about cancellation
  }
  return statusMap[orderStatus] || []
}

// Get notification button label text
const getNotificationButtonLabel = (notifType) => {
  const labelMap = {
    confirmation: t('maystro.notifications.actions.sendConfirmation'),
    shipped: 'Shipped',
    delivered: t('maystro.notifications.actions.sendDelivered'),
    cancelled: 'Cancelled',
    urgent: 'Urgent'
  }
  return labelMap[notifType] || notifType
}

// Fetch monthly sales data
const fetchMonthlySales = async () => {
  try {
    const { data, error } = await supabase.rpc('get_my_store_monthly_sales')
    if (error) throw error
    
    if (data && data.length > 0) {
      const result = data[0]
      chartData.value = {
        labels: result.labels || [],
        datasets: [{
          label: 'Monthly Sales',
          data: result.datasets?.data || [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }]
      }
    }
  } catch (error) {
    console.error('Error fetching monthly sales:', error)
  }
}

// Fetch pack information
const fetchPackInfo = async () => {
  try {
    packLoading.value = true
    const { data, error } = await supabase.rpc('get_user_store_pack')
    
    if (error) throw error
    
    if (data && data.length > 0) {
      packInfo.value = data[0]
    }
  } catch (error) {
    console.error('Error fetching pack information:', error)
  } finally {
    packLoading.value = false
  }
}

// Fetch best selling products
const fetchBestSellingProducts = async () => {
  try {
    bestSellingLoading.value = true
    const { data, error } = await supabase.rpc('get_best_selling_products')
    
    if (error) throw error
    
    bestSellingProducts.value = data || []
  } catch (error) {
    console.error('Error fetching best selling products:', error)
    bestSellingProducts.value = []
  } finally {
    bestSellingLoading.value = false
  }
}

onMounted(async () => {
  // Avoid forcing role refresh here to prevent loops
  if (authStore.isAuthenticated) {
    statsLoading.value = true
    try {
      // Fetch user's store first so MaystroIntegration can access it
      await storeStore.fetchUserStores()
      
      console.log('🔍 Debug - User stores:', storeStore.userStores)
      console.log('🔍 Debug - User stores length:', storeStore.userStores.length)
      
      // If user has stores, fetch complete store details and set as current store
      if (storeStore.userStores.length > 0) {
        const storeId = storeStore.userStores[0].id
        console.log('🔍 Debug - Fetching store details for ID:', storeId)
        
        // Fetch complete store information from store_details view
        await storeStore.fetchStoreById(storeId)
        console.log('🔍 Debug - Current store set:', storeStore.currentStore)
        
        // Small delay to ensure store data is fully propagated to components
        await new Promise(resolve => setTimeout(resolve, 100))
        console.log('🔍 Debug - Store data propagation delay completed')
      } else {
        console.warn('⚠️ No stores found for user')
      }
      
      await storeStore.fetchStoreStatistics()
      await fetchFilteredOrders() // Use filtered orders instead of regular fetch
      await fetchPackInfo() // Fetch pack information
      await fetchMonthlySales()
      await fetchBestSellingProducts()
      
      // Start real-time polling for order status updates
      startOrderPolling()
    } catch (error) {
      console.error('Error fetching store statistics:', error)
    } finally {
      statsLoading.value = false
    }
  }

  // Validate tab access on mount
  validateTabAccess()
})

// Cleanup polling on unmount
onBeforeUnmount(() => {
  stopOrderPolling()
})
</script>

<style scoped>
.card {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
  padding: 1.5rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary);
}

.btn-outline {
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  background-color: transparent;
  font-weight: 500;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline:hover {
  background-color: var(--color-primary);
  color: white;
}

.btn-outline:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary);
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
  color: #374151;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-secondary:focus {
  outline: none;
  box-shadow: 0 0 0 2px #6b7280;
}

/* Hide scrollbar but keep scroll functionality */
.scrollbar-hide {
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar { 
  display: none;  /* Safari and Chrome */
}
</style> 