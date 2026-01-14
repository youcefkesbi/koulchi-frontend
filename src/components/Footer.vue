<template>
  <footer class="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white shadow-2xl">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-8">
        <!-- Company Info -->
        <div class="space-y-4">
          <Logo variant="footer" size="large" />
          <p class="text-primary-100 leading-relaxed text-xs sm:text-sm">
            {{ $t('footer.description') }}
          </p>
          <div class="flex space-x-3 sm:space-x-4 space-x-reverse">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
              <i class="fab fa-facebook-f text-white text-sm sm:text-base"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
              <i class="fab fa-instagram text-white text-sm sm:text-base"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-110">
              <i class="fab fa-linkedin-in text-white text-sm sm:text-base"></i>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="space-y-3 sm:space-y-4">
          <h4 class="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">{{ $t('footer.quickLinks') }}</h4>
          <ul class="space-y-3">
            <li>
              <router-link :to="getLocalizedPath('/products')" class="text-primary-100 hover:text-white transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-primary group-hover:text-accent transition-colors"></i>
                {{ t('footer.products') }}
              </router-link>
            </li>
            <li>
              <router-link :to="getLocalizedPath('/about')" class="text-primary-100 hover:text-white transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-primary group-hover:text-accent transition-colors"></i>
                {{ t('footer.aboutUs') }}
              </router-link>
            </li>
            <li>
              <router-link :to="getLocalizedPath('/contact')" class="text-primary-100 hover:text-white transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-primary group-hover:text-accent transition-colors"></i>
                {{ t('footer.contactUs') }}
              </router-link>
            </li>
            <li>
              <router-link :to="getLocalizedPath('/help')" class="text-primary-100 hover:text-white transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-primary group-hover:text-accent transition-colors"></i>
                {{ t('footer.help') }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Customer Service -->
        <div class="space-y-3 sm:space-y-4">
          <h4 class="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">{{ t('footer.customerService') }}</h4>
          <ul class="space-y-3">
            <li>
              <router-link :to="getLocalizedPath('/return-policy')" class="text-primary-100 hover:text-white transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-secondary group-hover:text-primary transition-colors"></i>
                {{ t('footer.returnPolicy') }}
              </router-link>
            </li>
            <li>
              <router-link :to="getLocalizedPath('/terms')" class="text-primary-100 hover:text-white transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-secondary group-hover:text-primary transition-colors"></i>
                {{ t('footer.termsOfUse') }}
              </router-link>
            </li>
            <li>
              <router-link :to="getLocalizedPath('/privacy')" class="text-primary-100 hover:text-white transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-secondary group-hover:text-primary transition-colors"></i>
                {{ t('footer.privacyPolicy') }}
              </router-link>
            </li>
            <li>
              <router-link :to="getLocalizedPath('/faq')" class="text-primary-100 hover:text-white transition-colors duration-300 flex items-center group">
                <i class="fas fa-chevron-left ml-2 text-secondary group-hover:text-primary transition-colors"></i>
                {{ t('footer.faq') }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div class="space-y-3 sm:space-y-4">
          <h4 class="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">{{ t('footer.contactInfo') }}</h4>
          <div class="space-y-3">
            <div class="flex items-center space-x-3 space-x-reverse text-primary-100">
              <div class="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-envelope text-white text-sm"></i>
              </div>
              <span class="text-sm">contact@koulchi.site</span>
            </div>
            <div class="flex items-center space-x-3 space-x-reverse text-primary-100">
              <div class="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <i class="fas fa-map-marker-alt text-white text-sm"></i>
              </div>
              <span class="text-sm">{{ t('footer.address') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="border-t border-green-600 mt-4 sm:mt-6 lg:mt-8 pt-4 sm:pt-5 lg:pt-6">
        <div class="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 text-center sm:text-left">
          <p class="text-primary-100 text-xs sm:text-sm">
            {{ t('footer.copyright') }}
          </p>
          <div class="flex items-center justify-center sm:justify-end space-x-4 sm:space-x-6 space-x-reverse">
            <div class="bg-primary text-white rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 shadow-soft">
              <span class="font-bold text-xs sm:text-sm">{{ t('footer.cod') }}</span>
              <span class="text-xs opacity-90 block">{{ t('footer.cashOnDelivery') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useLocaleRouter } from '../composables/useLocaleRouter'
import Logo from './Logo.vue'

const { t } = useI18n()
const { getLocalizedPath } = useLocaleRouter()
</script> 