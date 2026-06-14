import {
	RELAY_API_BASE,
	RelayApiError,
	type RelayChain,
	type RelayVmType,
} from "./types";

const NATIVE = "0x0000000000000000000000000000000000000000";
const TTL_MS = 5 * 60 * 1000;
let cache: { at: number; data: RelayChain[] } | null = null;

/** Map a raw `/chains` entry to a normalized RelayChain. Pure + testable. */
export function parseChain(raw: Record<string, unknown>): RelayChain {
	const currency = (raw?.currency ?? {}) as Record<string, unknown>;
	return {
		id: Number(raw?.id),
		name: String(raw?.name ?? ""),
		displayName: String(raw?.displayName ?? raw?.name ?? ""),
		vmType: (raw?.vmType ?? "evm") as RelayVmType,
		currency: {
			symbol: String(currency?.symbol ?? ""),
			decimals: Number(currency?.decimals ?? 18),
			address: String(currency?.address ?? NATIVE),
		},
		iconUrl: (raw?.iconUrl ?? raw?.logoUrl ?? undefined) as string | undefined,
	};
}

async function safeBody(res: Response) {
	try {
		return await res.json();
	} catch {
		return undefined;
	}
}

/** Fetch the supported chains from Relay (cached 5min). Inject `fetchImpl` in tests. */
export async function fetchChains(options?: {
	force?: boolean;
	fetchImpl?: typeof fetch;
}): Promise<RelayChain[]> {
	if (!options?.force && cache && Date.now() - cache.at < TTL_MS) {
		return cache.data;
	}
	const f = options?.fetchImpl ?? fetch;
	const res = await f(`${RELAY_API_BASE}/chains`);
	if (!res.ok) {
		throw new RelayApiError("GET /chains failed", res.status, await safeBody(res));
	}
	const json = (await res.json()) as Record<string, unknown> | unknown[];
	const list = (
		Array.isArray(json) ? json : ((json as Record<string, unknown>)?.chains ?? [])
	) as Record<string, unknown>[];
	const data = list.map(parseChain).filter((c) => Number.isFinite(c.id));
	cache = { at: Date.now(), data };
	return data;
}

export function clearChainsCache() {
	cache = null;
}
