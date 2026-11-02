import { defineConfig, presetIcons, presetWind3 } from 'unocss'

// Plain CSS lives here, not in a .css file, so the library ships one stylesheet.
const popupCss = `
.mapboxgl-ctrl-logo,
.mapboxgl-popup-tip {
  display: none !important;
}

.mapboxgl-popup * {
  pointer-events: none !important;
}

.mapboxgl-popup-content {
  padding: 0.25rem 0.375rem;
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1);
}

.dark .mapboxgl-popup-content {
  background-color: #1f2937;
  color: #f9fafb;
}
`

export default defineConfig({
  presets: [
    presetWind3({
      dark: 'class',
    }),
    presetIcons({
      scale: 1.2,
    }),
  ],
  preflights: [{ getCSS: () => popupCss }],
})
