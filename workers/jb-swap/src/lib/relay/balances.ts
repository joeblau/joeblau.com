import {
	type Chain,
	createPublicClient,
	erc20Abi,
	formatUnits,
	getAddress,
	http,
} from "viem";
import {
	arbitrum,
	avalanche,
	base,
	blast,
	bsc,
	celo,
	gnosis,
	linea,
	mainnet,
	mantle,
	optimism,
	polygon,
	scroll,
	zksync,
	zora,
} from "viem/chains";

import type { TokenRow } from "@/components/token-drawer";

import { getTokenPrice } from "./currencies";

/**
 * EVM chains we can read balances on (viem ships RPC + Multicall3 addresses for
 * these). Holdings on chains outside this set aren't surfaced — reading every
 * Relay chain would need an indexer; this covers where balances usually live.
 */
const CHAINS: Record<number, Chain> = {
	[mainnet.id]: mainnet,
	[base.id]: base,
	[arbitrum.id]: arbitrum,
	[optimism.id]: optimism,
	[polygon.id]: polygon,
	[bsc.id]: bsc,
	[avalanche.id]: avalanche,
	[zksync.id]: zksync,
	[linea.id]: linea,
	[scroll.id]: scroll,
	[blast.id]: blast,
	[mantle.id]: mantle,
	[gnosis.id]: gnosis,
	[celo.id]: celo,
	[zora.id]: zora,
};

const NATIVE = "0x0000000000000000000000000000000000000000";

/** Chains (with catalog tokens) we can read EVM balances on. */
export const balanceChainIds = Object.keys(CHAINS).map(Number);

function groupByChain(tokens: TokenRow[]): Map<number, TokenRow[]> {
	const byChain = new Map<number, TokenRow[]>();
	for (const t of tokens) {
		if (t.vmType === "svm" || !CHAINS[t.chainId]) continue;
		const list = byChain.get(t.chainId);
		if (list) list.push(t);
		else byChain.set(t.chainId, [t]);
	}
	return byChain;
}

async function fetchChainHeld(
	chainId: number,
	tokens: TokenRow[],
	user: `0x${string}`,
): Promise<TokenRow[]> {
	const client = createPublicClient({ chain: CHAINS[chainId], transport: http() });
	const erc20 = tokens.filter((t) => t.address.toLowerCase() !== NATIVE);
	const native = tokens.find((t) => t.address.toLowerCase() === NATIVE);

	const [results, nativeBalance] = await Promise.all([
		erc20.length
			? client.multicall({
					allowFailure: true,
					contracts: erc20.map((t) => ({
						address: getAddress(t.address),
						abi: erc20Abi,
						functionName: "balanceOf" as const,
						args: [user] as const,
					})),
				})
			: Promise.resolve([]),
		native ? client.getBalance({ address: user }) : Promise.resolve(0n),
	]);

	const held: TokenRow[] = [];
	erc20.forEach((t, i) => {
		const r = results[i];
		if (r?.status === "success" && (r.result as bigint) > 0n) {
			held.push({ ...t, amount: formatUnits(r.result as bigint, t.decimals) });
		}
	});
	if (native && nativeBalance > 0n) {
		held.push({ ...native, amount: formatUnits(nativeBalance, native.decimals) });
	}
	return held;
}

/**
 * Multicall `balanceOf` for every catalog token across the supported chains and
 * return only the tokens the wallet actually holds (balance > 0), with their
 * `amount` and a USD value priced via Relay. Chains whose RPC fails are skipped.
 */
export async function fetchEvmHeldTokens(
	address: string,
	catalog: TokenRow[],
): Promise<TokenRow[]> {
	const user = getAddress(address);
	const byChain = groupByChain(catalog);

	const perChain = await Promise.all(
		[...byChain.entries()].map(([chainId, tokens]) =>
			fetchChainHeld(chainId, tokens, user).catch(() => [] as TokenRow[]),
		),
	);
	const held = perChain.flat();

	// Price the (small) held set for the USD column; failures leave it at $0.
	await Promise.all(
		held.map(async (t) => {
			try {
				const price = await getTokenPrice(t.chainId, t.address);
				t.usd = `$${(Number(t.amount) * price).toLocaleString("en-US", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})}`;
			} catch {
				// leave usd as-is on price failure
			}
		}),
	);

	held.sort(
		(a, b) =>
			(Number.parseFloat(b.usd.replace(/[^0-9.]/g, "")) || 0) -
			(Number.parseFloat(a.usd.replace(/[^0-9.]/g, "")) || 0),
	);
	return held;
}
