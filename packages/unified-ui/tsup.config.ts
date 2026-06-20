import { copyFileSync } from "node:fs";
import { defineConfig } from "tsup";

/**
 * Optional build for publishing a compiled dist. In-monorepo consumers can
 * import the package straight from source (the package.json `exports` point at
 * ./src), so this build is only needed when shipping to npm or a non-TS
 * bundler. `react`, `react-dom`, `framer-motion`, `vaul`, and `cuer` are left
 * external (peer deps).
 */
export default defineConfig({
	entry: ["src/index.ts", "src/cuer-qr.tsx"],
	format: ["esm", "cjs"],
	// Types ship from source: package.json `exports` resolve types to ./src, so
	// consumers get full .d.ts from the TS sources. Standalone .d.ts emit is left
	// off because this monorepo carries two @types/react majors (18 + 19) that
	// trip declaration generation — a tooling/env condition, not a code issue.
	// Flip to `true` in a deduped-types environment to emit dist/*.d.ts.
	dts: false,
	clean: true,
	external: ["react", "react-dom", "framer-motion", "vaul", "cuer"],
	onSuccess: async () => {
		// Ship the standalone token contract + the Tailwind preset alongside dist.
		copyFileSync("styles.css", "dist/styles.css");
		copyFileSync("tailwind-preset.cjs", "dist/tailwind-preset.cjs");
	},
});
