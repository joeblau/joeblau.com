import { adaptViemWallet, type AdaptedWallet } from "@relayprotocol/relay-sdk";
import { createWalletClient, custom, type EIP1193Provider } from "viem";

/**
 * Wrap an EIP-1193 provider (e.g. the provider returned by a Privy EVM wallet's
 * `getEthereumProvider()`) into a Relay `AdaptedWallet`. The adapter handles
 * chain switching, message signing, and sending/confirming transactions during
 * `executeSwap`.
 */
export function adaptedWalletFromEip1193(
	provider: EIP1193Provider,
	address: string,
): AdaptedWallet {
	const walletClient = createWalletClient({
		account: address as `0x${string}`,
		transport: custom(provider),
	});
	return adaptViemWallet(walletClient);
}

/**
 * Solana-origin execution is intentionally not wired yet. Relay SVM execution
 * needs the Privy Solana wallet's signer + @solana/kit transaction handling,
 * which must be validated against a funded wallet before it can be trusted with
 * real funds. We fail loudly here rather than risk a malformed transfer — this
 * is the one piece flagged for follow-up after a wallet-backed test.
 */
export function adaptedWalletForSolanaUnsupported(): never {
	throw new Error(
		"Sending from a Solana asset isn't enabled yet — choose an EVM asset as the source.",
	);
}
