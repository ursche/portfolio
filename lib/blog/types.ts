import type { JSONContent } from "@tiptap/core";

export type Post = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  cover_image_url: string | null;
  content: JSONContent;
  excerpt: string;
  reading_minutes: number;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PostSummary = Pick<
  Post,
  "slug" | "title" | "subtitle" | "cover_image_url" | "excerpt" | "reading_minutes" | "published_at"
>;
