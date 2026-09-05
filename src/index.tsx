import { render } from '@solidjs/web'
import { inject } from '@vercel/analytics'
import { App } from './App'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles.css'

inject()
render(() => <App />, document.querySelector('#root')!)
