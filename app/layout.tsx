import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import TransitionProvider from "@/components/TransitionProvider";
import SceneWrapper from "@/components/three/SceneWrapper";
import Assistant from "@/components/assistant/Assistant";
import { BASE_OPEN_GRAPH, RSS_ALTERNATE, SITE } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif", style: ["normal", "italic"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s - ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  keywords: [...SITE.skills, "Full-stack developer", "Portfolio", "Blog"],
  openGraph: {
    ...BASE_OPEN_GRAPH,
    type: "website",
    url: "/",
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  alternates: {
    types: RSS_ALTERNATE,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#060010",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable} ${serif.variable}`}>
      <body className="noise">
        <SmoothScroll>
          {/* Persistent WebGL background - survives route changes */}
          <SceneWrapper />
          <TransitionProvider>{children}</TransitionProvider>
          {/* Chat robot, outside the page transition so it stays put between routes */}
          <Assistant />
        </SmoothScroll>
      </body>
    </html>
  );
}
