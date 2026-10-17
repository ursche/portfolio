import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Shared social card: dark ground, accent bar, big title. */
export function ogCard({ eyebrow, title, footer }: { eyebrow: string; title: string; footer: string }) {
  const fontSize = title.length > 70 ? 56 : title.length > 40 ? 68 : 84;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "radial-gradient(circle at 85% 15%, #2e1065 0%, #060010 55%)",
          color: "#f5f5f5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 6, background: "#22d3ee", borderRadius: 3 }} />
          <div style={{ fontSize: 26, letterSpacing: 8, textTransform: "uppercase", color: "#22d3ee" }}>
            {eyebrow}
          </div>
        </div>
        <div style={{ display: "flex", fontSize, fontWeight: 700, lineHeight: 1.1, maxWidth: 1000 }}>
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#a3a3a3" }}>
          <div style={{ display: "flex" }}>
            Urjala<span style={{ color: "#8b5cf6" }}>.</span>
          </div>
          <div style={{ display: "flex" }}>{footer}</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
