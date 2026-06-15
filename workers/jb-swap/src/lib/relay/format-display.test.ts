import { describe, expect, test } from "bun:test";

import { formatTokenDisplay, toSubscript } from "./units";

describe("formatTokenDisplay", () => {
	test("subscript notation when there are 4+ leading zeros (DexScreener)", () => {
		expect(formatTokenDisplay("0.000000000001089")).toBe("0.0₁₁1089");
		expect(formatTokenDisplay("0.0000047734225")).toBe("0.0₅4773");
		expect(formatTokenDisplay("0.00000260298934643")).toBe("0.0₅2602");
		expect(formatTokenDisplay("0.000005518")).toBe("0.0₅5518");
		expect(formatTokenDisplay("0.0000061803")).toBe("0.0₅6180");
		expect(formatTokenDisplay("0.00001234")).toBe("0.0₄1234"); // exactly 4 zeros
	});

	test("no subscript for 3 or fewer leading zeros; 4 significant digits", () => {
		expect(formatTokenDisplay("0.004221362186928046")).toBe("0.004221");
		expect(formatTokenDisplay("0.028055")).toBe("0.02805");
		expect(formatTokenDisplay("0.963635")).toBe("0.9636");
		expect(formatTokenDisplay("0.647727272727272727")).toBe("0.6477");
		expect(formatTokenDisplay("0.0001234")).toBe("0.0001234"); // 3 zeros = boundary
	});

	test(">= 1 shows grouped, up to 4 decimals trimmed", () => {
		expect(formatTokenDisplay("1190.98245")).toBe("1,190.9824");
		expect(formatTokenDisplay("587.1842")).toBe("587.1842");
		expect(formatTokenDisplay("3.1243")).toBe("3.1243");
		expect(formatTokenDisplay("1000000")).toBe("1,000,000");
	});

	test("edge cases", () => {
		expect(formatTokenDisplay("0")).toBe("0");
		expect(formatTokenDisplay("")).toBe("0");
		expect(formatTokenDisplay(0)).toBe("0");
		expect(formatTokenDisplay("0.00500")).toBe("0.005"); // trailing zeros trimmed
		expect(formatTokenDisplay("-0.00001234")).toBe("-0.0₄1234");
	});

	test("toSubscript", () => {
		expect(toSubscript(5)).toBe("₅");
		expect(toSubscript(11)).toBe("₁₁");
	});
});
