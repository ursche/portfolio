import Link from "next/link";

export default function StudioBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-900 bg-void/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-display text-lg font-bold tracking-tight">
            Urjala<span className="text-neon">.</span>
          </Link>
          <Link href="/studio" className="text-sm text-neutral-500 transition-colors hover:text-white">
            Studio
          </Link>
        </div>
        <div className="flex items-center gap-3 text-sm">{children}</div>
      </div>
    </header>
  );
}
