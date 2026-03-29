import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  optimizeDeps: {
    include: ['break_infinity.js']
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        help: 'help.html',
      }
    }
  }
})
