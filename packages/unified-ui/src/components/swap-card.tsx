"use client";

import { motion } from "framer-motion";
import { ArrowUpDown } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { price } from "../lib/format";
import { cn } from "../lib/utils";
import type {
	GenerateAddressConfig,
	MenuSlotApi,
	Mode,
	PickerSlotApi,
	SwapCardLabels,
	TokenRow,
	TokenTriggerLabels,
} from "../types";
import { ActionRow } from "./action-row";
import { AppleBorderGradient } from "./apple-border-gradient";
import { AppMenuShell } from "./app-menu-shell";
import { HapticButton } from "./haptic-button";
import { MobileKeypad } from "./keypad";
import {
	applyAmountKey,
	sanitizePastedAmount,
	unitsToMode,
} from "./swap-field";
import { SwapFrom } from "./swap-from";
import { SwapTo } from "./swap-to";
import { TokenTrigger } from "./token-trigger";

export interface SwapCardProps {
	// ── From ────────────────────────────────────────────────────────────────
	fromToken: TokenRow | null;
	onSelectFromToken: (token: TokenRow) => void;
	fromAmount: string;
	onFromAmountChange: (amount: string) => void;
	fromMode: Mode;
	onToggleFromMode: () => void;
	/** USD value of the entered From amount. */
	fromUsd: number;
	/** Token units of the entered From amount. */
	fromUnits: number;

	// ── To ──────────────────────────────────────────────────────────────────
	toToken: TokenRow | null;
	onSelectToToken: (token: TokenRow) => void;
	/** Received amount in token units. */
	toAmount: number;
	/** Received amount in USD. */
	toUsd: number;
	toMode: Mode;
	onToggleToMode: () => void;
	/** Live total fee in USD (null until a quote resolves / for sends). */
	fee?: number | null;
	feeLoading?: boolean;
	slippage: number;
	onOpenSlippage: () => void;

	// ── Wallet / direction ───────────────────────────────────────────────────
	walletAddress?: string | null;
	canFlip: boolean;
	onSwapTokens: () => void;

	// ── Action row ───────────────────────────────────────────────────────────
	canSwap: boolean;
	actionLabel: ReactNode;
	onSubmit: () => void;
	submitting?: boolean;
	isPristine: boolean;
	onReset: () => void;

	/**
	 * Generate-address (receive) config. PRESENT → disconnected mode: the From
	 * field can flip to a receive view and the From picker gets the toggle.
	 * OMITTED → connected mode: no generate-address affordance anywhere.
	 */
	generateAddress?: GenerateAddressConfig;

	// ── Slots ────────────────────────────────────────────────────────────────
	/** Render the From token-picker (drawer body). Falls back to a bare trigger. */
	renderFromPicker?: (api: PickerSlotApi) => ReactNode;
	/** Render the To token-picker (drawer body). Falls back to a bare trigger. */
	renderToPicker?: (api: PickerSlotApi) => ReactNode;
	/** Render the settings-menu views inside the shared sheet. */
	renderMenu?: (api: MenuSlotApi) => ReactNode;
	menuTitles?: Record<string, string>;
	menuInitialView?: string;
	/** Labels for the token triggers (placeholders, Test/Max/Slippage/Fee). */
	triggerLabels?: { from?: TokenTriggerLabels; to?: TokenTriggerLabels };

	/** Install document keyboard + paste handlers that drive the From amount (default true). */
	keyboardInput?: boolean;
	/** Optional copy handler for the receive view (wire your own toast). */
	onCopyAddress?: (address: string) => void;
	/** Optional center-logo QR for the receive view (e.g. the `cuer` adapter). */
	renderQr?: (args: { value: string; arena?: string }) => ReactNode;

	labels?: SwapCardLabels;
	className?: string;
}

const FROM_TRIGGER_CLASS =
	"-mx-4 -mt-4 w-[calc(100%+2rem)] rounded-t-3xl px-4 pb-4 pt-4 hover:bg-foreground/[0.03]";

/**
 * The unified send / swap / bridge card — presentational and fully controlled.
 * Compose the two fields, the swap-direction button, the keypad, the action row
 * (menu + CTA + reset), and the border-gradient overlay. All data (tokens,
 * amounts, quote, wallet) lives in the parent; the token pickers and menu are
 * injected via render props.
 */
export function SwapCard({
	fromToken,
	onSelectFromToken,
	fromAmount,
	onFromAmountChange,
	fromMode,
	onToggleFromMode,
	fromUsd,
	fromUnits,
	toToken,
	onSelectToToken,
	toAmount,
	toUsd,
	toMode,
	onToggleToMode,
	fee = null,
	feeLoading,
	slippage,
	onOpenSlippage,
	walletAddress,
	canFlip,
	onSwapTokens,
	canSwap,
	actionLabel,
	onSubmit,
	submitting,
	isPristine,
	onReset,
	generateAddress,
	renderFromPicker,
	renderToPicker,
	renderMenu,
	menuTitles,
	menuInitialView,
	triggerLabels,
	keyboardInput = true,
	onCopyAddress,
	renderQr,
	labels,
	className,
}: SwapCardProps) {
	const [fromOpen, setFromOpen] = useState(false);
	const [toOpen, setToOpen] = useState(false);

	// Presence of `generateAddress` is the single switch for the receive
	// affordance. When omitted, genAddress is forced false (no toggle anywhere).
	const canGenerateAddress = generateAddress !== undefined;
	const genAddress = canGenerateAddress && generateAddress.enabled;

	const toTriggerClass = cn(
		"-mx-4 -mt-6 w-[calc(100%+2rem)] px-4 pb-4 pt-6 hover:bg-foreground/[0.03]",
		genAddress ? "rounded-3xl" : "rounded-t-3xl",
	);

	// Max / Test report holdings in token units; fromAmount is denominated by
	// fromMode, so convert before handing it up.
	const setAmountFromUnits = (units: string) =>
		onFromAmountChange(
			unitsToMode(units, fromMode, fromToken ? price(fromToken) : 0),
		);

	// ── Token picker slots ────────────────────────────────────────────────────
	const fromApi: PickerSlotApi = {
		variant: "from",
		selected: fromToken,
		onSelect: onSelectFromToken,
		triggerClassName: FROM_TRIGGER_CLASS,
		open: fromOpen,
		onOpenChange: setFromOpen,
		onActivate: () => setFromOpen(true),
		walletAddress,
		generateAddress: canGenerateAddress ? generateAddress : undefined,
		onSetAmount: setAmountFromUnits,
		labels: triggerLabels?.from ?? {},
	};
	const toApi: PickerSlotApi = {
		variant: "to",
		selected: toToken,
		onSelect: onSelectToToken,
		triggerClassName: toTriggerClass,
		open: toOpen,
		onOpenChange: setToOpen,
		onActivate: () => setToOpen(true),
		walletAddress,
		slippage,
		fee,
		feeLoading,
		onOpenSlippage,
		labels: triggerLabels?.to ?? {},
	};

	const fromPicker = renderFromPicker ? (
		renderFromPicker(fromApi)
	) : (
		<TokenTrigger
			variant="from"
			selected={fromToken}
			triggerClassName={FROM_TRIGGER_CLASS}
			walletAddress={walletAddress}
			onActivate={fromApi.onActivate}
			onSetAmount={setAmountFromUnits}
			labels={triggerLabels?.from}
		/>
	);
	const toPicker = renderToPicker ? (
		renderToPicker(toApi)
	) : (
		<TokenTrigger
			variant="to"
			selected={toToken}
			triggerClassName={toTriggerClass}
			walletAddress={walletAddress}
			onActivate={toApi.onActivate}
			slippage={slippage}
			fee={fee}
			feeLoading={feeLoading}
			onOpenSlippage={onOpenSlippage}
			labels={triggerLabels?.to}
		/>
	);

	// ── Keypad + physical keyboard (drive the From amount) ────────────────────
	const amountRef = useRef(fromAmount);
	amountRef.current = fromAmount;
	const modeRef = useRef(fromMode);
	modeRef.current = fromMode;
	const changeRef = useRef(onFromAmountChange);
	changeRef.current = onFromAmountChange;

	const handleKey = (key: string) => {
		const next = applyAmountKey(amountRef.current, key, modeRef.current);
		if (next !== amountRef.current) changeRef.current(next);
	};

	useEffect(() => {
		if (!keyboardInput) return;
		const inField = () => {
			const el = document.activeElement;
			return (
				!!el &&
				(el.tagName === "INPUT" ||
					el.tagName === "TEXTAREA" ||
					(el as HTMLElement).isContentEditable)
			);
		};
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey || e.ctrlKey || e.altKey || inField()) return;
			if (/^[0-9]$/.test(e.key)) {
				handleKey(e.key);
				e.preventDefault();
			} else if (e.key === ".") {
				handleKey(".");
				e.preventDefault();
			} else if (e.key === "Backspace") {
				handleKey("back");
				e.preventDefault();
			}
		};
		const onPaste = (e: ClipboardEvent) => {
			if (inField()) return;
			const parsed = sanitizePastedAmount(
				e.clipboardData?.getData("text") ?? "",
				modeRef.current,
			);
			if (parsed !== null) {
				changeRef.current(parsed);
				e.preventDefault();
			}
		};
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("paste", onPaste);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("paste", onPaste);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [keyboardInput]);

	return (
		<motion.div
			className={cn("unified-ui-root w-full max-w-md", className)}
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: "easeOut" }}
		>
			{/* You pay */}
			<SwapFrom
				picker={fromPicker}
				amount={fromAmount}
				mode={fromMode}
				onToggleMode={onToggleFromMode}
				usd={fromUsd}
				units={fromUnits}
				symbol={fromToken?.symbol}
				amountAriaLabel={labels?.amountAriaLabel}
				genAddress={genAddress}
				receiveAddress={generateAddress?.receiveAddress}
				receivePayload={generateAddress?.receivePayload}
				arena={generateAddress?.arena}
				onCopyAddress={onCopyAddress}
				renderQr={renderQr}
			/>

			{/* Swap direction */}
			<div className="relative z-10 mx-auto -my-3 flex w-fit">
				{/* Filled disc behind the button — breaks the seam line; sized to
				    include what used to be the 2px ring (size-8 + 2px each side). */}
				<span
					aria-hidden
					className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background"
				/>
				<HapticButton
					type="button"
					onClick={onSwapTokens}
					disabled={!canFlip}
					style={
						canFlip
							? {
									background:
										"linear-gradient(hsl(var(--foreground) / 0.07), hsl(var(--foreground) / 0.07)), hsl(var(--card))",
								}
							: undefined
					}
					className={cn(
						"relative flex size-8 items-center justify-center rounded-full transition-colors",
						canFlip
							? "text-muted-foreground"
							: "cursor-not-allowed bg-secondary/40 text-muted-foreground",
					)}
					aria-label={labels?.swapDirectionAriaLabel ?? "Swap direction"}
				>
					<ArrowUpDown className="size-4" />
				</HapticButton>
			</div>

			{/* You receive */}
			<SwapTo
				picker={toPicker}
				amount={toAmount}
				usd={toUsd}
				mode={toMode}
				onToggleMode={onToggleToMode}
				symbol={toToken?.symbol}
				amountAriaLabel={labels?.amountAriaLabel}
				collapsed={genAddress}
			/>

			<MobileKeypad onKey={handleKey} deleteAriaLabel={labels?.deleteKeyAriaLabel} />

			<ActionRow
				menu={
					<AppMenuShell
						renderMenu={renderMenu}
						titles={menuTitles}
						initialView={menuInitialView}
						menuAriaLabel={labels?.menuAriaLabel}
					/>
				}
				actionLabel={actionLabel}
				onSubmit={onSubmit}
				submitDisabled={submitting || (!genAddress && !canSwap)}
				submitting={submitting}
				submitConfirming={labels?.submitConfirming}
				onReset={onReset}
				resetDisabled={isPristine || submitting}
				resetAriaLabel={labels?.resetAriaLabel}
			/>

			<AppleBorderGradient preview={!!submitting} intensity="xl" />
		</motion.div>
	);
}
