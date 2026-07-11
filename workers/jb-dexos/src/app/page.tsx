import fs from "node:fs";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Read the memo at build time — this page is statically prerendered, so the
// file read happens during `next build`, never at runtime on the edge.
const memo = fs.readFileSync(
  path.join(process.cwd(), "src/content/memo.md"),
  "utf8",
);

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <p className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
        DEXos
      </p>
      <article className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-extrabold prose-headings:tracking-tight prose-h1:text-balance">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{memo}</ReactMarkdown>
      </article>
    </main>
  );
}
