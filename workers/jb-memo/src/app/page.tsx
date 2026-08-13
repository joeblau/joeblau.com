import Link from "next/link";
import { MEMOS } from "@/lib/memos";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <header className="mb-12 flex items-center justify-between gap-4">
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Memo
        </p>
        <ThemeToggle />
      </header>

      <ul className="divide-y divide-border border-y border-border">
        {MEMOS.map((memo) => (
          <li key={memo.slug}>
            <Link
              href={`/${memo.slug}`}
              className="group block py-8 transition-opacity hover:opacity-80"
            >
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                {memo.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-balance">
                {memo.title}
              </h2>
              <p className="mt-2 text-base text-muted-foreground">
                {memo.description}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
