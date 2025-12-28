import MapboxLanguage from '@mapbox/mapbox-gl-language'
import { usePrefersDark } from '@solid-primitives/media'
import mapboxgl, {
  Map,
  Marker,
  Popup,
  type ProjectionSpecification,
} from 'mapbox-gl'
import {
  createContext,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
  useContext,
  type Accessor,
  type JSX,
} from 'solid-js'
import { effect } from 'solid-js/web'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Place {
  label: string
  coords: [number, number] | `${number},${number}`
  current?: boolean
}
export type MapData = {
  color: string
  label: string
  places: Place[]
}[]

export const MapContext = createContext<Accessor<Map>>()

export function MapBox(props: {
  projection: ProjectionSpecification['name']
  children: JSX.Element
}) {
  const dark = usePrefersDark()
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
    const m = map()
    const s = style()

    if (!m || !m.loaded()) return
    m.setStyle(s)
  })

  effect(() => {
    const m = map()
    const p = props.projection

    if (!m || !m.loaded()) return
    m.setProjection(p)
  })

  const container = (
    <div style={{ width: '100vw', height: '100vh' }}></div>
  ) as HTMLDivElement
  return (
    <>
      {container}
      <Show when={map()}>
        <MapContext.Provider value={map as Accessor<Map>}>
          {props.children}
        </MapContext.Provider>
      </Show>
    </>
  )

  function initMap() {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

    const map = new Map({
      container,
      style: style(),
      center: [100, 30],
      zoom: 2,
      projection: props.projection,
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

export function PlaceMarker({ color, place }: { color: string; place: Place }) {
  const { label, coords, current } = place

  const map = useContext(MapContext)?.()
  if (!map) {
    throw new Error('PlaceMarker must be used within a MapBox')
  }

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
