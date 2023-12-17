import { pwa } from './config/pwa'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',

    '@advjs/blender-ui/nuxt',
  ],

  css: ['@unocss/reset/tailwind.css'],

  pwa,

  alias: {
    'pixi-painter': '../packages/pixi-painter/src/index.ts',
  },

  components: {
    dirs: [
      '~/components',
      {
        path: '../packages/controls/components',
        prefix: '',
      },
    ],
  },
})
