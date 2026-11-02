# Kevin's Journey

Kevin's travel journey visualized on a map.

## Development

Install dependencies with `pnpm install`, set `VITE_MAPBOX_TOKEN` in `.env.local`,
then run `pnpm dev`.

- `pnpm typecheck` checks the application and Vite configuration.
- `pnpm lint` checks code conventions.
- `pnpm format` formats the project.
- `pnpm build` creates the production site.

Travel data lives in `data.yaml`. The projection preference is saved in
`mapbox-projection`.

## Usage as a library

`pnpm build:lib` outputs `lib/mount.js` and `lib/style.css`. Call
`mount(container, { token, language? })` to render the map; dark mode follows
the `dark` class on `<html>`.

`style.css` contains unscoped UnoCSS utility classes (`.flex`, `.gap-3`, ...).
Import it into a cascade layer so it cannot override the host's own styles:

```css
@import 'kevins-journey/style.css' layer(kevins-journey);
```

The popup overrides for Mapbox's default styles use `!important`, so they still
win over `mapbox-gl.css` when the stylesheet is layered.

## Credits

From DIYgod's About page: https://diygod.cc/about/
