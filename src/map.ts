import mapboxgl, { type Map } from 'mapbox-gl'
import MapboxLanguage from '@mapbox/mapbox-gl-language'
import 'mapbox-gl/dist/mapbox-gl.css'
import { createMemo, onCleanup, onMount } from 'solid-js'
import { useDark } from './utils'
import { effect } from 'solid-js/web'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Item {
  name: string
  coords: [number, number] | `${number},${number}`
  current?: boolean
}
export type MapData = Record<string, Item[]>

export function useMap(container: HTMLElement, data: MapData) {
  const [dark] = useDark()
  const style = createMemo(
    () => `mapbox://styles/mapbox/${dark() ? 'dark' : 'light'}-v10`,
  )

  let map: Map
  onMount(() => {
    map = initMap(container, style(), data)
  })

  onCleanup(() => {
    map.remove()
  })

  effect(() => {
    const _style = style()
    map?.setStyle(_style)
  })
}

export function initMap(container: HTMLElement, style: string, data: MapData) {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

  const map = new mapboxgl.Map({
    container,
    style,
    center: [100, 30],
    zoom: 2,
    projection: 'globe',
    dragRotate: true,
    touchPitch: true,
    attributionControl: false,
  })

  map.addControl(
    new MapboxLanguage({
      defaultLanguage: {
        'zh-cn': 'zh-Hans',
        'zh-hk': 'zh-Hant',
        'zh-tw': 'zh-Hant',
      }[navigator.language.toLowerCase()],
    }),
  )

  map.on('style.load', () => {
    map.setFog({
      color: 'rgba(0,0,0,0)',
      'high-color': 'rgba(255,255,255,0.1)',
      'space-color': 'rgba(0,0,0,0)',
      'horizon-blend': 0,
    })
  })

  for (const [key, locations] of Object.entries(data)) {
    for (const { name, coords, current } of locations) {
      const div = document.createElement('div')
      div.className = `mapbox-marker mapbox-marker--${key} ${
        current ? 'animate-pulse' : ''
      }`
      div.setAttribute('aria-label', name)
      div.tabIndex = 0
      const popup = new mapboxgl.Popup({
        offset: 8,
        closeButton: false,
        closeOnMove: false,
        focusAfterOpen: false,
      }).setText(name)

      const pos =
        typeof coords === 'string'
          ? (coords.split(',').map(Number).reverse() as [number, number])
          : coords

      new mapboxgl.Marker({
        element: div,
        anchor: 'center',
      })
        .setLngLat(pos)
        .addTo(map)
      const show = () => popup.setLngLat(pos).addTo(map)
      const hide = () => popup.remove()
      div.addEventListener('mouseenter', show)
      div.addEventListener('mouseleave', hide)
      div.addEventListener('focus', show)
      div.addEventListener('blur', hide)
      div.addEventListener('click', (evt) => {
        evt.stopPropagation()
        show()
      })
      map.on('click', hide)
    }
  }

  return map
}
