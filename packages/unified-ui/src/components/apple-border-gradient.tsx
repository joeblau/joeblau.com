"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties } from "react";

import { cn } from "../lib/utils";

/**
 * Animated "Apple AI gradient" edge glow. A full-size rectangle painted with a
 * linear-gradient (blue → purple → red → orange) whose angle spins 0deg → 360deg
 * over 5s; the centre is transparent (the `.apple-edge-glow` mask feathers the
 * gradient inward), so it overlays the live card without covering it.
 *
 * Requires the `.apple-edge-glow` CSS from the package stylesheet — without it
 * the glow is a flat opaque rectangle. Fixed to the viewport (`inset-1`);
 * override `className` to scope it to a container.
 */
const COLORS = "#3b82f6, #a855f7, #ef4444, #f97316";

export function AppleBorderGradient({
	preview,
	intensity = "xl",
	className,
}: {
	preview: boolean;
	intensity?: "lg" | "xl" | "2xl" | "3xl";
	className?: string;
}) {
	// Band thickness: how far the gradient reaches inward before fading out.
	const feather = { lg: 22, xl: 32, "2xl": 48, "3xl": 72 }[intensity];

	return (
		<AnimatePresence>
			{preview && (
				<motion.div
					aria-hidden
					initial={{ opacity: 0 }}
					animate={{ opacity: 0.45 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.5, ease: "easeInOut" }}
					className={cn("pointer-events-none fixed inset-1 z-[100]", className)}
				>
					<motion.div
						className="apple-edge-glow absolute inset-0"
						style={{ "--feather": `${feather}px` } as CSSProperties}
						animate={{
							background: [
								`linear-gradient(0deg, ${COLORS})`,
								`linear-gradient(360deg, ${COLORS})`,
							],
						}}
						transition={{ duration: 5, ease: "linear", repeat: Infinity }}
					/>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
