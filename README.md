# Urjala Pariyar - Portfolio

Heavily animated 3D personal portfolio. Laravel + React developer, [github.com/ursche](https://github.com/ursche).

## Stack

- **Next.js 14** (App Router, TypeScript)
- **React Three Fiber + Drei** - persistent WebGL background (torus-knot hero, starfield, wireframe debris, skill rings)
- **Framer Motion** - page-transition curtain, staggered section reveals, 3D tilt photo card
- **Lenis** - smooth scrolling, driving the 3D camera rig via a shared mutable scroll state
- **Tailwind CSS**

## Run

```bash
npm install
npm run dev
```

## Personalize

- Replace `public/me.svg` with your photo and update the `src` in `components/sections/About.tsx` (e.g. `/me.jpg`).
- The Projects grid live-fetches your latest public repos from the GitHub API and falls back to static content offline.

## Performance notes

- Single `<Canvas>` for the whole site, mounted in the root layout behind the DOM.
- Scroll/pointer values flow into `useFrame` through mutable refs - zero React re-renders per frame.
- DPR capped at 1.8 with `AdaptiveDpr`, antialias off, shared geometries, one draw call for 2,400 particles.
- Three.js is client-only via `next/dynamic` and `React.lazy`, keeping it off the critical path.
