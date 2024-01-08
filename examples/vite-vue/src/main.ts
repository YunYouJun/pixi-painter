import { createApp } from 'vue'
import App from './App.vue'

import '@unocss/reset/tailwind.css'
import './styles/main.css'
import 'uno.css'

import '@advjs/gui/client/styles/index.scss'
import '@advjs/gui/client/styles/css-vars.scss'

createApp(App).mount('#app')
