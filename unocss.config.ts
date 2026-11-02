import { defineConfig, presetIcons, presetWind3 } from 'unocss'

// Plain CSS lives here, not in a .css file, so the library ships one stylesheet.
// `color-scheme` darkens the page canvas that shows around the globe; a `dark:`
// utility cannot do that because it never matches the `.dark` element itself.
// The popup overrides use `!important` because mapbox-gl.css is imported unlayered;
// a host that wraps style.css in a cascade layer would otherwise lose to it, as
// unlayered normal declarations beat layered ones. For `!important`, layered wins.
const popupCss = `
.mapboxgl-ctrl-logo,
.mapboxgl-popup-tip {
  display: none !important;
}

.mapboxgl-popup * {
  pointer-events: none !important;
}

.mapboxgl-popup-content {
  padding: 0.25rem 0.375rem !important;
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
}

.dark {
  color-scheme: dark;
}

.dark .mapboxgl-popup-content {
  background-color: #1f2937 !important;
  color: #f9fafb !important;
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
