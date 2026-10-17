import { OG_SIZE, ogCard } from "@/lib/og/card";

export const alt = "Blog - Urjala Pariyar";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Blog",
    title: "Notes & write-ups",
    footer: "Laravel, React and building for the web",
  });
}
