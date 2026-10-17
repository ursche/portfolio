import { formatDate } from "@/lib/blog/content";
import { getPublishedPost } from "@/lib/blog/posts";
import { OG_SIZE, ogCard } from "@/lib/og/card";

export const revalidate = 3600;
export const alt = "Blog post by Urjala Pariyar";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPublishedPost(params.slug).catch(() => null);

  return ogCard({
    eyebrow: "Blog",
    title: post?.title || "Notes & write-ups",
    footer: post ? `${formatDate(post.published_at)} · ${post.reading_minutes} min read` : "",
  });
}
