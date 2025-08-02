import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    deliveryAddress: null,
    customerInfo: null
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    
    subtotal: (state) => state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    
    deliveryFee: (state) => {
      // Algerian delivery fees based on wilaya (province)
      const baseFee = 500 // 500 DZD base delivery fee
      return baseFee
    },
    
    total: (state, getters) => getters.subtotal + getters.deliveryFee,
    
    hasItems: (state) => state.items.length > 0
  },

  actions: {
    addToCart(product) {
      const existingItem = this.items.find(item => item.id === product.id)
      
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        this.items.push({
          id: product.id,
          name: product.name,
          nameAr: product.nameAr,
          price: product.price,
          image: product.image,
          quantity: 1
        })
      }
    },

    removeFromCart(productId) {
      const index = this.items.findIndex(item => item.id === productId)
      if (index > -1) {
        this.items.splice(index, 1)
      }
    },

    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.id === productId)
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(productId)
        } else {
          item.quantity = quantity
        }
      }
    },

    clearCart() {
      this.items = []
      this.deliveryAddress = null
      this.customerInfo = null
    },

    setDeliveryAddress(address) {
      this.deliveryAddress = address
    },

    setCustomerInfo(info) {
      this.customerInfo = info
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'koulchi-cart',
        storage: localStorage
      }
    ]
  }
}) 