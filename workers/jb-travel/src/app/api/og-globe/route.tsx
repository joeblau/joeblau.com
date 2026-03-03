import { NextRequest } from "next/server";

/**
 * Dynamic OG Image Generator with Real Mapbox Globe
 *
 * Uses Mapbox Static Images API to generate a real globe image
 * centered on the viewer's location with GeoJSON location dots.
 *
 * Location detection (in order of priority):
 * 1. Query parameters: ?lat=37.7749&lon=-122.4194
 * 2. Cloudflare headers: cf-iplatitude, cf-iplongitude
 * 3. Default: San Francisco, US (37.7749, -122.4194)
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		// Get location from query params or Cloudflare headers
		const latitude =
			searchParams.get("lat") ||
			request.headers.get("cf-iplatitude") ||
			"37.7749";
		const longitude =
			searchParams.get("lon") ||
			request.headers.get("cf-iplongitude") ||
			"-122.4194";

		const lat = parseFloat(latitude.toString());
		const lon = parseFloat(longitude.toString());

		// Get Mapbox token from environment
		const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
		if (!mapboxToken) {
			throw new Error("NEXT_PUBLIC_MAPBOX_TOKEN is not set");
		}

		// Fetch GeoJSON locations
		const baseUrl = new URL(request.url).origin;
		const geojsonResponse = await fetch(`${baseUrl}/conquer-earth-locations.geojson`);
		if (!geojsonResponse.ok) {
			throw new Error("Failed to fetch GeoJSON");
		}
		const geojson = (await geojsonResponse.json()) as any;

		// Helper function to create simple SVG circle marker with glow
		const createCircleSVG = (color: string, size: number) => {
			// Simplified glow effect to reduce SVG size
			const glowSize = size * 3;
			const centerPoint = glowSize / 2;
			const radius = size / 2;

			const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${glowSize}" height="${glowSize}"><circle cx="${centerPoint}" cy="${centerPoint}" r="${radius * 2.5}" fill="${color}" opacity="0.2"/><circle cx="${centerPoint}" cy="${centerPoint}" r="${radius * 1.5}" fill="${color}" opacity="0.5"/><circle cx="${centerPoint}" cy="${centerPoint}" r="${radius}" fill="${color}"/></svg>`;
			return Buffer.from(svg).toString("base64");
		};

		// Build marker overlays - limit to 30 points to keep URL manageable
		const overlays: string[] = [];

		// Add location points from GeoJSON first (so user location is on top)
		if (geojson.features && Array.isArray(geojson.features)) {
			const limitedFeatures = geojson.features.slice(0, 30);
			limitedFeatures.forEach((feature: any) => {
				if (feature.geometry?.type === "Point" && feature.geometry?.coordinates) {
					const [lng, lt] = feature.geometry.coordinates;
					const type = feature.properties?.type || "Place";

					// Map type to color
					let color = "%23ff479c"; // default pink (URL encoded)
					if (type === "City") color = "%2300c8ff"; // cyan
					else if (type === "Airport") color = "%23c800ff"; // purple
					else if (type === "Park") color = "%2300ff64"; // green
					else if (type === "Place") color = "%23ffff00"; // yellow

					// Small 6px dots for locations with glow
					const circleSVG = createCircleSVG(decodeURIComponent(color), 6);
					overlays.push(`url-data:image/svg+xml;base64,${circleSVG}(${lng},${lt})`);
				}
			});
		}

		// Add user location marker (larger, on top)
		const userCircleSVG = createCircleSVG("#00c8ff", 10);
		overlays.push(`url-data:image/svg+xml;base64,${userCircleSVG}(${lon},${lat})`);

		// Build Mapbox Static Images API URL with overlays
		const overlayString = overlays.join(",");
		const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${overlayString}/${lon},${lat},1.5,0/1200x630@2x?logo=false&attribution=false&access_token=${mapboxToken}`;

		console.log("Fetching Mapbox with URL length:", mapboxUrl.length);

		const mapImageResponse = await fetch(mapboxUrl);
		if (!mapImageResponse.ok) {
			const errorText = await mapImageResponse.text();
			console.error("Mapbox API error:", mapImageResponse.status, errorText);
			throw new Error(`Mapbox API error: ${mapImageResponse.status}`);
		}

		const mapImageBuffer = await mapImageResponse.arrayBuffer();

		// Return the image directly from Mapbox
		return new Response(mapImageBuffer, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "public, max-age=3600, s-maxage=3600",
			},
		});
	} catch (error) {
		console.error("Error generating OG image:", error);

		// Fallback to simple error response
		return new Response(
			JSON.stringify({
				error: "Failed to generate image",
				message: error instanceof Error ? error.message : "Unknown error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
