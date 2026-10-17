import { renderToHTMLString } from "@tiptap/static-renderer";
import { createPublicClient } from "@/lib/supabase/public";
import { postExtensions } from "./extensions";
import type { Post, PostSummary } from "./types";

const SUMMARY_COLUMNS =
  "slug, title, subtitle, cover_image_url, excerpt, reading_minutes, published_at, updated_at";

export async function getPublishedPosts(limit?: number): Promise<PostSummary[]> {
  let query = createPublicClient()
    .from("posts")
    .select(SUMMARY_COLUMNS)
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load posts: ${error.message}`);
  return data;
}

export async function getPublishedPost(slug: string): Promise<Post | null> {
  const { data, error } = await createPublicClient()
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw new Error(`Failed to load post: ${error.message}`);
  return data;
}

export function renderPostHTML(post: Post) {
  return renderToHTMLString({ content: post.content, extensions: postExtensions });
}
