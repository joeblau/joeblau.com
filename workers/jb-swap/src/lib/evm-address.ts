const ADDRESS_FIELD_NAMES = new Set([
	"recipient",
	"address",
	"to",
	"wallet",
	"walletaddress",
	"wallet_address",
	"target_address",
	"targetaddress",
]);

// 0x + 40 hex chars. Scans anywhere inside a string so we can pluck the
// address out of free-form payloads (e.g. "Pay: 0xabc...123 on Arbitrum").
const HEX_ADDRESS_PATTERN = /0x[a-fA-F0-9]{40}/g;
const STRICT_HEX_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

/**
 * Validate + normalize a candidate to its `0x`-lowercase form, or null if it
 * isn't a 40-hex EVM address. This is a lightweight check (no EIP-55 checksum
 * verification) — enough for populating an address field in this demo UI.
 */
export function normalizeEvmAddress(value: string): string | null {
	const trimmed = value.trim();
	if (!STRICT_HEX_ADDRESS.test(trimmed)) return null;
	return trimmed.toLowerCase();
}

export function isValidEvmAddress(value: string): boolean {
	return normalizeEvmAddress(value) !== null;
}

function extractFromSearchParams(searchParams: URLSearchParams): string | null {
	for (const [key, value] of searchParams.entries()) {
		if (!ADDRESS_FIELD_NAMES.has(key.toLowerCase())) continue;
		const candidate = normalizeEvmAddress(value) ?? extractEvmAddress(value);
		if (candidate) return candidate;
	}
	return null;
}

function extractFromUrl(data: string): string | null {
	let url: URL;
	try {
		url = new URL(data);
	} catch {
		return null;
	}

	const queryCandidate = extractFromSearchParams(url.searchParams);
	if (queryCandidate) return queryCandidate;

	const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
	if (hash) {
		const hashQuery = hash.startsWith("?") ? hash.slice(1) : hash;
		const hashCandidate = extractFromSearchParams(
			new URLSearchParams(hashQuery),
		);
		if (hashCandidate) return hashCandidate;
	}

	for (const segment of url.pathname.split("/")) {
		const candidate = normalizeEvmAddress(segment);
		if (candidate) return candidate;
	}

	return null;
}

function extractByPattern(data: string): string | null {
	for (const match of data.matchAll(HEX_ADDRESS_PATTERN)) {
		const candidate = normalizeEvmAddress(match[0]);
		if (candidate) return candidate;
	}
	return null;
}

/**
 * Pull an EVM address out of an arbitrary QR payload. Strategies in order:
 *
 *   1. Direct 0x-hex (the common case — most wallets encode the raw address).
 *   2. EIP-681 `ethereum:` URI, including `pay-<target>@<chainId>/<fn>`
 *      variants — we only keep the target address, not function/value/chain.
 *   3. URL with a recognized query / hash / path segment carrying the addr.
 *   4. Regex fallback — scans for any 0x<40hex> substring.
 *
 * Returns the lowercased address or null.
 */
export function extractEvmAddress(data: string): string | null {
	const trimmed = data.trim();
	if (!trimmed) return null;

	const directCandidate = normalizeEvmAddress(trimmed);
	if (directCandidate) return directCandidate;

	// EIP-681: `ethereum:<address>[@chainId][/function][?args]`
	//          or `ethereum:pay-<address>@<chainId>/transfer?...`
	const ethMatch = trimmed.match(/^ethereum:(?:pay-)?([^@/?#]+)/i);
	if (ethMatch) {
		const schemeCandidate = normalizeEvmAddress(ethMatch[1]);
		if (schemeCandidate) return schemeCandidate;
	}

	const urlCandidate = extractFromUrl(trimmed);
	if (urlCandidate) return urlCandidate;

	return extractByPattern(trimmed);
}
