export interface SymbolRecord {
	id: string;
	vol: number;
	num: number;
	svg: string;
	isTextLogo: boolean;
	primarySubject: string;
	subjects: string[];
	shapes: string[];
	letters: string[];
	useCases: string[];
	style: string[];
	description: string;
	searchText: string;
	// optional category section (Vol 2 subject grouping, e.g. "birds")
	section?: string;
	// optional metadata (joined from the book's client index)
	plate?: number;
	company?: string;
	designers?: string[];
	country?: string;
	year?: string;
	industry?: string;
}
