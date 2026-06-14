"use client";

import { Wallet } from "lucide-react";

import { HapticButton } from "@/components/haptic-button";
import { cn } from "@/lib/utils";

/**
 * Split control shown before a wallet is connected: "Connect Wallet" on the
 * left and a "Generate Address" toggle on the right. Shared between the bottom
 * of the swap card and the top of the From token drawer so the two stay in
 * sync.
 */
export function ConnectWalletControl({
	onConnect,
	genAddress,
	onToggleGenAddress,
	className,
}: {
	onConnect: () => void;
	genAddress: boolean;
	onToggleGenAddress: () => void;
	className?: string;
}) {
	return (
		<div className={cn("flex h-12 w-full items-stretch gap-0.5", className)}>
			<HapticButton
				type="button"
				onClick={onConnect}
				wrapperClassName="grid flex-1"
				className="flex size-full items-center justify-center gap-2 rounded-l-full rounded-r-md bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.99]"
			>
				<Wallet className="size-4" />
				Connect Wallet
			</HapticButton>
			<HapticButton
				type="button"
				role="switch"
				aria-checked={genAddress}
				onClick={onToggleGenAddress}
				wrapperClassName="grid"
				className="flex items-center gap-2.5 rounded-l-md rounded-r-full bg-foreground/[0.08] px-4 text-sm font-medium text-foreground transition-colors hover:bg-foreground/[0.12]"
			>
				Generate Address
				<span
					className={cn(
						"relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
						genAddress ? "bg-primary" : "bg-foreground/25",
					)}
				>
					<span
						className={cn(
							"inline-block size-4 rounded-full bg-background shadow transition-transform",
							genAddress ? "translate-x-[18px]" : "translate-x-0.5",
						)}
					/>
				</span>
			</HapticButton>
		</div>
	);
}
