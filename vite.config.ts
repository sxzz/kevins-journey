import Solid from '@solidjs/vite-plugin'
import UnoCSS from 'unocss/vite'
import Yaml from 'unplugin-yaml/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [UnoCSS(), Solid(), Yaml()],
  build: {
    minify: false,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'mapbox', test: /mapbox/ },
            { name: 'vendor', test: /node_modules/ },
          ],
        },
      },
    },
  },
})
