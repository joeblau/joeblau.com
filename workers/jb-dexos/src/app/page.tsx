import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import memo from "@/content/memo.md";

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
