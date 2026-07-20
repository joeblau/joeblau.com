"use client";

import { ArrowUpDown } from "lucide-react";

import { HapticButton } from "@/components/haptic-button";
import {
	AMOUNT_FIELD_TRANSITION,
	AmountInput,
	ConversionValue,
	Pill,
	trim,
	useMeasuredHeight,
} from "@/components/swap-field";
import { TokenBox, type TokenRow } from "@/components/token-drawer";
import { cn } from "@/lib/utils";

export interface SwapToProps {
	/** Controlled selected "to" token (owned by the parent so flip can swap them). */
	token: TokenRow | null;
	onSelectToken: (token: TokenRow) => void;
	walletAddress?: string | null;
	slippage: number;
	/** Live total fee in USD from the quote (null until it resolves / for sends). */
	fee: number | null;
	/** Whether a fresh quote is loading (so the fee can show a placeholder). */
	feeLoading: boolean;
	onOpenSlippage: () => void;
	/** Received token amount (units). */
	amount: number;
	/** Received USD value. */
	usd: number;
	/** Whether the received amount is shown in token units or USD. */
	mode: "token" | "usd";
	onToggleMode: () => void;
	/** Collapse the amount block to height 0 (generate-address / receive mode). */
	collapsed: boolean;
}

/**
 * The "You receive" side of a swap: a token picker plus a muted, read-only
 * animated amount that flips between token and USD denomination. The amount
 * block collapses to nothing when `collapsed` (generate-address mode) so the
 * card's total height stays constant.
 *
 * Presentational and fully controlled — all state lives in the parent.
 */
export function SwapTo({
	token,
	onSelectToken,
	walletAddress,
	slippage,
	fee,
	feeLoading,
	onOpenSlippage,
	amount,
	usd,
	mode,
	onToggleMode,
	collapsed,
}: SwapToProps) {
	const box = useMeasuredHeight();
	const height = box.height == null ? undefined : collapsed ? 0 : box.height;

	return (
		<section className="group relative rounded-3xl bg-card px-4 pb-0 pt-6">
			{/* Whole-card hover tint: the top picker and bottom amount are separate
			    controls, but the seamless card highlights as one unit. */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 rounded-3xl transition-colors group-hover:bg-foreground/[0.03]"
			/>
			<TokenBox
				variant="to"
				selected={token}
				onSelect={onSelectToken}
				walletAddress={walletAddress}
				slippage={slippage}
				fee={fee}
				feeLoading={feeLoading}
				onOpenSlippage={onOpenSlippage}
				triggerClassName={cn(
					"-mx-4 -mt-6 w-[calc(100%+2rem)] px-4 pb-4 pt-6",
					collapsed ? "rounded-3xl" : "rounded-t-3xl",
				)}
			/>
			{/* The destination amount is removed entirely in generate-address mode;
			    the "from" field grows by exactly this block's height so the card's
			    total height never changes. */}
			<div className={AMOUNT_FIELD_TRANSITION} style={{ height }}>
				<div ref={box.ref}>
					<div className="relative">
						{/* Full-area tap target behind a pass-through content layer:
						    tapping anywhere on the amount flips the denomination. The
						    Pill stays the accessible control, so this is a11y-hidden. */}
						<div className="absolute inset-0">
							<HapticButton
								type="button"
								onClick={onToggleMode}
								tabIndex={-1}
								aria-hidden
								wrapperClassName="grid size-full"
								className="size-full cursor-pointer"
							/>
						</div>
						<div className="pointer-events-none relative flex flex-col items-center gap-2 p-2">
							<AmountInput
								value={trim(mode === "token" ? amount : usd)}
								prefix={mode === "usd" ? "$" : undefined}
								muted
							/>
							<Pill onClick={onToggleMode}>
								<span className="opacity-50">=</span>{" "}
								<ConversionValue
									mode={mode}
									usd={usd}
									units={amount}
									symbol={token?.symbol ?? ""}
								/>
								<ArrowUpDown className="size-3.5" />
							</Pill>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
