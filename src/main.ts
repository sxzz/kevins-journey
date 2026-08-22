import { inject } from '@vercel/analytics'
import { createVaporApp } from 'vue'
import App from './App.vue'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles.css'

inject()
createVaporApp(App).mount('#root')
