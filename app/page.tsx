import type { Metadata } from "next";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Writing from "@/components/sections/Writing";
import { getPublishedPosts } from "@/lib/blog/posts";
import { getRepos } from "@/lib/github";
import { RSS_ALTERNATE, SITE, absoluteUrl } from "@/lib/site";

// ISR: static HTML, refreshed hourly. Publishing a post also revalidates "/" on demand.
export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/", types: RSS_ALTERNATE },
};

async function getLatestPosts() {
  try {
    return await getPublishedPosts(3);
  } catch (error) {
    // The portfolio should still render if the blog database is unreachable.
    console.warn("[home] could not load latest posts:", error);
    return [];
  }
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": absoluteUrl("/#person"),
      name: SITE.name,
      url: absoluteUrl("/"),
      image: absoluteUrl("/urjala.jpeg"),
      jobTitle: SITE.jobTitle,
      description: SITE.description,
      knowsAbout: SITE.skills,
      sameAs: [SITE.github],
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      name: SITE.name,
      url: absoluteUrl("/"),
      description: SITE.description,
      inLanguage: "en",
      publisher: { "@id": absoluteUrl("/#person") },
    },
  ],
};

export default async function Home() {
  const [repos, posts] = await Promise.all([getRepos(), getLatestPosts()]);

  return (
    <main className="relative">
      <JsonLd data={structuredData} />
      <Header />
      <Hero />
      <About />
      <Skills />
      <Projects repos={repos} />
      <Writing posts={posts} />
      <footer className="border-t border-neutral-900 px-6 py-10 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Urjala Pariyar · Built with Next.js, R3F &amp; Framer Motion ·{" "}
        <a
          href={SITE.github}
          target="_blank"
          rel="noopener noreferrer me"
          className="text-neutral-400 underline-offset-4 hover:text-laser hover:underline"
        >
          github.com/ursche
        </a>
      </footer>
    </main>
  );
}
