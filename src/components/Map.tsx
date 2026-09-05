import MapboxLanguage from '@mapbox/mapbox-gl-language'
import {
  Map as MapboxMap,
  setAccessToken,
  type IControl,
  type ProjectionSpecification,
} from 'mapbox-gl/esm'
import {
  createEffect,
  createMemo,
  createSignal,
  onSettled,
  Show,
  untrack,
  type ParentProps,
} from 'solid-js'
import { MapContext } from '../map-context'
import { createDarkMode } from '../preferences'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapProps {
  projection: ProjectionSpecification['name']
  onMapReady: (map: MapboxMap) => void
}

export function Map(props: ParentProps<MapProps>) {
  const dark = createDarkMode()
  const style = createMemo(
    () => `mapbox://styles/mapbox/${dark() ? 'dark' : 'light'}-v10`,
  )
  const [map, setMap] = createSignal<MapboxMap>()
  const [loaded, setLoaded] = createSignal(false)
  let container!: HTMLDivElement
  let appliedStyle: string

  onSettled(() => {
    setAccessToken(import.meta.env.VITE_MAPBOX_TOKEN)
    appliedStyle = untrack(style)
    const instance = new MapboxMap({
      container,
      style: appliedStyle,
      center: [100, 30],
      zoom: 2,
      projection: untrack(() => props.projection),
      dragRotate: true,
      touchPitch: true,
      attributionControl: false,
    })

    instance.on('load', () => {
      instance.zoomIn()
      setLoaded(true)
      props.onMapReady(instance)
    })

    instance.on('style.load', () => {
      instance.setFog({
        color: 'rgba(0,0,0,0)',
        'high-color': 'rgba(255,255,255,0.1)',
        'space-color': 'rgba(0,0,0,0)',
        'horizon-blend': 0,
      })
      instance.setProjection(props.projection)
    })

    // Apply fog before the language control can replace the loaded style.
    instance.addControl(
      new MapboxLanguage({
        defaultLanguage: {
          'zh-cn': 'zh-Hans',
          'zh-hk': 'zh-Hant',
          'zh-tw': 'zh-Hant',
        }[navigator.language.toLowerCase()],
      }) as unknown as IControl,
    )

    setMap(instance)
    return () => instance.remove()
  })

  createEffect(
    () => ({ map: map(), loaded: loaded(), style: style() }),
    ({ map, loaded, style }) => {
      if (!loaded || !map || style === appliedStyle) return
      appliedStyle = style
      map.setStyle(style)
    },
  )

  createEffect(
    () => ({ map: map(), loaded: loaded(), projection: props.projection }),
    ({ map, loaded, projection }) => {
      if (loaded) map?.setProjection(projection)
    },
  )

  return (
    <MapContext value={map}>
      <div
        ref={(element) => (container = element)}
        style={{ width: '100vw', height: '100vh' }}
      />
      <Show when={loaded()}>{props.children}</Show>
    </MapContext>
  )
}
