import {
	RELAY_API_BASE,
	RelayApiError,
	type RelayCurrency,
	type RelayVmType,
} from "./types";

/** Map a raw `/currencies/v2` entry to a normalized RelayCurrency. Pure + testable. */
export function parseCurrency(raw: Record<string, unknown>): RelayCurrency {
	const md = (raw?.metadata ?? {}) as Record<string, unknown>;
	return {
		chainId: Number(raw?.chainId),
		address: String(raw?.address ?? ""),
		symbol: String(raw?.symbol ?? ""),
		name: String(raw?.name ?? md?.name ?? raw?.symbol ?? ""),
		decimals: Number(raw?.decimals ?? 18),
		logoUrl: (md?.logoURI ?? raw?.logoURI ?? undefined) as string | undefined,
		vmType: raw?.vmType as RelayVmType | undefined,
	};
}

/** Flatten the `/currencies/v2` response (it returns groups-of-arrays or a flat list). Pure. */
export function flattenCurrencies(json: unknown): RelayCurrency[] {
	const rows = (
		Array.isArray(json) ? json : ((json as Record<string, unknown>)?.currencies ?? [])
	) as unknown[];
	const flat: Record<string, unknown>[] = [];
	for (const row of rows) {
		if (Array.isArray(row)) flat.push(...(row as Record<string, unknown>[]));
		else flat.push(row as Record<string, unknown>);
	}
	return flat
		.map(parseCurrency)
		.filter((c) => c.address !== "" && Number.isFinite(c.chainId));
}

async function safeBody(res: Response) {
	try {
		return await res.json();
	} catch {
		return undefined;
	}
}

export interface CurrencySearch {
	term?: string;
	chainIds?: number[];
	address?: string;
	defaultList?: boolean;
	limit?: number;
}

/** Search Relay's currency catalog (token list). Inject `fetchImpl` in tests. */
export async function searchCurrencies(
	params: CurrencySearch,
	fetchImpl: typeof fetch = fetch,
): Promise<RelayCurrency[]> {
	const body: Record<string, unknown> = { limit: params.limit ?? 20 };
	if (params.term) body.term = params.term;
	if (params.chainIds) body.chainIds = params.chainIds;
	if (params.address) body.address = params.address;
	if (params.defaultList) body.defaultList = true;

	const res = await fetchImpl(`${RELAY_API_BASE}/currencies/v2`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		throw new RelayApiError(
			"POST /currencies/v2 failed",
			res.status,
			await safeBody(res),
		);
	}
	return flattenCurrencies(await res.json());
}

/** Live USD price for a token. Inject `fetchImpl` in tests. */
export async function getTokenPrice(
	chainId: number,
	address: string,
	fetchImpl: typeof fetch = fetch,
): Promise<number> {
	const url = `${RELAY_API_BASE}/currencies/token/price?address=${encodeURIComponent(
		address,
	)}&chainId=${chainId}`;
	const res = await fetchImpl(url);
	if (!res.ok) {
		throw new RelayApiError("GET token price failed", res.status, await safeBody(res));
	}
	const json = (await res.json()) as { price?: unknown };
	const price = Number(json?.price);
	return Number.isFinite(price) ? price : 0;
}
