/**
 * Generate a Uniswap-token-list-format whitelist of the tokens Relay supports.
 *
 * Pulls Relay's curated/default currency list for every supported chain and
 * writes src/data/relay-token-list.json in the Uniswap Token List schema
 * (https://uniswap.org/tokenlist.schema.json). Non-EVM chains (Solana, etc.) are
 * included with their native address + an `extensions.vmType` tag; note these
 * non-0x addresses do not pass the schema's strict EVM-address validation, so
 * filter to vmType === "evm" if you need a strictly-valid list.
 *
 * Re-run with:  bun run build:tokens
 */

const API = "https://api.relay.link";
const LIMIT = 100; // the /currencies/v2 cap; default lists are well under this
const CONCURRENCY = 8;

interface RawCurrency {
	chainId: number;
	address: string;
	symbol: string;
	name?: string;
	decimals: number;
	vmType?: string;
	metadata?: { logoURI?: string; verified?: boolean };
}

interface TokenListEntry {
	chainId: number;
	address: string;
	name: string;
	symbol: string;
	decimals: number;
	logoURI?: string;
	extensions: { vmType: string; verified: boolean; chainName: string };
}

function flatten(json: unknown): RawCurrency[] {
	const rows = (
		Array.isArray(json) ? json : ((json as Record<string, unknown>)?.currencies ?? [])
	) as unknown[];
	const flat: RawCurrency[] = [];
	for (const r of rows) {
		if (Array.isArray(r)) flat.push(...(r as RawCurrency[]));
		else flat.push(r as RawCurrency);
	}
	return flat;
}

async function fetchChains(): Promise<
	{ id: number; name: string; vmType?: string }[]
> {
	const res = await fetch(`${API}/chains`);
	const json = (await res.json()) as Record<string, unknown>;
	const list = (Array.isArray(json) ? json : (json.chains ?? [])) as Record<
		string,
		unknown
	>[];
	return list
		.map((c) => ({
			id: Number(c.id),
			name: String(c.displayName ?? c.name ?? c.id),
			vmType: c.vmType as string | undefined,
		}))
		.filter((c) => Number.isFinite(c.id));
}

async function fetchChainCurrencies(chainId: number): Promise<RawCurrency[]> {
	const res = await fetch(`${API}/currencies/v2`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ chainIds: [chainId], defaultList: true, limit: LIMIT }),
	});
	if (!res.ok) return [];
	return flatten(await res.json());
}

async function pool<T, R>(
	items: T[],
	n: number,
	fn: (t: T) => Promise<R>,
): Promise<R[]> {
	const out: R[] = [];
	let i = 0;
	await Promise.all(
		Array.from({ length: Math.min(n, items.length) }, async () => {
			while (i < items.length) {
				const idx = i++;
				out[idx] = await fn(items[idx]);
			}
		}),
	);
	return out;
}

const chains = await fetchChains();
const chainName = new Map(chains.map((c) => [c.id, c.name]));
console.error(`Fetching default token lists for ${chains.length} chains…`);
const perChain = await pool(chains, CONCURRENCY, (c) =>
	fetchChainCurrencies(c.id).catch(() => [] as RawCurrency[]),
);

const seen = new Set<string>();
const tokens: TokenListEntry[] = [];
const capped: number[] = [];

for (let ci = 0; ci < chains.length; ci++) {
	const rows = perChain[ci];
	if (rows.length >= LIMIT) capped.push(chains[ci].id);
	for (const c of rows) {
		if (!c.address || !c.symbol || c.decimals == null) continue;
		const vmType = c.vmType ?? "evm";
		const address = vmType === "evm" ? c.address.toLowerCase() : c.address;
		const key = `${c.chainId}:${address.toLowerCase()}`;
		if (seen.has(key)) continue;
		seen.add(key);
		const entry: TokenListEntry = {
			chainId: c.chainId,
			address,
			name: c.name || c.symbol,
			symbol: c.symbol,
			decimals: Number(c.decimals),
			extensions: {
				vmType,
				verified: c.metadata?.verified ?? false,
				chainName: chainName.get(c.chainId) ?? String(c.chainId),
			},
		};
		if (c.metadata?.logoURI) entry.logoURI = c.metadata.logoURI;
		tokens.push(entry);
	}
}

tokens.sort(
	(a, b) => a.chainId - b.chainId || a.symbol.localeCompare(b.symbol),
);

const list = {
	name: "Relay Supported Tokens",
	timestamp: new Date().toISOString(),
	version: { major: 1, minor: 0, patch: 0 },
	keywords: ["relay", "cross-chain", "bridge", "swap"],
	tags: {},
	logoURI: "https://assets.relay.link/icons/1/light.png",
	tokens,
};

await Bun.write(
	"src/data/relay-token-list.json",
	`${JSON.stringify(list, null, "\t")}\n`,
);

const evm = tokens.filter((t) => t.extensions.vmType === "evm").length;
console.error(
	`Wrote ${tokens.length} tokens (${evm} EVM, ${tokens.length - evm} non-EVM) across ${chains.length} chains.`,
);
if (capped.length) {
	console.error(
		`WARNING: these chains returned ${LIMIT} rows and may be truncated: ${capped.join(", ")}`,
	);
}
