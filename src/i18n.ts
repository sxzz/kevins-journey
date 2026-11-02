import { createContext, useContext } from 'solid-js'

export type Language = 'en' | 'zh'

export const languages: readonly Language[] = ['en', 'zh']

/** Picks the closest supported language for a BCP 47 tag, defaulting to English. */
export function detectLanguage(tag = navigator.language): Language {
  return tag.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

const messages = {
  en: {
    globe: 'Earth',
    map: 'Map',
    locate: 'Locate me',
    you: 'You',
  },
  zh: {
    globe: '地球',
    map: '地图',
    locate: '定位到我',
    you: '你',
  },
} satisfies Record<Language, Record<string, string>>

export type MessageKey = keyof (typeof messages)['en']

/** Legend names are the `label` keys in `data.yaml`, which are written in English. */
const legendLabels: Record<Language, Record<string, string>> = {
  en: {},
  zh: {
    Visited: '去过',
    Stay: '住过',
    Residence: '居住',
    Airports: '机场',
    Wishlist: '想去',
  },
}

export interface I18n {
  language: Language
  t: (key: MessageKey) => string
  legend: (label: string) => string
}

export function createI18n(language: Language): I18n {
  return {
    language,
    t: (key) => messages[language][key],
    legend: (label) => legendLabels[language][label] ?? label,
  }
}

export const I18nContext = createContext<I18n>(createI18n('en'))

export function useI18n() {
  return useContext(I18nContext)
}
