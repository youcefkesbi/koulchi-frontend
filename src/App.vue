<template>
  <div 
    id="app" 
    :dir="currentDir"
    :lang="currentLocale"
    class="min-h-screen bg-gradient-to-br from-light-gray to-white"
  >
    <Header />
    <main class="flex-1">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue'
import { useAuthStore } from './stores/auth'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    Header,
    Footer
  },
  setup() {
    const authStore = useAuthStore()
    
    onMounted(() => {
      authStore.initAuth()
    })
    
    onUnmounted(() => {
      authStore.cleanup()
    })
  }
}
</script>

<style>
/* Custom scrollbar with green theme */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100;
}

::-webkit-scrollbar-thumb {
  @apply bg-primary rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-primary-dark;
}

/* Smooth transitions */
* {
  transition: all 0.2s ease-in-out;
}

/* Custom animations */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}

.bounce-gentle {
  animation: bounceGentle 2s infinite;
}

/* Keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    transform: translateY(20px); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

@keyframes bounceGentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style> 