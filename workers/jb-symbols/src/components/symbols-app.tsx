"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type MiniSearch from "minisearch";
import { Search, X } from "lucide-react";
import type { SymbolRecord } from "@/lib/types";
import { buildIndex, runSearch } from "@/lib/search";
import { SymbolCard } from "@/components/symbol-card";
import { SymbolDetail } from "@/components/symbol-detail";
import { ThemeToggle } from "@/components/theme-toggle";

const PAGE = 120;
const EXAMPLES = ["swan", "eagle", "dog", "arrow", "star", "bird", "circle", "letter m", "fish", "tree"];

export function SymbolsApp() {
	const [symbols, setSymbols] = useState<SymbolRecord[] | null>(null);
	const [query, setQuery] = useState("");
	const [vol, setVol] = useState<0 | 1 | 2>(0);
	const [selected, setSelected] = useState<SymbolRecord | null>(null);
	const [limit, setLimit] = useState(PAGE);
	const indexRef = useRef<MiniSearch | null>(null);
	const byIdRef = useRef<Map<string, SymbolRecord>>(new Map());
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		let alive = true;
		fetch("/symbols.json")
			.then((r) => r.json())
			.then((data: SymbolRecord[]) => {
				if (!alive) return;
				setSymbols(data);
				byIdRef.current = new Map(data.map((s) => [s.id, s]));
				indexRef.current = buildIndex(data);
			});
		return () => {
			alive = false;
		};
	}, []);

	useEffect(() => setLimit(PAGE), [query, vol]);

	// "/" focuses the search box
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "/" && document.activeElement !== inputRef.current) {
				e.preventDefault();
				inputRef.current?.focus();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	const results = useMemo(() => {
		if (!symbols) return [];
		const base =
			query.trim() && indexRef.current
				? runSearch(indexRef.current, byIdRef.current, query)
				: symbols;
		return vol === 0 ? base : base.filter((s) => s.vol === vol);
	}, [symbols, query, vol]);

	const shown = results.slice(0, limit);
	const loading = symbols === null;

	return (
		<div className="min-h-screen">
			{/* Header / search */}
			<header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
				<div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
					<div className="hidden shrink-0 font-mono text-sm font-semibold tracking-tight sm:block">
						symbols
					</div>
					<div className="relative flex-1">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<input
							ref={inputRef}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search 3,080 trademarks & symbols — try “swan”, “eagle”, “arrow”…"
							className="h-11 w-full rounded-lg border border-border bg-card pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground/40"
							autoFocus
						/>
						{query && (
							<button
								type="button"
								onClick={() => {
									setQuery("");
									inputRef.current?.focus();
								}}
								aria-label="Clear"
								className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>
					<div className="hidden shrink-0 items-center gap-1 rounded-lg border border-border bg-card p-0.5 sm:flex">
						{([0, 1, 2] as const).map((v) => (
							<button
								key={v}
								type="button"
								onClick={() => setVol(v)}
								className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
									vol === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
								}`}
							>
								{v === 0 ? "All" : `Vol ${v}`}
							</button>
						))}
					</div>
					<ThemeToggle />
				</div>
			</header>

			<main className="mx-auto max-w-6xl px-4 py-6">
				{/* example chips */}
				{!query && (
					<div className="mb-5 flex flex-wrap items-center gap-2">
						<span className="text-xs text-muted-foreground">Try:</span>
						{EXAMPLES.map((ex) => (
							<button
								key={ex}
								type="button"
								onClick={() => setQuery(ex)}
								className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
							>
								{ex}
							</button>
						))}
					</div>
				)}

				{/* count */}
				<div className="mb-3 text-sm text-muted-foreground">
					{loading
						? "Loading…"
						: query.trim()
							? `${results.length.toLocaleString()} result${results.length === 1 ? "" : "s"} for “${query.trim()}”`
							: `Browsing ${results.length.toLocaleString()} symbols`}
				</div>

				{!loading && results.length === 0 && (
					<div className="py-24 text-center text-muted-foreground">
						No symbols match “{query.trim()}”. Try a simpler or different word.
					</div>
				)}

				<div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
					{shown.map((s) => (
						<SymbolCard key={s.id} symbol={s} onSelect={setSelected} />
					))}
				</div>

				{shown.length < results.length && (
					<div className="mt-8 flex justify-center">
						<button
							type="button"
							onClick={() => setLimit((l) => l + PAGE)}
							className="rounded-lg border border-border bg-card px-5 py-2 text-sm transition-colors hover:border-foreground/40 hover:bg-accent"
						>
							Load more ({(results.length - shown.length).toLocaleString()} more)
						</button>
					</div>
				)}
			</main>

			<footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-xs text-muted-foreground">
				3,080 marks from <span className="italic">Trademarks &amp; Symbols</span> (Yasaburo Kuwayama) — Vol 1 Alphabetical &amp; Vol 2 Symbolical. Tagged for search.
			</footer>

			<SymbolDetail symbol={selected} onClose={() => setSelected(null)} onTag={(t) => { setSelected(null); setQuery(t); }} />
		</div>
	);
}
