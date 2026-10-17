"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/blog/content";
import type { PostSummary } from "@/lib/blog/types";
import { staggerContainer, fadeUp } from "@/lib/variants";

export default function Writing({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null;

  return (
    <section id="writing" aria-labelledby="writing-heading" className="mx-auto max-w-6xl px-6 py-32">
      <motion.div
        variants={staggerContainer(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.p variants={fadeUp} className="font-mono text-sm uppercase tracking-[0.4em] text-laser">
          Writing
        </motion.p>
        <motion.h2
          id="writing-heading"
          variants={fadeUp}
          className="mt-4 font-display text-4xl font-bold sm:text-5xl"
        >
          Latest from the <span className="text-neon">blog</span>.
        </motion.h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <motion.article key={post.slug} variants={fadeUp}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur transition-colors hover:border-neon/60"
              >
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
                  <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
                  {" · "}
                  {post.reading_minutes} min read
                </p>
                <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-white group-hover:text-laser">
                  {post.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-400">
                  {post.subtitle || post.excerpt}
                </p>
              </Link>
            </motion.article>
          ))}
        </div>

        <motion.div variants={fadeUp} className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-block rounded-full border border-neutral-700 px-8 py-3 font-medium text-neutral-300 transition-all duration-300 hover:scale-105 hover:border-laser hover:text-laser"
          >
            All posts
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
