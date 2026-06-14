import { ArrowUpDown } from "lucide-react";

import { TokenBox } from "@/components/token-drawer";

function Pill({ children }: { children: React.ReactNode }) {
	return (
		<span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.07] px-3 py-1.5 text-sm text-muted-foreground">
			{children}
		</span>
	);
}

export function SwapCard() {
	return (
		<div className="w-full max-w-md">
			{/* You pay */}
			<section className="rounded-3xl bg-card px-5 pb-8 pt-5">
				<TokenBox
					variant="from"
					triggerClassName="-mx-5 -mt-5 w-[calc(100%+2.5rem)] rounded-t-3xl px-5 pb-5 pt-5 hover:bg-foreground/[0.03]"
				/>
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
			<div className="relative z-10 mx-auto -my-4 flex w-fit">
				<button
					type="button"
					className="flex size-12 items-center justify-center rounded-full bg-blue-500 text-white ring-4 ring-card transition-colors hover:bg-blue-600"
					aria-label="Swap direction"
				>
					<ArrowUpDown className="size-5" />
				</button>
			</div>

			{/* You receive */}
			<section className="rounded-3xl bg-card px-5 pb-5 pt-8">
				<TokenBox
					variant="to"
					triggerClassName="-mx-5 -mt-8 w-[calc(100%+2.5rem)] rounded-t-3xl px-5 pb-5 pt-8 hover:bg-foreground/[0.03]"
				/>
				<div className="-mx-5 mb-2 border-t-2 border-background" />
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
