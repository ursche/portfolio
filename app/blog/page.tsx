import type { Metadata } from "next";
import PostCard from "@/components/blog/PostCard";
import { getPublishedPosts } from "@/lib/blog/posts";

// ISR: served statically, regenerated at most hourly in the background.
// Publishing from the studio also revalidates this path on demand.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog - Urjala Pariyar",
  description: "Notes on Laravel, React and building things for the web.",
};

export default async function BlogIndex() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-36">
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
