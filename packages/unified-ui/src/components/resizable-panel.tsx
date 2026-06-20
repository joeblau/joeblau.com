"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

import { cn } from "../lib/utils";

/**
 * Family-wallet-style resizable container. The outer box springs its height to
 * whatever the active view measures, while views cross-fade and slide in the
 * push/pop direction — so navigating between sheet views morphs the sheet
 * instead of snapping. `activeKey` identifies the current view; `direction` is
 * +1 for a forward push (slide in from the right) and -1 for a back pop.
 */

const SPRING = { type: "spring", stiffness: 350, damping: 34 } as const;

const slide = {
	enter: (dir: number) => ({ x: dir >= 0 ? 28 : -28, opacity: 0 }),
	center: { x: 0, opacity: 1 },
	exit: (dir: number) => ({ x: dir >= 0 ? -28 : 28, opacity: 0 }),
};

export function ResizablePanel({
	activeKey,
	direction,
	children,
	className,
}: {
	activeKey: string;
	direction: number;
	children: ReactNode;
	className?: string;
}) {
	const measureRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState<number | null>(null);

	// Track the measured height of the in-flow view. popLayout pulls the exiting
	// view out of flow, so this reflects the incoming view immediately and the
	// wrapper can spring to it.
	useLayoutEffect(() => {
		const el = measureRef.current;
		if (!el) return;
		const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
		observer.observe(el);
		setHeight(el.offsetHeight);
		return () => observer.disconnect();
	}, []);

	return (
		<motion.div
			initial={false}
			animate={{ height: height ?? "auto" }}
			transition={SPRING}
			className={cn("relative overflow-hidden", className)}
		>
			<div ref={measureRef}>
				<AnimatePresence mode="popLayout" initial={false} custom={direction}>
					<motion.div
						key={activeKey}
						custom={direction}
						variants={slide}
						initial="enter"
						animate="center"
						exit="exit"
						transition={SPRING}
						className="w-full"
					>
						{children}
					</motion.div>
				</AnimatePresence>
			</div>
		</motion.div>
	);
}
