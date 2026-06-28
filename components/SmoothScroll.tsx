"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { scrollState } from "@/lib/scroll";

/**
 * Global Lenis smooth scrolling. Runs its own rAF loop and mirrors
 * progress/velocity into `scrollState` so the 3D scene can consume it
 * without triggering React renders.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    lenis.on("scroll", (l: Lenis) => {
      scrollState.progress = l.progress;
      scrollState.velocity = l.velocity;
    });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
