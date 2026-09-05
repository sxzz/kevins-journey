# Kevin's Journey - AI Agent Guide

This documentation provides context, conventions, and instructions for AI agents working on this codebase.

## 1. Project Overview

This is a personal travel visualization project built with:
- **Framework**: [SolidJS 2.0](https://www.solidjs.com/) (currently `2.0.0-rc.6`)
- **Styling**: [UnoCSS](https://unocss.dev/) (Atomic CSS)
- **Map**: [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- **Language**: TypeScript

## 2. Tooling & Commands

Use `pnpm` for all package management.

### core scripts
- **Start Dev Server**: `pnpm dev` (runs on http://localhost:5173)
- **Build for Production**: `pnpm build`
- **Type Check**: `pnpm typecheck`
- **Lint**: `pnpm lint`
- **Format**: `pnpm format`

### testing
*Note: There is currently no dedicated unit test runner (e.g., Vitest) configured.*
- Rely on **Type Checking** (`pnpm typecheck`) and **Linting** (`pnpm lint`) for verification.
- Verify UI changes visually by running the dev server.

## 3. Code Architecture & Patterns

### SolidJS Components
- **Functional Components**: Use PascalCase (e.g., `PlaceMarker`).
- **Reactivity**:
  - Use `createSignal` for local state.
  - Use `createMemo` for derived state (especially for expensive calculations or map filters).
  - Use two-phase `createEffect(compute, apply)`; read reactive inputs in compute and perform side effects in apply.
  - Use `onSettled` for mounted DOM work and return cleanup functions for listeners and Mapbox resources.
  - Signal writes are batched; do not expect a read immediately after a setter to return the new value.
  - **Props**: Access props via `props.property` in reactive scopes. Use `untrack` for intentional one-time reads.
- **Control Flow**: Prefer Solid's built-in components:
  - `<Show when={...}>` instead of ternary operators.
  - `<For each={...}>` instead of `.map()`; use `<For keyed={false}>` for index-based rendering.
- **Context**: Use `createContext` and `useContext` for global state like the Mapbox instance.

### State Management
- Use core Solid 2 signals and memos. Replace Sets immutably inside signal setters.
- Browser preference helpers live in `src/preferences.ts`; preserve their storage keys.
- Verify Solid 2 compatibility before adding third-party reactive primitives.

### Styling (UnoCSS)
- **Utility-First**: Use utility classes directly in the `class` attribute.
- **Conditional Styling**: Use Solid 2's `class` arrays and objects for toggling classes based on state:
  ```tsx
  <div class={['flex', { 'opacity-50': !isActive() }]} />
  ```
- **Icons**: Use pure CSS icons via the `i-` prefix (Iconify):
  ```tsx
  <div class="i-ph:globe-duotone" />
  ```
- **Dark Mode**: Use the `dark:` modifier.

### Mapbox Integration
- **Direct DOM Access**: Mapbox requires a DOM element container. Handle this safely within SolidJS components, typically using a variable reference assigned in JSX (e.g., `ref={container}` pattern or explicit assignment).

## 4. Coding Standards

### TypeScript
- **Strict Mode**: The project uses strict TypeScript. Avoid `any`.
- **Interfaces**: Define explicit interfaces for data structures (e.g., `Place`, `marker`).
- **Imports**:
  1. External libraries (Solid, Mapbox, Primitives)
  2. Internal components
  3. Types (use `import type`)
  4. Styles/Assets

### Data Handling
- **YAML Data**: Primary data is stored in `data.yaml`.
- **Importing**: Import YAML files directly; they are handled by `unplugin-yaml`.

### File Organization
- **Components**: `src/components/*.tsx` (PascalCase)
- **Configuration**: Root level config files (camelCase/kebab-case)
- **Entry**: `src/index.tsx`
- **Main App**: `src/App.tsx`
- **Map Logic**: `src/components/Map.tsx`

## 5. Error Handling
- Use non-null assertions (`!`) only when you are certain a value exists (e.g., after a check or known DOM presence).
- Ensure Mapbox load events are handled before interacting with the map instance.
