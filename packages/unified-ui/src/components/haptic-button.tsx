"use client";

import type { ComponentProps } from "react";
import { useEffect, useId, useRef, useState } from "react";

import { shouldUseHapticOverlay } from "../lib/platform";
import { cn } from "../lib/utils";

/**
 * A button that plays a native iOS haptic tick on tap, using the Project Fathom
 * technique (https://github.com/m1ckc3s/project-fathom).
 *
 * On iOS WebKit it appends an invisible `<label>` (filling the button) linked to
 * a native `<input switch>` via `htmlFor`/`id`. A `<label>` is an ordinary
 * gesture target, so finger scrolling and Vaul drawer dragging pass straight
 * through it — only a *completed tap* toggles the switch, which fires the WebKit
 * system haptic and forwards a click to the real button; a swipe never toggles
 * it, so it neither buzzes nor blocks the scroll.
 *
 * The overlay renders only on iOS WebKit, so on desktop/Android the button is a
 * plain button with no overlay (hover and clicks behave natively).
 *
 * The two-element span(wrapperClassName) + button(className) structure is
 * load-bearing for layout: `wrapperClassName` controls flex/grid participation
 * (e.g. "grid flex-1", "block w-full", "pointer-events-auto inline-grid"); the
 * inner button carries no baked spacing/radius. Requires the `.haptic-*` CSS
 * from the package stylesheet.
 */
export function HapticButton({
	className,
	children,
	wrapperClassName = "inline-grid",
	disabled,
	...props
}: ComponentProps<"button"> & { wrapperClassName?: string }) {
	const ref = useRef<HTMLButtonElement>(null);
	const switchId = useId();
	// Resolve out of render so SSR and the first client paint agree; flips true
	// one tick after mount on iOS.
	const [overlay, setOverlay] = useState(false);
	useEffect(() => setOverlay(shouldUseHapticOverlay()), []);

	return (
		<span className={cn("relative", wrapperClassName)}>
			<button ref={ref} className={className} disabled={disabled} {...props}>
				{children}
			</button>
			{overlay && !disabled && (
				<span aria-hidden="true" className="haptic-clip">
					<input
						className="haptic-switch"
						id={switchId}
						type="checkbox"
						tabIndex={-1}
						aria-hidden="true"
						// `switch` isn't a valid JSX/TS attr; set it imperatively.
						ref={(el) => el?.setAttribute("switch", "")}
						onChange={() => ref.current?.click()}
					/>
					<label
						className="haptic-label"
						htmlFor={switchId}
						aria-hidden="true"
						onClick={(e) => e.stopPropagation()}
					/>
				</span>
			)}
		</span>
	);
}
