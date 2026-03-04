"use client";

import { useEffect, useState, useMemo } from "react";
import tzlookup from "tz-lookup";
import { formatInTimeZone } from "date-fns-tz";

interface ClockProps {
	longitude: number;
	latitude: number;
}

export default function Clock({ longitude, latitude }: ClockProps) {
	const [time, setTime] = useState(new Date());
	const [showDebug, setShowDebug] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			setTime(new Date());
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	// Get the political timezone for these coordinates (memoized for performance)
	const timezoneId = useMemo(() => {
		try {
			return tzlookup(latitude, longitude) || "UTC";
		} catch (e) {
			console.error("Error looking up timezone:", e);
			return "UTC";
		}
	}, [latitude, longitude]);

	// Format time in the political timezone
	const localTimeStr = formatInTimeZone(time, timezoneId, "HH:mm:ss");
	const [hoursStr, minutesStr] = localTimeStr.split(":");
	const hours = parseInt(hoursStr, 10);
	const minutes = parseInt(minutesStr, 10);

	const hourAngle = ((hours % 12) + minutes / 60) * 30;
	const minuteAngle = minutes * 6;

	// Get UTC offset for display
	const offsetStr = formatInTimeZone(time, timezoneId, "XXX");

	return (
		<div className="absolute top-4 left-4 z-10">
			<div
				className="w-16 h-16 bg-card/80 backdrop-blur-sm rounded-full shadow-lg border border-border cursor-pointer"
				onClick={() => setShowDebug(!showDebug)}
				title="Click to toggle debug info"
			>
				<svg width="64" height="64" viewBox="0 0 64 64">
				<circle cx="32" cy="32" r="30" fill="none" className="stroke-border" strokeWidth="1" />

				<line
					x1="32"
					y1="32"
					x2="32"
					y2="18"
					className="stroke-foreground"
					strokeWidth="3"
					strokeLinecap="round"
					style={{
						transform: `rotate(${hourAngle}deg)`,
						transformOrigin: "32px 32px",
						transition: "transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)"
					}}
				/>

				<line
					x1="32"
					y1="32"
					x2="32"
					y2="12"
					className="stroke-foreground"
					strokeWidth="2"
					strokeLinecap="round"
					style={{
						transform: `rotate(${minuteAngle}deg)`,
						transformOrigin: "32px 32px",
						transition: "transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)"
					}}
				/>

				</svg>
			</div>

			{showDebug && (
				<div className="mt-2 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-border p-2 min-w-[200px]">
					<div className="text-[10px] font-mono space-y-1">
						<div className="text-foreground font-semibold">
							{localTimeStr} {offsetStr}
						</div>
						<div className="text-muted-foreground">
							Timezone: {timezoneId}
						</div>
						<div className="text-muted-foreground">
							Lat: {latitude.toFixed(4)}°
						</div>
						<div className="text-muted-foreground">
							Lng: {longitude.toFixed(4)}°
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
