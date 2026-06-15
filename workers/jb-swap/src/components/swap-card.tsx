"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { ArrowUpDown, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AppleBorderGradient } from "@/components/apple-border-gradient";
import { AppMenu, type Denomination, DENOMINATION_KEY } from "@/components/app-menu";
import { HapticButton } from "@/components/haptic-button";
import { MobileKeypad } from "@/components/keypad";
import { SlippageDrawer } from "@/components/slippage-drawer";
import { price, TokenBox, type TokenRow } from "@/components/token-drawer";
import { useTranslations } from "@/i18n/locale-provider";
import { usePersistentState } from "@/lib/use-persistent-state";
import type { QuoteRequest } from "@/lib/relay";
import { useExecuteSwap } from "@/lib/use-execute-swap";
import { PREVIEW_USER, useSwapQuote } from "@/lib/use-swap-quote";
import { useWallet } from "@/lib/use-wallet";
import { cn } from "@/lib/utils";

/** Map the persisted denomination setting to an amount-input display mode. */
const modeForDenomination = (d: Denomination) => (d === "usd" ? "usd" : "token");

/** Same asset + chain → send; different asset, same chain → swap; different asset + chain → bridge. */
function getActionLabel(from: TokenRow | null, to: TokenRow | null) {
	if (!from || !to) return "send";
	const differentAsset = from.symbol !== to.symbol;
	const sameChain = from.chainId === to.chainId;
	if (differentAsset && sameChain) return "swap";
	if (differentAsset && !sameChain) return "bridge";
	return "send";
}

/** Quote constant — must match the "Fee $0.25" shown in SelectedMeta. */
const FEE_USD = 0.25;

/** Trim a number to a clean string (drops trailing zeros, caps at 8 decimals). */
function trim(n: number) {
	return String(Number(n.toFixed(8)));
}

/** Trim a USD value to a clean string, capped at 2 decimal places. */
function trimUsd(n: number) {
	return String(Number(n.toFixed(2)));
}

/**
 * The animated value inside a conversion Pill. In "token" mode the field is
 * entered in token units so the pill shows the USD equivalent ($, 2dp); in
 * "usd" mode it shows the token amount + symbol (up to 8dp, no grouping).
 * NumberFlow animates digit changes the same way the main AmountInput does.
 */
function ConversionValue({
	mode,
	usd,
	units,
	symbol,
}: {
	mode: "token" | "usd";
	usd: number;
	units: number;
	symbol: string;
}) {
	if (mode === "token") {
		return (
			<NumberFlow
				value={usd}
				prefix="$"
				format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
				className="overflow-hidden [--number-flow-mask-height:0px]"
			/>
		);
	}
	return (
		<NumberFlow
			value={units}
			suffix={symbol ? ` ${symbol}` : ""}
			format={{ maximumFractionDigits: 8, useGrouping: false }}
			className="overflow-hidden [--number-flow-mask-height:0px]"
		/>
	);
}

function Pill({
	onClick,
	children,
}: {
	onClick?: () => void;
	children: React.ReactNode;
}) {
	return (
		<HapticButton
			type="button"
			onClick={onClick}
			wrapperClassName="pointer-events-auto inline-grid"
			className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-foreground/[0.07] px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.12]"
		>
			{children}
		</HapticButton>
	);
}

/** Keep only digits and a single decimal point; strip leading zeros. */
function sanitizeAmount(raw: string) {
	let v = raw.replace(/[^0-9.]/g, "");
	const dot = v.indexOf(".");
	if (dot !== -1) {
		v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, "");
	}
	v = v.replace(/^0+(\d)/, "$1");
	return v === "" || v === "." ? "0" : v;
}

/**
 * Animated amount display. Typing, the keypad, and paste are handled globally
 * by SwapCard and always drive the "from" amount.
 */
function AmountInput({
	value,
	prefix,
	muted,
	sizeClassName = "text-3xl md:text-5xl",
}: {
	value: string;
	prefix?: string;
	muted?: boolean;
	sizeClassName?: string;
}) {
	const t = useTranslations();
	// Dollar values ($ prefix) never show more than 2 decimals; token amounts up to 8.
	const maxFraction = prefix === "$" ? 2 : 8;
	const dot = value.indexOf(".");
	const fractionDigits =
		dot === -1 ? 0 : Math.min(value.length - dot - 1, maxFraction);
	return (
		<div
			role="textbox"
			aria-label={t("swapCard.amountInput.ariaLabel")}
			tabIndex={0}
			className="cursor-text overflow-hidden rounded-lg outline-none"
		>
			<NumberFlow
				value={Number(value) || 0}
				prefix={prefix}
				suffix={value.endsWith(".") ? "." : ""}
				format={{
					minimumFractionDigits: fractionDigits,
					maximumFractionDigits: maxFraction,
					useGrouping: false,
				}}
				className={cn(
					"font-bold tracking-tight [--number-flow-mask-height:0px]",
					sizeClassName,
					muted ? "text-muted-foreground" : "text-foreground",
				)}
			/>
		</div>
	);
}

export function SwapCard() {
	const t = useTranslations();
	// Default amount denomination, set in the menu and persisted. It seeds the
	// input modes below and is the single source of truth shared with AppMenu.
	const [denomination, setDenomination] = usePersistentState<Denomination>(
		DENOMINATION_KEY,
		"usd",
	);
	const defaultMode = modeForDenomination(denomination);

	const [fromAmount, setFromAmount] = useState("0");
	const [fromToken, setFromToken] = useState<TokenRow | null>(null);
	const [toToken, setToToken] = useState<TokenRow | null>(null);
	const [fromMode, setFromMode] = useState<"token" | "usd">(defaultMode);
	const [toMode, setToMode] = useState<"token" | "usd">(defaultMode);
	const [slippage, setSlippage] = useState(0.005);
	const [slippageOpen, setSlippageOpen] = useState(false);
	// Real wallet connection via Privy (external EVM/SVM wallets only).
	const { connected, address, connect, disconnect } = useWallet();
	const [genAddress, setGenAddress] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const action = getActionLabel(fromToken, toToken);
	const canFlip = fromToken !== null && toToken !== null;

	// Quote is always driven by the FROM token units, regardless of display mode.
	const fromPrice = fromToken ? price(fromToken) : 0;
	const fromInput = Number(fromAmount) || 0;
	const fromUnits =
		fromMode === "token" ? fromInput : fromPrice > 0 ? fromInput / fromPrice : 0;
	const fromUsd = fromUnits * fromPrice;

	// Live Relay quote (debounced). Drives the real received amount + fees; while
	// it loads or if it errors we fall back to a local price estimate so the UI
	// stays responsive.
	const quoteRequest: QuoteRequest | null =
		fromToken && toToken && fromUnits > 0
			? {
					user: address ?? PREVIEW_USER,
					originChainId: fromToken.chainId,
					originCurrency: fromToken.address,
					originDecimals: fromToken.decimals,
					destinationChainId: toToken.chainId,
					destinationCurrency: toToken.address,
					destinationDecimals: toToken.decimals,
					amount: trim(fromUnits),
					tradeType: "EXACT_INPUT",
				}
			: null;
	const { quote } = useSwapQuote(quoteRequest);

	const toPrice = toToken ? price(toToken) : 0;
	const estimateToUsd =
		fromToken && toToken ? Math.max(0, fromUsd - FEE_USD) * (1 - slippage) : 0;
	const estimateToAmount = toToken && toPrice > 0 ? estimateToUsd / toPrice : 0;
	// A "send" (same asset + same chain) is just a transfer: Relay won't quote it
	// (sender == recipient) and the catalog "to" token carries no price, so the
	// received side is simply the input amount.
	const isSend =
		fromToken !== null &&
		toToken !== null &&
		fromToken.chainId === toToken.chainId &&
		fromToken.address.toLowerCase() === toToken.address.toLowerCase();
	const toUsd = isSend ? fromUsd : quote ? quote.out.usd : estimateToUsd;
	const toAmount = isSend
		? fromUnits
		: quote
			? Number(quote.out.amount)
			: estimateToAmount;

	// Requirements to enable the action: both tokens chosen, a positive amount,
	// and enough from-balance to cover it. Otherwise disable and show the reason.
	const fromBalance = fromToken ? Number(fromToken.amount) || 0 : 0;
	// Only gate on balance when it's actually known (>0). Catalog tokens have no
	// balance until wallet holdings are fetched, so don't block the swap on them.
	const insufficient = fromBalance > 0 && fromUnits > fromBalance;
	const canSwap =
		fromToken !== null && toToken !== null && fromUnits > 0 && !insufficient;
	const actionLabel =
		fromToken === null || toToken === null
			? t("swapCard.actionLabel.selectToken")
			: fromUnits <= 0
				? t("swapCard.actionLabel.enterAmount")
				: insufficient
					? t("swapCard.actionLabel.insufficientBalance", {
							symbol: fromToken.symbol,
						})
					: t(`swapCard.action.${action}`);

	// Flip a field's denomination. For FROM, convert the editable string so the
	// displayed value stays equal across the toggle.
	const toggleFromMode = () => {
		if (fromMode === "token") {
			setFromAmount(trimUsd(fromUsd));
			setFromMode("usd");
		} else {
			setFromAmount(trim(fromUnits));
			setFromMode("token");
		}
	};
	const toggleToMode = () =>
		setToMode((m) => (m === "token" ? "usd" : "token"));

	// Changing the default denomination in the menu switches BOTH inputs at once.
	// Convert the editable FROM amount so its displayed value stays equivalent.
	const handleDenominationChange = (next: Denomination) => {
		setDenomination(next);
		const mode = modeForDenomination(next);
		if (mode !== fromMode) {
			setFromAmount(mode === "usd" ? trimUsd(fromUsd) : trim(fromUnits));
		}
		setFromMode(mode);
		setToMode(mode);
	};

	// Flip only swaps the chosen assets/chains; the entered amount stays put and
	// the quote re-derives. No-op until both sides have a token.
	const swapTokens = () => {
		if (fromToken === null || toToken === null) return;
		setFromToken(toToken);
		setToToken(fromToken);
	};

	// Apply the default denomination to both inputs on load and whenever the
	// setting changes. Skip while an amount is being entered so a typed value
	// isn't silently reinterpreted (it'll take effect on the next reset).
	useEffect(() => {
		if (Number(fromAmount) !== 0) return;
		setFromMode(defaultMode);
		setToMode(defaultMode);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [defaultMode]);

	// Clear tokens, amount, and denomination back to the default state.
	const resetForm = () => {
		setFromAmount("0");
		setFromToken(null);
		setToToken(null);
		setFromMode(defaultMode);
		setToMode(defaultMode);
	};
	const isPristine =
		fromToken === null && toToken === null && Number(fromAmount) === 0;

	// Send/Swap/Bridge. With a live quote + connected wallet we execute the real
	// transaction(s) via Relay; if no wallet is connected we open connect; if a
	// quote hasn't resolved yet we fall back to the preview animation.
	const exec = useExecuteSwap();
	const handleSubmit = () => {
		if (!canSwap || submitting) return;
		if (!connected) {
			connect();
			return;
		}
		if (quote) {
			setSubmitting(true);
			void exec.run(quote);
			return;
		}
		// Live quote hasn't resolved — play the preview effect and reset.
		setSubmitting(true);
		window.setTimeout(() => {
			setSubmitting(false);
			resetForm();
		}, 3000);
	};

	// Reflect real execution status: clear the form on success, drop the spinner
	// when execution settles either way.
	useEffect(() => {
		if (exec.status === "success") {
			resetForm();
			setSubmitting(false);
			exec.reset();
		} else if (exec.status === "error") {
			setSubmitting(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [exec.status]);

	// Latest from amount + mode for the global keyboard handler (avoids stale closures).
	const stateRef = useRef(fromAmount);
	stateRef.current = fromAmount;
	const fromModeRef = useRef(fromMode);
	fromModeRef.current = fromMode;

	// Dollars are capped at 2 decimals; token amounts keep full precision.
	const exceedsDecimals = (s: string) => {
		if (fromModeRef.current !== "usd") return false;
		const dot = s.indexOf(".");
		return dot !== -1 && s.length - dot - 1 > 2;
	};

	const handleKey = (key: string) => {
		const current = stateRef.current;
		if (key === "back") {
			setFromAmount(current.length <= 1 ? "0" : current.slice(0, -1));
		} else if (key === ".") {
			if (!current.includes(".")) setFromAmount(`${current}.`);
		} else {
			const next = sanitizeAmount(current === "0" ? key : current + key);
			if (exceedsDecimals(next)) return;
			setFromAmount(next);
		}
	};

	// The physical keyboard / paste drive the active amount unless another
	// field (e.g. the drawer search) is focused.
	useEffect(() => {
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
			const text = (e.clipboardData?.getData("text") ?? "")
				.trim()
				.replace(/,/g, "");
			if (text !== "" && /^[0-9]*\.?[0-9]*$/.test(text)) {
				const next = sanitizeAmount(text);
				// Clamp pasted dollar values to 2 decimals.
				setFromAmount(
					fromModeRef.current === "usd" ? trimUsd(Number(next) || 0) : next,
				);
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
	}, []);

	return (
		<motion.div
			className="w-full max-w-md"
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: "easeOut" }}
		>
			{/* You pay */}
			<section className="rounded-3xl bg-card px-4 pb-3 pt-4">
				<TokenBox
					variant="from"
					selected={fromToken}
					onSelect={setFromToken}
					onSetAmount={setFromAmount}
					connected={connected}
					walletAddress={address}
					onConnect={connect}
					onDisconnect={disconnect}
					genAddress={genAddress}
					onToggleGenAddress={() => setGenAddress((v) => !v)}
					triggerClassName="-mx-4 -mt-4 w-[calc(100%+2rem)] rounded-t-3xl px-4 pb-4 pt-4 hover:bg-foreground/[0.03]"
				/>
				<div className="-mx-4 border-t-2 border-background" />
				<div className="flex flex-col items-center gap-2 p-2">
					<AmountInput
						value={fromAmount}
						prefix={fromMode === "usd" ? "$" : undefined}
					/>
					<Pill onClick={toggleFromMode}>
						<span className="opacity-50">=</span>{" "}
						<ConversionValue
							mode={fromMode}
							usd={fromUsd}
							units={fromUnits}
							symbol={fromToken?.symbol ?? ""}
						/>
						<ArrowUpDown className="size-3.5" />
					</Pill>
				</div>
			</section>

			{/* Swap direction */}
			<div className="relative z-10 mx-auto -my-3 flex w-fit">
				{/* Filled disc behind the button — breaks the seam line and is sized
				    to include what used to be the 2px ring (size-8 + 2px each side). */}
				<span
					aria-hidden
					className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background"
				/>
				<HapticButton
					type="button"
					onClick={swapTokens}
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
					aria-label={t("swapCard.swapDirection.ariaLabel")}
				>
					<ArrowUpDown className="size-4" />
				</HapticButton>
			</div>

			{/* You receive */}
			<section className="rounded-3xl bg-card px-4 pb-0 pt-6">
				<TokenBox
					variant="to"
					selected={toToken}
					onSelect={setToToken}
					walletAddress={address}
					slippage={slippage}
					onOpenSlippage={() => setSlippageOpen(true)}
					triggerClassName="-mx-4 -mt-6 w-[calc(100%+2rem)] rounded-t-3xl px-4 pb-4 pt-6 hover:bg-foreground/[0.03]"
				/>
				<div className="-mx-4 border-t-2 border-background" />
				<div className="flex flex-col items-center gap-2 p-2">
					<AmountInput
						value={trim(toMode === "token" ? toAmount : toUsd)}
						prefix={toMode === "usd" ? "$" : undefined}
						muted
					/>
					<Pill onClick={toggleToMode}>
						<span className="opacity-50">=</span>{" "}
						<ConversionValue
							mode={toMode}
							usd={toUsd}
							units={toAmount}
							symbol={toToken?.symbol ?? ""}
						/>
						<ArrowUpDown className="size-3.5" />
					</Pill>
				</div>
			</section>

			<MobileKeypad onKey={handleKey} />

			{/* Action button with the menu button to its left. */}
			<div className="mt-2 flex items-center gap-2">
				<AppMenu
					denomination={denomination}
					onDenominationChange={handleDenominationChange}
				/>
				<HapticButton
					wrapperClassName="grid flex-1"
					type="button"
					onClick={handleSubmit}
					disabled={!canSwap || submitting}
					className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-secondary/40 disabled:text-muted-foreground disabled:hover:bg-secondary/40 disabled:active:scale-100"
				>
					{submitting ? t("swapCard.submit.confirming") : actionLabel}
				</HapticButton>
				<HapticButton
					type="button"
					onClick={resetForm}
					disabled={isPristine || submitting}
					aria-label={t("swapCard.reset.ariaLabel")}
					className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80 active:scale-95 disabled:cursor-not-allowed disabled:bg-secondary/40 disabled:text-muted-foreground disabled:hover:bg-secondary/40 disabled:active:scale-100"
				>
					<RotateCcw className="size-5" />
				</HapticButton>
			</div>

			<SlippageDrawer
				open={slippageOpen}
				onOpenChange={setSlippageOpen}
				value={slippage}
				onChange={setSlippage}
			/>

			<AppleBorderGradient preview={submitting} intensity="xl" />
		</motion.div>
	);
}
