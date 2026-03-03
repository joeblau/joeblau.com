"use client";

import { useEffect, useState } from "react";
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { MapPinIcon, Loader2Icon } from "lucide-react";

interface GeocodingResult {
	id: string;
	place_name: string;
	center: [number, number];
	place_type: string[];
	text: string;
}

interface MapboxGeocodingResponse {
	features: GeocodingResult[];
}

interface AddLocationProps {
	onLocationAdded?: () => void;
}

export default function AddLocation({ onLocationAdded }: AddLocationProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [results, setResults] = useState<GeocodingResult[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	useEffect(() => {
		if (!search || search.length < 3) {
			setResults([]);
			return;
		}

		const searchCities = async () => {
			setLoading(true);
			try {
				const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
				const response = await fetch(
					`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
						search
					)}.json?access_token=${mapboxToken}&types=place,locality,poi&limit=5`
				);
				const data = (await response.json()) as MapboxGeocodingResponse;
				setResults(data.features || []);
			} catch (error) {
				console.error("Failed to search locations:", error);
				setResults([]);
			} finally {
				setLoading(false);
			}
		};

		const debounce = setTimeout(searchCities, 300);
		return () => clearTimeout(debounce);
	}, [search]);

	const handleAddLocation = async (result: GeocodingResult) => {
		try {
			const [longitude, latitude] = result.center;
			const locationType = result.place_type.includes("poi")
				? "Place"
				: "City";

			const response = await fetch("/api/add-location", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: result.place_name,
					type: locationType,
					coordinates: [longitude, latitude],
					description: null,
				}),
			});

			if (response.ok) {
				setOpen(false);
				setSearch("");
				setResults([]);
				onLocationAdded?.();
			} else {
				console.error("Failed to add location");
			}
		} catch (error) {
			console.error("Failed to add location:", error);
		}
	};

	return (
		<CommandDialog open={open} onOpenChange={setOpen}>
			<CommandInput
				placeholder="Search for a city or place..."
				value={search}
				onValueChange={setSearch}
			/>
			<CommandList>
				{loading && (
					<div className="flex items-center justify-center py-6">
						<Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				)}
				{!loading && search.length >= 3 && results.length === 0 && (
					<CommandEmpty>No locations found.</CommandEmpty>
				)}
				{!loading && results.length > 0 && (
					<CommandGroup heading="Locations">
						{results.map((result) => (
							<CommandItem
								key={result.id}
								value={result.place_name}
								onSelect={() => handleAddLocation(result)}
							>
								<MapPinIcon className="mr-2 h-4 w-4" />
								<span>{result.place_name}</span>
							</CommandItem>
						))}
					</CommandGroup>
				)}
				{search.length < 3 && (
					<div className="py-6 text-center text-sm text-muted-foreground">
						Type at least 3 characters to search...
					</div>
				)}
			</CommandList>
		</CommandDialog>
	);
}
