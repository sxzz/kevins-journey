import { onCleanup, onMount } from 'solid-js'
import mapboxgl, { type Map } from 'mapbox-gl'
import MapboxLanguage from '@mapbox/mapbox-gl-language'
import 'mapbox-gl/dist/mapbox-gl.css'
import data from '../data.yaml'

interface Item {
  name: string
  coords: [number, number] | `${number},${number}`
}

mapboxgl.accessToken =
  'pk.eyJ1Ijoic3h6eiIsImEiOiJjbWpuMDlib2oxbmJzM2dweXRqeGFkOXo0In0.Lpjhw-do-fXE7crRESrEBg'

export function App() {
  const container = (
    <div id="map" style={{ width: '100vw', height: '100vh' }}></div>
  )

  let map: Map
  onMount(() => {
    map = new mapboxgl.Map({
      container: container as HTMLDivElement,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [100, 30],
      zoom: 2,
      projection: 'globe',
      dragRotate: true,
      touchPitch: true,
      attributionControl: false,
    })

    map.addControl(new MapboxLanguage({ defaultLanguage: 'zh-Hans' }))

    map.on('style.load', () => {
      map.setFog({
        color: 'rgba(0,0,0,0)',
        'high-color': 'rgba(255,255,255,0.1)',
        'space-color': 'rgba(0,0,0,0)',
        'horizon-blend': 0,
      })
    })

    for (const [key, locations] of Object.entries(data) as [string, Item[]][]) {
      for (const { name, coords } of locations) {
        const div = document.createElement('div')
        div.className = `mapbox-marker mapbox-marker--${key}`
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
  })

  onCleanup(() => {
    map.remove()
  })

  return (
    <>
      {container}
      <div class="mapbox-legend">
        <div class="mapbox-legend__item">
          <span
            class="mapbox-legend__dot mapbox-legend__dot--residence"
            aria-hidden="true"
          />
          <span>居住</span>
        </div>
        <div class="mapbox-legend__item">
          <span
            class="mapbox-legend__dot mapbox-legend__dot--travel"
            aria-hidden="true"
          />
          <span>旅行</span>
        </div>
      </div>
    </>
  )
}
