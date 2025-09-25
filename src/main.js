import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import i18n from './i18n'
import App from './App.vue'
import './style.css'
import { piniaPersist } from './plugins/piniaPersist.js'

// Error handling for app initialization
try {
  const app = createApp(App)
  const pinia = createPinia()

  // Use the persistence plugin
  pinia.use(piniaPersist)

  app.use(pinia)
  app.use(router)
  app.use(i18n)

  // Make i18n instance globally available
  app.config.globalProperties.$i18n = i18n.global

  // Initialize stores after Pinia is set up
  import { useAuthStore } from './stores/auth.js'

  const authStore = useAuthStore()

  // Initialize stores with error handling
  try {
    authStore.initAuth()
  } catch (error) {
    console.warn('Auth initialization failed:', error)
  }

  app.mount('#app')
} catch (error) {
  console.error('App initialization failed:', error)
  // Show a fallback message in the DOM
  document.getElementById('app').innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h1>App Loading Error</h1>
      <p>There was an error loading the application. Please check the console for details.</p>
      <p>Error: ${error.message}</p>
    </div>
  `
}
