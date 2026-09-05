import { createContext, useContext, type Accessor } from 'solid-js'
import type { Map } from 'mapbox-gl/esm'

export const MapContext = createContext<Accessor<Map | undefined>>()

export function useMap() {
  return useContext(MapContext)
}
