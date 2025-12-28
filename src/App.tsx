import { ReactiveSet } from '@solid-primitives/set'
import { makePersisted } from '@solid-primitives/storage'
import { createDeferred, createSignal, For, Index } from 'solid-js'
import data from '../data.yaml'
import { MapBox, PlaceMarker } from './Map'
import type { ProjectionSpecification } from 'mapbox-gl'

export function App() {
  const activeLegends = new ReactiveSet<string>(['Visited', 'Residence'])
  const [projection, setProjection] = makePersisted(
    createSignal<ProjectionSpecification['name']>('globe'),
    { name: 'map-projection' },
  )

  const filteredData = createDeferred(() =>
    data.filter((item) => activeLegends.has(item.label)),
  )

  return (
    <>
      <MapBox projection={projection()}>
        <For each={filteredData()}>
          {(item) => (
            <For each={item.places}>
              {(place) => <PlaceMarker color={item.color} place={place} />}
            </For>
          )}
        </For>
      </MapBox>

      <div class="absolute bottom-6 right-6 flex flex-col items-end gap-3">
        <div class="flex items-center gap-3 rounded-full bg-white/20 px-3 py-2 text-sm text-#111827 shadow-lg backdrop-blur-md dark-text-#f9fafb">
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
  const [isActive, setIsActive] = createSignal(!!props.active)
  function onClick() {
    const newValue = !isActive()
    setIsActive(newValue)
    props.onToggle?.(newValue)
  }

  return (
    <div
      class="flex cursor-pointer items-center gap-1.4 whitespace-nowrap"
      classList={{ 'opacity-30': !isActive() }}
      onClick={onClick}
    >
      <span
        class="h-2.5 w-2.5 border-1 border-white rounded-full"
        style={{ background: props.color }}
        aria-hidden="true"
      />
      <span>{props.label}</span>
    </div>
  )
}
