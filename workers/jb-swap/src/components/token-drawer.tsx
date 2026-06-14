"use client";

import Avatar from "boring-avatars";
import { FlaskConical, Lock, Search, X } from "lucide-react";
import { useState } from "react";
import { Drawer } from "vaul";

import { cn } from "@/lib/utils";

/**
 * Stateful "From" token selector. Before a token is picked it shows a
 * "From..." placeholder; picking a token swaps it for a stacked icon
 * (Boring Avatar + chain + asset) alongside the address / chain / name,
 * plus Test/Max and holdings. Static data — no real search or balances.
 * Asset and chain icons come from Relay's icon CDN; the address avatar
 * is generated with boring-avatars.
 */

interface TokenRow {
	name: string;
	symbol: string;
	chain: string;
	chainId: number;
	logo: string;
	amount: string;
	usd: string;
}

const ADDRESS = "0x71•••976F";
const AVATAR_COLORS = ["#7dd3fc", "#3b82f6", "#2563eb", "#1e3a8a", "#0ea5e9"];

const LOGO = {
	sol: "https://coin-images.coingecko.com/coins/images/4128/large/solana.png",
	usdc: "https://coin-images.coingecko.com/coins/images/6319/large/usdc.png",
	wbtc: "https://coin-images.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png",
	eth: "https://assets.relay.link/icons/1/light.png",
	usdt: "https://coin-images.coingecko.com/coins/images/325/large/Tether.png",
	cbeth: "https://coin-images.coingecko.com/coins/images/27008/large/cbeth.png",
};

const chainIcon = (chainId: number) =>
	`https://assets.relay.link/icons/${chainId}/light.png`;

const TOKENS: TokenRow[] = [
	{ name: "Solana", symbol: "SOL", chain: "Solana", chainId: 792703809, logo: LOGO.sol, amount: "12.41", usd: "$1,767.18" },
	{ name: "USD Coin", symbol: "USDC", chain: "Ethereum", chainId: 1, logo: LOGO.usdc, amount: "1240.5", usd: "$1,240.50" },
	{ name: "Wrapped BTC", symbol: "WBTC", chain: "Ethereum", chainId: 1, logo: LOGO.wbtc, amount: "0.0154", usd: "$956.96" },
	{ name: "Ethereum", symbol: "ETH", chain: "Ethereum", chainId: 1, logo: LOGO.eth, amount: "0.4218", usd: "$693.44" },
	{ name: "Tether", symbol: "USDT", chain: "Ethereum", chainId: 1, logo: LOGO.usdt, amount: "540", usd: "$540.00" },
	{ name: "USD Coin", symbol: "USDC", chain: "Solana", chainId: 792703809, logo: LOGO.usdc, amount: "320.75", usd: "$320.75" },
	{ name: "Ethereum", symbol: "ETH", chain: "Base", chainId: 8453, logo: LOGO.eth, amount: "0.083", usd: "$136.45" },
	{ name: "Coinbase ETH", symbol: "cbETH", chain: "Base", chainId: 8453, logo: LOGO.cbeth, amount: "0.061", usd: "$104.43" },
];

const FILTERS: { label: string; chainId?: number; active?: boolean }[] = [
	{ label: "All", active: true },
	{ label: "Ethereum", chainId: 1 },
	{ label: "Solana", chainId: 792703809 },
	{ label: "Base", chainId: 8453 },
];

function tokenKey(t: TokenRow) {
	return `${t.name}-${t.chain}`;
}

function ChainBadge({ chainId, className }: { chainId: number; className?: string }) {
	// eslint-disable-next-line @next/next/no-img-element
	return (
		<img
			src={chainIcon(chainId)}
			alt=""
			className={cn("size-4 rounded-full bg-card object-cover ring-2 ring-card", className)}
		/>
	);
}

function TokenIcon({ token }: { token: TokenRow }) {
	return (
		<div className="relative size-11 shrink-0">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={token.logo}
				alt={token.name}
				className="size-11 rounded-full bg-foreground/[0.06] object-cover"
			/>
			<ChainBadge chainId={token.chainId} className="absolute -bottom-0.5 -right-0.5" />
		</div>
	);
}

function AssetStack({ token }: { token: TokenRow }) {
	return (
		<div className="relative h-[68px] w-9 shrink-0">
			<div className="absolute left-1/2 top-0 size-9 -translate-x-1/2 overflow-hidden rounded-full ring-2 ring-card">
				<Avatar size={36} name={ADDRESS} variant="marble" colors={AVATAR_COLORS} />
			</div>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={chainIcon(token.chainId)}
				alt={token.chain}
				className="absolute left-1/2 top-4 size-9 -translate-x-1/2 rounded-full bg-card object-cover ring-2 ring-card"
			/>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={token.logo}
				alt={token.name}
				className="absolute left-1/2 top-8 size-9 -translate-x-1/2 rounded-full bg-card object-cover ring-2 ring-card"
			/>
		</div>
	);
}

function Pill({ children }: { children: React.ReactNode }) {
	return (
		<span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.07] px-3 py-1.5 text-sm text-muted-foreground">
			{children}
		</span>
	);
}

function SelectedHeader({ token }: { token: TokenRow }) {
	return (
		<div className="flex items-start justify-between">
			<div className="flex items-center gap-3">
				<AssetStack token={token} />
				<div className="flex flex-col leading-none -space-y-0.5">
					<span className="text-sm text-muted-foreground">{ADDRESS}</span>
					<span className="text-sm text-muted-foreground">{token.chain}</span>
					<span className="text-xl font-semibold text-foreground">{token.name}</span>
				</div>
			</div>
			<div className="flex flex-col items-end gap-2">
				<div className="flex gap-2">
					<Pill>
						<FlaskConical className="size-3.5" />
						Test
					</Pill>
					<Pill>Max</Pill>
				</div>
				<span className="text-sm text-muted-foreground">
					{token.amount} {token.symbol}
				</span>
			</div>
		</div>
	);
}

export function FromBox() {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<TokenRow | null>(null);

	return (
		<Drawer.Root open={open} onOpenChange={setOpen}>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="-mx-5 -mt-5 block w-[calc(100%+2.5rem)] cursor-pointer rounded-t-3xl px-5 pb-5 pt-5 text-left transition-colors hover:bg-foreground/[0.03]"
			>
				{selected ? (
					<SelectedHeader token={selected} />
				) : (
					<span className="block text-5xl font-semibold text-muted-foreground">
						From...
					</span>
				)}
			</button>

			<Drawer.Portal>
				<Drawer.Overlay className="fixed inset-0 z-50 bg-black/60" />
				<Drawer.Content
					aria-describedby={undefined}
					className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[88vh] max-w-md flex-col rounded-t-3xl bg-card outline-none"
				>
					<div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-foreground/20" />

					<div className="flex flex-col gap-4 px-5 pt-4">
						<div className="flex items-center justify-between">
							<Drawer.Title className="text-2xl font-bold text-foreground">
								From
							</Drawer.Title>
							<Drawer.Close className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-foreground/10 text-muted-foreground transition-colors hover:bg-foreground/15">
								<X className="size-5" />
							</Drawer.Close>
						</div>

						<div className="flex items-center gap-3 rounded-2xl bg-foreground/[0.06] px-4 py-3.5">
							<div className="size-7 shrink-0 overflow-hidden rounded-full">
								<Avatar size={28} name={ADDRESS} variant="marble" colors={AVATAR_COLORS} />
							</div>
							<span className="flex-1 text-lg font-semibold text-foreground">
								0x71C7...976F
							</span>
							<Lock className="size-4 text-muted-foreground" />
						</div>

						<div className="flex items-center gap-3 rounded-2xl bg-foreground/[0.06] px-4 py-3">
							<Search className="size-5 shrink-0 text-muted-foreground" />
							<input
								type="text"
								placeholder="Search name or paste address"
								className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
							/>
						</div>

						<div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
							{FILTERS.map((f) => (
								<button
									key={f.label}
									type="button"
									className={cn(
										"flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
										f.active
											? "bg-foreground text-background"
											: "bg-foreground/[0.06] text-foreground hover:bg-foreground/10",
									)}
								>
									{f.chainId ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img
											src={chainIcon(f.chainId)}
											alt=""
											className="size-4 rounded-full object-cover"
										/>
									) : (
										<span className="size-4 rounded-full border-2 border-current" />
									)}
									{f.label}
								</button>
							))}
						</div>
					</div>

					<div className="mt-2 flex-1 overflow-y-auto px-5 pb-8">
						{TOKENS.map((t) => {
							const isSelected = selected !== null && tokenKey(selected) === tokenKey(t);
							return (
								<button
									key={tokenKey(t)}
									type="button"
									onClick={() => {
										setSelected(t);
										setOpen(false);
									}}
									className={cn(
										"flex w-full cursor-pointer items-center gap-3 rounded-xl py-3 text-left transition-colors hover:bg-foreground/[0.04]",
										isSelected && "opacity-50",
									)}
								>
									<TokenIcon token={t} />
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-foreground">{t.name}</p>
										<p className="text-sm text-muted-foreground">
											{t.chain}
											{isSelected ? " · selected" : ""}
										</p>
									</div>
									<div className="text-right">
										<p className="font-semibold text-foreground">{t.amount}</p>
										<p className="text-sm text-muted-foreground">{t.usd}</p>
									</div>
								</button>
							);
						})}
					</div>
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
