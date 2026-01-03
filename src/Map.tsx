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
  createDeferred,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
  useContext,
  type Accessor,
  type JSX,
} from 'solid-js'
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

  createEffect(() => {
    const m = map()
    const s = style()

    if (!m || !m.loaded()) return
    m.setStyle(s)
  })

  createEffect(() => {
    const m = map()
    const p = props.projection

    if (!m || !m.loaded()) return
    m.setProjection(p)
  })

  const container = (
    <div style={{ width: '100vw', height: '100vh' }} />
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

export function PlaceMarker(props: { color: string; place: Place }) {
  const map = useContext(MapContext)?.()
  if (!map) {
    throw new Error('PlaceMarker must be used within a MapBox')
  }

  const show = () => popup.setLngLat(position()).addTo(map)
  const hide = () => popup.remove()

  const element = (
    <div
      class="h-8 w-8 flex cursor-pointer items-center justify-center"
      aria-label={props.place.label}
      tabIndex={0}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={(evt) => {
        evt.stopPropagation()
        show()
      }}
      onKeyDown={(evt) => {
        if (evt.key === 'Enter' || evt.key === ' ') {
          evt.stopPropagation()
          show()
        }
      }}
    >
      <div
        class="pointer-events-none h-2.5 w-2.5 border border-white rounded-full bg-[var(--dot-color)] shadow-[0_2px_8px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.2),0_2px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-75"
        classList={{
          'w-4 h-4 shadow-[0_3px_12px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.25),0_3px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.5)]':
            props.place.current,
        }}
        style={{ '--dot-color': props.color }}
        aria-hidden="true"
      />
    </div>
  ) as HTMLDivElement

  const marker = new Marker({ element, anchor: 'center' })
  const popup = new Popup({
    offset: 8,
    closeButton: false,
    closeOnMove: false,
    focusAfterOpen: false,
  })

  const position = createDeferred(() => {
    const { coords } = props.place
    return typeof coords === 'string'
      ? (coords.split(',').map(Number).toReversed() as [number, number])
      : coords
  })

  createEffect(() => {
    marker.setLngLat(position()).addTo(map)
  })

  createEffect(() => {
    popup.setText(props.place.label)
  })

  map.on('click', hide)
  onCleanup(() => {
    marker.remove()
    map.off('click', hide)
  })

  return null
}
