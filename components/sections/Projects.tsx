"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp } from "@/lib/variants";

const GITHUB_USER = "ursche";

type Repo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
};

/** Shown until (or if) the live GitHub fetch resolves. */
const FALLBACK: Repo[] = [
  {
    id: 1,
    name: "your-project-here",
    description: "Pin your best repos on GitHub and they will appear here automatically.",
    html_url: `https://github.com/${GITHUB_USER}`,
    language: "PHP",
    stargazers_count: 0,
  },
];

const LANG_COLOR: Record<string, string> = {
  PHP: "bg-indigo-400",
  JavaScript: "bg-yellow-400",
  TypeScript: "bg-blue-400",
  Blade: "bg-rose-400",
  Vue: "bg-emerald-400",
  CSS: "bg-purple-400",
};

const cardVariants = {
  hidden: { opacity: 0, y: 60, rotateX: -12 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Projects() {
  const [repos, setRepos] = useState<Repo[]>(FALLBACK);

  useEffect(() => {
    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=6`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Repo[]) => {
        if (Array.isArray(data) && data.length > 0) setRepos(data);
      })
      .catch(() => {
        /* fall back to static content - no error UI needed */
      });
  }, []);

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-32">
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.p variants={fadeUp} className="font-mono text-sm uppercase tracking-[0.4em] text-laser">
          Projects
        </motion.p>
        <motion.h2 variants={fadeUp} className="mt-4 font-display text-4xl font-bold sm:text-5xl">
          Built in <span className="text-neon">public</span>.
        </motion.h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ perspective: 1200 }}>
          {repos.map((repo) => (
            <motion.a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              variants={cardVariants}
              whileHover={{
                y: -10,
                rotateX: 4,
                rotateY: -4,
                transition: { type: "spring", stiffness: 260, damping: 18 },
              }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur transition-colors hover:border-neon/60"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* animated gradient sheen on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <div className="absolute -inset-x-full top-0 h-full skew-x-12 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-[200%]" />
              </div>

              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-lg font-semibold text-white group-hover:text-laser">
                    {repo.name}
                  </h3>
                  <span className="text-neutral-500 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-laser">
                    ↗
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-400">
                  {repo.description ?? "No description yet."}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-4 text-xs text-neutral-500">
                {repo.language && (
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${LANG_COLOR[repo.language] ?? "bg-neutral-400"}`} />
                    {repo.language}
                  </span>
                )}
                <span>★ {repo.stargazers_count}</span>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div variants={fadeUp} className="mt-12 text-center">
          <a
            href={`https://github.com/${GITHUB_USER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border border-neutral-700 px-8 py-3 font-medium text-neutral-300 transition-all duration-300 hover:scale-105 hover:border-laser hover:text-laser"
          >
            All repositories on GitHub ↗
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
