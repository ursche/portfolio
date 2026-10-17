# Urjala Pariyar - Portfolio

Heavily animated 3D personal portfolio. Laravel + React developer, [github.com/ursche](https://github.com/ursche).

## Stack

- **Next.js 14** (App Router, TypeScript)
- **React Three Fiber + Drei** - persistent WebGL background (torus-knot hero, starfield, wireframe debris, skill rings)
- **Framer Motion** - page-transition curtain, staggered section reveals, 3D tilt photo card
- **Lenis** - smooth scrolling, driving the 3D camera rig via a shared mutable scroll state
- **Tailwind CSS**

## Run

```bash
npm install
npm run dev
```

## Performance notes

- Single `<Canvas>` for the whole site, mounted in the root layout behind the DOM.
- Scroll/pointer values flow into `useFrame` through mutable refs - zero React re-renders per frame.
- DPR capped at 1.8 with `AdaptiveDpr`, antialias off, shared geometries, one draw call for 2,400 particles.
- Three.js is client-only via `next/dynamic` and `React.lazy`, keeping it off the critical path.

## Blog

Medium-style blog at `/blog`, written in a private studio at `/studio`.

- **Supabase** stores posts (Tiptap JSON) and images (`blog-images` storage bucket).
- **ISR**: `/`, `/blog`, `/blog/[slug]`, `/sitemap.xml` and `/feed.xml` are static, revalidated hourly and on demand whenever a post is published, updated, unpublished or deleted. The home page shows the 3 latest posts and fetches GitHub repos on the server, so both are in the HTML.

## SEO

- Set `NEXT_PUBLIC_SITE_URL` to the production domain (on Vercel it falls back to the production URL). It drives canonical links, the sitemap, the RSS feed and social cards.
- Per-page titles, descriptions and canonicals; Open Graph and Twitter tags; generated social cards (`opengraph-image.tsx`) for the site, the blog and each post.
- JSON-LD: `Person` + `WebSite` on the home page, `Blog` on `/blog`, `BlogPosting` + `BreadcrumbList` on posts.
- `robots.txt` blocks `/studio`, `/login` and `/auth`, which are also `noindex`.
- **Auth**: GitHub OAuth through Supabase. Only GitHub usernames in the `blog_authors` table can write; this is enforced by row-level security on posts and storage, so other GitHub users who sign in can read but never write.

### Setup

1. Create a Supabase project and run `supabase/migrations/20261012000000_blog.sql` in the SQL editor (or `supabase db push`).
2. Allowlist yourself:
   ```sql
   insert into public.blog_authors (github_username) values ('ursche');
   ```
3. Create a GitHub OAuth app with callback URL `https://<project-ref>.supabase.co/auth/v1/callback`, then enable the GitHub provider in Supabase (Authentication > Providers) with its client ID and secret.
4. In Supabase Authentication > URL Configuration, set the Site URL to your domain and add `http://localhost:3000/auth/callback` and `https://<your-domain>/auth/callback` to the redirect URLs.
5. `cp .env.example .env.local` and fill in the project URL, anon key and site URL.

Then sign in at `/login` and write at `/studio`.
