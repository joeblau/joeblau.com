import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	webpack: (config) => {
		// `ox` (pulled in transitively by Privy/viem) uses a dynamic require
		// expression that webpack flags as "Critical dependency". It's benign —
		// silence it so the build/console stays clean.
		config.ignoreWarnings = [
			...(config.ignoreWarnings ?? []),
			{ message: /Critical dependency: the request of a dependency is an expression/ },
		];
		return config;
	},
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
