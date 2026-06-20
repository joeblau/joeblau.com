"use client";

import { Download } from "lucide-react";
import type { SymbolRecord } from "@/lib/types";

export function SymbolCard({
	symbol,
	onSelect,
}: {
	symbol: SymbolRecord;
	onSelect: (s: SymbolRecord) => void;
}) {
	return (
		<div className="group relative aspect-square rounded-lg border border-border bg-card transition-colors hover:border-foreground/40 hover:bg-accent focus-within:ring-2 focus-within:ring-ring">
			<button
				type="button"
				onClick={() => onSelect(symbol)}
				title={symbol.company || symbol.primarySubject}
				className="flex h-full w-full items-center justify-center p-4 focus:outline-none"
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
			<a
				href={symbol.svg}
				download={`${symbol.id}.svg`}
				onClick={(e) => e.stopPropagation()}
				aria-label="Download SVG"
				title="Download SVG"
				className="absolute right-1 top-1 rounded-md bg-background/85 p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus:opacity-100 group-hover:opacity-100"
			>
				<Download className="h-3.5 w-3.5" />
			</a>
		</div>
	);
}
