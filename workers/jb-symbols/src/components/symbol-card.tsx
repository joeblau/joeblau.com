"use client";

import type { SymbolRecord } from "@/lib/types";

export function SymbolCard({
	symbol,
	onSelect,
}: {
	symbol: SymbolRecord;
	onSelect: (s: SymbolRecord) => void;
}) {
	return (
		<button
			type="button"
			onClick={() => onSelect(symbol)}
			title={symbol.company || symbol.primarySubject}
			className="group relative flex aspect-square items-center justify-center rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/40 hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={symbol.svg}
				alt={symbol.primarySubject}
				loading="lazy"
				className="h-full w-full object-contain dark:invert"
			/>
			<span className="pointer-events-none absolute inset-x-1 bottom-1 truncate rounded bg-background/85 px-1.5 py-0.5 text-center text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
				{symbol.company || symbol.primarySubject}
			</span>
		</button>
	);
}
