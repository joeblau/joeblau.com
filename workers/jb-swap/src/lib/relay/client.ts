import {
	createClient,
	getClient,
	LogLevel,
	MAINNET_RELAY_API,
} from "@relayprotocol/relay-sdk";

let created = false;

/**
 * Create (once) and return the singleton Relay SDK client, configured for
 * mainnet. The standalone `getQuote` / `execute` actions read this singleton, so
 * it must exist before they're called. Quotes don't require the chain list to be
 * pre-configured (they POST explicit chain ids), so we keep init synchronous.
 */
export function ensureRelayClient() {
	if (!created) {
		createClient({
			baseApiUrl: MAINNET_RELAY_API,
			source: "swap.joeblau.com",
			logLevel: LogLevel.Error,
		});
		created = true;
	}
	return getClient();
}
