"use client";

import { X } from "lucide-react";
import { Drawer } from "vaul";

import { useTranslations } from "@/i18n/locale-provider";
import { cn } from "@/lib/utils";

/**
 * Controlled slippage picker drawer. Styled like the token drawer (bg-card
 * content, drag handle, Drawer.Title, Drawer.Close X). Exposes preset chips
 * (0.1% / 0.5% / 1.0%) plus a custom "%" input. All values flow in/out as a
 * FRACTION (0.5% = 0.005); the UI converts to/from percent for display.
 */

const PRESETS = [0.001, 0.005, 0.01]; // 0.1% / 0.5% / 1.0% as fractions

/** Format a fraction as a percent string with trailing zeros trimmed. */
function formatPct(fraction: number) {
	return `${Number((fraction * 100).toFixed(4))}%`;
}

export function SlippageDrawer({
	open,
	onOpenChange,
	value,
	onChange,
}: {
	open: boolean;
	onOpenChange: (o: boolean) => void;
	value: number;
	onChange: (v: number) => void;
}) {
	const t = useTranslations();

	const handleCustom = (raw: string) => {
		const pct = Number.parseFloat(raw);
		if (Number.isFinite(pct) && pct >= 0) onChange(pct / 100);
	};

	return (
		<Drawer.Root open={open} onOpenChange={onOpenChange}>
			<Drawer.Portal>
				<Drawer.Overlay className="fixed inset-0 z-50 bg-black/60" />
				<Drawer.Content
					aria-describedby={undefined}
					className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md flex-col rounded-t-3xl bg-card outline-none"
				>
					<div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-foreground/20" />

					<div className="flex flex-col gap-5 px-3 pb-8 pt-4">
						<div className="flex items-center justify-between">
							<Drawer.Title className="text-2xl font-bold text-foreground">
								{t("slippage.title")}
							</Drawer.Title>
							<Drawer.Close className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-foreground/10 text-muted-foreground transition-colors hover:bg-foreground/15">
								<X className="size-5" />
							</Drawer.Close>
						</div>

						<div className="flex gap-2">
							{PRESETS.map((preset) => {
								const active = Math.abs(value - preset) < 1e-9;
								return (
									<button
										key={preset}
										type="button"
										onClick={() => onChange(preset)}
										className={cn(
											"flex flex-1 cursor-pointer items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
											active
												? "bg-foreground text-background"
												: "bg-foreground/[0.06] text-foreground hover:bg-foreground/10",
										)}
									>
										{formatPct(preset)}
									</button>
								);
							})}
						</div>

						<div className="flex items-center gap-3 rounded-2xl bg-foreground/[0.06] px-4 py-3.5">
							<input
								type="number"
								inputMode="decimal"
								min={0}
								step="0.1"
								value={Number((value * 100).toFixed(4))}
								onChange={(e) => handleCustom(e.target.value)}
								placeholder={t("slippage.customPlaceholder")}
								className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
							/>
							<span className="shrink-0 text-base font-semibold text-muted-foreground">
								%
							</span>
						</div>
					</div>
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
