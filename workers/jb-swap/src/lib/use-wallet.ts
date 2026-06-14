"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import type { AdaptedWallet } from "@relayprotocol/relay-sdk";
import { useCallback } from "react";

import { adaptedWalletFromEip1193 } from "@/lib/wallet-adapter";

/**
 * Connection state for the swap UI, backed by Privy external wallets. Reports
 * the first connected wallet (EVM preferred, then Solana), exposes connect /
 * disconnect, and builds a Relay `AdaptedWallet` for executing a quote. No
 * embedded/smart wallets are involved — see {@link WalletProvider}.
 */
export function useWallet() {
	const { ready, connectWallet, logout } = usePrivy();
	const { wallets: evmWallets } = useWallets();
	const { wallets: solanaWallets } = useSolanaWallets();

	const evmWallet = evmWallets[0];
	const solanaWallet = solanaWallets[0];
	const address = evmWallet?.address ?? solanaWallet?.address ?? null;

	/** Build a Relay AdaptedWallet from the connected EVM wallet (for executeSwap). */
	const getAdaptedWallet = useCallback(async (): Promise<AdaptedWallet> => {
		if (evmWallet) {
			const provider = await evmWallet.getEthereumProvider();
			return adaptedWalletFromEip1193(
				provider as Parameters<typeof adaptedWalletFromEip1193>[0],
				evmWallet.address,
			);
		}
		throw new Error(
			"Connect an EVM wallet to send — Solana-origin sending isn't enabled yet.",
		);
	}, [evmWallet]);

	return {
		ready,
		connected: address !== null,
		address,
		evmAddress: evmWallet?.address ?? null,
		solanaAddress: solanaWallet?.address ?? null,
		connect: () => connectWallet(),
		disconnect: () => {
			evmWallets.forEach((w) => w.disconnect?.());
			solanaWallets.forEach((w) => w.disconnect?.());
			logout();
		},
		getAdaptedWallet,
	};
}
