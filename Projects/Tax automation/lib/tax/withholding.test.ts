import { describe, it, expect } from "vitest";
import {
  SL_LK_WHT_2025_26,
  calculateWithholding,
  validateWithholdingInput,
  getRuleSet,
  getActiveRuleSet,
  WHT_CATEGORY_LABEL,
} from "./index";
import type { TaxRuleSet, WithholdingInput, WhtPaymentCategory } from "./types";

const SET = SL_LK_WHT_2025_26;
const ASSESS_DATE = "2025-04-01";

function calc(overrides: Partial<WithholdingInput> = {}, atDate: string = ASSESS_DATE) {
  return calculateWithholding(
    {
      category: "DIVIDENDS",
      gross: 0,
      ...overrides,
    },
    SET,
    atDate
  );
}

function validated(input: Partial<WithholdingInput> = {}) {
  return validateWithholdingInput({ category: "DIVIDENDS", gross: 0, ...input });
}

describe("Sri Lanka Withholding Tax — 2025/2026, each verified category", () => {
  const cases: Array<{
    category: WhtPaymentCategory;
    gross: number;
    expectedRate: number;
    expectedWithholding: number;
  }> = [
    { category: "NONRESIDENT_TRANSPORT_TELECOM", gross: 50_000, expectedRate: 0.02, expectedWithholding: 1_000 },
    { category: "GEM_NGJA_AUCTION", gross: 40_000, expectedRate: 0.025, expectedWithholding: 1_000 },
    { category: "RESIDENT_NON_EMPLOYEE_SERVICE_FEE", gross: 200_000, expectedRate: 0.05, expectedWithholding: 10_000, },
    { category: "INTEREST_DISCOUNT", gross: 500_000, expectedRate: 0.1, expectedWithholding: 50_000 },
    { category: "RENT_RESIDENT", gross: 200_000, expectedRate: 0.1, expectedWithholding: 20_000 },
    { category: "LOTTERY_BETTING_WINNINGS", gross: 100_000, expectedRate: 0.14, expectedWithholding: 14_000 },
    { category: "CHARGE_NATURAL_RESOURCE_PREMIUM", gross: 100_000, expectedRate: 0.14, expectedWithholding: 14_000 },
    { category: "ROYALTY", gross: 200_000, expectedRate: 0.14, expectedWithholding: 28_000 },
    { category: "RENT_NONRESIDENT", gross: 100_000, expectedRate: 0.14, expectedWithholding: 14_000 },
    { category: "SERVICE_FEE_INSURANCE_NONRESIDENT", gross: 100_000, expectedRate: 0.14, expectedWithholding: 14_000 },
    { category: "DIVIDENDS", gross: 100_000, expectedRate: 0.15, expectedWithholding: 15_000 },
  ];

  for (const c of cases) {
    it(`applies the verified rate to ${c.category}`, () => {
      const input: WithholdingInput = {
        category: c.category,
        gross: c.gross,
        ...(c.category === "RESIDENT_NON_EMPLOYEE_SERVICE_FEE" ||
        c.category === "RENT_RESIDENT"
          ? { monthlyAggregate: c.gross }
          : {}),
      };
      const r = calc(input);
      expect(r.rate).toBe(c.expectedRate);
      expect(r.withholding).toBe(c.expectedWithholding);
      expect(r.net).toBe(c.gross - c.expectedWithholding);
      expect(r.applies).toBe(true);
      expect(r.categoryLabel).toBe(WHT_CATEGORY_LABEL[c.category]);
    });
  }

  it("computes net = gross − withholding", () => {
    const r = calc({ category: "DIVIDENDS", gross: 100_000 });
    expect(r.net).toBe(85_000);
  });
});

describe("zero values", () => {
  it("zero gross → zero withholding and net", () => {
    const r = calc({ category: "DIVIDENDS", gross: 0 });
    expect(r.withholding).toBe(0);
    expect(r.net).toBe(0);
  });

  it("zero gross on a threshold category, aggregate above threshold → zero withholding", () => {
    const r = calc({
      category: "RENT_RESIDENT",
      gross: 0,
      monthlyAggregate: 200_000,
    });
    expect(r.applies).toBe(true);
    expect(r.withholding).toBe(0);
    expect(r.net).toBe(0);
  });
});

describe("exclusive LKR 100,000 monthly threshold (resident categories)", () => {
  it("service fee — aggregate exactly 100,000 → no WHT", () => {
    const r = calc({
      category: "RESIDENT_NON_EMPLOYEE_SERVICE_FEE",
      gross: 100_000,
      monthlyAggregate: 100_000,
    });
    expect(r.thresholdMet).toBe(false);
    expect(r.withholding).toBe(0);
    expect(r.net).toBe(100_000);
  });

  it("service fee — aggregate 100,001 → WHT on the full payment", () => {
    const r = calc({
      category: "RESIDENT_NON_EMPLOYEE_SERVICE_FEE",
      gross: 100_001,
      monthlyAggregate: 100_001,
    });
    expect(r.thresholdMet).toBe(true);
    // 5% on the FULL gross, not just the excess over 100,000.
    expect(r.withholding).toBe(5_000);
    expect(r.net).toBe(95_001);
  });

  it("service fee — aggregate just below 100,000 → no WHT", () => {
    const r = calc({
      category: "RESIDENT_NON_EMPLOYEE_SERVICE_FEE",
      gross: 99_999,
      monthlyAggregate: 99_999,
    });
    expect(r.withholding).toBe(0);
  });

  it("service fee — full-payment treatment when aggregate is above threshold", () => {
    const r = calc({
      category: "RESIDENT_NON_EMPLOYEE_SERVICE_FEE",
      gross: 100_001,
      monthlyAggregate: 200_000,
    });
    // WHT computed on the entire gross payment, not on the excess.
    expect(r.withholding).toBe(5_000);
  });

  it("service fee — small gross but aggregate above threshold → WHT on the gross", () => {
    const r = calc({
      category: "RESIDENT_NON_EMPLOYEE_SERVICE_FEE",
      gross: 10_000,
      monthlyAggregate: 150_000,
    });
    expect(r.thresholdMet).toBe(true);
    expect(r.withholding).toBe(500);
    expect(r.net).toBe(9_500);
  });

  it("rent to resident — aggregate exactly 100,000 → no WHT", () => {
    const r = calc({
      category: "RENT_RESIDENT",
      gross: 100_000,
      monthlyAggregate: 100_000,
    });
    expect(r.withholding).toBe(0);
  });

  it("rent to resident — aggregate 100,001 → WHT on the full payment at 10%", () => {
    const r = calc({
      category: "RENT_RESIDENT",
      gross: 100_001,
      monthlyAggregate: 100_001,
    });
    expect(r.thresholdMet).toBe(true);
    expect(r.withholding).toBe(10_000);
    expect(r.net).toBe(90_001);
  });

  it("rent to resident — aggregate just below 100,000 → no WHT", () => {
    const r = calc({
      category: "RENT_RESIDENT",
      gross: 99_999,
      monthlyAggregate: 99_999,
    });
    expect(r.withholding).toBe(0);
  });
});

describe("non-threshold categories are always subject to WHT", () => {
  it("dividends do not have a monthly threshold", () => {
    const r = calc({ category: "DIVIDENDS", gross: 100_000 });
    expect(r.monthlyThreshold).toBeNull();
    expect(r.monthlyAggregate).toBeNull();
    expect(r.thresholdMet).toBe(true);
    expect(r.applies).toBe(true);
  });
});

describe("rounding", () => {
  it("rounds sub-rupee withholding to the nearest rupee (half-up)", () => {
    // 50,001 × 5% = 2,500.05 → 2,500
    const r = calc({
      category: "RESIDENT_NON_EMPLOYEE_SERVICE_FEE",
      gross: 50_001,
      monthlyAggregate: 100_001,
    });
    expect(r.withholding).toBe(2_500);
  });

  it("rounds a high-value 2.5% payment", () => {
    const r = calc({ category: "GEM_NGJA_AUCTION", gross: 500_000_000 });
    expect(r.withholding).toBe(12_500_000);
  });

  it("rounds a 14% payment up at the half-rupee", () => {
    // 333,333 × 14% = 46,666.62 → 46,667
    const r = calc({ category: "ROYALTY", gross: 333_333 });
    expect(r.withholding).toBe(46_667);
  });
});

describe("invalid input", () => {
  it("rejects an unknown category", () => {
    expect(validated({ category: "DOES_NOT_EXIST" as WhtPaymentCategory })).toContain(
      "A valid payment category must be selected."
    );
    expect(() => calc({ category: "X" as WhtPaymentCategory, gross: 100 })).toThrow(
      /Invalid input/
    );
  });

  it("rejects a negative gross", () => {
    expect(validated({ gross: -1 })).toContain("Gross payment cannot be negative.");
    expect(() => calc({ gross: -1 })).toThrow(/Invalid input/);
  });

  it("rejects a fractional gross", () => {
    expect(validated({ gross: 10.5 })).toContain("Gross payment must be a whole number of rupees.");
  });

  it("rejects a non-finite gross", () => {
    expect(validated({ gross: Number.NaN })).toContain("Gross payment must be a number.");
  });

  it("requires monthly aggregate for a threshold category", () => {
    expect(
      validated({ category: "RESIDENT_NON_EMPLOYEE_SERVICE_FEE", gross: 200_000 }).join(" ")
    ).toContain("The total paid to this recipient this month is required for this category");
    expect(() =>
      calc({ category: "RESIDENT_NON_EMPLOYEE_SERVICE_FEE", gross: 200_000 })
    ).toThrow(/Invalid input/);
  });

  it("rejects a negative monthly aggregate", () => {
    expect(validated({ category: "RENT_RESIDENT", monthlyAggregate: -5 })).toContain(
      "Monthly aggregate cannot be negative."
    );
  });

  it("rejects a fractional monthly aggregate", () => {
    expect(validated({ category: "RENT_RESIDENT", monthlyAggregate: 10.5 })).toContain(
      "Monthly aggregate must be a whole number of rupees."
    );
  });

  it("accepts an empty category-free valid input for a no-threshold category", () => {
    expect(validated({ category: "DIVIDENDS", gross: 100 })).toHaveLength(0);
  });
});

describe("interest/discount does not auto-apply the personal-relief circular", () => {
  it("applies a flat 10% — no relief/refund is derived", () => {
    const r = calc({ category: "INTEREST_DISCOUNT", gross: 100_000 });
    expect(r.withholding).toBe(10_000);
    expect(r.net).toBe(90_000);
    // No refund field is produced; the result only carries the flat withholding.
    expect(Object.keys(r)).not.toContain("refund");
  });
});

describe("effective-date behaviour", () => {
  it("throws when the category's rule is not yet in force at the date", () => {
    const FUTURE: TaxRuleSet = {
      ...SET,
      id: "LK-wht-test-future",
      rules: SET.rules.map((r) =>
        r.category === "WITHHOLDING_RATE" && r.appliesTo === "DIVIDENDS"
          ? { ...r, effectiveFrom: "2026-01-01" }
          : r
      ),
    };
    expect(() =>
      calculateWithholding({ category: "DIVIDENDS", gross: 100 }, FUTURE, "2025-04-01")
    ).toThrow(/no WITHHOLDING_RATE rule for DIVIDENDS is in force at 2025-04-01/i);
  });

  it("resolves the WHT ruleset within its effective window", () => {
    const set = getActiveRuleSet({ jurisdiction: "LK", taxType: "WITHHOLDING" }, "2025-07-01");
    expect(set).toBe(SET);
  });

  it("returns null for a WHT year with no registered set", () => {
    const set = getRuleSet({ jurisdiction: "LK", taxType: "WITHHOLDING", taxYear: "2024/2025" });
    expect(set).toBeNull();
  });

  it("flags the WHT ruleset as IRD-verified", () => {
    expect(SET.verified).toBe(true);
  });
});

describe("engine consumes the versioned rules repository (not hard-coded rates)", () => {
  it("uses the rate from the supplied ruleset", () => {
    const TWENTY: TaxRuleSet = {
      ...SET,
      id: "LK-wht-test-20pct",
      rules: SET.rules.map((r) =>
        r.category === "WITHHOLDING_RATE" && r.appliesTo === "DIVIDENDS"
          ? { ...r, rate: 0.2 }
          : r
      ),
    };
    const r = calculateWithholding({ category: "DIVIDENDS", gross: 100_000 }, TWENTY, ASSESS_DATE);
    expect(r.withholding).toBe(20_000);
  });

  it("uses the threshold from the supplied ruleset", () => {
    const LOWER: TaxRuleSet = {
      ...SET,
      id: "LK-wht-test-lower-threshold",
      rules: SET.rules.map((r) =>
        r.category === "WITHHOLDING_RATE" && r.appliesTo === "RENT_RESIDENT"
          ? { ...r, monthlyThreshold: 50_000 }
          : r
      ),
    };
    // With the real 100,000 threshold this aggregate (60,000) is below → no WHT.
    const baseline = calculateWithholding(
      { category: "RENT_RESIDENT", gross: 60_000, monthlyAggregate: 60_000 },
      SET,
      ASSESS_DATE
    );
    expect(baseline.withholding).toBe(0);
    // With the lower 50,000 threshold the same aggregate exceeds → WHT.
    const lower = calculateWithholding(
      { category: "RENT_RESIDENT", gross: 60_000, monthlyAggregate: 60_000 },
      LOWER,
      ASSESS_DATE
    );
    expect(lower.thresholdMet).toBe(true);
    expect(lower.withholding).toBe(6_000);
  });

  it("throws when a verified set lacks the category's rule", () => {
    const NO_ROYALTY: TaxRuleSet = {
      ...SET,
      id: "LK-wht-test-noroyalty",
      rules: SET.rules.filter((r) => !(r.category === "WITHHOLDING_RATE" && r.appliesTo === "ROYALTY")),
    };
    expect(() =>
      calculateWithholding({ category: "ROYALTY", gross: 100 }, NO_ROYALTY, ASSESS_DATE)
    ).toThrow(/no WITHHOLDING_RATE rule for ROYALTY/);
  });
});

describe("ruleset resolution", () => {
  it("resolves the WHT ruleset by selector", () => {
    const set = getRuleSet({ jurisdiction: "LK", taxType: "WITHHOLDING", taxYear: "2025/2026" });
    expect(set).toBe(SET);
  });
});
