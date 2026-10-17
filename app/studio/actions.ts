"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { JSONContent } from "@tiptap/core";
import { requireAuthor } from "@/lib/blog/auth";
import { SLUG_PATTERN, excerptOf, isDoc, plainText, readingMinutes } from "@/lib/blog/content";
import { createServerSupabase } from "@/lib/supabase/server";

type Result = { error?: string };

export type PostDraft = {
  title: string;
  subtitle: string;
  cover_image_url: string | null;
  content: JSONContent;
};

/** Drop the cached ISR pages that show this post (home lists the latest ones). */
function revalidatePost(...slugs: (string | null | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  revalidatePath("/feed.xml");
  slugs
    .filter((slug, i) => slug && slugs.indexOf(slug) === i)
    .forEach((slug) => revalidatePath(`/blog/${slug}`));
}

export async function createDraft() {
  const supabase = await requireAuthor();
  const { data, error } = await supabase
    .from("posts")
    .insert({ slug: `draft-${crypto.randomUUID().slice(0, 8)}` })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  redirect(`/studio/${data.id}`);
}

export async function savePost(id: string, draft: PostDraft): Promise<Result> {
  if (!isDoc(draft.content)) return { error: "Invalid document." };
  const supabase = await requireAuthor();

  const text = plainText(draft.content);
  const { data, error } = await supabase
    .from("posts")
    .update({
      title: draft.title.trim().slice(0, 200),
      subtitle: draft.subtitle.trim().slice(0, 300),
      cover_image_url: draft.cover_image_url,
      content: draft.content,
      excerpt: excerptOf(text),
      reading_minutes: readingMinutes(text),
    })
    .eq("id", id)
    .select("slug, published")
    .single();

  if (error) return { error: error.message };
  if (data.published) revalidatePost(data.slug);
  return {};
}

export async function publishPost(id: string, slug: string): Promise<Result> {
  if (!SLUG_PATTERN.test(slug)) {
    return { error: "Use lowercase letters, numbers and single hyphens." };
  }
  const supabase = await requireAuthor();

  const { data: before } = await supabase.from("posts").select("slug, title").eq("id", id).single();
  if (!before?.title.trim()) return { error: "Give the story a title first." };

  const { error } = await supabase
    .from("posts")
    .update({ slug, published: true })
    .eq("id", id);

  if (error) {
    return { error: error.code === "23505" ? "That URL is already taken." : error.message };
  }
  revalidatePost(before.slug, slug);
  revalidatePath("/studio");
  return {};
}

export async function unpublishPost(id: string): Promise<Result> {
  const supabase = await requireAuthor();
  const { data, error } = await supabase
    .from("posts")
    .update({ published: false })
    .eq("id", id)
    .select("slug")
    .single();

  if (error) return { error: error.message };
  revalidatePost(data.slug);
  revalidatePath("/studio");
  return {};
}

export async function deletePost(id: string) {
  const supabase = await requireAuthor();
  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .select("slug, published")
    .single();

  if (error) throw new Error(error.message);
  if (data.published) revalidatePost(data.slug);
  revalidatePath("/studio");
  redirect("/studio");
}

export async function signOut() {
  await createServerSupabase().auth.signOut();
  redirect("/");
}
