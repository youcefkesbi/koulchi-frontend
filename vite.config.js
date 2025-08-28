import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    server: {
      port: 3000,
      open: true,
      // Ensure environment variables are available in development
      env: env
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // Ensure environment variables are available in production build
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            supabase: ['@supabase/supabase-js']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    // Environment variable handling
    envPrefix: 'VITE_',
    // Ensure OAuth environment variables are available
    envDir: process.cwd(),
    // Load environment variables based on mode
    env: {
      // Development mode loads .env.local
      development: loadEnv('development', process.cwd(), ''),
      // Production mode loads .env
      production: loadEnv('production', process.cwd(), '')
    }
  }
}) 