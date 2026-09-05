import { createEffect, createMemo, createSignal, For, Show } from 'solid-js'
import data from '../data.yaml'
import { LegendItem } from './components/LegendItem'
import { Map } from './components/Map'
import { PlaceMarker } from './components/PlaceMarker'
import { createStoredPreference } from './preferences'
import type { Map as MapboxMap } from 'mapbox-gl/esm'

export function App() {
  const [activeLegends, setActiveLegends] = createSignal(
    new Set(['Visited', 'Stay', 'Residence']),
  )
  const [projection, setProjection] = createStoredPreference(
    'mapbox-projection',
    'globe',
    ['globe', 'mercator'] as const,
  )
  const filteredData = createMemo(() =>
    data.filter((item) => activeLegends().has(item.label)),
  )
  const [coords, setCoords] = createSignal<GeolocationCoordinates>()
  const [locating, setLocating] = createSignal(false)
  const [map, setMap] = createSignal<MapboxMap>()

  createEffect(
    () => ({ coords: coords(), map: map() }),
    ({ coords, map }) => {
      if (coords && map) {
        map.flyTo({
          center: [coords.longitude, coords.latitude],
          zoom: 12,
        })
      }
    },
  )

  function handleLocate() {
    setLocating(true)
    if (!navigator.geolocation) {
      setLocating(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords(position.coords)
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true },
    )
  }

  return (
    <>
      <Map projection={projection()} onMapReady={setMap}>
        <For each={filteredData()}>
          {(item) => (
            <For each={item.places}>
              {(place) => <PlaceMarker color={item.color} place={place} />}
            </For>
          )}
        </For>

        <Show when={coords()}>
          {(coords) => (
            <PlaceMarker
              color="oklch(62.3% 0.214 259.815)"
              place={{
                label: 'You',
                coords: [coords().longitude, coords().latitude],
                current: true,
              }}
            />
          )}
        </Show>
      </Map>

      <div class="absolute bottom-6 right-6 flex flex-col items-end gap-3">
        <div class="flex gap3">
          <div class="flex items-center gap-3 rounded-full bg-white/20 px-3 py-2 text-sm text-#111827 shadow-lg backdrop-blur-md dark-text-#f9fafb">
            <button
              class={[
                'flex cursor-pointer',
                { 'opacity-30': projection() !== 'globe' },
              ]}
              onClick={() => setProjection('globe')}
            >
              <span
                class="i-ph:globe-hemisphere-east-duotone text-xl"
                aria-label="Earth"
              />
            </button>
            <button
              class={[
                'flex cursor-pointer',
                { 'opacity-30': projection() !== 'mercator' },
              ]}
              onClick={() => setProjection('mercator')}
            >
              <span class="i-ph:map-trifold-duotone text-xl" aria-label="Map" />
            </button>
          </div>

          <div class="flex items-center gap-3 rounded-full bg-white/20 px-3 py-2 text-sm text-#111827 shadow-lg backdrop-blur-md dark-text-#f9fafb">
            <button class="flex cursor-pointer" onClick={handleLocate}>
              <span
                class={[
                  'i-ph:map-pin-duotone text-xl',
                  { 'animate-pulse': locating() },
                ]}
                aria-label="Locate me"
              />
            </button>
          </div>
        </div>

        <div class="max-w-[calc(100vw-3rem)] flex items-center gap-3 overflow-x-auto rounded-full bg-white/20 px-3 py-2 text-sm text-#111827 shadow-lg backdrop-blur-md dark-text-#f9fafb">
          <For each={data}>
            {(item) => (
              <LegendItem
                label={item.label}
                color={item.color}
                active={activeLegends().has(item.label)}
                onToggle={(active) => {
                  setActiveLegends((previous) => {
                    const next = new Set(previous)
                    if (active) next.add(item.label)
                    else next.delete(item.label)
                    return next
                  })
                }}
              />
            )}
          </For>
        </div>
      </div>
    </>
  )
}
