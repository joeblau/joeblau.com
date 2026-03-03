"use client";

import NumberFlow from "@number-flow/react";

interface CoordinatesProps {
	latitude: number;
	longitude: number;
}

export default function Coordinates({ latitude, longitude }: CoordinatesProps) {
	// Format latitude with N/S
	const latDirection = latitude >= 0 ? "N" : "S";
	const latValue = Math.abs(latitude);

	// Format longitude with E/W
	const lonDirection = longitude >= 0 ? "E" : "W";
	const lonValue = Math.abs(longitude);

	return (
		<div className="absolute bottom-4 right-4 bg-card/80 backdrop-blur-sm rounded-lg shadow-lg border border-border px-3 py-2 z-10">
			<div className="flex flex-col gap-1">
				{/* Latitude */}
				<div className="flex items-baseline gap-1">
					<span className="text-muted-foreground text-[10px] uppercase tracking-wide w-8">
						Lat
					</span>
					<NumberFlow
						value={latValue}
						format={{
							minimumFractionDigits: 4,
							maximumFractionDigits: 4,
						}}
						className="text-foreground font-mono text-sm font-semibold"
					/>
					<span className="text-muted-foreground text-xs font-medium w-3">
						{latDirection}
					</span>
				</div>

				{/* Longitude */}
				<div className="flex items-baseline gap-1">
					<span className="text-muted-foreground text-[10px] uppercase tracking-wide w-8">
						Lng
					</span>
					<NumberFlow
						value={lonValue}
						format={{
							minimumFractionDigits: 4,
							maximumFractionDigits: 4,
						}}
						className="text-foreground font-mono text-sm font-semibold"
					/>
					<span className="text-muted-foreground text-xs font-medium w-3">
						{lonDirection}
					</span>
				</div>
			</div>
		</div>
	);
}
