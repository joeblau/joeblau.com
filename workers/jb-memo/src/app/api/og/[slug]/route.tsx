import { ImageResponse } from "next/og";
import { MEMOS, getMemo } from "@/lib/memos";

export const runtime = "nodejs";

export function generateStaticParams() {
  return MEMOS.map((memo) => ({ slug: memo.slug }));
}

// Dynamic Open Graph image per memo — https://vercel.com/docs/og-image-generation
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const memo = getMemo(slug);
  if (!memo) return new Response("Not found", { status: 404 });

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
          {memo.eyebrow}
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
            {memo.og.headline}
          </div>
          <div style={{ fontSize: 34, color: "#b8ad99", fontWeight: 600 }}>
            {memo.og.subhead}
          </div>
        </div>
        <div style={{ display: "flex", gap: 48, fontSize: 28 }}>
          {memo.og.stats.map((stat) => (
            <div
              key={stat.label}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <span style={{ fontWeight: 800, fontSize: 40 }}>{stat.value}</span>
              <span style={{ color: "#b8ad99" }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
