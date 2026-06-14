"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { ArrowUpDown, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AppleBorderGradient } from "@/components/apple-border-gradient";
import { AppMenu } from "@/components/app-menu";
import { HapticButton } from "@/components/haptic-button";
import { MobileKeypad } from "@/components/keypad";
import { SlippageDrawer } from "@/components/slippage-drawer";
import { price, TokenBox, type TokenRow } from "@/components/token-drawer";
import { cn } from "@/lib/utils";

/** Same asset + chain → Send; different asset, same chain → Swap; different asset + chain → Bridge. */
function getActionLabel(from: TokenRow | null, to: TokenRow | null) {
	if (!from || !to) return "Send";
	const differentAsset = from.symbol !== to.symbol;
	const sameChain = from.chainId === to.chainId;
	if (differentAsset && sameChain) return "Swap";
	if (differentAsset && !sameChain) return "Bridge";
	return "Send";
}

/** Quote constant — must match the "Fee $0.25" shown in SelectedMeta. */
const FEE_USD = 0.25;

function formatUsd(n: number) {
	return `$${n.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
}

/** Trim a number to a clean string (drops trailing zeros, caps at 8 decimals). */
function trim(n: number) {
	return String(Number(n.toFixed(8)));
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
	const dot = value.indexOf(".");
	const fractionDigits = dot === -1 ? 0 : Math.min(value.length - dot - 1, 8);
	return (
		<div
			role="textbox"
			aria-label="Amount"
			tabIndex={0}
			className="cursor-text rounded-lg outline-none"
		>
			<NumberFlow
				value={Number(value) || 0}
				prefix={prefix}
				suffix={value.endsWith(".") ? "." : ""}
				format={{
					minimumFractionDigits: fractionDigits,
					maximumFractionDigits: 8,
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
	const [fromAmount, setFromAmount] = useState("0");
	const [fromToken, setFromToken] = useState<TokenRow | null>(null);
	const [toToken, setToToken] = useState<TokenRow | null>(null);
	const [fromMode, setFromMode] = useState<"token" | "usd">("token");
	const [toMode, setToMode] = useState<"token" | "usd">("token");
	const [slippage, setSlippage] = useState(0.005);
	const [slippageOpen, setSlippageOpen] = useState(false);
	const [connected, setConnected] = useState(false);
	const [genAddress, setGenAddress] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const action = getActionLabel(fromToken, toToken);

	// Quote is always driven by the FROM token units, regardless of display mode.
	const fromPrice = fromToken ? price(fromToken) : 0;
	const fromInput = Number(fromAmount) || 0;
	const fromUnits =
		fromMode === "token" ? fromInput : fromPrice > 0 ? fromInput / fromPrice : 0;
	const fromUsd = fromUnits * fromPrice;
	const toUsd =
		fromToken && toToken ? Math.max(0, fromUsd - FEE_USD) * (1 - slippage) : 0;
	const toPrice = toToken ? price(toToken) : 0;
	const toAmount = toToken && toPrice > 0 ? toUsd / toPrice : 0;

	// Requirements to enable the action: both tokens chosen, a positive amount,
	// and enough from-balance to cover it. Otherwise disable and show the reason.
	const fromBalance = fromToken ? Number(fromToken.amount) || 0 : 0;
	const insufficient = fromToken !== null && fromUnits > fromBalance;
	const canSwap =
		fromToken !== null && toToken !== null && fromUnits > 0 && !insufficient;
	const actionLabel =
		fromToken === null || toToken === null
			? "Select a token"
			: fromUnits <= 0
				? "Enter an amount"
				: insufficient
					? `Insufficient ${fromToken.symbol} balance`
					: action;

	// Flip a field's denomination. For FROM, convert the editable string so the
	// displayed value stays equal across the toggle.
	const toggleFromMode = () => {
		if (fromMode === "token") {
			setFromAmount(trim(fromUsd));
			setFromMode("usd");
		} else {
			setFromAmount(trim(fromUnits));
			setFromMode("token");
		}
	};
	const toggleToMode = () =>
		setToMode((m) => (m === "token" ? "usd" : "token"));

	// Flip only swaps the chosen assets/chains; the entered amount stays put and
	// the quote re-derives. No-op until both sides have a token.
	const swapTokens = () => {
		if (fromToken === null || toToken === null) return;
		setFromToken(toToken);
		setToToken(fromToken);
	};

	// Clear tokens, amount, and denomination back to the initial state.
	const resetForm = () => {
		setFromAmount("0");
		setFromToken(null);
		setToToken(null);
		setFromMode("token");
		setToMode("token");
	};
	const isPristine =
		fromToken === null && toToken === null && Number(fromAmount) === 0;

	// Send/Swap/Bridge: play the Apple-gradient effect for 3s, then reset the form.
	const handleSubmit = () => {
		if (!canSwap || submitting) return;
		setSubmitting(true);
		window.setTimeout(() => {
			setSubmitting(false);
			resetForm();
		}, 3000);
	};

	// Latest from amount for the global keyboard handler (avoids stale closures).
	const stateRef = useRef(fromAmount);
	stateRef.current = fromAmount;

	const handleKey = (key: string) => {
		const current = stateRef.current;
		if (key === "back") {
			setFromAmount(current.length <= 1 ? "0" : current.slice(0, -1));
		} else if (key === ".") {
			if (!current.includes(".")) setFromAmount(`${current}.`);
		} else {
			setFromAmount(sanitizeAmount(current === "0" ? key : current + key));
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
				setFromAmount(sanitizeAmount(text));
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
					onConnect={() => setConnected(true)}
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
						{fromMode === "token"
							? formatUsd(fromUsd)
							: `${trim(fromUnits)} ${fromToken?.symbol ?? ""}`}
						<ArrowUpDown className="size-3.5" />
					</Pill>
				</div>
			</section>

			{/* Swap direction */}
			<div className="relative z-10 mx-auto -my-3 flex w-fit">
				<HapticButton
					type="button"
					onClick={swapTokens}
					disabled={fromToken === null || toToken === null}
					style={{
						background:
							"linear-gradient(hsl(var(--foreground) / 0.07), hsl(var(--foreground) / 0.07)), hsl(var(--card))",
					}}
					className="flex size-8 items-center justify-center rounded-full text-muted-foreground ring-2 ring-background transition-colors disabled:cursor-not-allowed disabled:text-muted-foreground/40"
					aria-label="Swap assets"
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
						{toMode === "token"
							? formatUsd(toUsd)
							: `${trim(toAmount)} ${toToken?.symbol ?? ""}`}
						<ArrowUpDown className="size-3.5" />
					</Pill>
				</div>
			</section>

			<MobileKeypad onKey={handleKey} />

			{/* Action button with the menu button to its left. */}
			<div className="mt-2 flex items-center gap-2">
				<AppMenu />
				<HapticButton
					wrapperClassName="grid flex-1"
					type="button"
					onClick={handleSubmit}
					disabled={!canSwap || submitting}
					className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground disabled:hover:bg-secondary disabled:active:scale-100"
				>
					{submitting ? "Confirming…" : actionLabel}
				</HapticButton>
				<HapticButton
					type="button"
					onClick={resetForm}
					disabled={isPristine || submitting}
					aria-label="Reset"
					className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-secondary disabled:active:scale-100"
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
