import type { ReactNode } from "react";

/** Amount-input denomination: entered in token units or in USD. */
export type Mode = "token" | "usd";

/** A selectable token row. Identity is `chainId` + `address`. */
export interface TokenRow {
	name: string;
	symbol: string;
	chain: string;
	chainId: number;
	address: string;
	/** Asset logo URL. */
	logo: string;
	/** Holdings in token units, as a string (e.g. "1.2345"). "0" when unknown. */
	amount: string;
	/** Holdings in USD, as a string (e.g. "$12.34"). "$0" when unknown. */
	usd: string;
	/** Token decimals — for converting display amounts to on-chain base units. */
	decimals: number;
	/** Chain VM family (EVM today; SVM guarded). */
	vmType?: "evm" | "svm";
}

/**
 * Presence of this config on `<SwapCard>` is the single switch for the
 * generate-address (receive) affordance:
 *   • PASS it  → disconnected mode: the From field can flip to a receive view
 *                (QR + address) and the From picker slot receives the toggle.
 *   • OMIT it  → connected mode: there is NO generate-address button anywhere.
 */
export interface GenerateAddressConfig {
	/** Whether receive/generate-address mode is currently ON (controlled). */
	enabled: boolean;
	/** Flip receive mode. The From picker slot renders the actual toggle UI. */
	onToggle: (next: boolean) => void;
	/** Address shown + copied in the receive view. */
	receiveAddress: string;
	/** Optional QR payload override (e.g. an EIP-681 URI). Defaults to the address. */
	receivePayload?: string;
	/** Optional asset logo rendered in the QR center. */
	arena?: string;
}

/** Visible strings used by the token trigger (English defaults provided). */
export interface TokenTriggerLabels {
	/** Placeholder shown before a token is picked, e.g. "From..." / "To...". */
	placeholder?: string;
	/** aria-label for the trigger's tap target. */
	selectAriaLabel?: string;
	/** "Test" pill (From side). */
	test?: string;
	/** "Max" pill (From side). */
	max?: string;
	/** Slippage pill text builder (To side). */
	slippage?: (percent: string) => string;
	/** Fee line text builder (To side). */
	fee?: (amount: string) => string;
}

/**
 * Payload handed to `renderFromPicker` / `renderToPicker`. The package owns the
 * presentational <TokenTrigger/>; your render prop returns the data-heavy drawer
 * body (search, list, connect, etc.), typically wrapped in <BottomSheet/>.
 */
export interface PickerSlotApi {
	variant: "from" | "to";
	selected: TokenRow | null;
	onSelect: (token: TokenRow) => void;
	/** Exact wrapper classes the trigger must use (state-dependent on the To side). */
	triggerClassName: string;
	/** Controlled drawer open state (owned by SwapCard). */
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Convenience: opens the drawer (`() => onOpenChange(true)`) for the trigger. */
	onActivate: () => void;
	walletAddress?: string | null;
	/** From side, disconnected mode only — render your generate-address toggle. */
	generateAddress?: GenerateAddressConfig;
	/** To side — current slippage fraction. */
	slippage?: number;
	/** To side — live fee in USD (null until a quote resolves). */
	fee?: number | null;
	feeLoading?: boolean;
	onOpenSlippage?: () => void;
	/** From side — set the amount from a Test/Max pill. */
	onSetAmount?: (amount: string) => void;
	labels: TokenTriggerLabels;
}

/** Payload handed to `renderMenu`. Push/pop sub-views inside the same sheet. */
export interface MenuSlotApi {
	/** Current view key. Switch on this to render the right panel. */
	view: string;
	/** Navigate to a view. `direction` is +1 forward (default) / -1 back. */
	setView: (view: string, direction?: number) => void;
	/** Close the menu sheet. */
	close: () => void;
}

/** User-facing strings for the card chrome (English defaults provided). */
export interface SwapCardLabels {
	amountAriaLabel?: string;
	swapDirectionAriaLabel?: string;
	resetAriaLabel?: string;
	menuAriaLabel?: string;
	deleteKeyAriaLabel?: string;
	/** CTA text while `submitting`. */
	submitConfirming?: string;
}

export type { ReactNode };
