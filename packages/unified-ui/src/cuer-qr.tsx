"use client";

import { Cuer } from "cuer";

/**
 * Optional center-logo QR backed by `cuer`, for use as CryptoAddress's
 * `renderQr` slot:
 *
 *   import { cuerQr } from "@joeblau/unified-ui/cuer";
 *   <CryptoAddress address={addr} arena={logo} renderQr={cuerQr} />
 *
 * Kept in a separate entry so the core package does not depend on `cuer`
 * (declared an OPTIONAL peer). Note: in some setups cuer's center-logo rendering
 * benefits from the upstream `cuer@0.0.3` patch; without it the QR still scans.
 */
export function cuerQr({ value, arena }: { value: string; arena?: string }) {
	return (
		<Cuer
			value={value}
			size={196}
			color="currentColor"
			arena={arena}
			errorCorrection={arena ? "high" : undefined}
		/>
	);
}
