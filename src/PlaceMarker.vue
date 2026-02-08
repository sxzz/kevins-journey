<script setup lang="ts" vapor>
import { Marker, Popup, type Map } from 'mapbox-gl'
import { computed, inject, onUnmounted, watchEffect, type Ref } from 'vue'
import type { Place } from './types'

const props = defineProps<{
  color: string
  place: Place
}>()

const map = inject<Ref<Map>>('map')
if (!map?.value) {
  throw new Error('PlaceMarker must be used within a MapBox')
}
const mapInstance = map.value

const position = computed(() => {
  const { coords } = props.place
  return typeof coords === 'string'
    ? (coords.split(',').map(Number).toReversed() as [number, number])
    : coords
})

const el = document.createElement('div')
el.className = 'h-8 w-8 flex cursor-pointer items-center justify-center'
el.setAttribute('aria-label', props.place.label)
el.tabIndex = 0

const dot = document.createElement('div')
dot.className =
  'pointer-events-none h-2.5 w-2.5 border border-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.3)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.2),0_2px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.4)] hover:brightness-75'
if (props.place.current) {
  dot.className +=
    ' w-4 h-4 shadow-[0_3px_12px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.25),0_3px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.5)]'
}
dot.style.setProperty('--dot-color', props.color)
dot.classList.add('bg-[var(--dot-color)]')
dot.setAttribute('aria-hidden', 'true')
el.append(dot)

const popup = new Popup({
  offset: 8,
  closeButton: false,
  closeOnMove: false,
  focusAfterOpen: false,
})

const show = () => popup.setLngLat(position.value).addTo(mapInstance)
const hide = () => popup.remove()

el.addEventListener('mouseenter', show)
el.addEventListener('mouseleave', hide)
el.addEventListener('focus', show)
el.addEventListener('blur', hide)
el.addEventListener('click', (evt) => {
  evt.stopPropagation()
  show()
})
el.addEventListener('keydown', (evt) => {
  if (evt.key === 'Enter' || evt.key === ' ') {
    evt.stopPropagation()
    show()
  }
})

const marker = new Marker({ element: el, anchor: 'center' })

watchEffect(() => {
  marker.setLngLat(position.value).addTo(mapInstance)
})

watchEffect(() => {
  popup.setText(props.place.label)
})

mapInstance.on('click', hide)
onUnmounted(() => {
  marker.remove()
  mapInstance.off('click', hide)
})
</script>

<template>
  <div />
</template>
