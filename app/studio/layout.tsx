import type { Metadata } from "next";
import { requireAuthor } from "@/lib/blog/auth";

export const metadata: Metadata = {
  title: "Studio - Urjala Pariyar",
  robots: { index: false },
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  await requireAuthor();
  return <main className="relative min-h-screen bg-void/95">{children}</main>;
}
