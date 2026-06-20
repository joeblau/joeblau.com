"use client";

import type { ReactNode } from "react";

import { cn } from "../lib/utils";
import { QrCode } from "./qr-code";

/**
 * Tap-to-copy receive view: a scannable QR on the left, the address laid out as
 * a multi-row "vertical address" on the right with the anchor characters (the
 * leading + trailing chars wallets eyeball) highlighted and the middle faded.
 * The whole surface copies the address on tap.
 *
 * `qrValue` overrides ONLY the QR payload (e.g. an EIP-681 URI so a scanning
 * wallet pre-fills the right token); the displayed + copied text is always the
 * bare `address`. By default the QR is the dependency-free <QrCode/>; pass
 * `renderQr` (e.g. the `@joeblau/unified-ui/cuer` adapter) for a center-logo QR.
 * `onCopy` is invoked after writing to the clipboard (wire your own toast).
 */
export function CryptoAddress({
	address,
	qrValue,
	arena,
	onCopy,
	renderQr,
}: {
	address: string;
	qrValue?: string;
	/** Asset logo for the QR center — only used when `renderQr` supports it. */
	arena?: string;
	onCopy?: (address: string) => void;
	renderQr?: (args: { value: string; arena?: string }) => ReactNode;
}) {
	const copy = () => {
		navigator.clipboard
			?.writeText(address)
			.then(() => onCopy?.(address))
			.catch(() => {});
	};
	const value = qrValue ?? address;
	return (
		<button
			type="button"
			onClick={copy}
			aria-label="Copy address"
			className="block w-full rounded-2xl p-2 transition-opacity active:opacity-80"
		>
			<div className="flex w-full items-center justify-evenly">
				{/* Square tile; QR is `currentColor` so it flips with the theme:
				    white tile + black code (light), black tile + white code (dark). */}
				<div className="grid aspect-square w-[clamp(112px,38vw,196px)] shrink-0 rounded-2xl bg-white p-2 text-black dark:bg-black dark:text-white [&_svg]:block [&_svg]:size-full">
					{renderQr ? (
						renderQr({ value, arena })
					) : (
						<QrCode value={value} className="size-full" />
					)}
				</div>
				<AddressColumn address={address} />
			</div>
		</button>
	);
}

/**
 * The address as a column of fixed-width chunks. EVM (`0x` + 40 hex) lays out 6
 * chars × 7 rows at the larger font; everything else (Solana base58, etc.) uses
 * a narrower 4-char grid at a smaller font. The leading anchor (6 for EVM, else
 * 4) and trailing 4 chars are bold; the middle is faded.
 */
function AddressColumn({ address }: { address: string }) {
	const isEvm = address.startsWith("0x");
	const chunkSize = isEvm ? 6 : 4;
	const hiStart = isEvm ? 6 : 4;
	const total = address.length;
	const hiEnd = total - 4;
	const chunks: string[] = [];
	for (let i = 0; i < total; i += chunkSize) {
		chunks.push(address.slice(i, i + chunkSize));
	}
	const fontClass = isEvm
		? "text-[clamp(15px,5vw,26px)] leading-[1.06]"
		: "text-[clamp(10px,3.4vw,18px)] leading-[1.1]";
	return (
		<div
			className={cn(
				"flex min-w-0 flex-col font-mono tracking-wide tabular-nums",
				fontClass,
			)}
		>
			{chunks.map((chunk, chunkIdx) => (
				<span key={chunkIdx}>
					{Array.from(chunk).map((ch, i) => {
						const globalIdx = chunkIdx * chunkSize + i;
						const highlighted = globalIdx < hiStart || globalIdx >= hiEnd;
						return (
							<span
								key={i}
								className={
									highlighted
										? "font-semibold text-foreground"
										: "font-medium text-foreground/25"
								}
							>
								{ch}
							</span>
						);
					})}
				</span>
			))}
		</div>
	);
}
