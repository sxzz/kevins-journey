import { createEffect, createSignal, onSettled } from 'solid-js'

export function createStoredPreference<T extends string>(
  key: string,
  fallback: T,
  values: readonly T[],
) {
  const parse = (value: string | null): T =>
    values.includes(value as T) ? (value as T) : fallback

  const read = (): T => {
    try {
      return parse(localStorage.getItem(key))
    } catch {
      return fallback
    }
  }

  const [value, setValue] = createSignal<T>(() => read())

  createEffect(value, (value) => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Keep preferences usable when browser storage is unavailable.
    }
  })

  onSettled(() => {
    const onStorage = (event: StorageEvent) => {
      if (
        event.storageArea === localStorage &&
        (event.key === key || event.key === null)
      ) {
        setValue(() => parse(event.newValue))
      }
    }
    addEventListener('storage', onStorage)
    return () => removeEventListener('storage', onStorage)
  })

  return [value, setValue] as const
}

export function createDarkMode() {
  const media = matchMedia('(prefers-color-scheme: dark)')
  const [dark, setDark] = createSignal(media.matches)

  onSettled(() => {
    const onChange = (event: MediaQueryListEvent) => setDark(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  })

  return dark
}
