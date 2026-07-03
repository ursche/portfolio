"use client";

import { useContext, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { EASE_OUT_EXPO } from "@/lib/variants";

/**
 * App Router unmounts the old page immediately on navigation, which kills
 * Framer Motion exit animations. Freezing the router context for the
 * exiting subtree keeps the old page rendered until AnimatePresence is done.
 */
function FrozenRouter({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context).current;
  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

export default function TransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname}>
        {/* Curtain sweep: covers the screen on exit, reveals on enter */}
        <motion.div
          className="fixed inset-0 z-50 origin-top bg-neon"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } }}
          exit={{ scaleY: 0 }}
          style={{ pointerEvents: "none" }}
        />
        <motion.div
          className="fixed inset-0 z-50 origin-bottom bg-void"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 1, transition: { duration: 0.5, ease: [0.64, 0, 0.78, 0] } }}
          style={{ pointerEvents: "none" }}
        />
        {/* Page content itself drifts in/out under the curtain */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.15, ease: EASE_OUT_EXPO } }}
          exit={{ opacity: 0, y: -24, transition: { duration: 0.4 } }}
        >
          <FrozenRouter>{children}</FrozenRouter>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
