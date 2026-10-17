import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/blog/content";
import type { PostSummary } from "@/lib/blog/types";

export default function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="group border-b border-neutral-900 py-10 first:pt-0">
      <Link href={`/blog/${post.slug}`} className="flex items-start gap-6 sm:gap-10">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
            {formatDate(post.published_at)} · {post.reading_minutes} min read
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold leading-tight transition-colors group-hover:text-laser sm:text-3xl">
            {post.title || "Untitled"}
          </h2>
          <p className="mt-3 line-clamp-2 font-serif text-lg text-neutral-400">
            {post.subtitle || post.excerpt}
          </p>
        </div>
        {post.cover_image_url && (
          <div className="relative hidden aspect-[4/3] w-40 shrink-0 overflow-hidden rounded-lg border border-neutral-800 sm:block md:w-48">
            <Image
              src={post.cover_image_url}
              alt=""
              fill
              sizes="200px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
      </Link>
    </article>
  );
}
