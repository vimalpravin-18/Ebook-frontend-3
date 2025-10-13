import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk - React and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Firebase chunk
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          // UI libraries chunk (if you have any)
          // 'ui-vendor': ['framer-motion', 'other-ui-lib']
        }
      }
    },
    chunkSizeWarningLimit: 1000 // Increase limit to 1000 KB (optional)
  }
})

