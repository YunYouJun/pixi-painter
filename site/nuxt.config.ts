import { pwa } from './config/pwa'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: [
    'nuxt-security',

    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',

    '@advjs/gui/nuxt',
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

  security: {
    corsHandler: {
      origin: '*',
    },
  },
})
