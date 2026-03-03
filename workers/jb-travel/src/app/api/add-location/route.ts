import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface LocationRequest {
	title: string;
	type: string;
	coordinates: [number, number];
	description: string | null;
}

export async function POST(request: NextRequest) {
	try {
		const body: LocationRequest = await request.json();
		const { title, type, coordinates, description } = body;

		if (!title || !type || !coordinates || coordinates.length !== 2) {
			return NextResponse.json(
				{ error: "Invalid request data" },
				{ status: 400 }
			);
		}

		const geojsonPath = path.join(process.cwd(), "public", "conquer-earth-locations.geojson");

		const fileContent = await fs.readFile(geojsonPath, "utf-8");
		const geojsonData = JSON.parse(fileContent);

		const newFeature = {
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates,
			},
			properties: {
				title,
				type,
				description,
				token: generateToken(),
			},
		};

		geojsonData.features.push(newFeature);
		geojsonData.metadata.count = String(geojsonData.features.length);
		geojsonData.metadata.generated_at = String(Math.floor(Date.now() / 1000));

		await fs.writeFile(
			geojsonPath,
			JSON.stringify(geojsonData, null, 2),
			"utf-8"
		);

		return NextResponse.json({ success: true, feature: newFeature });
	} catch (error) {
		console.error("Failed to add location:", error);
		return NextResponse.json(
			{ error: "Failed to add location" },
			{ status: 500 }
		);
	}
}

function generateToken(): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let token = "";
	for (let i = 0; i < 22; i++) {
		token += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return token;
}
