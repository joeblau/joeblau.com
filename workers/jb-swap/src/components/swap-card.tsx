import { ArrowUpDown, SlidersHorizontal } from "lucide-react";

import { FromBox } from "@/components/token-drawer";

/**
 * Visual scaffold for the swap interface. Static, non-functional —
 * placeholder values only, no wiring to wallets, quotes, or routing.
 */

const WALLET_ADDRESS = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

function shortenAddress(address: string) {
	return `${address.slice(0, 4)}•••${address.slice(-4)}`;
}

function TokenStack({ variant }: { variant: "eth" | "usdc" }) {
	return (
		<div className="relative h-[68px] w-9 shrink-0">
			<div className="absolute left-1/2 top-0 size-9 -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-400 to-blue-600 ring-2 ring-background" />
			<div className="absolute left-1/2 top-4 flex size-9 -translate-x-1/2 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white ring-2 ring-background">
				▲
			</div>
			<div
				className={`absolute left-1/2 top-8 flex size-9 -translate-x-1/2 items-center justify-center rounded-full text-sm font-semibold text-white ring-2 ring-background ${
					variant === "eth" ? "bg-[#131a2a]" : "bg-[#2775ca]"
				}`}
			>
				{variant === "eth" ? "◆" : "$"}
			</div>
		</div>
	);
}

function Pill({
	children,
	className = "",
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.07] px-3 py-1.5 text-sm text-muted-foreground ${className}`}
		>
			{children}
		</span>
	);
}

function TokenInfo({
	variant,
	name,
}: {
	variant: "eth" | "usdc";
	name: string;
}) {
	return (
		<div className="flex gap-3">
			<TokenStack variant={variant} />
			<div className="flex flex-col leading-none -space-y-0.5">
				<span className="text-sm text-muted-foreground">
					{shortenAddress(WALLET_ADDRESS)}
				</span>
				<span className="text-sm text-muted-foreground">Ethereum</span>
				<span className="text-xl font-semibold text-foreground">{name}</span>
			</div>
		</div>
	);
}

export function SwapCard() {
	return (
		<div className="w-full max-w-md">
			{/* You pay */}
			<section className="rounded-3xl bg-card px-5 pb-8 pt-5">
				<FromBox />
				<div className="-mx-5 mb-2 border-t-2 border-background" />
				<div className="flex flex-col items-center gap-3">
					<span className="text-6xl font-bold tracking-tight text-foreground">
						0.05
					</span>
					<Pill>
						<span className="opacity-50">=</span> $82.20
						<ArrowUpDown className="size-3.5" />
					</Pill>
				</div>
			</section>

			{/* Swap direction */}
			<div className="relative z-10 mx-auto -my-5 flex w-fit">
				<button
					type="button"
					className="flex size-14 items-center justify-center rounded-full bg-blue-500 text-white ring-4 ring-card transition-colors hover:bg-blue-600"
					aria-label="Swap direction"
				>
					<ArrowUpDown className="size-5" />
				</button>
			</div>

			{/* You receive */}
			<section className="rounded-3xl bg-card px-5 pb-5 pt-8">
				<div className="flex items-start justify-between">
					<TokenInfo variant="usdc" name="USD Coin" />
					<div className="flex flex-col items-end gap-2">
						<Pill>
							<SlidersHorizontal className="size-3.5" />
							Slippage 0.5%
						</Pill>
						<span className="text-sm text-muted-foreground">Fee $0.25</span>
					</div>
				</div>
				<div className="-mx-5 mt-5 mb-2 border-t-2 border-background" />
				<div className="flex flex-col items-center gap-3">
					<span className="text-6xl font-bold tracking-tight text-muted-foreground">
						81.9534
					</span>
					<Pill>
						<span className="opacity-50">=</span> $81.95
						<ArrowUpDown className="size-3.5" />
					</Pill>
				</div>
			</section>

			<button
				type="button"
				className="mt-4 h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.99]"
			>
				Send
			</button>
		</div>
	);
}
