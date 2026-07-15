"use client";

import { Suspense, lazy } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";

// Lazy-load the heavy scene graph so the shell paints immediately.
const Experience = lazy(() => import("./Experience"));

/**
 * Fixed full-screen canvas that lives BEHIND the DOM (-z-10) and persists
 * across route transitions (it is mounted in the root layout).
 *
 * Performance notes:
 *  - dpr capped at 1.8; AdaptiveDpr drops it further under load.
 *  - antialias off - the film grain + bloom-ish materials hide aliasing.
 *  - single canvas for the whole site; sections share one render loop.
 */
export default function Scene() {
  return (
    <div className="fixed inset-0 -z-10" aria-hidden>
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, 9], fov: 45 }}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: false,
        }}
      >
        <Suspense fallback={null}>
          <Experience />
          <Preload all />
        </Suspense>
        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
}
