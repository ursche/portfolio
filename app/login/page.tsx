import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthor } from "@/lib/blog/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import LoginButton from "./LoginButton";

export const metadata: Metadata = {
  title: "Sign in - Urjala Pariyar",
  robots: { index: false },
};

const ERRORS: Record<string, string> = {
  not_allowed: "That GitHub account isn't allowed to write here.",
  oauth: "GitHub sign-in failed. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  if (await isAuthor(createServerSupabase())) redirect("/studio");
  const error = searchParams.error && ERRORS[searchParams.error];

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-void/80 px-6">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight">
          Urjala<span className="text-neon">.</span>
        </Link>
        <h1 className="mt-10 font-display text-3xl font-bold">Studio</h1>
        <p className="mt-3 text-neutral-400">Sign in to write and publish posts.</p>
        {error && (
          <p role="alert" className="mt-6 rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
            {error}
          </p>
        )}
        <div className="mt-10">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
