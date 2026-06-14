"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { useTheme } from "next-themes";
import { useMemo } from "react";

const APP_ID =
	process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "cml9tcaov005cjv0eelkoh0cv";

/**
 * Privy provider scoped to *external wallet connections only* — both EVM and
 * Solana. Embedded wallets are disabled (`createOnLogin: "off"`) and no smart
 * wallet config is supplied, so users connect their own Phantom / MetaMask /
 * etc. and nothing is provisioned on their behalf. The modal theme tracks the
 * app's resolved light/dark theme.
 */
// App theme tokens (from globals.css) as the hex values Privy expects, so the
// connect modal matches our monochrome surfaces exactly instead of Privy's
// slightly blue-tinted `dark` preset. `theme` = modal background, `accentColor`
// = primary action / highlight.
const PRIVY_THEME = {
	light: { theme: "#ffffff", accentColor: "#171717" }, // bg 0 0% 100% / primary 0 0% 9%
	dark: { theme: "#0a0a0a", accentColor: "#fafafa" }, // bg 0 0% 3.9% / primary 0 0% 98%
} as const;

export function WalletProvider({ children }: { children: React.ReactNode }) {
	const { resolvedTheme } = useTheme();
	const solanaConnectors = useMemo(() => toSolanaWalletConnectors(), []);
	const colors = resolvedTheme === "light" ? PRIVY_THEME.light : PRIVY_THEME.dark;

	return (
		<PrivyProvider
			appId={APP_ID}
			config={{
				loginMethods: ["wallet"],
				embeddedWallets: {
					ethereum: { createOnLogin: "off" },
					solana: { createOnLogin: "off" },
				},
				externalWallets: {
					solana: { connectors: solanaConnectors },
				},
				appearance: {
					theme: colors.theme,
					accentColor: colors.accentColor,
					walletChainType: "ethereum-and-solana",
					// Wallet is our only login method, so wallets always show first.
					// Setting this explicitly avoids Privy's auto-correct warning.
					showWalletLoginFirst: true,
				},
			}}
		>
			{children}
		</PrivyProvider>
	);
}
