import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import TransitionProvider from "@/components/TransitionProvider";
import SceneWrapper from "@/components/three/SceneWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Urjala Pariyar — Laravel + React Developer",
  description:
    "Portfolio of Urjala Pariyar, a full-stack developer crafting robust Laravel backends and animated React frontends.",
  metadataBase: new URL("https://github.com/ursche"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable}`}>
      <body className="noise">
        <SmoothScroll>
          {/* Persistent WebGL background — survives route changes */}
          <SceneWrapper />
          <TransitionProvider>{children}</TransitionProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
