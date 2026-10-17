import { OG_SIZE, ogCard } from "@/lib/og/card";
import { SITE } from "@/lib/site";

export const alt = SITE.title;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "Laravel + React Developer",
    title: "Urjala Pariyar",
    footer: "Robust backends, animated frontends",
  });
}
