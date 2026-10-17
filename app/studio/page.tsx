import Link from "next/link";
import StudioBar from "@/components/blog/StudioBar";
import { formatDate } from "@/lib/blog/content";
import { createServerSupabase } from "@/lib/supabase/server";
import { createDraft, signOut } from "./actions";

export default async function StudioPage() {
  const { data: posts, error } = await createServerSupabase()
    .from("posts")
    .select("id, slug, title, published, published_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    <>
      <StudioBar>
        <form action={signOut}>
          <button className="text-neutral-500 transition-colors hover:text-white">Sign out</button>
        </form>
        <form action={createDraft}>
          <button className="rounded-full bg-neon px-4 py-1.5 font-medium text-white transition-colors hover:bg-neon/80">
            New story
          </button>
        </form>
      </StudioBar>

      <div className="mx-auto max-w-5xl px-6 py-14">
        <h1 className="font-display text-4xl font-bold">Your stories</h1>

        {posts.length === 0 ? (
          <p className="mt-10 text-neutral-500">No stories yet. Start one with “New story”.</p>
        ) : (
          <ul className="mt-10 divide-y divide-neutral-900 border-y border-neutral-900">
            {posts.map((post) => (
              <li key={post.id} className="flex items-center justify-between gap-4 py-5">
                <Link href={`/studio/${post.id}`} className="min-w-0 flex-1 group">
                  <p className="truncate font-display text-lg font-semibold group-hover:text-laser">
                    {post.title || "Untitled story"}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {post.published
                      ? `Published ${formatDate(post.published_at)}`
                      : `Draft · edited ${formatDate(post.updated_at)}`}
                  </p>
                </Link>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wider ${
                    post.published ? "bg-laser/10 text-laser" : "bg-neutral-900 text-neutral-500"
                  }`}
                >
                  {post.published ? "Live" : "Draft"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
