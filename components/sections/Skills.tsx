"use client";

import { motion } from "framer-motion";
import { AtomIcon, ServerIcon } from "@/components/icons";
import { staggerContainer, fadeUp, scaleIn } from "@/lib/variants";

const FEATURED = [
  {
    name: "Laravel",
    role: "Backend",
    Icon: ServerIcon,
    blurb:
      "Eloquent, queues, events, Livewire, REST & Sanctum APIs. Clean architecture without ceremony.",
  },
  {
    name: "React",
    role: "Frontend",
    Icon: AtomIcon,
    blurb:
      "Hooks-first components, Next.js App Router, R3F, and motion design that respects the frame budget.",
  },
];

const STACK = [
  "PHP", "TypeScript", "Next.js", "Inertia.js", "Livewire", "MySQL",
  "Redis", "Tailwind CSS", "Framer Motion", "Three.js", "Docker", "Git",
];

function trackSpotlight(e: React.MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
}

export default function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-32">
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.p variants={fadeUp} className="font-mono text-sm uppercase tracking-[0.4em] text-laser">
          Skills &amp; tech
        </motion.p>
        <motion.h2 variants={fadeUp} className="mt-4 font-display text-4xl font-bold sm:text-5xl">
          The <span className="text-neon">stack</span> I think in.
        </motion.h2>

        {/* Featured: Laravel + React */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {FEATURED.map(({ name, role, Icon, blurb }, i) => (
            <motion.div
              key={name}
              variants={scaleIn}
              whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 20 } }}
              onMouseMove={trackSpotlight}
              className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 backdrop-blur transition-colors hover:border-neon/50"
            >
              {/* violet spotlight that follows the cursor */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(420px circle at var(--x, 50%) var(--y, 50%), rgba(139, 92, 246, 0.16), transparent 70%)",
                }}
              />
              <Icon
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-8 -right-8 h-44 w-44 text-neon/10 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:text-neon/20"
              />

              <div className="relative">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500">
                  0{i + 1} / {role}
                </p>
                <h3 className="mt-3 font-display text-3xl font-bold text-white">
                  {name}
                  <span className="text-neon">.</span>
                </h3>
                <p className="mt-4 max-w-md leading-relaxed text-neutral-400">{blurb}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Supporting stack chips */}
        <motion.ul
          variants={staggerContainer(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          {STACK.map((item) => (
            <motion.li
              key={item}
              variants={scaleIn}
              whileHover={{
                scale: 1.12,
                rotate: -2,
                transition: { type: "spring", stiffness: 400, damping: 12 },
              }}
              className="cursor-default rounded-full border border-neutral-800 bg-neutral-900/60 px-5 py-2 text-sm text-neutral-300 backdrop-blur transition-colors hover:border-neon hover:text-white"
            >
              {item}
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </section>
  );
}
