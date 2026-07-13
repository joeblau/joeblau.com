import { ImageResponse } from "next/og";

export const runtime = "nodejs";

// Dynamic Open Graph image for DEXos — https://vercel.com/docs/og-image-generation
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#faf6ee",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#b8ad99",
          }}
        >
          DEXos
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            A 24/7 Global Trading Operating System
          </div>
          <div style={{ fontSize: 34, color: "#b8ad99", fontWeight: 600 }}>
            The next evolution in capital-market infrastructure
          </div>
        </div>
        <div style={{ display: "flex", gap: 48, fontSize: 28 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 800, fontSize: 40 }}>188.6M</span>
            <span style={{ color: "#b8ad99" }}>orders/s per link</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 800, fontSize: 40 }}>16</span>
            <span style={{ color: "#b8ad99" }}>global validators</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 800, fontSize: 40 }}>24/7</span>
            <span style={{ color: "#b8ad99" }}>continuous markets</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
