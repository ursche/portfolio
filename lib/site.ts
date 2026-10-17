function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const url = explicit || (vercel ? `https://${vercel}` : "http://localhost:3000");
  return url.replace(/\/+$/, "");
}

export const SITE = {
  name: "Urjala Pariyar",
  title: "Urjala Pariyar - Laravel + React Developer",
  description:
    "Portfolio of Urjala Pariyar, a full-stack developer crafting robust Laravel backends and animated React frontends.",
  blogDescription: "Notes on Laravel, React and building things for the web.",
  url: resolveSiteUrl(),
  github: "https://github.com/ursche",
  jobTitle: "Full-stack Developer",
  skills: ["Laravel", "PHP", "React", "Next.js", "TypeScript", "MySQL", "Three.js"],
} as const;

/** Absolute URL for a site path, for JSON-LD and feeds (metadata uses metadataBase). */
export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE.url}/`).toString();
}

/**
 * Next.js replaces (does not merge) `alternates` and `openGraph` from a parent
 * layout, so pages that set their own spread these back in.
 */
export const RSS_ALTERNATE = {
  "application/rss+xml": [{ url: "/feed.xml", title: `${SITE.name} - Blog` }],
};

export const BASE_OPEN_GRAPH = {
  siteName: SITE.name,
  locale: "en_US",
} as const;
