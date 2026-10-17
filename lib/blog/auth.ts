import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * True only for a signed-in GitHub account listed in public.blog_authors.
 * This is a UX gate; the real enforcement is the RLS policies built on the
 * same is_blog_author() function.
 */
export async function isAuthor(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase.rpc("is_blog_author");
  return !error && data === true;
}

/** Redirects to /login unless the current session belongs to an allowlisted author. */
export async function requireAuthor() {
  const supabase = createServerSupabase();
  if (!(await isAuthor(supabase))) redirect("/login");
  return supabase;
}
