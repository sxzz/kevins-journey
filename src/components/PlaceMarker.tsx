import { Marker, Popup } from 'mapbox-gl/esm'
import { createEffect, createMemo } from 'solid-js'
import { useMap } from '../map-context'
import type { Place } from '../types'

interface PlaceMarkerProps {
  color: string
  place: Place
}

export function PlaceMarker(props: PlaceMarkerProps) {
  const map = useMap()
  const position = createMemo(() => {
    const coords = props.place.coords
    return typeof coords === 'string'
      ? (coords.split(',').map(Number).toReversed() as [number, number])
      : coords
  })
  let popup: Popup | undefined

  function show() {
    const instance = map()
    if (instance) popup?.setLngLat(position()).addTo(instance)
  }

  function hide() {
    popup?.remove()
  }

  const el = (
    <div
      class="group h-8 w-8 flex cursor-pointer items-center justify-center"
      aria-label={props.place.label}
      tabindex={0}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={(event) => {
        event.stopPropagation()
        show()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        event.stopPropagation()
        show()
      }}
    >
      <div
        class={[
          'pointer-events-none h-2.5 w-2.5 border border-white rounded-full bg-[var(--dot-color)] shadow-[0_2px_8px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] transition-shadow duration-200 group-hover:ring-4 transition-transform transition-400 group-hover:scale-140 group-hover:border-2',
          {
            'w-4 h-4 shadow-[0_3px_12px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.25),0_3px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.5)]':
              !!props.place.current,
          },
        ]}
        style={{ '--dot-color': props.color }}
        aria-hidden="true"
      />
    </div>
  ) as HTMLDivElement

  createEffect(
    () => ({
      map: map(),
      label: props.place.label,
      position: position(),
    }),
    ({ map, label, position }) => {
      if (!map) return
      popup = new Popup({
        offset: 8,
        closeButton: false,
        closeOnMove: false,
        focusAfterOpen: false,
      }).setText(label)

      const marker = new Marker({ element: el, anchor: 'center' })
        .setLngLat(position)
        .addTo(map)

      map.on('click', hide)
      return () => {
        hide()
        popup = undefined
        marker.remove()
        map.off('click', hide)
      }
    },
  )

  return null
}
