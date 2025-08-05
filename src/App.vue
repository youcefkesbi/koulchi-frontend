<template>
  <div id="app" class="min-h-screen bg-light-gray" :dir="currentDir">
    <Header />
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    Header,
    Footer
  },
  setup() {
    const { locale } = useI18n()

    const currentDir = computed(() => {
      return locale.value === 'ar' ? 'rtl' : 'ltr'
    })

    return {
      currentDir
    }
  }
}
</script> 