import type { Metadata } from "next";
import PostCard from "@/components/blog/PostCard";
import JsonLd from "@/components/JsonLd";
import { getPublishedPosts } from "@/lib/blog/posts";
import { BASE_OPEN_GRAPH, RSS_ALTERNATE, SITE, absoluteUrl } from "@/lib/site";

// ISR: served statically, regenerated at most hourly in the background.
// Publishing from the studio also revalidates this path on demand.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description: SITE.blogDescription,
  alternates: { canonical: "/blog", types: RSS_ALTERNATE },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    type: "website",
    url: "/blog",
    title: `Blog - ${SITE.name}`,
    description: SITE.blogDescription,
  },
  twitter: { card: "summary_large_image", title: `Blog - ${SITE.name}`, description: SITE.blogDescription },
};

export default async function BlogIndex() {
  const posts = await getPublishedPosts();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": absoluteUrl("/blog#blog"),
    name: `${SITE.name} - Blog`,
    description: SITE.blogDescription,
    url: absoluteUrl("/blog"),
    inLanguage: "en",
    author: { "@type": "Person", name: SITE.name, url: absoluteUrl("/") },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: post.published_at ?? undefined,
      dateModified: post.updated_at,
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-36">
      <JsonLd data={structuredData} />
      <p className="font-mono text-sm uppercase tracking-[0.4em] text-laser">Blog</p>
      <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
        Notes &amp; <span className="text-neon">write-ups</span>.
      </h1>

      <div className="mt-16">
        {posts.length === 0 ? (
          <p className="font-serif text-lg text-neutral-500">Nothing published yet. Check back soon.</p>
        ) : (
          posts.map((post) => <PostCard key={post.slug} post={post} />)
        )}
      </div>
    </div>
  );
}
