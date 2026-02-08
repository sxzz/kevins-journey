declare module '*.yaml' {
  const value: import('./types').MapData
  export default value
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}
