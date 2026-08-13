import dexos from "@/content/dexos.md";

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
];

export function getMemo(slug: string): Memo | undefined {
  return MEMOS.find((memo) => memo.slug === slug);
}
