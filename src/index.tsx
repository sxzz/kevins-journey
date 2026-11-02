import { inject } from '@vercel/analytics'
import { mount } from './mount'
import '@unocss/reset/tailwind.css'

// The map follows the `dark` class, so mirror the system preference onto it.
const media = matchMedia('(prefers-color-scheme: dark)')
const syncDark = () =>
  document.documentElement.classList.toggle('dark', media.matches)
syncDark()
media.addEventListener('change', syncDark)

inject()
mount(document.querySelector('#root')!, {
  token: import.meta.env.VITE_MAPBOX_TOKEN,
})
