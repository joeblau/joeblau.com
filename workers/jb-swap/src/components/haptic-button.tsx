"use client";

import type { ComponentProps } from "react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * A button that plays a native iOS haptic tick on tap, using the Project Fathom
 * technique (https://github.com/m1ckc3s/project-fathom): an invisible WebKit
 * `<input type="checkbox" switch>` is overlaid on the button. Tapping the switch
 * makes iOS (Safari 17.4+ / iOS 18+) play a system haptic, and its change
 * handler forwards the tap to the real button so existing behavior is kept.
 * On non-WebKit browsers the switch is an ordinary (invisible) checkbox and the
 * click-forwarding still works, so it's a no-op visually/behaviorally elsewhere.
 *
 * The switch is absolutely positioned over the whole button (inset-0), so a tap
 * anywhere on the button — including its padding and corners — triggers the
 * haptic, without changing layout. `wrapperClassName` controls the wrapper's
 * display/width (e.g. "grid w-full" for full-width buttons, "absolute inset-0"
 * to fill a positioned parent).
 */
export function HapticButton({
	className,
	children,
	wrapperClassName = "inline-grid",
	disabled,
	...props
}: ComponentProps<"button"> & { wrapperClassName?: string }) {
	const ref = useRef<HTMLButtonElement>(null);
	return (
		<span className={cn("relative", wrapperClassName)}>
			<button ref={ref} className={className} disabled={disabled} {...props}>
				{children}
			</button>
			<input
				type="checkbox"
				aria-hidden="true"
				tabIndex={-1}
				ref={(el) => el?.setAttribute("switch", "")}
				onChange={() => ref.current?.click()}
				className={cn(
					"absolute inset-0 m-0 size-full opacity-0 [-webkit-tap-highlight-color:transparent]",
					disabled ? "pointer-events-none" : "cursor-pointer",
				)}
				style={{ touchAction: "manipulation" }}
			/>
		</span>
	);
}
