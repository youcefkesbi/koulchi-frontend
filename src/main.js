import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import i18n from './i18n'
import App from './App.vue'
import './style.css'
import { getBestLocale, setLocale } from './lib/i18n-utils'

// Initialize language before creating the app
const initialLocale = getBestLocale()
setLocale(initialLocale)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app') 