"use client";

import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * Recreation of Skiper UI's "Apple AI Gradient" (skiper86, AppleBorderGradient).
 *
 * The original is a full-size rectangle painted with an animated
 * `linear-gradient` (blue → purple → red → orange) whose angle spins
 * 0deg → 360deg over 5s; a blurred inset fill covers the centre so only a soft
 * glow bleeds out around the edge. We keep the exact colours and rotation, but
 * because this overlays the live swap card we leave the centre TRANSPARENT —
 * the gradient feathers inward to nothing via an eased edge mask instead of
 * being covered by an opaque fill. The overlay is inset (`inset-1`) so a thin
 * black margin frames the rounded glow; the band is thin (`--feather`) with a
 * smooth ease-out falloff, and the whole thing is kept subtle (low opacity).
 *
 * NOTE: the original is a paid Skiper UI Pro component; this is an independent
 * recreation of the same effect.
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
