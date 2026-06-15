/**
 * A tiny module-level store for an explicit "the user disconnected" override.
 *
 * Injected wallets (MetaMask/Phantom) can't be programmatically disconnected:
 * their connector `disconnect()` is a documented no-op, and Privy's
 * `useWallets()` is driven by the live connector store (not by auth state), so
 * neither `wallet.disconnect()` nor `logout()` removes the wallet from the list.
 * Without this, the UI would never return to the connect screen on "log out".
 *
 * This override lets {@link useWallet} treat the wallet as disconnected the
 * instant the user clicks log out — regardless of what Privy still reports — and
 * is cleared when they reconnect. State is shared through one subscription set
 * so every `useWallet()` consumer re-renders consistently. It is intentionally
 * in-memory (a page refresh re-evaluates the live connection).
 */
let manuallyDisconnected = false;
const listeners = new Set<() => void>();

function emit(): void {
	for (const listener of listeners) listener();
}

export const walletSessionStore = {
	subscribe(listener: () => void): () => void {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	},
	getSnapshot(): boolean {
		return manuallyDisconnected;
	},
	/** Server snapshot is always "not disconnected" — no wallet exists on the server. */
	getServerSnapshot(): boolean {
		return false;
	},
};

/** Mark the wallet as disconnected (called from `useWallet().disconnect`). */
export function setManualDisconnect(): void {
	if (!manuallyDisconnected) {
		manuallyDisconnected = true;
		emit();
	}
}

/** Clear the override so a fresh connect re-surfaces the wallet. */
export function clearManualDisconnect(): void {
	if (manuallyDisconnected) {
		manuallyDisconnected = false;
		emit();
	}
}
