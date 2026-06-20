"use client";

import { ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";

import type { Mode } from "../types";
import {
	AMOUNT_FIELD_TRANSITION,
	AmountInput,
	ConversionValue,
	Pill,
	trim,
	useMeasuredHeight,
} from "./swap-field";

export interface SwapToProps {
	/** The token-selector node (your <BottomSheet trigger={<TokenTrigger/>}>… or a bare <TokenTrigger/>). */
	picker: ReactNode;
	/** Received token amount (units). */
	amount: number;
	/** Received USD value. */
	usd: number;
	mode: Mode;
	onToggleMode: () => void;
	/** Selected token symbol (shown in the token-mode conversion pill). */
	symbol?: string;
	amountAriaLabel?: string;
	/** Collapse the amount block to height 0 (generate-address / receive mode). */
	collapsed?: boolean;
}

/**
 * The "You receive" side: a token-selector slot plus a muted, read-only animated
 * amount that flips between token and USD denomination. The amount block
 * collapses to nothing when `collapsed` so the card's total height stays
 * constant while the From side grows into a receive view. Fully controlled.
 */
export function SwapTo({
	picker,
	amount,
	usd,
	mode,
	onToggleMode,
	symbol,
	amountAriaLabel,
	collapsed = false,
}: SwapToProps) {
	const box = useMeasuredHeight();
	const height = box.height == null ? undefined : collapsed ? 0 : box.height;

	return (
		<section className="rounded-3xl bg-card px-4 pb-0 pt-6">
			{picker}
			<div className={AMOUNT_FIELD_TRANSITION} style={{ height }}>
				<div ref={box.ref}>
					<div className="-mx-4 border-t-2 border-background" />
					<div className="flex flex-col items-center gap-2 p-2">
						<AmountInput
							value={trim(mode === "token" ? amount : usd)}
							prefix={mode === "usd" ? "$" : undefined}
							muted
							ariaLabel={amountAriaLabel}
						/>
						<Pill onClick={onToggleMode}>
							<span className="opacity-50">=</span>{" "}
							<ConversionValue mode={mode} usd={usd} units={amount} symbol={symbol ?? ""} />
							<ArrowUpDown className="size-3.5" />
						</Pill>
					</div>
				</div>
			</div>
		</section>
	);
}
