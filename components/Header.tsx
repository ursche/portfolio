"use client";

import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CodeIcon, FolderIcon, GitHubIcon, HomeIcon, PenIcon, UserIcon } from "@/components/icons";

type NavLink = {
  label: string;
  href: string;
  section?: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const LINKS: NavLink[] = [
  { label: "Home", href: "/#hero", section: "hero", Icon: HomeIcon },
  { label: "About", href: "/#about", section: "about", Icon: UserIcon },
  { label: "Skills", href: "/#skills", section: "skills", Icon: CodeIcon },
  {
    label: "Projects",
    href: "/#projects",
    section: "projects",
    Icon: FolderIcon,
  },
  { label: "Blog", href: "/blog", Icon: PenIcon },
];

const itemClass =
  "group relative flex h-10 w-10 items-center justify-center rounded-full text-lg transition-colors hover:bg-white/10 hover:text-white";

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md border border-neutral-800 bg-void/90 px-2 py-1 text-xs text-neutral-200 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
      {label}
    </span>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Highlight the section currently in view on the home page.
  useEffect(() => {
    if (pathname !== "/") return setActiveSection(null);
    const els = LINKS.flatMap((l) => (l.section ? [document.getElementById(l.section)] : [])).filter(
      (el): el is HTMLElement => el !== null,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActiveSection(e.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-0 z-40 px-6 py-5 sm:px-10"
      >
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          Urjala<span className="text-neon">.</span>
        </Link>
      </motion.header>

      <div className="fixed left-2 top-1/2 z-40 -translate-y-1/2 sm:left-5">
        <motion.nav
          aria-label="Main"
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-1 rounded-full border border-neutral-800 bg-void/70 p-1 text-neutral-400 shadow-lg shadow-black/40 backdrop-blur-md sm:gap-2 sm:p-1.5"
        >
          {LINKS.map(({ label, href, section, Icon }) => {
            const active = section ? activeSection === section : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`${itemClass} ${active ? "bg-neon/20 text-white" : ""}`}
              >
                <Icon />
                <Tooltip label={label} />
              </Link>
            );
          })}
          <span className="my-1 h-px w-5 bg-neutral-800" aria-hidden="true" />
          <a
            href="https://github.com/ursche"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className={`${itemClass} hover:text-laser`}
          >
            <GitHubIcon />
            <Tooltip label="GitHub" />
          </a>
        </motion.nav>
      </div>
    </>
  );
}
