// ── Card + fields ───────────────────────────────────────────────────────────
export { SwapCard, type SwapCardProps } from "./components/swap-card";
export { SwapFrom, type SwapFromProps } from "./components/swap-from";
export { SwapTo, type SwapToProps } from "./components/swap-to";

// ── Composition primitives ──────────────────────────────────────────────────
export { ActionRow } from "./components/action-row";
export { AppMenuShell } from "./components/app-menu-shell";
export { BottomSheet, SheetHeader } from "./components/bottom-sheet";
export { TokenTrigger } from "./components/token-trigger";
export { SettingsRow } from "./components/settings-row";
export {
	SegmentedControl,
	type SegmentOption,
} from "./components/segmented-control";
export { ResizablePanel } from "./components/resizable-panel";
export { Keypad, MobileKeypad } from "./components/keypad";

// ── Leaf primitives ─────────────────────────────────────────────────────────
export { HapticButton } from "./components/haptic-button";
export { AppleBorderGradient } from "./components/apple-border-gradient";
export { CryptoAddress } from "./components/crypto-address";
export { QrCode } from "./components/qr-code";
export { TokenAmount } from "./components/token-amount";
export {
	AmountInput,
	ConversionValue,
	Pill,
	AMOUNT_FIELD_TRANSITION,
	useMeasuredHeight,
	// amount helpers
	trim,
	trimUsd,
	sanitizeAmount,
	applyAmountKey,
	sanitizePastedAmount,
} from "./components/swap-field";

// ── Helpers ─────────────────────────────────────────────────────────────────
export {
	cn,
} from "./lib/utils";
export {
	formatPct,
	fmtUsd,
	price,
	computeTest,
	truncateAddress,
	formatTokenParts,
	type TokenDisplayParts,
} from "./lib/format";
export { shouldUseHapticOverlay } from "./lib/platform";

// ── Types ───────────────────────────────────────────────────────────────────
export type {
	Mode,
	TokenRow,
	GenerateAddressConfig,
	TokenTriggerLabels,
	PickerSlotApi,
	MenuSlotApi,
	SwapCardLabels,
} from "./types";
