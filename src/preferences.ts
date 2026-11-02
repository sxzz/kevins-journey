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
  const root = document.documentElement
  const [dark, setDark] = createSignal(root.classList.contains('dark'))

  onSettled(() => {
    const observer = new MutationObserver(() =>
      setDark(root.classList.contains('dark')),
    )
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  })

  return dark
}
