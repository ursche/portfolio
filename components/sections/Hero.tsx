"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "@/components/icons";
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
        className="mb-4 font-serif text-2xl italic text-neutral-400 sm:text-3xl"
      >
        hi, I&apos;m
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
        className="mt-8 max-w-xl text-lg leading-relaxed text-neutral-400 sm:text-xl"
      >
        I build web apps end to end:{" "}
        <em className="font-serif text-[1.1em] text-white">Laravel</em> on the server,{" "}
        <em className="font-serif text-[1.1em] text-white">React</em> in the browser.
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
          className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-8 py-3 font-medium text-neutral-300 transition-colors duration-300 hover:border-laser hover:text-laser"
        >
          GitHub <ArrowUpRight />
        </a>
      </motion.div>

    </section>
  );
}
