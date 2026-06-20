"use client";

import { ArrowUpDown } from "lucide-react";

import { CryptoAddress } from "@/components/crypto-address";
import {
	AMOUNT_FIELD_TRANSITION,
	AmountInput,
	ConversionValue,
	Pill,
	useMeasuredHeight,
} from "@/components/swap-field";
import { TokenBox, type TokenRow } from "@/components/token-drawer";
import { cn } from "@/lib/utils";

export interface SwapFromProps {
	/** Controlled selected "from" token (owned by the parent so flip can swap them). */
	token: TokenRow | null;
	onSelectToken: (token: TokenRow) => void;
	/** Editable amount string, in `mode`'s denomination. */
	amount: string;
	onSetAmount: (amount: string) => void;
	/** Whether the amount is entered in token units or USD. */
	mode: "token" | "usd";
	onToggleMode: () => void;
	/** USD value of the entered amount (for the conversion pill). */
	usd: number;
	/** Token units of the entered amount (for the conversion pill). */
	units: number;
	connected: boolean;
	walletAddress?: string | null;
	onConnect: () => void;
	onDisconnect: () => void;
	/** Generate-address (receive) mode: swaps the amount field for a QR + address. */
	genAddress: boolean;
	onToggleGenAddress: () => void;
	/** Address shown in the receive view (connected wallet, or a placeholder). */
	receiveAddress: string;
	/** QR payload for the receive view (e.g. an EIP-681 asset-transfer URI). */
	receivePayload: string;
}

/**
 * The "You pay" side of a swap: a token picker plus an animated amount field
 * that flips between token and USD denomination. In generate-address mode the
 * amount field is replaced by a QR code + vertical address (receive view).
 *
 * Presentational and fully controlled — all state lives in the parent.
 */
export function SwapFrom({
	token,
	onSelectToken,
	amount,
	onSetAmount,
	mode,
	onToggleMode,
	usd,
	units,
	connected,
	walletAddress,
	onConnect,
	onDisconnect,
	genAddress,
	onToggleGenAddress,
	receiveAddress,
	receivePayload,
}: SwapFromProps) {
	const box = useMeasuredHeight();
	const height = box.height ?? undefined;

	return (
		<section className="rounded-3xl bg-card px-4 pb-3 pt-4">
			<TokenBox
				variant="from"
				selected={token}
				onSelect={onSelectToken}
				onSetAmount={onSetAmount}
				connected={connected}
				walletAddress={walletAddress}
				onConnect={onConnect}
				onDisconnect={onDisconnect}
				genAddress={genAddress}
				onToggleGenAddress={onToggleGenAddress}
				triggerClassName="-mx-4 -mt-4 w-[calc(100%+2rem)] rounded-t-3xl px-4 pb-4 pt-4 hover:bg-foreground/[0.03]"
			/>
			<div className="-mx-4 border-t-2 border-background" />
			<div
				className={cn("flex flex-col justify-center", AMOUNT_FIELD_TRANSITION)}
				style={{ height }}
			>
				<div ref={box.ref}>
					{genAddress ? (
						// Receive view: QR + vertical address, formatted per asset.
						// The $0 + units are hidden in this mode. CryptoAddress's own
						// p-2 matches the normal field's p-2, so the gap below it to the
						// flip button is identical (no extra wrapper padding).
						<CryptoAddress
							address={receiveAddress}
							qrValue={receivePayload}
							arena={token?.logo}
						/>
					) : (
						<div className="flex flex-col items-center gap-2 p-2">
							<AmountInput
								value={amount}
								prefix={mode === "usd" ? "$" : undefined}
							/>
							<Pill onClick={onToggleMode}>
								<span className="opacity-50">=</span>{" "}
								<ConversionValue
									mode={mode}
									usd={usd}
									units={units}
									symbol={token?.symbol ?? ""}
								/>
								<ArrowUpDown className="size-3.5" />
							</Pill>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
