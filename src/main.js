import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import i18n from './i18n'
import App from './App.vue'
import './style.css'

// Import environment utilities for development
import './utils/environment-test.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

// Make i18n instance globally available
app.config.globalProperties.$i18n = i18n.global

app.mount('#app') // Force deployment Sat Sep 13 09:29:46 CEST 2025
// Force deployment 1757751061
// Fix Git email configuration for Vercel deployment
