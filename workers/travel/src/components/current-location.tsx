"use client";

import { LocateIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";

interface CurrentLocationProps {
	onLocationFound: (lng: number, lat: number, shouldFly?: boolean) => void;
}

export default function CurrentLocation({ onLocationFound }: CurrentLocationProps) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleGetLocation = () => {
		if (!navigator.geolocation) {
			setError("Geolocation is not supported by your browser");
			return;
		}

		setLoading(true);
		setError(null);

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				onLocationFound(longitude, latitude, true);
				setLoading(false);
			},
			(err) => {
				setError(err.message || "Failed to get location");
				setLoading(false);
			},
			{
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 0,
			}
		);
	};

	return (
		<div className="absolute top-4 right-4 z-10">
			<button
				onClick={handleGetLocation}
				disabled={loading}
				className="flex items-center justify-center w-12 h-12 bg-card/80 backdrop-blur-sm rounded-full shadow-lg border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				title={error || "Get current location"}
			>
				{loading ? (
					<Loader2Icon className="w-5 h-5 text-foreground animate-spin" />
				) : (
					<LocateIcon className={`w-5 h-5 ${error ? "text-destructive" : "text-foreground"}`} />
				)}
			</button>
		</div>
	);
}
