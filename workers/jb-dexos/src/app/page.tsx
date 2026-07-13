import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import memo from "@/content/memo.md";
import { ThemeToggle } from "@/components/theme-toggle";

const AUTHORS = [
  {
    name: "Joe Blau",
    companies: "Uber • Amazon • Virginia Tech",
    role: "Design Engineer",
  },
  { name: "David Blau", companies: "Jump • MIT", role: "Quant Engineer" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <header className="mb-8 flex items-center justify-between gap-4">
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          DEXos
        </p>
        <ThemeToggle />
      </header>
      <article className="prose prose-stone max-w-none dark:prose-invert prose-headings:font-extrabold prose-headings:tracking-tight prose-h1:text-balance">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            table: ({ children, ...props }) => (
              <div className="overflow-x-auto">
                <table {...props}>{children}</table>
              </div>
            ),
          }}
        >
          {memo}
        </ReactMarkdown>
      </article>

      <footer className="mt-16 grid grid-cols-2 gap-8 border-t border-border pt-10">
        {AUTHORS.map((author) => (
          <div key={author.name}>
            <p className="text-xl font-bold">{author.name}</p>
            <p className="text-base font-semibold text-muted-foreground">
              {author.role}
            </p>
            <p className="text-base text-muted-foreground">{author.companies}</p>
          </div>
        ))}
      </footer>
    </main>
  );
}
