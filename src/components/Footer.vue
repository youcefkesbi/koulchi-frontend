<template>
  <footer class="bg-dark text-white mt-16">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Company Info -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-3 space-x-reverse mb-4">
            <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <i class="fas fa-shopping-bag text-white"></i>
            </div>
            <div>
              <h3 class="text-xl font-bold">كولشي</h3>
              <p class="text-sm text-gray-300">Koulchi</p>
            </div>
          </div>
          <p class="text-gray-300 mb-4">
            {{ $t('footer.description') }}
          </p>
          <div class="flex space-x-4 space-x-reverse">
            <a href="#" class="text-gray-300 hover:text-primary transition-colors">
              <i class="fab fa-facebook text-xl"></i>
            </a>
            <a href="#" class="text-gray-300 hover:text-primary transition-colors">
              <i class="fab fa-instagram text-xl"></i>
            </a>
            <a href="#" class="text-gray-300 hover:text-primary transition-colors">
              <i class="fab fa-twitter text-xl"></i>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-lg font-semibold mb-4">{{ $t('footer.quickLinks') }}</h4>
          <ul class="space-y-2">
            <li><router-link to="/" class="text-gray-300 hover:text-white transition-colors">{{ $t('navigation.home') }}</router-link></li>
            <li><router-link to="/products" class="text-gray-300 hover:text-white transition-colors">{{ $t('navigation.products') }}</router-link></li>
            <li><a href="#" class="text-gray-300 hover:text-white transition-colors">{{ $t('footer.aboutUs') }}</a></li>
            <li><a href="#" class="text-gray-300 hover:text-white transition-colors">{{ $t('footer.privacyPolicy') }}</a></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h4 class="text-lg font-semibold mb-4">{{ $t('footer.contactInfo') }}</h4>
          <div class="space-y-3">
            <div class="flex items-center space-x-3 space-x-reverse">
              <i class="fas fa-map-marker-alt text-primary"></i>
              <span class="text-gray-300">{{ $t('footer.address') }}</span>
            </div>
            <div class="flex items-center space-x-3 space-x-reverse">
              <i class="fas fa-phone text-primary"></i>
              <span class="text-gray-300">+213 123 456 789</span>
            </div>
            <div class="flex items-center space-x-3 space-x-reverse">
              <i class="fas fa-envelope text-primary"></i>
              <span class="text-gray-300">info@koulchi.dz</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Methods -->
      <div class="border-t border-gray-700 mt-8 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0">
            <h5 class="text-sm font-semibold mb-2">{{ $t('footer.acceptedPaymentMethods') }}</h5>
            <div class="flex items-center space-x-4 space-x-reverse">
              <div class="bg-white rounded-lg px-3 py-2">
                <span class="text-dark font-bold text-sm">{{ $t('product.cod') }}</span>
              </div>
            </div>
          </div>
          <div class="text-center md:text-right">
            <p class="text-gray-300 text-sm">
              {{ $t('footer.allPricesInDZD') }}
            </p>
            <p class="text-gray-400 text-xs mt-1">
              {{ $t('footer.copyright') }}
            </p>
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