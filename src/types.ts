export interface Place {
  label: string
  coords: [number, number] | `${number},${number}`
  current?: boolean
}

export type MapData = {
  color: string
  label: string
  places: Place[]
}[]
