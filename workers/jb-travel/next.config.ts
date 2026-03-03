import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		// Disable ESLint during production builds to avoid native module issues on Cloudflare
		ignoreDuringBuilds: true,
	},
	typescript: {
		// Keep TypeScript checking enabled
		ignoreBuildErrors: false,
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
