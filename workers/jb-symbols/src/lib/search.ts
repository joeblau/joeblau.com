import MiniSearch from "minisearch";
import type { SymbolRecord } from "./types";

// Fields MiniSearch will index. Arrays are pre-joined into strings.
const FIELDS = [
	"primarySubject",
	"subjects",
	"shapes",
	"letters",
	"useCases",
	"style",
	"description",
	"section",
	"company",
	"industry",
	"country",
	"designers",
] as const;

const BOOST: Record<string, number> = {
	primarySubject: 6,
	subjects: 4,
	section: 4,
	company: 4,
	letters: 3,
	useCases: 2,
	industry: 2,
	shapes: 1.5,
	country: 1.5,
	designers: 1.5,
	style: 1,
	description: 1,
};

function toDoc(s: SymbolRecord) {
	return {
		id: s.id,
		primarySubject: s.primarySubject,
		subjects: s.subjects.join(" "),
		shapes: s.shapes.join(" "),
		letters: s.letters.join(" "),
		useCases: s.useCases.join(" "),
		style: s.style.join(" "),
		description: s.description,
		section: s.section ?? "",
		company: s.company ?? "",
		industry: s.industry ?? "",
		country: s.country ?? "",
		designers: (s.designers ?? []).join(" "),
	};
}

export function buildIndex(symbols: SymbolRecord[]): MiniSearch {
	const mini = new MiniSearch({
		fields: FIELDS as unknown as string[],
		storeFields: ["id"],
		// split on non-alphanumerics, keep single letters (for letterform search)
		tokenize: (text) => text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
		processTerm: (term) => (term.length >= 1 ? term : null),
		searchOptions: {
			boost: BOOST,
			// prefix-match anything 2+ chars; only fuzzy-match longer words to avoid
			// short tokens like "dog" matching "cog"/"dot".
			prefix: (term) => term.length >= 2,
			fuzzy: (term) => (term.length > 5 ? 0.2 : false),
			combineWith: "AND",
		},
	});
	mini.addAll(symbols.map(toDoc));
	return mini;
}

export function runSearch(
	mini: MiniSearch,
	byId: Map<string, SymbolRecord>,
	query: string,
	limit = 400,
): SymbolRecord[] {
	const q = query.trim();
	if (!q) return [];
	const hits = mini.search(q);
	if (hits.length === 0) return [];
	// Drop the weak tail: keep hits scoring within a fraction of the top hit.
	const cutoff = hits[0].score * 0.32;
	const out: SymbolRecord[] = [];
	for (const h of hits) {
		if (h.score < cutoff) break;
		const rec = byId.get(h.id as string);
		if (rec) out.push(rec);
		if (out.length >= limit) break;
	}
	return out;
}
