/**
 * Tailwind v3 preset for @joeblau/unified-ui. Maps the bare-HSL token contract in
 * styles.css to the semantic color scale + radius the components use.
 *
 *   // tailwind.config.js
 *   module.exports = {
 *     presets: [require("@joeblau/unified-ui/tailwind-preset")],
 *     content: [
 *       "./src/**\/*.{ts,tsx}",
 *       "./node_modules/@joeblau/unified-ui/src/**\/*.{ts,tsx}",
 *     ],
 *   };
 *
 * Tailwind v4 (no JS config): instead of this preset, add an @theme inline block
 * mapping --color-card: hsl(var(--card)) etc. (see README), and add the package
 * source to your content/@source so the utilities are generated.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
	darkMode: ["class"],
	content: [],
	theme: {
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
		},
	},
	plugins: [],
};
