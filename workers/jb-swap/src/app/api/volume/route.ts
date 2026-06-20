import { fetchVolumeProxy, type VolumeData } from "@/lib/volume-ranking";

/**
 * Server-side proxy for the swap volume-ranking data.
 *
 * The browser used to call CoinGecko's `coins/markets` endpoint directly, which
 * (a) is blocked by CORS — the endpoint sends no `Access-Control-Allow-Origin` —
 * and (b) rate-limits (429) once enough visitors each poll it on a 60s timer.
 * Fetching it here on the worker fixes both: it's a same-origin request for the
 * client, the `User-Agent` header actually applies (browsers forbid setting it),
 * and a short module-level cache + CDN cache headers collapse all visitors into
 * at most ~one upstream call per minute. We return the precomputed maps rather
 * than the raw 250-coin payload, so the client just consumes them.
 */

// Always run on the worker — never prerender at build time (which would call
// CoinGecko during `next build`).
export const dynamic = "force-dynamic";

/** Serve the same computed maps for this long before refetching upstream. */
const TTL_MS = 60_000;

let cache: { data: VolumeData; at: number } | null = null;

export async function GET() {
	const now = Date.now();

	if (!cache || now - cache.at > TTL_MS) {
		const data = await fetchVolumeProxy();
		// Only cache a non-empty result, so a transient upstream failure (timeout
		// or 429) doesn't pin empty maps for a full minute — the next request
		// retries. With a prior good cache we fall through and serve it (stale).
		if (Object.keys(data.bySymbol).length > 0) {
			cache = { data, at: now };
		} else if (!cache) {
			return Response.json(data, { headers: { "Cache-Control": "no-store" } });
		}
	}

	return Response.json(cache.data, {
		headers: {
			// Let the CDN serve a shared copy too, so upstream sees at most
			// ~one request per minute regardless of how many visitors are polling.
			"Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
		},
	});
}
