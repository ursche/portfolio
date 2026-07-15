"use client";

import { motion } from "framer-motion";

const LINKS = [
  ["About", "#about"],
  ["Skills", "#skills"],
  ["Projects", "#projects"],
] as const;

export default function Header() {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 sm:px-10"
    >
      <a href="#hero" className="font-display text-lg font-bold tracking-tight">
        Urjala<span className="text-neon">.</span>
      </a>
      <nav className="flex items-center gap-6 text-sm text-neutral-400">
        {LINKS.map(([label, href]) => (
          <a key={href} href={href} className="transition-colors hover:text-white">
            {label}
          </a>
        ))}
        <a
          href="https://github.com/ursche"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-neutral-700 px-4 py-1.5 transition-colors hover:border-laser hover:text-laser"
        >
          GitHub
        </a>
      </nav>
    </motion.header>
  );
}
