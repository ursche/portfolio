"use client";

import dynamic from "next/dynamic";

/**
 * Client-side-only mount for the WebGL canvas. Keeps three.js out of the
 * server bundle entirely and out of the critical hydration path.
 */
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function SceneWrapper() {
  return <Scene />;
}
