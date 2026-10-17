import { NextResponse, type NextRequest } from "next/server";
import { isAuthor } from "@/lib/blog/auth";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) return NextResponse.redirect(`${origin}/login?error=oauth`);

  const supabase = createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?error=oauth`);

  // Any GitHub user can complete OAuth; only allowlisted ones keep a session.
  if (!(await isAuthor(supabase))) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?error=not_allowed`);
  }

  return NextResponse.redirect(`${origin}/studio`);
}
