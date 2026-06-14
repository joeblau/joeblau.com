"use client";

import qrcode from "qrcode-generator";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

/**
 * Renders a QR code as a crisp SVG path (no canvas, no external network, SSR-
 * safe). `value` is the encoded payload (an address or an EIP-681 URI — see
 * buildPaymentPayload). Colors default to `currentColor` on transparent so it
 * inherits the surrounding theme.
 */
export function QrCode({
	value,
	size = 200,
	margin = 2,
	background = "transparent",
	foreground = "currentColor",
	className,
}: {
	value: string;
	size?: number;
	margin?: number;
	background?: string;
	foreground?: string;
	className?: string;
}) {
	const { path, dimension } = useMemo(() => {
		const qr = qrcode(0, "M");
		qr.addData(value);
		qr.make();
		const count = qr.getModuleCount();
		const dim = count + margin * 2;
		let d = "";
		for (let row = 0; row < count; row++) {
			for (let col = 0; col < count; col++) {
				if (qr.isDark(row, col)) {
					d += `M${col + margin},${row + margin}h1v1h-1z`;
				}
			}
		}
		return { path: d, dimension: dim };
	}, [value, margin]);

	return (
		<svg
			viewBox={`0 0 ${dimension} ${dimension}`}
			width={size}
			height={size}
			role="img"
			aria-label="QR code"
			shapeRendering="crispEdges"
			className={cn("block", className)}
		>
			{background !== "transparent" && (
				<rect width={dimension} height={dimension} fill={background} />
			)}
			<path d={path} fill={foreground} />
		</svg>
	);
}
