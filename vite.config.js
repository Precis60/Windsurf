import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['date-fns-tz'],
  },
  plugins: [react()],
  base: '/Windsurf/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and React Router
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Firebase chunk for all Firebase-related code
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
        },
      },
    },
    // Increase chunk size warning limit to 1000kb
    chunkSizeWarningLimit: 1000,
  },
})
