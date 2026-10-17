"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const LINKS = [
  ["About", "/#about"],
  ["Skills", "/#skills"],
  ["Projects", "/#projects"],
  ["Blog", "/blog"],
] as const;

export default function Header() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 sm:px-10"
    >
      <Link href="/" className="font-display text-lg font-bold tracking-tight">
        Urjala<span className="text-neon">.</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm text-neutral-400 sm:gap-6">
        {LINKS.map(([label, href]) => {
          const isBlog = href === "/blog";
          const active = isBlog && pathname.startsWith("/blog");
          return (
            <Link
              key={href}
              href={href}
              className={`transition-colors hover:text-white ${isBlog ? "" : "hidden sm:inline"} ${
                active ? "text-white" : ""
              }`}
            >
              {label}
            </Link>
          );
        })}
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
