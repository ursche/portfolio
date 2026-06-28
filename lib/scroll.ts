/**
 * Mutable scroll state shared between the Lenis loop (DOM world) and the
 * R3F render loop (WebGL world). Written on every Lenis scroll tick and
 * read inside useFrame — no React re-renders involved, which is what keeps
 * scroll-linked 3D animation cheap.
 */
export const scrollState = {
  /** 0 at top of page, 1 at bottom */
  progress: 0,
  /** signed scroll velocity from Lenis, roughly -60..60 */
  velocity: 0,
};
