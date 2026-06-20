"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Delete } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "../lib/utils";
import { HapticButton } from "./haptic-button";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];

/**
 * The bare numeric keypad grid. Keys emit "0"-"9", ".", or "back" to the parent.
 * Always rendered — use where the keypad should be permanently visible.
 */
export function Keypad({
	onKey,
	className,
	deleteAriaLabel = "Delete",
}: {
	onKey: (key: string) => void;
	className?: string;
	deleteAriaLabel?: string;
}) {
	return (
		<div className={cn("grid grid-cols-3", className)}>
			{KEYS.map((k) => (
				<HapticButton
					key={k}
					wrapperClassName="grid"
					type="button"
					onClick={() => onKey(k)}
					aria-label={k === "back" ? deleteAriaLabel : k}
					className="flex h-14 items-center justify-center rounded-2xl text-2xl font-semibold text-foreground transition-colors active:bg-foreground/10"
				>
					{k === "back" ? <Delete className="size-6" /> : k}
				</HapticButton>
			))}
		</div>
	);
}

/**
 * The keypad, shown only in mobile-width viewports (≤767px). It animates in when
 * the viewport compresses to mobile and out when it widens. On desktop it
 * unmounts so the row below sits directly under the card.
 */
export function MobileKeypad({
	onKey,
	deleteAriaLabel,
}: {
	onKey: (key: string) => void;
	deleteAriaLabel?: string;
}) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const mq = window.matchMedia("(max-width: 767px)");
		const update = () => setIsMobile(mq.matches);
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, []);

	return (
		<AnimatePresence initial={false}>
			{isMobile && (
				<motion.div
					initial={{ opacity: 0, height: 0, y: 16 }}
					animate={{ opacity: 1, height: "auto", y: 0 }}
					exit={{ opacity: 0, height: 0, y: 16 }}
					transition={{ duration: 0.12, ease: "easeOut" }}
					className="overflow-hidden"
				>
					<Keypad onKey={onKey} className="pt-2" deleteAriaLabel={deleteAriaLabel} />
				</motion.div>
			)}
		</AnimatePresence>
	);
}
