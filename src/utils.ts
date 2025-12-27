import { createSignal, onCleanup } from 'solid-js'

export function useDark() {
  const darkMedia = window.matchMedia('(prefers-color-scheme: dark)')
  const signal = createSignal(darkMedia.matches)

  const ac = new AbortController()
  darkMedia.addEventListener('change', (event) => signal[1](event.matches), {
    signal: ac.signal,
  })
  onCleanup(() => ac.abort())

  return signal
}
