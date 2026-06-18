"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { SymbolRecord } from "@/lib/types";

function TagRow({ label, tags, onTag }: { label: string; tags: string[]; onTag: (t: string) => void }) {
	if (!tags.length) return null;
	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
			<div className="flex flex-wrap gap-1.5">
				{tags.map((t) => (
					<button
						key={t}
						type="button"
						onClick={() => onTag(t)}
						className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground transition-colors hover:border-foreground/40 hover:bg-accent"
					>
						{t}
					</button>
				))}
			</div>
		</div>
	);
}

export function SymbolDetail({
	symbol,
	onClose,
	onTag,
}: {
	symbol: SymbolRecord | null;
	onClose: () => void;
	onTag: (t: string) => void;
}) {
	useEffect(() => {
		if (!symbol) return;
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [symbol, onClose]);

	if (!symbol) return null;

	const meta: [string, string | undefined][] = [
		["Company", symbol.company],
		["Category", symbol.section],
		["Industry", symbol.industry],
		["Designer", symbol.designers?.join(", ")],
		["Country", symbol.country],
		["Year", symbol.year],
	];
	const hasMeta = meta.some(([, v]) => v);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
			onClick={onClose}
		>
			<div
				className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close"
					className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				>
					<X className="h-5 w-5" />
				</button>

				<div className="grid gap-6 overflow-y-auto p-6 sm:grid-cols-[200px_1fr]">
					<div className="flex flex-col gap-3">
						<div className="flex aspect-square items-center justify-center rounded-lg border border-border bg-background p-6">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={symbol.svg} alt={symbol.primarySubject} className="h-full w-full object-contain dark:invert" />
						</div>
						<div className="text-center text-xs text-muted-foreground">
							Vol {symbol.vol} · №{symbol.plate ?? symbol.num}
						</div>
					</div>

					<div className="flex flex-col gap-4">
						<div>
							<h2 className="text-lg font-semibold capitalize">
								{symbol.company || symbol.primarySubject}
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">{symbol.description}</p>
						</div>

						{hasMeta && (
							<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
								{meta.map(([k, v]) =>
									v ? (
										<div key={k} className="contents">
											<dt className="text-muted-foreground">{k}</dt>
											<dd>{v}</dd>
										</div>
									) : null,
								)}
							</dl>
						)}

						<TagRow label="Subjects" tags={symbol.subjects} onTag={onTag} />
						<TagRow label="Shapes" tags={symbol.shapes} onTag={onTag} />
						{symbol.letters.length > 0 && <TagRow label="Letters" tags={symbol.letters} onTag={onTag} />}
						<TagRow label="Use cases" tags={symbol.useCases} onTag={onTag} />
						<TagRow label="Style" tags={symbol.style} onTag={onTag} />
					</div>
				</div>
			</div>
		</div>
	);
}
