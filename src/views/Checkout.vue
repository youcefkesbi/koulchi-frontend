<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-dark">إتمام الطلب</h1>
      <router-link to="/cart" class="btn-outline">
        <i class="fas fa-arrow-left ml-2"></i>
        العودة للسلة
      </router-link>
    </div>

    <div v-if="cartStore.hasItems" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Checkout Form -->
      <div class="space-y-6">
        <!-- Customer Information -->
        <div class="card">
          <h2 class="text-xl font-bold text-dark mb-4">معلومات العميل</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">الاسم الأول *</label>
              <input
                v-model="customerInfo.firstName"
                type="text"
                class="input-field"
                placeholder="الاسم الأول"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">الاسم الأخير *</label>
              <input
                v-model="customerInfo.lastName"
                type="text"
                class="input-field"
                placeholder="الاسم الأخير"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
              <input
                v-model="customerInfo.phone"
                type="tel"
                class="input-field"
                placeholder="+213 123 456 789"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                v-model="customerInfo.email"
                type="email"
                class="input-field"
                placeholder="example@email.com"
              />
            </div>
          </div>
        </div>

        <!-- Delivery Address -->
        <div class="card">
          <h2 class="text-xl font-bold text-dark mb-4">عنوان التوصيل</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">الولاية *</label>
              <select v-model="deliveryAddress.wilaya" class="input-field" required>
                <option value="">اختر الولاية</option>
                <option v-for="wilaya in algerianWilayas" :key="wilaya.id" :value="wilaya.id">
                  {{ wilaya.nameAr }} - {{ wilaya.name }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">البلدية *</label>
              <input
                v-model="deliveryAddress.commune"
                type="text"
                class="input-field"
                placeholder="البلدية"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">الشارع والرقم *</label>
              <input
                v-model="deliveryAddress.street"
                type="text"
                class="input-field"
                placeholder="اسم الشارع ورقم المنزل"
                required
              />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">الرمز البريدي</label>
                <input
                  v-model="deliveryAddress.postalCode"
                  type="text"
                  class="input-field"
                  placeholder="16000"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">رقم الطابق</label>
                <input
                  v-model="deliveryAddress.floor"
                  type="text"
                  class="input-field"
                  placeholder="الطابق والرقم"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية</label>
              <textarea
                v-model="deliveryAddress.notes"
                rows="3"
                class="input-field"
                placeholder="ملاحظات حول العنوان أو التوصيل..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="card">
          <h2 class="text-xl font-bold text-dark mb-4">طريقة الدفع</h2>
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center space-x-3 space-x-reverse">
              <input
                type="radio"
                id="cod"
                value="cod"
                v-model="paymentMethod"
                class="text-green-600"
                checked
              />
              <label for="cod" class="flex items-center space-x-3 space-x-reverse cursor-pointer">
                <i class="fas fa-money-bill-wave text-green-600 text-xl"></i>
                <div>
                  <div class="font-semibold text-green-800">دفع عند الاستلام</div>
                  <div class="text-sm text-green-700">ادفع عند استلام طلبك وفحصه</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:col-span-1">
        <div class="card sticky top-4">
          <h2 class="text-xl font-bold text-dark mb-6">ملخص الطلب</h2>
          
          <!-- Order Items -->
          <div class="space-y-4 mb-6">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="flex items-center space-x-3 space-x-reverse"
            >
              <img 
                :src="item.image" 
                :alt="item.name"
                class="w-12 h-12 object-cover rounded-lg"
              />
              <div class="flex-1">
                <h4 class="font-semibold text-sm">{{ item.nameAr }}</h4>
                <p class="text-gray-500 text-xs">{{ item.name }}</p>
                <p class="text-xs text-gray-600">الكمية: {{ item.quantity }}</p>
              </div>
              <div class="text-right">
                <span class="font-semibold text-sm">{{ formatPrice(item.price * item.quantity) }} دج</span>
              </div>
            </div>
          </div>
          
          <!-- Summary Details -->
          <div class="space-y-3 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-600">عدد المنتجات:</span>
              <span class="font-semibold">{{ cartStore.totalItems }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">المجموع الفرعي:</span>
              <span class="font-semibold">{{ formatPrice(cartStore.subtotal) }} دج</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">رسوم التوصيل:</span>
              <span class="font-semibold">{{ formatPrice(cartStore.deliveryFee) }} دج</span>
            </div>
            
            <div class="border-t pt-3">
              <div class="flex justify-between text-lg font-bold">
                <span>المجموع الكلي:</span>
                <span class="text-primary">{{ formatPrice(cartStore.total) }} دج</span>
              </div>
            </div>
          </div>

          <!-- COD Notice -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div class="flex items-start space-x-3 space-x-reverse">
              <i class="fas fa-info-circle text-yellow-600 text-xl mt-1"></i>
              <div>
                <h4 class="font-semibold text-yellow-800 mb-1">معلومات مهمة</h4>
                <ul class="text-yellow-700 text-sm space-y-1">
                  <li>• سيتم الاتصال بك لتأكيد الطلب</li>
                  <li>• مدة التوصيل: 2-5 أيام عمل</li>
                  <li>• ادفع {{ formatPrice(cartStore.total) }} دج عند الاستلام</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Place Order Button -->
          <button
            @click="placeOrder"
            :disabled="!isFormValid"
            class="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fas fa-check ml-2"></i>
            تأكيد الطلب
          </button>
        </div>
      </div>
    </div>

    <!-- Empty Cart Redirect -->
    <div v-else class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-shopping-cart text-gray-400 text-3xl"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">سلة التسوق فارغة</h3>
      <p class="text-gray-500 mb-6">
        لا يمكن إتمام الطلب بدون منتجات في السلة
      </p>
      <router-link to="/products" class="btn-primary">
        <i class="fas fa-shopping-bag ml-2"></i>
        ابدأ التسوق
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cartStore = useCartStore()
const paymentMethod = ref('cod')

const customerInfo = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: ''
})

const deliveryAddress = reactive({
  wilaya: '',
  commune: '',
  street: '',
  postalCode: '',
  floor: '',
  notes: ''
})

// Algerian Wilayas (provinces)
const algerianWilayas = [
  { id: '16', name: 'Alger', nameAr: 'الجزائر' },
  { id: '31', name: 'Oran', nameAr: 'وهران' },
  { id: '21', name: 'Skikda', nameAr: 'سكيكدة' },
  { id: '25', name: 'Constantine', nameAr: 'قسنطينة' },
  { id: '19', name: 'Sétif', nameAr: 'سطيف' },
  { id: '27', name: 'Mostaganem', nameAr: 'مستغانم' },
  { id: '24', name: 'Guelma', nameAr: 'قالمة' },
  { id: '23', name: 'Annaba', nameAr: 'عنابة' },
  { id: '26', name: 'Médéa', nameAr: 'المدية' },
  { id: '20', name: 'Saïda', nameAr: 'سعيدة' }
]

const isFormValid = computed(() => {
  return customerInfo.firstName && 
         customerInfo.lastName && 
         customerInfo.phone && 
         deliveryAddress.wilaya && 
         deliveryAddress.commune && 
         deliveryAddress.street
})

const formatPrice = (price) => {
  return price.toLocaleString('ar-DZ')
}

const placeOrder = () => {
  if (isFormValid.value) {
    // Save customer info and delivery address to store
    cartStore.setCustomerInfo(customerInfo)
    cartStore.setDeliveryAddress(deliveryAddress)
    
    // Navigate to order confirmation
    router.push('/order-confirmation')
  }
}
</script> 