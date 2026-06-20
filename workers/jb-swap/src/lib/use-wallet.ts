"use client";

import { useConnectWallet, usePrivy, useWallets } from "@privy-io/react-auth";
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
	const { ready, authenticated, logout } = usePrivy();
	const { wallets: evmWallets } = useWallets();
	const { wallets: solanaWallets } = useSolanaWallets();
	// Connector-only wallet connect (no SIWE/SIWS identity auth — see `connect`).
	const { connectWallet } = useConnectWallet();

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
		// Open the external-wallet picker. We use Privy's `connectWallet`
		// (connector-only) rather than `login()` so we DON'T trigger SIWE/SIWS
		// identity authentication: a swap only needs a connected wallet to sign
		// transactions, and the authenticate step was failing against this Privy
		// app (SIWE `init` 403, then SIWS `authenticate` 400). Nothing here reads
		// Privy's `authenticated`/`user` — the address comes from the connector
		// (`useWallets`), which `connectWallet` populates without a user session.
		// We always open the picker (after clearing the override) rather than
		// silently re-using a still-connected wallet, so "log out → connect"
		// re-prompts and lets the user switch wallets.
		connect: () => {
			clearManualDisconnect();
			connectWallet();
		},
		// Real disconnect. Flip the local override first so the UI returns to the
		// connect screen immediately and reliably. Then best-effort sever the
		// underlying connection: injected EVM wallets ignore connector
		// `disconnect()` and Privy's `useWallets()` isn't gated on auth, so we ask
		// the provider to revoke the dApp's account permission (EIP-2255
		// `wallet_revokePermissions`). MetaMask / Rabby honor this and actually
		// drop the connection, so the next connect re-prompts for approval; wallets
		// that don't support it stay hidden behind the override. Solana wallets
		// (Phantom) support programmatic `disconnect()`. Only tear down a Privy
		// session if one actually exists — with connector-only `connectWallet`
		// there usually isn't one, and calling `logout()` with no authenticated
		// user 400s ("Error destroying session").
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
			if (authenticated) void logout().catch(() => {});
		},
		getAdaptedWallet,
	};
}
