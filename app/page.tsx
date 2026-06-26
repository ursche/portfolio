import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";

export default function Home() {
  return (
    <main className="relative">
      <Header />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <footer className="border-t border-neutral-900 px-6 py-10 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Urjala Pariyar · Built with Next.js, R3F &amp; Framer Motion ·{" "}
        <a
          href="https://github.com/ursche"
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-400 underline-offset-4 hover:text-laser hover:underline"
        >
          github.com/ursche
        </a>
      </footer>
    </main>
  );
}
