"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

interface ElevationProps {
	zoom: number;
}

export default function Elevation({ zoom }: ElevationProps) {
	const [useImperial, setUseImperial] = useState(false);

	useEffect(() => {
		// Detect user's locale and determine unit system
		const locale = navigator.language || "en-US";
		// Countries that primarily use imperial system
		const imperialCountries = ["US", "LR", "MM"];
		const country = locale.split("-")[1] || locale.split("-")[0].toUpperCase();
		setUseImperial(imperialCountries.includes(country));
	}, []);

	// Convert zoom level to approximate altitude in meters
	// Using the formula: altitude ≈ 591,657,550 / (2^zoom)
	const altitudeMeters = 591657550 / Math.pow(2, zoom);

	// Convert to kilometers or miles
	const altitudeKm = altitudeMeters / 1000;
	const altitudeMiles = altitudeKm * 0.621371;

	const value = useImperial ? altitudeMiles : altitudeKm;
	const unit = useImperial ? "mi" : "km";

	return (
		<div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border border-border px-3 py-2 z-10">
			<div className="flex items-baseline gap-1">
				<NumberFlow
					value={value}
					format={{
						minimumFractionDigits: 0,
						maximumFractionDigits: value >= 1000 ? 0 : 1,
					}}
					className="text-foreground font-mono text-lg font-semibold"
				/>
				<span className="text-muted-foreground text-xs font-medium">{unit}</span>
			</div>
			<div className="text-muted-foreground text-[10px] uppercase tracking-wide mt-0.5">
				Elevation
			</div>
		</div>
	);
}
