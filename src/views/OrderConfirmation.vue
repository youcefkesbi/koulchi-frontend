<template>
  <div class="max-w-4xl mx-auto">
    <!-- Success Message -->
    <div class="text-center mb-8">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-check text-green-600 text-3xl"></i>
      </div>
      <h1 class="text-3xl font-bold text-dark mb-2">تم تأكيد طلبك بنجاح!</h1>
      <p class="text-gray-600 text-lg">
        شكراً لك على طلبك. سنقوم بالاتصال بك قريباً لتأكيد التفاصيل
      </p>
    </div>

    <!-- Order Details -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Order Summary -->
      <div class="card">
        <h2 class="text-xl font-bold text-dark mb-6">تفاصيل الطلب</h2>
        
        <div class="space-y-4">
          <div class="flex justify-between">
            <span class="text-gray-600">رقم الطلب:</span>
            <span class="font-semibold">#{{ orderNumber }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">تاريخ الطلب:</span>
            <span class="font-semibold">{{ orderDate }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">حالة الطلب:</span>
            <span class="badge badge-cod">في انتظار التأكيد</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">طريقة الدفع:</span>
            <span class="font-semibold text-green-600">
              <i class="fas fa-money-bill-wave ml-1"></i>
              دفع عند الاستلام
            </span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">المجموع الكلي:</span>
            <span class="text-xl font-bold text-primary">{{ formatPrice(cartStore.total) }} دج</span>
          </div>
        </div>
      </div>

      <!-- Customer Information -->
      <div class="card">
        <h2 class="text-xl font-bold text-dark mb-6">معلومات العميل</h2>
        
        <div class="space-y-4">
          <div>
            <span class="text-gray-600">الاسم:</span>
            <p class="font-semibold">{{ customerName }}</p>
          </div>
          
          <div>
            <span class="text-gray-600">رقم الهاتف:</span>
            <p class="font-semibold">{{ customerPhone }}</p>
          </div>
          
          <div v-if="customerEmail">
            <span class="text-gray-600">البريد الإلكتروني:</span>
            <p class="font-semibold">{{ customerEmail }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Delivery Address -->
    <div class="card mt-8">
      <h2 class="text-xl font-bold text-dark mb-6">عنوان التوصيل</h2>
      
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="font-semibold">{{ deliveryAddress.street }}</p>
        <p class="text-gray-600">{{ deliveryAddress.commune }}</p>
        <p class="text-gray-600">{{ getWilayaName(deliveryAddress.wilaya) }}</p>
        <p v-if="deliveryAddress.postalCode" class="text-gray-600">
          الرمز البريدي: {{ deliveryAddress.postalCode }}
        </p>
        <p v-if="deliveryAddress.floor" class="text-gray-600">
          {{ deliveryAddress.floor }}
        </p>
        <p v-if="deliveryAddress.notes" class="text-gray-600 mt-2">
          <strong>ملاحظات:</strong> {{ deliveryAddress.notes }}
        </p>
      </div>
    </div>

    <!-- Order Items -->
    <div class="card mt-8">
      <h2 class="text-xl font-bold text-dark mb-6">المنتجات المطلوبة</h2>
      
      <div class="space-y-4">
        <div
          v-for="item in cartStore.items"
          :key="item.id"
          class="flex items-center space-x-4 space-x-reverse border-b border-gray-200 pb-4 last:border-b-0"
        >
          <img 
            :src="item.image" 
            :alt="item.name"
            class="w-16 h-16 object-cover rounded-lg"
          />
          
          <div class="flex-1">
            <h4 class="font-semibold">{{ item.nameAr }}</h4>
            <p class="text-gray-600 text-sm">{{ item.name }}</p>
            <p class="text-sm text-gray-500">الكمية: {{ item.quantity }}</p>
          </div>
          
          <div class="text-right">
            <span class="font-semibold">{{ formatPrice(item.price * item.quantity) }} دج</span>
          </div>
        </div>
      </div>
      
      <!-- Order Total -->
      <div class="border-t pt-4 mt-6">
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">المجموع الفرعي:</span>
            <span class="font-semibold">{{ formatPrice(cartStore.subtotal) }} دج</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">رسوم التوصيل:</span>
            <span class="font-semibold">{{ formatPrice(cartStore.deliveryFee) }} دج</span>
          </div>
          
          <div class="flex justify-between text-lg font-bold border-t pt-2">
            <span>المجموع الكلي:</span>
            <span class="text-primary">{{ formatPrice(cartStore.total) }} دج</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Important Information -->
    <div class="card mt-8 bg-blue-50 border border-blue-200">
      <h2 class="text-xl font-bold text-blue-800 mb-4">معلومات مهمة</h2>
      
      <div class="space-y-4">
        <div class="flex items-start space-x-3 space-x-reverse">
          <i class="fas fa-phone text-blue-600 text-xl mt-1"></i>
          <div>
            <h4 class="font-semibold text-blue-800">تأكيد الطلب</h4>
            <p class="text-blue-700">سنقوم بالاتصال بك خلال 24 ساعة لتأكيد طلبك وتحديد موعد التوصيل</p>
          </div>
        </div>
        
        <div class="flex items-start space-x-3 space-x-reverse">
          <i class="fas fa-truck text-blue-600 text-xl mt-1"></i>
          <div>
            <h4 class="font-semibold text-blue-800">التوصيل</h4>
            <p class="text-blue-700">مدة التوصيل: 2-5 أيام عمل حسب موقعك</p>
          </div>
        </div>
        
        <div class="flex items-start space-x-3 space-x-reverse">
          <i class="fas fa-money-bill-wave text-blue-600 text-xl mt-1"></i>
          <div>
            <h4 class="font-semibold text-blue-800">الدفع</h4>
            <p class="text-blue-700">ادفع {{ formatPrice(cartStore.total) }} دج عند استلام طلبك وفحصه</p>
          </div>
        </div>
        
        <div class="flex items-start space-x-3 space-x-reverse">
          <i class="fas fa-undo text-blue-600 text-xl mt-1"></i>
          <div>
            <h4 class="font-semibold text-blue-800">الإرجاع</h4>
            <p class="text-blue-700">يمكنك إرجاع المنتج خلال 14 يوم من تاريخ الاستلام</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 mt-8">
      <router-link to="/" class="btn-primary text-center">
        <i class="fas fa-home ml-2"></i>
        العودة للرئيسية
      </router-link>
      
      <router-link to="/products" class="btn-outline text-center">
        <i class="fas fa-shopping-bag ml-2"></i>
        متابعة التسوق
      </router-link>
      
      <button @click="printOrder" class="btn-outline text-center">
        <i class="fas fa-print ml-2"></i>
        طباعة الطلب
      </button>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useCartStore } from '../stores/cart'

export default {
  name: 'OrderConfirmation',
  setup() {
    const cartStore = useCartStore()

    // Generate order number
    const orderNumber = computed(() => {
      const timestamp = Date.now()
      return `KOUL${timestamp.toString().slice(-8)}`
    })

    // Get current date
    const orderDate = computed(() => {
      return new Date().toLocaleDateString('ar-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    // Customer info
    const customerName = computed(() => {
      if (cartStore.customerInfo) {
        return `${cartStore.customerInfo.firstName} ${cartStore.customerInfo.lastName}`
      }
      return ''
    })

    const customerPhone = computed(() => {
      return cartStore.customerInfo?.phone || ''
    })

    const customerEmail = computed(() => {
      return cartStore.customerInfo?.email || ''
    })

    const deliveryAddress = computed(() => {
      return cartStore.deliveryAddress || {}
    })

    // Algerian Wilayas mapping
    const wilayasMap = {
      '16': 'الجزائر - Alger',
      '31': 'وهران - Oran',
      '21': 'سكيكدة - Skikda',
      '25': 'قسنطينة - Constantine',
      '19': 'سطيف - Sétif',
      '27': 'مستغانم - Mostaganem',
      '24': 'قالمة - Guelma',
      '23': 'عنابة - Annaba',
      '26': 'المدية - Médéa',
      '20': 'سعيدة - Saïda'
    }

    const getWilayaName = (wilayaId) => {
      return wilayasMap[wilayaId] || wilayaId
    }

    const formatPrice = (price) => {
      return price.toLocaleString('ar-DZ')
    }

    const printOrder = () => {
      window.print()
    }

    onMounted(() => {
      // Clear cart after successful order
      setTimeout(() => {
        cartStore.clearCart()
      }, 5000)
    })

    return {
      cartStore,
      orderNumber,
      orderDate,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      getWilayaName,
      formatPrice,
      printOrder
    }
  }
}
</script>

<style scoped>
@media print {
  .btn-primary,
  .btn-outline {
    display: none;
  }
}
</style> 