import { vi } from 'vitest'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

// Global test setup
const pinia = createPinia()
const router = createRouter({
  history: createMemoryHistory(),
  routes: []
})

// Make Pinia and Router available globally
global.pinia = pinia
global.router = router

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: { user: null, session: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: () => {} } } }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: null })) })) })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => Promise.resolve({ data: null, error: null })),
      delete: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }))
  }
}))

// Mock environment
vi.mock('../config/environment', () => ({
  environment: {
    supabase: {
      url: 'https://test.supabase.co',
      anonKey: 'test-key'
    },
    isDevelopment: true
  },
  validateEnvironment: vi.fn(() => true)
}))

// Mock i18n
vi.mock('../i18n', () => ({
  default: {
    global: {
      locale: { value: 'en' },
      t: vi.fn((key) => key)
    }
  },
  languages: {
    en: { name: 'English', dir: 'ltr', locale: 'en-US' },
    fr: { name: 'Français', dir: 'ltr', locale: 'fr-FR' },
    ar: { name: 'العربية', dir: 'rtl', locale: 'ar-DZ' }
  }
}))

// Mock router
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRoute: vi.fn(() => ({ params: {}, meta: {} })),
    useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() }))
  }
})
