import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'

// Simple test component
const TestComponent = {
  template: '<div class="test-component">Test Component</div>',
  setup() {
    return {}
  }
}

describe('Vue 3 + Vite + TailwindCSS v4 Setup', () => {
  it('renders a simple component properly', () => {
    const pinia = createPinia()
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: TestComponent }
      ]
    })
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: { en: {} }
    })
    
    const wrapper = mount(TestComponent, {
      global: {
        plugins: [pinia, router, i18n]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('has the correct structure', () => {
    const pinia = createPinia()
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: TestComponent }
      ]
    })
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      messages: { en: {} }
    })
    
    const wrapper = mount(TestComponent, {
      global: {
        plugins: [pinia, router, i18n]
      }
    })
    expect(wrapper.find('.test-component').exists()).toBe(true)
    expect(wrapper.text()).toBe('Test Component')
  })
})
