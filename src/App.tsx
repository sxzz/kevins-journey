import { ReactiveSet } from '@solid-primitives/set'
import { makePersisted } from '@solid-primitives/storage'
import {
  createDeferred,
  createEffect,
  createSignal,
  For,
  Index,
  Show,
} from 'solid-js'
import data from '../data.yaml'
import { MapBox, PlaceMarker } from './Map'
import { createGeolocation } from './utils/location'
import type { ProjectionSpecification } from 'mapbox-gl'

export function App() {
  const activeLegends = new ReactiveSet<string>([
    'Visited',
    'Stay',
    'Residence',
  ])
  const [projection, setProjection] = makePersisted(
    // eslint-disable-next-line solid/reactivity
    createSignal<ProjectionSpecification['name']>('globe'),
    { name: 'map-projection' },
  )

  const filteredData = createDeferred(() =>
    data.filter((item) => activeLegends.has(item.label)),
  )

  const [locate, setLocate] = createSignal(false)
  const [location, reLocate] = createGeolocation(() =>
    locate() ? { enableHighAccuracy: true } : false,
  )

  const [map, setMap] = createSignal<mapboxgl.Map>()

  function flyToLocation() {
    const m = map()
    const pos = location()
    if (!m || !pos) return

    m.flyTo({
      center: [pos.longitude, pos.latitude],
      zoom: 12,
    })
  }
  createEffect(() => flyToLocation())

  return (
    <>
      <MapBox projection={projection()} onMapReady={(map) => setMap(map)}>
        <For each={filteredData()}>
          {(item) => (
            <For each={item.places}>
              {(place) => <PlaceMarker color={item.color} place={place} />}
            </For>
          )}
        </For>

        <Show when={location()}>
          {(location) => (
            <PlaceMarker
              color="oklch(62.3% 0.214 259.815)"
              place={{
                label: 'You',
                coords: [location().longitude, location().latitude],
                current: true,
              }}
            />
          )}
        </Show>
      </MapBox>

      <div class="absolute bottom-6 right-6 flex flex-col items-end gap-3">
        <div class="flex gap3">
          <div class="flex items-center gap-3 rounded-full bg-white/20 px-3 py-2 text-sm text-#111827 shadow-lg backdrop-blur-md dark-text-#f9fafb">
            <button
              class="flex cursor-pointer"
              classList={{ 'opacity-30': projection() !== 'globe' }}
              onClick={() => setProjection('globe')}
            >
              <span
                class="i-ph:globe-hemisphere-east-duotone text-xl"
                aria-label="Earth"
              />
            </button>
            <button
              class="flex cursor-pointer"
              classList={{ 'opacity-30': projection() !== 'mercator' }}
              onClick={() => setProjection('mercator')}
            >
              <span class="i-ph:map-trifold-duotone text-xl" aria-label="Map" />
            </button>
          </div>

          <div class="flex items-center gap-3 rounded-full bg-white/20 px-3 py-2 text-sm text-#111827 shadow-lg backdrop-blur-md dark-text-#f9fafb">
            <button
              class="flex cursor-pointer"
              onClick={() => {
                setLocate(true)
                reLocate()
                flyToLocation()
              }}
            >
              <span
                class="i-ph:map-pin-duotone text-xl"
                classList={{ 'animate-pulse': location.state === 'pending' }}
                aria-label="Locate me"
              />
            </button>
          </div>
        </div>

        <div class="max-w-[calc(100vw-3rem)] flex items-center gap-3 overflow-x-auto rounded-full bg-white/20 px-3 py-2 text-sm text-#111827 shadow-lg backdrop-blur-md dark-text-#f9fafb">
          <Index each={data}>
            {(item) => (
              <LegendItem
                label={item().label}
                color={item().color}
                active={activeLegends.has(item().label)}
                onToggle={(value) => {
                  if (value) {
                    activeLegends.add(item().label)
                  } else {
                    activeLegends.delete(item().label)
                  }
                }}
              />
            )}
          </Index>
        </div>
      </div>
    </>
  )
}

export function LegendItem(props: {
  label: string
  color: string
  active?: boolean
  onToggle?: (value: boolean) => void
}) {
  function onClick() {
    props.onToggle?.(!props.active)
  }

  return (
    <div
      class="flex cursor-pointer items-center gap-1.4 whitespace-nowrap"
      classList={{ 'opacity-30': !props.active }}
      onClick={onClick}
    >
      <span
        class="h-2.5 w-2.5 border-2 border-white rounded-full shadow-[0_0_0_2px_#11182714] dark:shadow-[0_0_0_2px_#ffffff30]"
        style={{ background: props.color }}
        aria-hidden="true"
      />
      <span>{props.label}</span>
    </div>
  )
}
