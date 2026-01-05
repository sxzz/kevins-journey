import { createResource, type Accessor } from 'solid-js'

export function createGeolocation(options: Accessor<false | PositionOptions>) {
  const [location, { refetch }] = createResource(
    options,
    (options) =>
      new Promise<GeolocationCoordinates>((resolve, reject) => {
        if (!('geolocation' in navigator)) {
          return reject('Geolocation is not supported.')
        }
        navigator.geolocation.getCurrentPosition(
          (res) => resolve(res.coords),
          (error) => reject(Object.assign(new Error(error.message), error)),
          options,
        )
      }),
  )
  return [location, refetch] as const
}
