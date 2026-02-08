import Vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Yaml from 'unplugin-yaml/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [Vue(), UnoCSS(), Yaml()],
})
