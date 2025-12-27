import MapboxLanguage from '@mapbox/mapbox-gl-language'
import mapboxgl, {
  Map,
  Marker,
  Popup,
  type ProjectionSpecification,
} from 'mapbox-gl'
import {
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  type Accessor,
} from 'solid-js'
import { effect } from 'solid-js/web'
import { useDark } from './utils'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Place {
  label: string
  coords: [number, number] | `${number},${number}`
  current?: boolean
}
export type MapData = {
  id: string
  color: string
  label: string
  places: Place[]
}[]

export function useMap(
  container: HTMLElement,
  projection?: Accessor<ProjectionSpecification['name']>,
) {
  const [dark] = useDark()
  const style = createMemo(
    () => `mapbox://styles/mapbox/${dark() ? 'dark' : 'light'}-v10`,
  )

  const [map, setMap] = createSignal<Map>()
  onMount(() => {
    setMap(initMap())
  })

  onCleanup(() => {
    map()?.remove()
  })

  effect(() => {
    map()?.setStyle(style())
  })

  effect(() => {
    if (projection && map()) {
      map()!.setProjection(projection())
    }
  })

  return map

  function initMap() {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

    const map = new Map({
      container,
      style: style(),
      center: [100, 30],
      zoom: 2,
      projection: (projection?.() || 'globe') as any,
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

    return map
  }
}

// @unocss-include
export function PlaceMarker({
  map,
  color,
  place,
}: {
  map: Map
  color: string
  place: Place
}) {
  const { label, coords, current } = place

  const show = () => popup.setLngLat(pos).addTo(map)
  const hide = () => popup.remove()

  const element = (
    <div
      class="h-2.5 w-2.5 cursor-pointer border border-white rounded-full bg-[var(--dot-color)] shadow-[0_4px_4px_var(--dot-color)] hover:shadow-[0_8px_24px_var(--dot-color)] hover:brightness-75"
      classList={{
        'w-4 h-4': current,
      }}
      style={{ '--dot-color': color }}
      aria-label={label}
      tabIndex={0}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={(evt) => {
        evt.stopPropagation()
        show()
      }}
    />
  ) as HTMLDivElement

  const pos =
    typeof coords === 'string'
      ? (coords.split(',').map(Number).toReversed() as [number, number])
      : coords

  const marker = new Marker({ element, anchor: 'center' })
    .setLngLat(pos)
    .addTo(map)

  const popup = new Popup({
    offset: 8,
    closeButton: false,
    closeOnMove: false,
    focusAfterOpen: false,
  }).setText(label)

  map.on('click', hide)
  onCleanup(() => {
    marker.remove()
  })

  return null
}
