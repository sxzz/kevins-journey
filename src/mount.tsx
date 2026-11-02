import { render } from '@solidjs/web'
import { App } from './App'
import 'uno.css'

export interface MountOptions {
  /** Mapbox access token. */
  token: string
}

/**
 * Renders the map into `container`, which should have a definite size.
 * Dark mode follows the `dark` class on `<html>`.
 * Returns a function that unmounts it.
 */
export function mount(container: HTMLElement, options: MountOptions) {
  return render(() => <App token={options.token} />, container)
}
