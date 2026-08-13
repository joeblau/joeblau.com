import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { MEMOS, getMemo } from "@/lib/memos";
import { ThemeToggle } from "@/components/theme-toggle";

export function generateStaticParams() {
  return MEMOS.map((memo) => ({ slug: memo.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const memo = getMemo(slug);
  if (!memo) return {};

  const url = `https://memo.joeblau.com/${memo.slug}`;
  const image = {
    url: `/api/og/${memo.slug}`,
    width: 1200,
    height: 630,
    alt: memo.eyebrow,
  };

  return {
    title: memo.title,
    description: memo.description,
    alternates: { canonical: url },
    openGraph: {
      title: memo.title,
      description: memo.description,
      url,
      siteName: "Memo",
      type: "article",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: memo.title,
      description: memo.description,
      images: [image.url],
    },
  };
}

export default async function MemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const memo = getMemo(slug);
  if (!memo) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <header className="mb-8 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          {memo.eyebrow}
        </Link>
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
          {memo.content}
        </ReactMarkdown>
      </article>

      <footer className="mt-16 grid grid-cols-2 gap-8 border-t border-border pt-10">
        {memo.authors.map((author) => (
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
