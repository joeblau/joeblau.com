"use client";

import { ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";

import type { Mode } from "../types";
import { cn } from "../lib/utils";
import { CryptoAddress } from "./crypto-address";
import { HapticButton } from "./haptic-button";
import {
	AMOUNT_FIELD_TRANSITION,
	AmountInput,
	ConversionValue,
	Pill,
	useMeasuredHeight,
} from "./swap-field";

export interface SwapFromProps {
	/** The token-selector node (your <BottomSheet trigger={<TokenTrigger/>}>… or a bare <TokenTrigger/>). */
	picker: ReactNode;
	/** Editable amount string, in `mode`'s denomination. */
	amount: string;
	mode: Mode;
	onToggleMode: () => void;
	/**
	 * Open the token picker. The amount area is a tap target for this, so the
	 * whole card behaves as one — matching `picker`'s own trigger. Omit to make
	 * the amount area inert.
	 */
	onActivatePicker?: () => void;
	/** USD value of the entered amount (for the conversion pill). */
	usd: number;
	/** Token units of the entered amount (for the conversion pill). */
	units: number;
	/** Selected token symbol (shown in the token-mode conversion pill). */
	symbol?: string;
	amountAriaLabel?: string;
	/** Generate-address (receive) mode: swaps the amount field for a QR + address. */
	genAddress?: boolean;
	receiveAddress?: string;
	receivePayload?: string;
	arena?: string;
	onCopyAddress?: (address: string) => void;
	renderQr?: (args: { value: string; arena?: string }) => ReactNode;
}

/**
 * The "You pay" side: a token-selector slot plus an animated amount field that
 * flips between token and USD denomination. In generate-address mode the amount
 * field is replaced by a QR + vertical address (receive view). Fully controlled.
 */
export function SwapFrom({
	picker,
	amount,
	mode,
	onToggleMode,
	onActivatePicker,
	usd,
	units,
	symbol,
	amountAriaLabel,
	genAddress = false,
	receiveAddress,
	receivePayload,
	arena,
	onCopyAddress,
	renderQr,
}: SwapFromProps) {
	const box = useMeasuredHeight();
	const height = box.height ?? undefined;

	return (
		<section className="group relative rounded-3xl bg-card px-4 pb-3 pt-4">
			{/* Whole-card hover tint: the picker and amount are separate controls,
			    but the seamless card highlights as one unit. Don't add your own
			    hover background to the picker trigger. */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 rounded-3xl transition-colors group-hover:bg-foreground/[0.03]"
			/>
			{picker}
			<div
				className={cn("flex flex-col justify-center", AMOUNT_FIELD_TRANSITION)}
				style={{ height }}
			>
				<div ref={box.ref}>
					{genAddress ? (
						<CryptoAddress
							address={receiveAddress ?? ""}
							qrValue={receivePayload}
							arena={arena}
							onCopy={onCopyAddress}
							renderQr={renderQr}
						/>
					) : (
						<div className="relative">
							{/* Full-area tap target behind a pass-through content layer.
							    The card reads as one surface, so tapping the amount opens
							    the token picker exactly like tapping the trigger above it —
							    only the Pill switches denomination. The picker's own
							    trigger is the accessible control, so this is a11y-hidden. */}
							<div className="absolute inset-0">
								<HapticButton
									type="button"
									onClick={onActivatePicker}
									tabIndex={-1}
									aria-hidden
									wrapperClassName="grid size-full"
									className="size-full cursor-pointer"
								/>
							</div>
							<div className="pointer-events-none relative flex flex-col items-center gap-2 p-2">
								<AmountInput
									value={amount}
									prefix={mode === "usd" ? "$" : undefined}
									ariaLabel={amountAriaLabel}
								/>
								<Pill onClick={onToggleMode}>
									<span className="opacity-50">=</span>{" "}
									<ConversionValue mode={mode} usd={usd} units={units} symbol={symbol ?? ""} />
									<ArrowUpDown className="size-3.5" />
								</Pill>
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
