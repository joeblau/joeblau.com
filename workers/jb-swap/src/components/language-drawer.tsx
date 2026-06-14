"use client";

import { Check, ChevronRight, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { HapticButton } from "@/components/haptic-button";
import { cn } from "@/lib/utils";

/**
 * Language picker pieces for the AppMenu sheet. Rather than open a second
 * drawer, the menu swaps its own content between the menu view and the
 * `LanguagePanel`; Vaul's dynamic height animates the sheet taller/shorter to
 * fit. `LanguageRow` is the tappable menu entry (circular flag + current
 * language) that triggers the swap.
 *
 * Flags come from flagcdn.com's SVG CDN — the same pattern the token/chain
 * icons use. (restcountries.com/flags serves an HTML page, not an image.)
 */

export interface Language {
	/** BCP-47 code used as the stable key / persisted value. */
	code: string;
	/** Endonym shown to the user. */
	name: string;
	/** English name, kept searchable so "Spanish" finds "Español". */
	englishName: string;
	/** ISO 3166-1 alpha-2 country code for the flag CDN. */
	flag: string;
}

export const LANGUAGES: Language[] = [
	{ code: "en", name: "English", englishName: "English", flag: "us" },
	{ code: "es", name: "Español", englishName: "Spanish", flag: "es" },
	{ code: "zh", name: "中文", englishName: "Chinese", flag: "cn" },
	{ code: "ko", name: "한국어", englishName: "Korean", flag: "kr" },
	{ code: "fr", name: "Français", englishName: "French", flag: "fr" },
];

export const languageFor = (code: string) =>
	LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

const flagUrl = (code: string) => `https://flagcdn.com/${code}.svg`;

export function FlagCircle({
	flag,
	alt,
	className,
}: {
	flag: string;
	alt: string;
	className?: string;
}) {
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={flagUrl(flag)}
			alt={alt}
			className={cn(
				"size-8 shrink-0 rounded-full bg-foreground/[0.06] object-cover",
				className,
			)}
		/>
	);
}

/** Case-insensitive substring match across endonym, English name and code. */
function matches(query: string, lang: Language) {
	const q = query.trim().toLowerCase();
	if (q === "") return true;
	return (
		lang.name.toLowerCase().includes(q) ||
		lang.englishName.toLowerCase().includes(q) ||
		lang.code.toLowerCase().includes(q)
	);
}

/** The menu row: circular flag + "Language" + current endonym. Opens the panel. */
export function LanguageRow({
	value,
	onOpen,
}: {
	value: string;
	onOpen: () => void;
}) {
	const current = languageFor(value);
	return (
		<HapticButton
			type="button"
			onClick={onOpen}
			wrapperClassName="block w-full"
			className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-full bg-foreground/[0.06] pl-1.5 pr-4 text-left text-base font-medium text-foreground transition-colors hover:bg-foreground/10"
		>
			<FlagCircle
				flag={current.flag}
				alt={current.englishName}
				className="size-9"
			/>
			<span className="flex-1">Language</span>
			<span className="text-muted-foreground">{current.name}</span>
			<ChevronRight className="size-5 shrink-0 text-muted-foreground" />
		</HapticButton>
	);
}

/** The pushed-in view: search field + scrollable list of every language. */
export function LanguagePanel({
	value,
	onSelect,
}: {
	value: string;
	onSelect: (code: string) => void;
}) {
	const [query, setQuery] = useState("");
	const searchRef = useRef<HTMLInputElement>(null);
	const current = languageFor(value);

	// Focus the search on web only (skip mobile to avoid popping the keyboard).
	useEffect(() => {
		if (!window.matchMedia("(min-width: 768px)").matches) return;
		const t = setTimeout(() => searchRef.current?.focus(), 150);
		return () => clearTimeout(t);
	}, []);

	const filtered = LANGUAGES.filter((l) => matches(query, l));

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-3 rounded-2xl bg-foreground/[0.06] px-4 py-3">
				<Search className="size-5 shrink-0 text-muted-foreground" />
				<input
					ref={searchRef}
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Search languages"
					className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
				/>
			</div>

			<div className="scrollbar-subtle -mx-1 max-h-[50vh] overflow-y-auto px-1">
				{filtered.length === 0 && (
					<p className="py-8 text-center text-sm text-muted-foreground">
						No languages found
					</p>
				)}
				{filtered.map((l) => {
					const isSelected = l.code === current.code;
					return (
						<HapticButton
							key={l.code}
							type="button"
							wrapperClassName="block w-full"
							onClick={() => onSelect(l.code)}
							className="flex w-full cursor-pointer items-center gap-3 rounded-xl py-3 text-left transition-colors hover:bg-foreground/[0.04]"
						>
							<FlagCircle flag={l.flag} alt={l.englishName} />
							<div className="min-w-0 flex-1">
								<p className="font-semibold text-foreground">{l.name}</p>
								<p className="text-sm text-muted-foreground">{l.englishName}</p>
							</div>
							{isSelected && (
								<Check className="size-5 shrink-0 text-foreground" />
							)}
						</HapticButton>
					);
				})}
			</div>
		</div>
	);
}
