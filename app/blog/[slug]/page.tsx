import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReadingProgress from "@/components/blog/ReadingProgress";
import { formatDate } from "@/lib/blog/content";
import { getPublishedPost, getPublishedPosts, renderPostHTML } from "@/lib/blog/posts";

export const revalidate = 3600;
// Posts published after the last build are rendered on first request, then cached.
export const dynamicParams = true;

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts();
    return posts.map(({ slug }) => ({ slug }));
  } catch (error) {
    // Don't fail the build over it; every post can still render on demand.
    console.warn("[blog] could not prerender posts:", error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPost(params.slug);
  if (!post) return {};

  const description = post.subtitle || post.excerpt;
  return {
    title: `${post.title} - Urjala Pariyar`,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPublishedPost(params.slug);
  if (!post) notFound();

  return (
    <article className="pb-24 pt-32">
      <ReadingProgress />

      <header className="mx-auto max-w-[44rem] px-6">
        <Link
          href="/blog"
          className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500 transition-colors hover:text-laser"
        >
          ← All posts
        </Link>
        <h1 className="mt-8 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        {post.subtitle && (
          <p className="mt-4 font-serif text-xl text-neutral-400 sm:text-2xl">{post.subtitle}</p>
        )}

        <div className="mt-8 flex items-center gap-3 border-y border-neutral-900 py-4">
          <Image
            src="/urjala.jpeg"
            alt="Urjala Pariyar"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
          />
          <div className="text-sm">
            <p className="font-medium text-neutral-200">Urjala Pariyar</p>
            <p className="text-neutral-500">
              {post.reading_minutes} min read · {formatDate(post.published_at)}
            </p>
          </div>
        </div>
      </header>

      {post.cover_image_url && (
        <div className="relative mx-auto mt-10 aspect-[16/9] max-w-4xl overflow-hidden sm:rounded-xl">
          <Image
            src={post.cover_image_url}
            alt=""
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>
      )}

      <div
        className="post-body mx-auto mt-12 max-w-[44rem] px-6"
        dangerouslySetInnerHTML={{ __html: renderPostHTML(post) }}
      />
    </article>
  );
}
