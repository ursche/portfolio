import { notFound } from "next/navigation";
import PostEditor from "@/components/blog/PostEditor";
import type { Post } from "@/lib/blog/types";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const { data: post } = await createServerSupabase()
    .from("posts")
    .select("*")
    .eq("id", params.id)
    .maybeSingle<Post>();

  if (!post) notFound();
  return <PostEditor post={post} />;
}
