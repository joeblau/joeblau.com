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
		// Clear the override first so a connection can re-surface, then open
		// Privy's login modal. We ALWAYS open the modal rather than silently
		// re-using a wallet that's still connected at the connector level: after a
		// "log out" the injected wallet often persists (see `disconnect` below),
		// and reconnecting it with no prompt makes logout feel broken and prevents
		// switching wallets. `login()` (vs `connectWallet()`) creates an
		// authenticated session so the eventual `logout()` has something real to
		// destroy (avoids the connect-only `POST /sessions/logout` 400).
		connect: () => {
			clearManualDisconnect();
			login();
		},
		// Real disconnect. Flip the local override first so the UI returns to the
		// connect screen immediately and reliably. Then best-effort sever the
		// underlying connection: injected EVM wallets ignore connector
		// `disconnect()` and Privy's `useWallets()` isn't gated on auth, so we ask
		// the provider to revoke the dApp's account permission (EIP-2255
		// `wallet_revokePermissions`). MetaMask / Rabby honor this and actually
		// drop the connection, so the next connect re-prompts for approval; wallets
		// that don't support it stay hidden behind the override. Solana wallets
		// (Phantom) support programmatic `disconnect()`. Finally tear down the
		// Privy session — a 400 on a stale/never-authenticated session is harmless,
		// Privy still clears local tokens — so swallow it.
		disconnect: async () => {
			setManualDisconnect();
			if (evmWallet) {
				try {
					const provider = await evmWallet.getEthereumProvider();
					await provider.request({
						method: "wallet_revokePermissions",
						params: [{ eth_accounts: {} }],
					});
				} catch {
					// Wallet doesn't support permission revocation — the override
					// keeps it hidden until the page is refreshed.
				}
			}
			void evmWallet?.disconnect?.();
			void solanaWallet?.disconnect?.();
			void logout().catch(() => {});
		},
		getAdaptedWallet,
	};
}
