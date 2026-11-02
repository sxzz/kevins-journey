import { defineConfig } from 'tsdown'
import UnoCSS from 'unocss/rolldown'
import Solid from 'unplugin-solid/rolldown'
import Yaml from 'unplugin-yaml/rolldown'

export default defineConfig({
  entry: ['src/mount.tsx'],
  platform: 'browser',
  tsconfig: 'tsconfig.app.json',
  outDir: 'lib',
  dts: true,
  plugins: [UnoCSS(), Solid(), Yaml()],
  // Keep the stylesheet name stable so consumers can import it.
  outputOptions: { assetFileNames: 'style.css' },
})
