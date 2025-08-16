<template>
  <footer class="bg-dark text-white">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Company Info -->
        <div class="space-y-4">
          <div class="flex items-center space-x-3 space-x-reverse">
            <div class="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-soft">
              <i class="fas fa-shopping-bag text-white text-lg"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold text-primary">كولشي</h3>
              <p class="text-sm text-gray-300">Koulchi</p>
            </div>
          </div>
          <p class="text-gray-300 leading-relaxed text-sm">
            تسوق أونلاين في الجزائر مع الدفع عند الاستلام. نقدم أفضل المنتجات بأفضل الأسعار.
          </p>
          <div class="flex space-x-4 space-x-reverse">
            <a href="#" class="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary-dark transition-all duration-300 shadow-soft">
              <i class="fab fa-facebook-f text-white"></i>
            </a>
            <a href="#" class="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary-dark transition-all duration-300 shadow-soft">
              <i class="fab fa-instagram text-white"></i>
            </a>
            <a href="#" class="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary-dark transition-all duration-300 shadow-soft">
              <i class="fab fa-twitter text-white"></i>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="space-y-4">
          <h4 class="text-lg font-bold text-white mb-4">روابط سريعة</h4>
          <ul class="space-y-3">
            <li>
              <router-link to="/products" class="text-gray-300 hover:text-primary transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-primary group-hover:text-secondary transition-colors"></i>
                المنتجات
              </router-link>
            </li>
            <li>
              <a href="#" class="text-gray-300 hover:text-primary transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-primary group-hover:text-secondary transition-colors"></i>
                من نحن
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-300 hover:text-primary transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-primary group-hover:text-secondary transition-colors"></i>
                اتصل بنا
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-300 hover:text-primary transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-primary group-hover:text-secondary transition-colors"></i>
                المساعدة
              </a>
            </li>
          </ul>
        </div>

        <!-- Customer Service -->
        <div class="space-y-4">
          <h4 class="text-lg font-bold text-white mb-4">خدمة العملاء</h4>
          <ul class="space-y-3">
            <li>
              <a href="#" class="text-gray-300 hover:text-secondary transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-secondary group-hover:text-orange-400 transition-colors"></i>
                سياسة الإرجاع
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-300 hover:text-secondary transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-secondary group-hover:text-orange-400 transition-colors"></i>
                شروط الاستخدام
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-300 hover:text-secondary transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-secondary group-hover:text-orange-400 transition-colors"></i>
                سياسة الخصوصية
              </a>
            </li>
            <li>
              <a href="#" class="text-gray-300 hover:text-secondary transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-secondary group-hover:text-orange-400 transition-colors"></i>
                الأسئلة الشائعة
              </a>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div class="space-y-4">
          <h4 class="text-lg font-bold text-white mb-4">معلومات الاتصال</h4>
          <div class="space-y-3">
            <div class="flex items-center space-x-3 space-x-reverse text-gray-300">
              <div class="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-phone text-white text-sm"></i>
              </div>
              <span class="text-sm">+213 123 456 789</span>
            </div>
            <div class="flex items-center space-x-3 space-x-reverse text-gray-300">
              <div class="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-envelope text-white text-sm"></i>
              </div>
              <span class="text-sm">info@koulchi.dz</span>
            </div>
            <div class="flex items-center space-x-3 space-x-reverse text-gray-300">
              <div class="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-map-marker-alt text-white text-sm"></i>
              </div>
              <span class="text-sm">الجزائر العاصمة</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-gray-700 mt-8 pt-6">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p class="text-gray-400 text-sm">
            © 2024 كولشي. جميع الحقوق محفوظة.
          </p>
          <div class="flex items-center space-x-6 space-x-reverse">
            <div class="bg-primary text-white rounded-lg px-4 py-2 shadow-soft">
              <span class="font-bold text-sm">COD</span>
              <span class="text-xs opacity-90 block">Cash on Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script> 