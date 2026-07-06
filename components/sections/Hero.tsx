"use client";

import { motion } from "framer-motion";
import { staggerContainer, letterReveal, fadeUp } from "@/lib/variants";

const NAME = "Urjala Pariyar";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.2 }}
        className="mb-6 font-mono text-sm uppercase tracking-[0.4em] text-laser"
      >
        Hello, I build for the web
      </motion.p>

      {/* Per-letter masked reveal */}
      <motion.h1
        variants={staggerContainer(0.045, 0.35)}
        initial="hidden"
        animate="show"
        aria-label={NAME}
        className="font-display text-6xl font-bold leading-none tracking-tight sm:text-8xl lg:text-9xl"
      >
        {NAME.split(" ").map((word, wi) => (
          <span key={wi} className="mr-[0.25em] inline-block whitespace-nowrap last:mr-0">
            {word.split("").map((char, ci) => (
              <span key={ci} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span variants={letterReveal} className="inline-block">
                  {char}
                </motion.span>
              </span>
            ))}
          </span>
        ))}
      </motion.h1>

      <motion.h2
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 1 }}
        className="mt-8 text-xl text-neutral-300 sm:text-2xl"
      >
        <span className="text-ember">Laravel</span>
        <span className="mx-3 text-neutral-600">+</span>
        <span className="text-laser">React</span>
        <span className="ml-3 text-neutral-400">Developer</span>
      </motion.h2>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 1.2 }}
        className="mt-12 flex items-center gap-4"
      >
        <a
          href="#projects"
          className="rounded-full bg-neon px-8 py-3 font-medium text-white transition-transform duration-300 hover:scale-105 hover:bg-violet-500"
        >
          See my work
        </a>
        <a
          href="https://github.com/ursche"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-neutral-700 px-8 py-3 font-medium text-neutral-300 transition-colors duration-300 hover:border-laser hover:text-laser"
        >
          GitHub ↗
        </a>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-neutral-600 p-1.5"
        >
          <div className="h-2 w-1 rounded-full bg-laser" />
        </motion.div>
      </motion.div>
    </section>
  );
}
