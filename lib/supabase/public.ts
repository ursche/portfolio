import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

/**
 * Cookie-less anon client for public blog reads. Reading cookies would opt
 * the route out of static rendering, so ISR pages must use this one.
 * RLS only exposes published posts to it.
 */
export function createPublicClient() {
  const { url, key } = supabaseEnv();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
