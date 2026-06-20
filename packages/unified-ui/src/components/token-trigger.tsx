"use client";

import Avatar from "boring-avatars";
import { AnimatePresence, motion } from "framer-motion";
import { FlaskConical, SlidersHorizontal } from "lucide-react";

import { computeTest, formatPct, truncateAddress } from "../lib/format";
import { cn } from "../lib/utils";
import type { TokenRow, TokenTriggerLabels } from "../types";
import { HapticButton } from "./haptic-button";
import { TokenAmount } from "./token-amount";

const ADDRESS = "0x71•••976F";
const AVATAR_COLORS = ["#7dd3fc", "#3b82f6", "#2563eb", "#1e3a8a", "#0ea5e9"];

/** Relay icon CDN; override per token via `chainIconUrl` if you host your own. */
const defaultChainIcon = (chainId: number) =>
	`https://assets.relay.link/icons/${chainId}/light.png`;

const DEFAULT_LABELS: Required<
	Pick<TokenTriggerLabels, "test" | "max" | "slippage" | "fee">
> = {
	test: "Test",
	max: "Max",
	slippage: (percent) => percent,
	fee: (amount) => `Fee ${amount}`,
};

function AssetStack({
	token,
	seed,
	chainIconUrl,
}: {
	token: TokenRow;
	seed: string;
	chainIconUrl: (chainId: number) => string;
}) {
	return (
		<div className="relative h-14 w-7 shrink-0">
			<div className="absolute left-1/2 top-0 size-7 -translate-x-1/2 overflow-hidden rounded-full ring-2 ring-card">
				<Avatar size={28} name={seed} variant="marble" colors={AVATAR_COLORS} />
			</div>
			{/* biome-ignore lint/a11y/useAltText: decorative chain glyph */}
			<img
				src={chainIconUrl(token.chainId)}
				alt={token.chain}
				className="absolute left-1/2 top-3.5 size-7 -translate-x-1/2 rounded-full bg-card object-cover ring-2 ring-card"
			/>
			{/* biome-ignore lint/a11y/useAltText: token logo */}
			<img
				src={token.logo}
				alt={token.name}
				className="absolute left-1/2 top-7 size-7 -translate-x-1/2 rounded-full bg-card object-cover ring-2 ring-card"
			/>
		</div>
	);
}

function ClickablePill({
	onClick,
	children,
}: {
	onClick: (e: React.MouseEvent) => void;
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

function SelectedMeta({
	variant,
	token,
	labels,
	onSetAmount,
	slippage,
	fee,
	feeLoading,
	onOpenSlippage,
}: {
	variant: "from" | "to";
	token: TokenRow;
	labels: Required<Pick<TokenTriggerLabels, "test" | "max" | "slippage" | "fee">>;
	onSetAmount?: (amount: string) => void;
	slippage?: number;
	fee?: number | null;
	feeLoading?: boolean;
	onOpenSlippage?: () => void;
}) {
	if (variant === "to") {
		const feeAmount = feeLoading ? "…" : fee != null ? `$${fee.toFixed(2)}` : "—";
		return (
			<div className="flex flex-col items-end gap-2">
				<ClickablePill
					onClick={(e) => {
						e.stopPropagation();
						onOpenSlippage?.();
					}}
				>
					<SlidersHorizontal className="size-3.5" />
					{labels.slippage(formatPct(slippage ?? 0.005))}
				</ClickablePill>
				<span className="text-sm text-muted-foreground">{labels.fee(feeAmount)}</span>
			</div>
		);
	}
	const set = (amount: string) => (e: React.MouseEvent) => {
		e.stopPropagation();
		onSetAmount?.(amount);
	};
	// No holdings known (catalog without wallet balances) — show nothing.
	if (Number.parseFloat(token.amount) <= 0) return null;
	return (
		<div className="flex flex-col items-end gap-2">
			<div className="flex gap-2">
				<ClickablePill onClick={set(computeTest(token))}>
					<FlaskConical className="size-3.5" />
					{labels.test}
				</ClickablePill>
				<ClickablePill onClick={set(token.amount)}>{labels.max}</ClickablePill>
			</div>
			<span className="text-sm text-muted-foreground">
				<TokenAmount value={token.amount} /> {token.symbol}
			</span>
		</div>
	);
}

function SelectedHeader({
	variant,
	token,
	walletAddress,
	chainIconUrl,
	labels,
	onSetAmount,
	slippage,
	fee,
	feeLoading,
	onOpenSlippage,
}: {
	variant: "from" | "to";
	token: TokenRow;
	walletAddress?: string | null;
	chainIconUrl: (chainId: number) => string;
	labels: Required<Pick<TokenTriggerLabels, "test" | "max" | "slippage" | "fee">>;
	onSetAmount?: (amount: string) => void;
	slippage?: number;
	fee?: number | null;
	feeLoading?: boolean;
	onOpenSlippage?: () => void;
}) {
	return (
		<div className="flex items-start justify-between gap-3">
			<div className="flex items-center gap-3">
				<AssetStack
					token={token}
					seed={walletAddress ?? ADDRESS}
					chainIconUrl={chainIconUrl}
				/>
				<div className="flex flex-col leading-none -space-y-0.5">
					<span className="text-sm text-muted-foreground">
						{walletAddress ? truncateAddress(walletAddress) : ADDRESS}
					</span>
					<span className="text-sm text-muted-foreground">{token.chain}</span>
					<span className="text-base font-semibold text-foreground">{token.name}</span>
				</div>
			</div>
			<SelectedMeta
				variant={variant}
				token={token}
				labels={labels}
				onSetAmount={onSetAmount}
				slippage={slippage}
				fee={fee}
				feeLoading={feeLoading}
				onOpenSlippage={onOpenSlippage}
			/>
		</div>
	);
}

/**
 * The presentational token selector face. Shows a large "From..." / "To..."
 * placeholder until a token is picked, then a stacked icon + address/chain/name
 * with side-specific meta (Test/Max + holdings for From, Slippage/Fee for To).
 * Tapping anywhere calls `onActivate` (open your drawer); the meta pills opt back
 * into pointer events and act without opening it.
 *
 * Fully presentational — no data, wallet, or drawer logic. Wrap it in your own
 * <BottomSheet trigger={<TokenTrigger … />}> and render the drawer body yourself.
 */
export function TokenTrigger({
	variant,
	selected = null,
	triggerClassName,
	walletAddress,
	onActivate,
	labels,
	kbdHint,
	chainIconUrl = defaultChainIcon,
	onSetAmount,
	slippage,
	fee,
	feeLoading,
	onOpenSlippage,
}: {
	variant: "from" | "to";
	selected?: TokenRow | null;
	triggerClassName?: string;
	walletAddress?: string | null;
	/** Open your drawer. */
	onActivate?: () => void;
	labels?: TokenTriggerLabels;
	/** Optional keyboard hint glyph rendered as a ⌘<hint> kbd (e.g. "F"). */
	kbdHint?: string;
	/** Override the chain-icon URL builder (defaults to Relay's CDN). */
	chainIconUrl?: (chainId: number) => string;
	onSetAmount?: (amount: string) => void;
	slippage?: number;
	fee?: number | null;
	feeLoading?: boolean;
	onOpenSlippage?: () => void;
}) {
	const merged = { ...DEFAULT_LABELS, ...labels };
	const placeholder = labels?.placeholder ?? (variant === "from" ? "From..." : "To...");
	const selectAriaLabel = labels?.selectAriaLabel ?? `Select ${variant} token`;

	return (
		<div className={cn("relative block text-left transition-colors", triggerClassName)}>
			{/* Full-area tap target. It sits behind a pass-through content layer; the
			    pills re-enable pointer events so they act without opening the drawer. */}
			<div className="absolute inset-0">
				<HapticButton
					type="button"
					onClick={() => onActivate?.()}
					aria-label={selectAriaLabel}
					wrapperClassName="grid size-full"
					className="size-full cursor-pointer"
				/>
			</div>
			<div className="pointer-events-none relative flex min-h-[3.75rem] flex-col justify-center">
				<AnimatePresence mode="wait" initial={false}>
					{selected ? (
						<motion.div
							key="selected"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
						>
							<SelectedHeader
								variant={variant}
								token={selected}
								walletAddress={walletAddress}
								chainIconUrl={chainIconUrl}
								labels={merged}
								onSetAmount={onSetAmount}
								slippage={slippage}
								fee={fee}
								feeLoading={feeLoading}
								onOpenSlippage={onOpenSlippage}
							/>
						</motion.div>
					) : (
						<motion.div
							key="placeholder"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
						>
							<span className="token-box-label block text-5xl font-semibold text-foreground/30">
								{placeholder}
							</span>
							{kbdHint && (
								<kbd className="pointer-events-none absolute right-0 top-1/2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground md:inline-flex">
									<span className="text-xs">⌘</span>
									{kbdHint}
								</kbd>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
