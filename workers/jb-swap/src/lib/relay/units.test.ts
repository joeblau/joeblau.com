import { test, expect, describe } from "bun:test";
import {
	toBaseUnits,
	fromBaseUnits,
	formatTokenAmount,
	toUsdNumber,
} from "./units";

describe("toBaseUnits", () => {
	describe("decimals variations", () => {
		test("decimals=0 returns the whole number unchanged", () => {
			expect(toBaseUnits("123", 0)).toBe("123");
		});

		test("decimals=0 truncates any fractional part", () => {
			expect(toBaseUnits("123.456", 0)).toBe("123");
		});

		test("decimals=6 scales a whole number", () => {
			expect(toBaseUnits("1", 6)).toBe("1000000");
		});

		test("decimals=6 scales a fractional number", () => {
			expect(toBaseUnits("1.5", 6)).toBe("1500000");
		});

		test("decimals=18 scales a whole number", () => {
			expect(toBaseUnits("1", 18)).toBe("1000000000000000000");
		});

		test("decimals=18 scales a fractional number", () => {
			expect(toBaseUnits("1.5", 18)).toBe("1500000000000000000");
		});
	});

	describe("fractional truncation beyond decimals", () => {
		test("truncates extra fractional digits at decimals=6", () => {
			expect(toBaseUnits("1.123456789", 6)).toBe("1123456");
		});

		test("truncates (does not round) at decimals=6", () => {
			expect(toBaseUnits("0.9999999", 6)).toBe("999999");
		});

		test("truncates extra fractional digits at decimals=18", () => {
			expect(toBaseUnits("0.1234567890123456789", 18)).toBe(
				"123456789012345678",
			);
		});
	});

	describe("leading-zero stripping", () => {
		test("strips leading zeros from whole part", () => {
			expect(toBaseUnits("007", 0)).toBe("7");
		});

		test("strips leading zeros but keeps a single zero", () => {
			expect(toBaseUnits("000", 0)).toBe("0");
		});

		test("strips leading zeros on combined whole+frac", () => {
			expect(toBaseUnits("0.5", 6)).toBe("500000");
		});

		test("preserves significant digits when whole is zero", () => {
			expect(toBaseUnits("0.000001", 6)).toBe("1");
		});
	});

	describe("special inputs", () => {
		test('"0" returns "0"', () => {
			expect(toBaseUnits("0", 6)).toBe("0");
		});

		test('empty string returns "0"', () => {
			expect(toBaseUnits("", 6)).toBe("0");
		});

		test('"." returns "0"', () => {
			expect(toBaseUnits(".", 6)).toBe("0");
		});

		test('"1." (trailing dot) treats frac as empty', () => {
			expect(toBaseUnits("1.", 6)).toBe("1000000");
		});

		test('".5" (leading dot) treats whole as zero', () => {
			expect(toBaseUnits(".5", 6)).toBe("500000");
		});

		test('"0.5" scales correctly', () => {
			expect(toBaseUnits("0.5", 6)).toBe("500000");
		});

		test("whitespace is trimmed before parsing", () => {
			expect(toBaseUnits("  1.5  ", 6)).toBe("1500000");
		});

		test("whitespace-only string returns 0", () => {
			expect(toBaseUnits("   ", 6)).toBe("0");
		});

		test('"0.0" returns "0"', () => {
			expect(toBaseUnits("0.0", 6)).toBe("0");
		});
	});

	describe("large 18-decimal values", () => {
		test("handles a large whole 18-decimal value", () => {
			expect(toBaseUnits("1000000", 18)).toBe(
				"1000000000000000000000000",
			);
		});

		test("handles a large fractional 18-decimal value precisely", () => {
			expect(toBaseUnits("123456789.123456789012345678", 18)).toBe(
				"123456789123456789012345678",
			);
		});
	});

	describe("invalid inputs throw", () => {
		test('"1.2.3" throws', () => {
			expect(() => toBaseUnits("1.2.3", 6)).toThrow("invalid amount");
		});

		test('"abc" throws', () => {
			expect(() => toBaseUnits("abc", 6)).toThrow("invalid amount");
		});

		test("a value with a sign throws", () => {
			expect(() => toBaseUnits("-1", 6)).toThrow("invalid amount");
		});

		test("a value with letters mixed in throws", () => {
			expect(() => toBaseUnits("1.5e3", 6)).toThrow("invalid amount");
		});
	});

	describe("invalid decimals throw", () => {
		test("negative decimals throws", () => {
			expect(() => toBaseUnits("1", -1)).toThrow("invalid decimals");
		});

		test("non-integer decimals throws", () => {
			expect(() => toBaseUnits("1", 1.5)).toThrow("invalid decimals");
		});

		test("NaN decimals throws", () => {
			expect(() => toBaseUnits("1", Number.NaN)).toThrow(
				"invalid decimals",
			);
		});
	});
});

describe("fromBaseUnits", () => {
	describe("basic conversions", () => {
		test("decimals=6 with trailing zeros trimmed", () => {
			expect(fromBaseUnits("1500000", 6)).toBe("1.5");
		});

		test("decimals=18 trims trailing zeros", () => {
			expect(fromBaseUnits("1500000000000000000", 18)).toBe("1.5");
		});

		test("decimals=0 returns the integer unchanged", () => {
			expect(fromBaseUnits("123", 0)).toBe("123");
		});

		test('value "0" returns "0"', () => {
			expect(fromBaseUnits("0", 6)).toBe("0");
		});

		test('value "0" with decimals=0 returns "0"', () => {
			expect(fromBaseUnits("0", 0)).toBe("0");
		});
	});

	describe("trailing-zero trimming", () => {
		test("trims all fractional zeros leaving only the whole part", () => {
			expect(fromBaseUnits("1000000", 6)).toBe("1");
		});

		test("keeps significant fractional digits and trims trailing zeros", () => {
			expect(fromBaseUnits("1230000", 6)).toBe("1.23");
		});

		test("keeps full fractional precision when no trailing zeros", () => {
			expect(fromBaseUnits("1123456", 6)).toBe("1.123456");
		});
	});

	describe("value smaller than one whole unit", () => {
		test('"1500"@6 yields a fractional-only value', () => {
			expect(fromBaseUnits("1500", 6)).toBe("0.0015");
		});

		test('"1"@6 yields the smallest representable fraction', () => {
			expect(fromBaseUnits("1", 6)).toBe("0.000001");
		});

		test('"1"@18 yields the smallest 18-decimal fraction', () => {
			expect(fromBaseUnits("1", 18)).toBe("0.000000000000000001");
		});
	});

	describe("leading zero handling on input", () => {
		test("strips leading zeros from the base string", () => {
			expect(fromBaseUnits("0001500000", 6)).toBe("1.5");
		});

		test('all-zero padded string returns "0"', () => {
			expect(fromBaseUnits("000", 6)).toBe("0");
		});

		test('empty base coerces to "0"', () => {
			expect(fromBaseUnits("", 6)).toBe("0");
		});
	});

	describe("negative values", () => {
		test("preserves the sign for a negative value", () => {
			expect(fromBaseUnits("-1500000", 6)).toBe("-1.5");
		});

		test("does not produce a negative zero", () => {
			expect(fromBaseUnits("-0", 6)).toBe("0");
		});

		test("negative fractional-only value keeps sign", () => {
			expect(fromBaseUnits("-1500", 6)).toBe("-0.0015");
		});
	});

	describe("invalid inputs throw", () => {
		test("non-numeric base throws", () => {
			expect(() => fromBaseUnits("abc", 6)).toThrow("invalid base units");
		});

		test("fractional base throws", () => {
			expect(() => fromBaseUnits("1.5", 6)).toThrow("invalid base units");
		});

		test("negative decimals throws", () => {
			expect(() => fromBaseUnits("100", -1)).toThrow("invalid decimals");
		});

		test("non-integer decimals throws", () => {
			expect(() => fromBaseUnits("100", 2.5)).toThrow("invalid decimals");
		});
	});

	describe("round-trip with toBaseUnits", () => {
		const cases: Array<[string, number]> = [
			["1.5", 6],
			["0.000001", 6],
			["123456789.123456789012345678", 18],
			["1000000", 18],
			["0.5", 18],
			["42", 0],
			["0", 6],
		];

		for (const [amount, decimals] of cases) {
			test(`round-trips "${amount}" @ ${decimals}`, () => {
				const base = toBaseUnits(amount, decimals);
				expect(fromBaseUnits(base, decimals)).toBe(amount);
			});
		}

		test("round-trips a truncated value to its truncated form", () => {
			const base = toBaseUnits("1.123456789", 6);
			expect(fromBaseUnits(base, 6)).toBe("1.123456");
		});
	});
});

describe("formatTokenAmount", () => {
	test("default maxFractionDigits=8 returns full value within cap", () => {
		expect(formatTokenAmount("1500000", 6)).toBe("1.5");
	});

	test("caps fractional digits to maxFractionDigits", () => {
		// 18 decimals: 1.123456789012345678 capped to 4 frac digits
		expect(formatTokenAmount("1123456789012345678", 18, 4)).toBe("1.1234");
	});

	test("caps at default 8 fractional digits", () => {
		expect(formatTokenAmount("1123456789012345678", 18)).toBe("1.12345678");
	});

	test("trims trailing zeros after capping", () => {
		// 1.10000000... -> capped slice "10000000" -> trimmed "1" -> whole only
		expect(formatTokenAmount("1100000000000000000", 18, 8)).toBe("1.1");
	});

	test("returns whole number when there is no fractional part", () => {
		expect(formatTokenAmount("1000000", 6)).toBe("1");
	});

	test("returns whole number when capped fraction is all zeros", () => {
		// maxFractionDigits=0 cancels the whole fraction
		expect(formatTokenAmount("1500000", 6, 0)).toBe("1");
	});

	test("decimals=0 returns the integer with no fraction", () => {
		expect(formatTokenAmount("123", 0)).toBe("123");
	});

	test('value "0" returns "0"', () => {
		expect(formatTokenAmount("0", 6)).toBe("0");
	});

	test("formats a fractional-only value", () => {
		expect(formatTokenAmount("1500", 6)).toBe("0.0015");
	});

	test("preserves sign for negative values", () => {
		expect(formatTokenAmount("-1500000", 6)).toBe("-1.5");
	});

	test("caps a long fractional value and trims resulting trailing zeros", () => {
		// 0.012300000000000000 @18 -> frac "012300000000000000",
		// cap 8 -> "01230000" -> trim -> "0123"
		expect(formatTokenAmount("12300000000000000", 18, 8)).toBe("0.0123");
	});

	test("propagates invalid base units error", () => {
		expect(() => formatTokenAmount("xyz", 6)).toThrow("invalid base units");
	});
});

describe("toUsdNumber", () => {
	describe("string parsing", () => {
		test('parses "$1,234.56" to 1234.56', () => {
			expect(toUsdNumber("$1,234.56")).toBe(1234.56);
		});

		test("parses a plain numeric string", () => {
			expect(toUsdNumber("42.5")).toBe(42.5);
		});

		test("parses a negative formatted string", () => {
			expect(toUsdNumber("-$1,000.00")).toBe(-1000);
		});

		test("strips currency symbols and other letters", () => {
			expect(toUsdNumber("USD 12.34")).toBe(12.34);
		});

		test("empty string returns 0", () => {
			expect(toUsdNumber("")).toBe(0);
		});

		test("non-numeric string returns 0", () => {
			expect(toUsdNumber("abc")).toBe(0);
		});

		test("string with only symbols returns 0", () => {
			expect(toUsdNumber("$,.")).toBe(0);
		});

		test("parses a value with no decimal part", () => {
			expect(toUsdNumber("$100")).toBe(100);
		});
	});

	describe("number inputs", () => {
		test("returns a finite number unchanged", () => {
			expect(toUsdNumber(1234.56)).toBe(1234.56);
		});

		test("returns a negative number unchanged", () => {
			expect(toUsdNumber(-50)).toBe(-50);
		});

		test("returns 0 unchanged", () => {
			expect(toUsdNumber(0)).toBe(0);
		});

		test("NaN number returns 0", () => {
			expect(toUsdNumber(Number.NaN)).toBe(0);
		});

		test("Infinity returns 0", () => {
			expect(toUsdNumber(Number.POSITIVE_INFINITY)).toBe(0);
		});

		test("-Infinity returns 0", () => {
			expect(toUsdNumber(Number.NEGATIVE_INFINITY)).toBe(0);
		});
	});

	describe("other types return 0", () => {
		test("null returns 0", () => {
			expect(toUsdNumber(null)).toBe(0);
		});

		test("undefined returns 0", () => {
			expect(toUsdNumber(undefined)).toBe(0);
		});

		test("object returns 0", () => {
			expect(toUsdNumber({ amount: 5 })).toBe(0);
		});

		test("boolean returns 0", () => {
			expect(toUsdNumber(true)).toBe(0);
		});

		test("array returns 0", () => {
			expect(toUsdNumber([1, 2, 3])).toBe(0);
		});
	});
});
