import dexos from "@/content/dexos.md";
import validator from "@/content/validator.md";

export type Author = {
  name: string;
  role: string;
  companies: string;
};

export type Memo = {
  /** URL path segment — memo.joeblau.com/<slug> */
  slug: string;
  /** Small uppercase label above the memo */
  eyebrow: string;
  /** Page + Open Graph title */
  title: string;
  description: string;
  /** Markdown body, inlined at build time (see next.config.js) */
  content: string;
  /** Open Graph card copy */
  og: {
    headline: string;
    subhead: string;
    stats: { value: string; label: string }[];
  };
  authors: Author[];
};

export const MEMOS: Memo[] = [
  {
    slug: "dexos",
    eyebrow: "DEXos",
    title: "DEXos — A 24/7 Global Trading Operating System",
    description:
      "The next evolution of capital markets: a truly 24/7, globally decentralized, high-performance trading operating system.",
    content: dexos,
    og: {
      headline: "A 24/7 Global Trading Operating System",
      subhead: "The next evolution in capital-market infrastructure",
      stats: [
        { value: "188.6M", label: "orders/s per link" },
        { value: "16", label: "global validators" },
        { value: "24/7", label: "continuous markets" },
      ],
    },
    authors: [
      {
        name: "Joe Blau",
        companies: "Uber • Amazon • Virginia Tech",
        role: "Design Engineer",
      },
      { name: "David Blau", companies: "Jump • MIT", role: "Quant Engineer" },
    ],
  },
  {
    slug: "validator",
    eyebrow: "Validator",
    title: "Hyperliquid Full Validator — Strategy Overview",
    description:
      "Latency-optimized execution on HIP-3 markets: order-to-fill cut from ~5,000 ms to ~500 ms, with a materially cheaper fee stack.",
    content: validator,
    og: {
      headline: "Hyperliquid Full Validator",
      subhead: "Latency-optimized execution on HIP-3 markets",
      stats: [
        { value: "~500ms", label: "order-to-fill latency" },
        { value: "47%", label: "lower taker fees" },
        { value: "2–4wk", label: "initial test window" },
      ],
    },
    authors: [
      {
        name: "Joe Blau",
        companies: "Uber • Amazon • Virginia Tech",
        role: "Design Engineer",
      },
      { name: "David Blau", companies: "Jump • MIT", role: "Quant Engineer" },
    ],
  },
];

export function getMemo(slug: string): Memo | undefined {
  return MEMOS.find((memo) => memo.slug === slug);
}
