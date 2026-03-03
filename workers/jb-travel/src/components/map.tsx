"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import SunCalc from "suncalc";
import Clock from "./clock";
import AddLocation from "./add-location";
import Elevation from "./elevation";
import Coordinates from "./coordinates";
import CurrentLocation from "./current-location";
import { ThemeToggleButton } from "./theme-toggle-button";

export default function Map() {
	const { theme, systemTheme } = useTheme();
	const mapContainer = useRef<HTMLDivElement>(null);
	const map = useRef<mapboxgl.Map | null>(null);
	const userLocationMarker = useRef<mapboxgl.Marker | null>(null);
	const [centerLng, setCenterLng] = useState(0);
	const [centerLat, setCenterLat] = useState(20);
	const [zoom, setZoom] = useState(2);
	const [mounted, setMounted] = useState(false);

	// Get the current theme, defaulting to dark
	const currentTheme = theme === "system" ? systemTheme : theme;
	const mapStyle = currentTheme === "light"
		? "mapbox://styles/mapbox/light-v11"
		: "mapbox://styles/mapbox/dark-v11";

	// Handle hydration
	useEffect(() => {
		setMounted(true);
	}, []);

	const getNightPolygon = useCallback((date = new Date()): GeoJSON.Feature<GeoJSON.Polygon> => {
		const points: [number, number][] = [];

		// Calculate the terminator line with higher resolution
		for (let lng = -180; lng <= 180; lng += 2) {
			let lat = 0;
			// Binary search to find latitude where sun altitude is at horizon
			let minLat = -90;
			let maxLat = 90;

			// Increased iterations for better precision
			for (let i = 0; i < 15; i++) {
				lat = (minLat + maxLat) / 2;
				const sunPos = SunCalc.getPosition(date, lat, lng);
				const sunAltitude = (sunPos.altitude * 180) / Math.PI;

				// Use -0.833 degrees to account for atmospheric refraction
				if (sunAltitude > -0.833) {
					maxLat = lat;
				} else {
					minLat = lat;
				}
			}

			points.push([lng, lat]);
		}

		// Determine which direction to build polygon
		// Check sun position at a point north of the terminator to see which side is dark (flipped)
		const firstPoint = points[0];
		const testLat = firstPoint[1] + 10; // 10 degrees toward north (flipped from south)
		const testSunPos = SunCalc.getPosition(date, testLat, firstPoint[0]);
		const testAltitude = (testSunPos.altitude * 180) / Math.PI;

		// Create polygon covering the dark side
		const darkCoordinates: [number, number][] = [];

		if (testAltitude > -0.833) {
			// North of terminator is light, so south is dark - build polygon covering southern area (flipped)
			darkCoordinates.push([-180, -90]);
			darkCoordinates.push([180, -90]);
			for (let i = points.length - 1; i >= 0; i--) {
				darkCoordinates.push(points[i]);
			}
			darkCoordinates.push([-180, points[0][1]]);
		} else {
			// North of terminator is dark - build polygon covering northern area (flipped)
			darkCoordinates.push([-180, 90]);
			darkCoordinates.push([180, 90]);
			for (let i = points.length - 1; i >= 0; i--) {
				darkCoordinates.push(points[i]);
			}
			darkCoordinates.push([-180, points[0][1]]);
		}

		return {
			type: "Feature",
			properties: {},
			geometry: {
				type: "Polygon",
				coordinates: [darkCoordinates]
			}
		};
	}, []);

	const loadLocations = useCallback(async () => {
		if (!map.current) return;

		try {
			const response = await fetch("/conquer-earth-locations.geojson");
			const locationsData = await response.json();

			const source = map.current.getSource("locations") as mapboxgl.GeoJSONSource;
			if (source) {
				source.setData(locationsData as GeoJSON.FeatureCollection);
			}
		} catch (error) {
			console.error("Failed to reload locations data:", error);
		}
	}, []);

	const handleUserLocation = useCallback((lng: number, lat: number, shouldZoom = true) => {
		if (!map.current) return;

		console.log("Setting user location marker at:", { lng, lat });

		// Remove existing marker if any
		if (userLocationMarker.current) {
			userLocationMarker.current.remove();
		}

		// Add marker at user's location using default Mapbox marker
		userLocationMarker.current = new mapboxgl.Marker()
			.setLngLat([lng, lat])
			.addTo(map.current);

		// Pan to user's location
		const currentZoom = map.current.getZoom();
		map.current.flyTo({
			center: [lng, lat],
			zoom: shouldZoom ? 10 : currentZoom,
			duration: 2000,
			essential: true,
		});
	}, []);

	useEffect(() => {
		console.log("Map useEffect running");
		console.log("map.current:", map.current);

		if (map.current || !mounted) return;

		// Access env var - Next.js inlines this at build time
		const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

		console.log("Mapbox token:", mapboxToken ? "Found" : "Not found");
		console.log("All env vars:", Object.keys(process.env));

		if (!mapboxToken) {
			console.error("Mapbox token is not set. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file");
			console.error("Build-time env:", process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
			return;
		}

		mapboxgl.accessToken = mapboxToken;
		console.log("Mapbox accessToken set successfully");

		if (mapContainer.current) {
			map.current = new mapboxgl.Map({
				container: mapContainer.current,
				style: mapStyle,
				center: [0, 20],
				zoom: 2,
				projection: { name: "globe" },
				attributionControl: false,
			});

			map.current.on("style.load", async () => {
				if (map.current) {
					try {
						// Fetch GeoJSON data
						const response = await fetch("/conquer-earth-locations.geojson");
						const locationsData = await response.json();

						// Add GeoJSON source
						map.current.addSource("locations", {
							type: "geojson",
							data: locationsData as GeoJSON.FeatureCollection,
						});

						// Add circle layer for location points with wide color gamut
						map.current.addLayer({
							id: "locations-circle",
							type: "circle",
							source: "locations",
							paint: {
								"circle-radius": [
									"interpolate",
									["linear"],
									["zoom"],
									2, 3,
									10, 8
								],
								"circle-color": [
									"match",
									["get", "type"],
									"City", "rgb(0, 200, 255)",
									"Airport", "rgb(200, 0, 255)",
									"Park", "rgb(0, 255, 100)",
									"Place", "rgb(255, 255, 0)",
									"rgb(255, 50, 180)"
								],
								"circle-opacity": 1.0,
								"circle-stroke-width": 0,
							},
						});

						// Create popup
						const popup = new mapboxgl.Popup({
							closeButton: false,
							closeOnClick: false,
						});

						// Show popup on hover
						map.current.on("mouseenter", "locations-circle", (e) => {
							if (!map.current || !e.features || !e.features[0]) return;

							map.current.getCanvas().style.cursor = "pointer";

							const feature = e.features[0];
							const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
							const { title, type, description } = feature.properties || {};

							// Ensure popup appears over the correct location
							while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
								coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
							}

							const descriptionText = description ? `<p class="popup-description">${description}</p>` : "";

							popup
								.setLngLat(coordinates)
								.setHTML(
									`<div class="popup-container">
										<h3 class="popup-title">${title}</h3>
										<p class="popup-type">${type}</p>
										${descriptionText}
									</div>`
								)
								.addTo(map.current);
						});

						// Hide popup on mouse leave
						map.current.on("mouseleave", "locations-circle", () => {
							if (!map.current) return;
							map.current.getCanvas().style.cursor = "";
							popup.remove();
						});
					} catch (error) {
						console.error("Failed to load locations data:", error);
					}

					// Add day/night layer
					if (map.current) {
						const nightPolygon = getNightPolygon();

						map.current.addSource("night", {
							type: "geojson",
							data: {
								type: "FeatureCollection",
								features: [nightPolygon]
							}
						});

						map.current.addLayer({
							id: "night",
							type: "fill",
							source: "night",
							paint: {
								"fill-color": "#000000",
								"fill-opacity": 0.3
							}
						}, "locations-circle");
					}

					// Update center coordinates on initial load
					if (map.current) {
						const center = map.current.getCenter();
						setCenterLng(center.lng);
						setCenterLat(center.lat);
						setZoom(map.current.getZoom());
					}

					// Automatically get user's location after map is loaded
					if (navigator.geolocation) {
						navigator.geolocation.getCurrentPosition(
							(position) => {
								const { latitude, longitude } = position.coords;
								console.log("Got geolocation:", { latitude, longitude });
								handleUserLocation(longitude, latitude, false);
							},
							(error) => {
								console.log("Geolocation not available or denied:", error.message);
							},
							{
								enableHighAccuracy: true,
								timeout: 5000,
								maximumAge: 0,
							}
						);
					}
				}
			});

			map.current.on("moveend", () => {
				if (map.current) {
					const center = map.current.getCenter();
					setCenterLng(center.lng);
					setCenterLat(center.lat);
					setZoom(map.current.getZoom());
				}
			});

			map.current.on("zoomend", () => {
				if (map.current) {
					setZoom(map.current.getZoom());
				}
			});
		}

		return () => {
			map.current?.remove();
			map.current = null;
		};
	}, [handleUserLocation, getNightPolygon, mounted, mapStyle]);

	// Handle theme changes
	useEffect(() => {
		if (!map.current || !mounted) return;

		// Check if map is already loaded and style is different
		if (!map.current.isStyleLoaded()) return;

		const currentStyle = map.current.getStyle();
		const currentStyleUrl = (currentStyle as unknown as { sprite?: string })?.sprite;

		// Only update if the style is actually different
		const isDarkStyle = currentStyleUrl?.includes("dark");
		const shouldBeDark = mapStyle.includes("dark");

		if (isDarkStyle === shouldBeDark) return;

		// Save current map position before changing style
		const center = map.current.getCenter();
		const zoom = map.current.getZoom();
		const bearing = map.current.getBearing();
		const pitch = map.current.getPitch();

		const handleStyleChange = async () => {
			if (!map.current) return;

			// Restore map position after style loads
			map.current.setCenter(center);
			map.current.setZoom(zoom);
			map.current.setBearing(bearing);
			map.current.setPitch(pitch);

			try {
				// Fetch GeoJSON data
				const response = await fetch("/conquer-earth-locations.geojson");
				const locationsData = await response.json();

				// Add GeoJSON source
				map.current.addSource("locations", {
					type: "geojson",
					data: locationsData as GeoJSON.FeatureCollection,
				});

				// Add circle layer for location points with wide color gamut
				map.current.addLayer({
					id: "locations-circle",
					type: "circle",
					source: "locations",
					paint: {
						"circle-radius": [
							"interpolate",
							["linear"],
							["zoom"],
							2, 3,
							10, 8
						],
						"circle-color": [
							"match",
							["get", "type"],
							"City", "rgb(0, 200, 255)",
							"Airport", "rgb(200, 0, 255)",
							"Park", "rgb(0, 255, 100)",
							"Place", "rgb(255, 255, 0)",
							"rgb(255, 50, 180)"
						],
						"circle-opacity": 1.0,
						"circle-stroke-width": 0,
					},
				});

				// Create popup
				const popup = new mapboxgl.Popup({
					closeButton: false,
					closeOnClick: false,
				});

				// Show popup on hover
				map.current.on("mouseenter", "locations-circle", (e) => {
					if (!map.current || !e.features || !e.features[0]) return;

					map.current.getCanvas().style.cursor = "pointer";

					const feature = e.features[0];
					const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
					const { title, type, description } = feature.properties || {};

					while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
						coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
					}

					const descriptionText = description ? `<p class="popup-description">${description}</p>` : "";

					popup
						.setLngLat(coordinates)
						.setHTML(
							`<div class="popup-container">
								<h3 class="popup-title">${title}</h3>
								<p class="popup-type">${type}</p>
								${descriptionText}
							</div>`
						)
						.addTo(map.current);
				});

				// Hide popup on mouse leave
				map.current.on("mouseleave", "locations-circle", () => {
					if (!map.current) return;
					map.current.getCanvas().style.cursor = "";
					popup.remove();
				});

				// Add day/night layer
				const nightPolygon = getNightPolygon();
				map.current.addSource("night", {
					type: "geojson",
					data: {
						type: "FeatureCollection",
						features: [nightPolygon]
					}
				});

				map.current.addLayer({
					id: "night",
					type: "fill",
					source: "night",
					paint: {
						"fill-color": "#000000",
						"fill-opacity": 0.3
					}
				}, "locations-circle");
			} catch (error) {
				console.error("Failed to reload layers:", error);
			}
		};

		// Update map style when theme changes
		map.current.once("style.load", handleStyleChange);
		map.current.setStyle(mapStyle);

		return () => {
			if (map.current) {
				map.current.off("style.load", handleStyleChange);
			}
		};
	}, [mapStyle, mounted, getNightPolygon]);

	// Update night layer every minute
	useEffect(() => {
		if (!map.current) return;

		const updateNightLayer = () => {
			if (map.current && map.current.getSource("night")) {
				const nightPolygon = getNightPolygon();
				const source = map.current.getSource("night") as mapboxgl.GeoJSONSource;
				source.setData({
					type: "FeatureCollection",
					features: [nightPolygon]
				});
			}
		};

		// Update every minute
		const interval = setInterval(updateNightLayer, 60000);

		return () => clearInterval(interval);
	}, [getNightPolygon]);

	return (
		<div className="relative w-screen h-screen">
			<div ref={mapContainer} className="w-screen h-screen fixed inset-0 z-0" />
			<Clock longitude={centerLng} latitude={centerLat} />
			<Elevation zoom={zoom} />
			<Coordinates latitude={centerLat} longitude={centerLng} />
			<ThemeToggleButton variant="circle" blur={true} start="top-right" />
			<CurrentLocation onLocationFound={handleUserLocation} />
			<AddLocation onLocationAdded={loadLocations} />
		</div>
	);
}
