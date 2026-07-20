import { describe, expect, test } from "bun:test";

import { unitsToMode } from "./swap-field";

describe("unitsToMode", () => {
	test("passes token units through untouched in token mode", () => {
		expect(unitsToMode("0.004220", "token", 1892)).toBe("0.004220");
	});

	test("ignores price entirely in token mode", () => {
		expect(unitsToMode("1.5", "token", 0)).toBe("1.5");
	});

	test("converts units to dollars in usd mode", () => {
		expect(unitsToMode("2", "usd", 1000)).toBe("2000");
	});

	test("regression: Max on a 0.004220 ETH balance is not $0.00", () => {
		// Reported bug: the raw unit string was stored while in usd mode, so the
		// balance read back as $0.00422 -> "$0.00" and 0.00000223 ETH.
		const out = unitsToMode("0.004220", "usd", 1892);
		expect(out).not.toBe("0.00422");
		expect(Number(out)).toBeCloseTo(7.98, 2);
	});

	test("floors to the cent so Max never exceeds the balance", () => {
		// 0.005 * 1899.9 = 9.4995 -> rounding gives 9.50, which converts back to
		// more units than are held. Flooring keeps it under.
		const out = unitsToMode("0.005", "usd", 1899.9);
		expect(out).toBe("9.49");
		expect(Number(out) / 1899.9).toBeLessThanOrEqual(0.005);
	});

	test("sub-cent holdings floor to 0 — usd mode has two decimals", () => {
		expect(unitsToMode("0.000001", "usd", 1892)).toBe("0");
	});

	test("returns 0 in usd mode when the price is unknown", () => {
		expect(unitsToMode("0.004220", "usd", 0)).toBe("0");
	});

	test("treats a non-numeric unit string as zero rather than NaN", () => {
		expect(unitsToMode("", "usd", 1892)).toBe("0");
		expect(unitsToMode("abc", "usd", 1892)).toBe("0");
	});
});
