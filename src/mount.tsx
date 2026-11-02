import { render } from '@solidjs/web'
import { App } from './App'
import { detectLanguage, type Language } from './i18n'
import 'uno.css'

export interface MountOptions {
  /** Mapbox access token. */
  token: string
  /**
   * Interface and map language. Defaults to the browser language,
   * falling back to English.
   */
  language?: Language
}

/**
 * Renders the map into `container`, which should have a definite size.
 * Dark mode follows the `dark` class on `<html>`.
 * Returns a function that unmounts it.
 */
export type { Language }

export function mount(container: HTMLElement, options: MountOptions) {
  return render(
    () => (
      <App
        token={options.token}
        language={options.language ?? detectLanguage()}
      />
    ),
    container,
  )
}
