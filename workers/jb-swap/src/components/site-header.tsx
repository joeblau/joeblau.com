"use client";

import { Wallet } from "lucide-react";

import { ThemeToggleButton } from "@/components/skiper26";

export function SiteHeader() {
	return (
		<header className="absolute inset-x-0 top-0 z-50 flex items-center justify-end gap-3 p-4 sm:p-6">
			<button
				type="button"
				className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
			>
				<Wallet className="size-4" />
				Connect Wallet
			</button>
			<ThemeToggleButton variant="circle" start="center" />
		</header>
	);
}
