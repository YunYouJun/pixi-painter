import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import UnoCSS from 'unocss/vite'

// for windows
import { resolve } from 'pathe'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'pixi-painter': resolve(__dirname, '../../packages/pixi-painter/src/index.ts'),
    },
  },

  plugins: [
    react(),

    UnoCSS(),
  ],
})
