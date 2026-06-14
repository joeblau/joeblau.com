"use client";

import { QrCode } from "@/components/qr-code";
import { buildPaymentPayload, type PaymentRequest } from "@/lib/eip681";
import { cn } from "@/lib/utils";

/**
 * A scannable receive QR for an address. Encodes an EIP-681 payment URI for EVM
 * addresses (so a scanning wallet pre-fills the transfer) or the bare address
 * for non-EVM chains. Rendered on a white tile so any wallet camera reads it.
 */
export function ReceiveQr({
	request,
	size = 208,
	className,
}: {
	request: PaymentRequest;
	size?: number;
	className?: string;
}) {
	const payload = buildPaymentPayload(request);
	return (
		<div className={cn("flex flex-col items-center gap-3", className)}>
			<div className="rounded-2xl bg-white p-3 shadow-sm">
				<QrCode value={payload} size={size} foreground="#000000" background="#ffffff" />
			</div>
			<code className="max-w-[16rem] break-all text-center text-xs text-muted-foreground">
				{request.address}
			</code>
		</div>
	);
}
