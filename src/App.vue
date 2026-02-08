<script setup lang="ts" vapor>
import { useLocalStorage } from '@vueuse/core'
import { computed, reactive, ref } from 'vue'
import data from '../data.yaml'
import LegendItem from './LegendItem.vue'
import MapBox from './MapBox.vue'
import PlaceMarker from './PlaceMarker.vue'
import type { Map, ProjectionSpecification } from 'mapbox-gl'

const activeLegends = reactive(new Set(['Visited', 'Stay', 'Residence']))
const projection = useLocalStorage<ProjectionSpecification['name']>(
  'mapbox-projection',
  'globe',
)

const filteredData = computed(() =>
  data.filter((item) => activeLegends.has(item.label)),
)

const coords = ref<GeolocationCoordinates>()
const locating = ref(false)
const map = ref<Map>()

function flyToLocation() {
  if (!coords.value) return
  map.value?.flyTo({
    center: [coords.value.longitude, coords.value.latitude],
    zoom: 12,
  })
}

function getCurrentPosition(
  options?: PositionOptions,
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

async function handleLocate() {
  locating.value = true
  const position = await getCurrentPosition({
    enableHighAccuracy: true,
  }).finally(() => (locating.value = false))
  coords.value = position.coords
  flyToLocation()
}
</script>

<template>
  <MapBox :projection="projection" @map-ready="(m) => (map = m)">
    <template v-for="item in filteredData" :key="item.label">
      <PlaceMarker
        v-for="place in item.places"
        :key="place.label"
        :color="item.color"
        :place="place"
      />
    </template>

    <PlaceMarker
      v-if="coords"
      color="oklch(62.3% 0.214 259.815)"
      :place="{
        label: 'You',
        coords: [coords.longitude, coords.latitude],
        current: true,
      }"
    />
  </MapBox>

  <div class="absolute bottom-6 right-6 flex flex-col items-end gap-3">
    <div class="flex gap3">
      <div
        class="flex items-center gap-3 rounded-full bg-white/20 px-3 py-2 text-sm text-#111827 shadow-lg backdrop-blur-md dark-text-#f9fafb"
      >
        <button
          class="flex cursor-pointer"
          :class="{ 'opacity-30': projection !== 'globe' }"
          @click="projection = 'globe'"
        >
          <span
            class="i-ph:globe-hemisphere-east-duotone text-xl"
            aria-label="Earth"
          />
        </button>
        <button
          class="flex cursor-pointer"
          :class="{ 'opacity-30': projection !== 'mercator' }"
          @click="projection = 'mercator'"
        >
          <span class="i-ph:map-trifold-duotone text-xl" aria-label="Map" />
        </button>
      </div>

      <div
        class="flex items-center gap-3 rounded-full bg-white/20 px-3 py-2 text-sm text-#111827 shadow-lg backdrop-blur-md dark-text-#f9fafb"
      >
        <button class="flex cursor-pointer" @click="handleLocate">
          <span
            class="i-ph:map-pin-duotone text-xl"
            :class="{ 'animate-pulse': locating }"
            aria-label="Locate me"
          />
        </button>
      </div>
    </div>

    <div
      class="max-w-[calc(100vw-3rem)] flex items-center gap-3 overflow-x-auto rounded-full bg-white/20 px-3 py-2 text-sm text-#111827 shadow-lg backdrop-blur-md dark-text-#f9fafb"
    >
      <LegendItem
        v-for="item in data"
        :key="item.label"
        :label="item.label"
        :color="item.color"
        :active="activeLegends.has(item.label)"
        @toggle="
          (value) => {
            if (value) activeLegends.add(item.label)
            else activeLegends.delete(item.label)
          }
        "
      />
    </div>
  </div>
</template>
