import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import UnoCSS from 'unocss/vite'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'pixi-painter': path.resolve(__dirname, '../../packages/pixi-painter/src'),
    },
  },

  plugins: [
    react(),

    UnoCSS(),
  ],
})
