"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";
import type { AdaptedWallet } from "@relayprotocol/relay-sdk";
import { useCallback, useSyncExternalStore } from "react";

import { adaptedWalletFromEip1193 } from "@/lib/wallet-adapter";
import {
	clearManualDisconnect,
	setManualDisconnect,
	walletSessionStore,
} from "@/lib/wallet-session-store";

/**
 * Connection state for the swap UI, backed by Privy external wallets. Reports
 * the first connected wallet (EVM preferred, then Solana), exposes connect /
 * disconnect, and builds a Relay `AdaptedWallet` for executing a quote. No
 * embedded/smart wallets are involved — see {@link WalletProvider}.
 */
export function useWallet() {
	const { ready, login, logout } = usePrivy();
	const { wallets: evmWallets } = useWallets();
	const { wallets: solanaWallets } = useSolanaWallets();

	const evmWallet = evmWallets[0];
	const solanaWallet = solanaWallets[0];
	const rawAddress = evmWallet?.address ?? solanaWallet?.address ?? null;

	// Whether the user explicitly logged out. Injected wallets can't be told to
	// disconnect, so we override Privy's (still-connected) view locally. See
	// {@link walletSessionStore}.
	const manuallyDisconnected = useSyncExternalStore(
		walletSessionStore.subscribe,
		walletSessionStore.getSnapshot,
		walletSessionStore.getServerSnapshot,
	);
	const address = manuallyDisconnected ? null : rawAddress;

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
		evmAddress: manuallyDisconnected ? null : (evmWallet?.address ?? null),
		solanaAddress: manuallyDisconnected ? null : (solanaWallet?.address ?? null),
		// Clear the override first so the wallet re-surfaces, then open Privy's
		// login modal. `login()` (vs `connectWallet()`) creates an authenticated
		// session so the eventual `logout()` has something real to destroy
		// (avoids the connect-only `POST /sessions/logout` 400). If a wallet is
		// already connected at the provider level, just clearing the override
		// reconnects instantly with no redundant modal.
		connect: () => {
			clearManualDisconnect();
			if (rawAddress === null) login();
		},
		// Injected wallets (MetaMask/Phantom) can't be programmatically
		// disconnected and Privy's `useWallets()` isn't gated on auth, so neither
		// `wallet.disconnect()` nor `logout()` clears the list. Flip the local
		// override first (the UI returns to connect immediately and reliably),
		// then best-effort tear down the connector + Privy session for any wallet
		// that *does* support it. The logout 400 on a stale session is harmless —
		// Privy still clears local tokens — so swallow it.
		disconnect: () => {
			setManualDisconnect();
			void evmWallet?.disconnect?.();
			void solanaWallet?.disconnect?.();
			void logout().catch(() => {});
		},
		getAdaptedWallet,
	};
}
