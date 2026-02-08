<script setup lang="ts">
import MapboxLanguage from '@mapbox/mapbox-gl-language'
import { useDark } from '@vueuse/core'
import mapboxgl, { Map, type ProjectionSpecification } from 'mapbox-gl'
import {
  computed,
  onMounted,
  onUnmounted,
  provide,
  ref,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue'
import 'mapbox-gl/dist/mapbox-gl.css'

const props = defineProps<{
  projection: ProjectionSpecification['name']
}>()

const emit = defineEmits<{
  mapReady: [map: Map]
}>()

const dark = useDark()
const style = computed(
  () => `mapbox://styles/mapbox/${dark.value ? 'dark' : 'light'}-v10`,
)

const container = useTemplateRef<HTMLDivElement>('container')
const map = shallowRef<Map>()
const loaded = ref(false)

provide('map', map)

onMounted(() => {
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

  const instance = new Map({
    container: container.value!,
    style: style.value,
    center: [100, 30],
    zoom: 2,
    projection: props.projection,
    dragRotate: true,
    touchPitch: true,
    attributionControl: false,
  })

  instance.addControl(
    new MapboxLanguage({
      defaultLanguage: {
        'zh-cn': 'zh-Hans',
        'zh-hk': 'zh-Hant',
        'zh-tw': 'zh-Hant',
      }[navigator.language.toLowerCase()],
    }),
  )

  instance.on('load', () => {
    loaded.value = true
  })

  instance.on('style.load', () => {
    instance.setFog({
      color: 'rgba(0,0,0,0)',
      'high-color': 'rgba(255,255,255,0.1)',
      'space-color': 'rgba(0,0,0,0)',
      'horizon-blend': 0,
    })
  })

  map.value = instance
  emit('mapReady', instance)
})

onUnmounted(() => {
  map.value?.remove()
})

watch(style, () => {
  if (!loaded.value) return
  map.value?.setStyle(style.value)
})

watch(
  () => props.projection,
  (projection) => {
    if (!loaded.value) return
    map.value?.setProjection(projection)
  },
)
</script>

<template>
  <div ref="container" style="width: 100vw; height: 100vh" />
  <slot v-if="map" />
</template>
