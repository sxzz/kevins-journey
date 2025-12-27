import data from '../data.yaml'
import { useMap } from './map'

export function App() {
  const container = (
    <div style={{ width: '100vw', height: '100vh' }}></div>
  ) as HTMLDivElement

  useMap(container, data as any)

  return (
    <>
      {container}
      <div class="mapbox-legend">
        <div class="mapbox-legend__item">
          <span
            class="mapbox-legend__dot mapbox-legend__dot--residence"
            aria-hidden="true"
          />
          <span>Lived</span>
        </div>
        <div class="mapbox-legend__item">
          <span
            class="mapbox-legend__dot mapbox-legend__dot--travel"
            aria-hidden="true"
          />
          <span>Traveled</span>
        </div>
      </div>
    </>
  )
}
