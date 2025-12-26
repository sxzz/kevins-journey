import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import UnoCSS from 'unocss/vite'
import Yaml from 'unplugin-yaml/vite'

export default defineConfig({
  plugins: [solid(), UnoCSS(), Yaml()],
})
