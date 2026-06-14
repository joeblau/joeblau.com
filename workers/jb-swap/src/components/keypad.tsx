"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Delete } from "lucide-react";
import { useEffect, useState } from "react";

import { HapticButton } from "@/components/haptic-button";

/**
 * Numeric keypad shown only in mobile-width viewports (below md). It animates
 * in when the viewport compresses to mobile and out when it widens. Keys emit
 * "0"-"9", ".", or "back" to the parent.
 */

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];

export function MobileKeypad({ onKey }: { onKey: (key: string) => void }) {
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
					<div className="grid grid-cols-3 pt-2">
						{KEYS.map((k) => (
							<HapticButton
								key={k}
								wrapperClassName="grid"
								type="button"
								onClick={() => onKey(k)}
								aria-label={k === "back" ? "Delete" : k}
								className="flex h-16 items-center justify-center rounded-2xl text-2xl font-semibold text-foreground transition-colors active:bg-foreground/10"
							>
								{k === "back" ? <Delete className="size-6" /> : k}
							</HapticButton>
						))}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
