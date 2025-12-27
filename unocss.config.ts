import {
  defineConfig,
  presetIcons,
  presetWind3,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  presets: [
    presetWind3({
      dark: 'media',
    }),
    presetIcons({
      scale: 1.2,
    }),
  ],
  transformers: [transformerDirectives()],
})
