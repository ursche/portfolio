"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeUp, scaleIn } from "@/lib/variants";

const FEATURED = [
  {
    name: "Laravel",
    blurb:
      "Eloquent, queues, events, Livewire, REST & Sanctum APIs. Clean architecture without ceremony.",
    accent: "from-rose-500/20 to-rose-500/0 border-rose-500/30",
    text: "text-ember",
  },
  {
    name: "React",
    blurb:
      "Hooks-first components, Next.js App Router, R3F, and motion design that respects the frame budget.",
    accent: "from-cyan-500/20 to-cyan-500/0 border-cyan-500/30",
    text: "text-laser",
  },
];

const STACK = [
  "PHP", "TypeScript", "Next.js", "Inertia.js", "Livewire", "MySQL",
  "Redis", "Tailwind CSS", "Framer Motion", "Three.js", "Docker", "Git",
];

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
          {FEATURED.map((skill) => (
            <motion.div
              key={skill.name}
              variants={scaleIn}
              whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 20 } }}
              className={`rounded-2xl border bg-gradient-to-b p-8 ${skill.accent}`}
            >
              <h3 className={`font-display text-3xl font-bold ${skill.text}`}>
                {skill.name}
              </h3>
              <p className="mt-4 leading-relaxed text-neutral-400">{skill.blurb}</p>
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
