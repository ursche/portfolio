import Header from "@/components/Header";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    // Near-opaque ground over the WebGL scene: long-form text needs calm contrast.
    <main className="relative min-h-screen bg-void/90">
      <Header />
      {children}
      <footer className="border-t border-neutral-900 px-6 py-10 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Urjala Pariyar
      </footer>
    </main>
  );
}
