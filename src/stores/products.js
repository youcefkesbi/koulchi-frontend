import { defineStore } from 'pinia'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [
      {
        id: 1,
        name: "Smartphone Samsung Galaxy A54",
        nameAr: "هاتف ذكي سامسونج جالكسي A54",
        price: 45000,
        originalPrice: 50000,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
        category: "electronics",
        description: "Latest Samsung smartphone with excellent camera and performance",
        descriptionAr: "أحدث هاتف سامسونج مع كاميرا ممتازة وأداء عالي",
        inStock: true,
        isNew: true,
        isOnSale: true,
        rating: 4.5,
        reviews: 128
      },
      {
        id: 2,
        name: "Traditional Algerian Dress",
        nameAr: "فستان جزائري تقليدي",
        price: 15000,
        originalPrice: 18000,
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
        category: "fashion",
        description: "Beautiful traditional Algerian dress for special occasions",
        descriptionAr: "فستان جزائري تقليدي جميل للمناسبات الخاصة",
        inStock: true,
        isNew: false,
        isOnSale: true,
        rating: 4.8,
        reviews: 89
      },
      {
        id: 3,
        name: "Coffee Maker",
        nameAr: "ماكينة قهوة",
        price: 8000,
        originalPrice: 8000,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
        category: "home",
        description: "Automatic coffee maker for perfect coffee every time",
        descriptionAr: "ماكينة قهوة أوتوماتيكية لقهوة مثالية في كل مرة",
        inStock: true,
        isNew: false,
        isOnSale: false,
        rating: 4.2,
        reviews: 156
      },
      {
        id: 4,
        name: "Algerian Dates - 1kg",
        nameAr: "تمر جزائري - 1 كيلو",
        price: 1200,
        originalPrice: 1200,
        image: "https://images.unsplash.com/photo-1603046891744-76e6300df9d9?w=400&h=400&fit=crop",
        category: "food",
        description: "Fresh Algerian dates, perfect for Ramadan and daily consumption",
        descriptionAr: "تمر جزائري طازج، مثالي لرمضان والاستهلاك اليومي",
        inStock: true,
        isNew: false,
        isOnSale: false,
        rating: 4.9,
        reviews: 234
      },
      {
        id: 5,
        name: "Gaming Headset",
        nameAr: "سماعات ألعاب",
        price: 12000,
        originalPrice: 15000,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        category: "electronics",
        description: "High-quality gaming headset with noise cancellation",
        descriptionAr: "سماعات ألعاب عالية الجودة مع إلغاء الضوضاء",
        inStock: true,
        isNew: true,
        isOnSale: true,
        rating: 4.3,
        reviews: 67
      },
      {
        id: 6,
        name: "Traditional Pottery Set",
        nameAr: "طقم فخار تقليدي",
        price: 3500,
        originalPrice: 4000,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
        category: "home",
        description: "Beautiful traditional Algerian pottery for home decoration",
        descriptionAr: "فخار جزائري تقليدي جميل لتزيين المنزل",
        inStock: true,
        isNew: false,
        isOnSale: true,
        rating: 4.6,
        reviews: 45
      }
    ],
    categories: [
      { id: 'all', name: 'All Products', nameFr:'Tous les produits', nameAr: 'جميع المنتجات' },
      { id: 'cars', name: 'Cars', nameAr: 'السيارات' },
      { id: 'realestate', name: 'Real Estate', nameAr: 'العقارات' },
      { id: 'electronics', name: 'Electronics', nameAr: 'الإلكترونيات' },
      { id: 'fashion', name: 'Fashion', nameAr: 'الموضة' },
      { id: 'home', name: 'Home & Kitchen', nameAr: 'المنزل والمطبخ' },
      { id: 'beauty', name: 'Beauty & Personal Care', nameAr: 'الجمال والرعاية الشخصية' },
      { id: 'kids', name: 'Kids', nameAr: 'الأطفال' },
      { id: 'food', name: 'Food & Beverages', nameAr: 'الطعام والمشروبات' }
    ],
    selectedCategory: 'all',
    searchQuery: ''
  }),

  getters: {
    filteredProducts: (state) => {
      let filtered = state.products

      // Filter by category
      if (state.selectedCategory !== 'all') {
        filtered = filtered.filter(product => product.category === state.selectedCategory)
      }

      // Filter by search query
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query) ||
          product.nameAr.includes(query) ||
          product.description.toLowerCase().includes(query)
        )
      }

      return filtered
    },

    newProducts: (state) => state.products.filter(product => product.isNew),
    
    saleProducts: (state) => state.products.filter(product => product.isOnSale),
    
    getProductById: (state) => (id) => state.products.find(product => product.id === id)
  },

  actions: {
    setCategory(category) {
      this.selectedCategory = category
    },

    setSearchQuery(query) {
      this.searchQuery = query
    },

    clearFilters() {
      this.selectedCategory = 'all'
      this.searchQuery = ''
    }
  }
}) 