/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#10B981',      // Beautiful emerald green
        'primary-dark': '#059669', // Darker green
        'primary-light': '#34D399', // Light green
        'secondary': '#F97316',    // Vibrant orange
        'secondary-dark': '#EA580C', // Darker orange
        'secondary-light': '#FB923C', // Light orange
        'accent': '#F59E0B',       // Golden accent
        'accent-dark': '#D97706',   // Darker gold
        'accent-light': '#FBBF24',  // Light gold
        'dark': '#1F2937',         // Dark gray
        'light-gray': '#F8FAFC',   // Light gray
        'success': '#10B981',      // Green for success
        'warning': '#F59E0B',      // Yellow for warnings
        'error': '#EF4444',        // Red for errors
        'info': '#3B82F6'          // Blue for info
      },
      fontFamily: {
        'arabic': ['Noto Sans Arabic', 'sans-serif'],
        'french': ['Inter', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.3)'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideInFromBottom: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-5px) scale(1.02)' }
        }
      }
    },
  },
  plugins: [],
} 