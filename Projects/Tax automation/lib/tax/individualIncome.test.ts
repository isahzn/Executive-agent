import { describe, it, expect } from "vitest";
import {
  SL_LK_INDIVIDUAL_2025_26,
  calculateIndividualIncomeTax,
  validateIndividualIncomeInput,
  getRuleSet,
  getActiveRuleSet,
  taxOnBand,
  applyProgressiveBands,
} from "./index";

const SET = SL_LK_INDIVIDUAL_2025_26;

function run(overrides: Partial<Parameters<typeof calculateIndividualIncomeTax>[0]> = {}) {
  return calculateIndividualIncomeTax(
    {
      employmentIncome: 0,
      businessIncome: 0,
      investmentIncome: 0,
      otherIncome: 0,
      allowableDeductions: 0,
      investmentAssetGains: 0,
      ...overrides,
    },
    SET
  );
}

describe("Sri Lanka Individual Income Tax — 2025/2026", () => {
  it("applies the LKR 1,800,000 personal relief (income at relief → zero tax)", () => {
    const r = run({ employmentIncome: 1_800_000 });
    expect(r.personalRelief).toBe(1_800_000);
    expect(r.ordinaryAssessableIncome).toBe(1_800_000);
    expect(r.taxableAfterRelief).toBe(0);
    expect(r.bandTax).toBe(0);
    expect(r.totalTax).toBe(0);
    expect(r.bands).toHaveLength(0);
  });

  it("does not apply the relief against investment-asset gains", () => {
    const r = run({ investmentAssetGains: 1_000_000 });
    expect(r.ordinaryAssessableIncome).toBe(0);
    expect(r.taxableAfterRelief).toBe(0);
    expect(r.investmentGainsRate).toBe(0.1);
    expect(r.investmentGainsTax).toBe(100_000);
    expect(r.totalTax).toBe(100_000);
  });

  it("first LKR 1,000,000 at 6%", () => {
    const r = run({ employmentIncome: 2_800_000 }); // 1.8M relief → 1M taxable
    expect(r.taxableAfterRelief).toBe(1_000_000);
    expect(r.bands).toHaveLength(1);
    expect(r.bands[0]).toMatchObject({ lower: 0, upper: 1_000_000, rate: 0.06, amountInBand: 1_000_000, tax: 60_000 });
    expect(r.totalTax).toBe(60_000);
  });

  it("next LKR 500,000 at 18%", () => {
    const r = run({ employmentIncome: 3_300_000 }); // 1.5M taxable
    expect(r.bands).toHaveLength(2);
    expect(r.bands[0].tax).toBe(60_000);
    expect(r.bands[1]).toMatchObject({ lower: 1_000_000, upper: 1_500_000, rate: 0.18, amountInBand: 500_000, tax: 90_000 });
    expect(r.totalTax).toBe(150_000);
  });

  it("next LKR 500,000 at 24%", () => {
    const r = run({ employmentIncome: 3_800_000 }); // 2M taxable
    expect(r.bands).toHaveLength(3);
    expect(r.bands[2]).toMatchObject({ lower: 1_500_000, upper: 2_000_000, rate: 0.24, amountInBand: 500_000, tax: 120_000 });
    expect(r.totalTax).toBe(270_000);
  });

  it("next LKR 500,000 at 30%", () => {
    const r = run({ employmentIncome: 4_300_000 }); // 2.5M taxable
    expect(r.bands).toHaveLength(4);
    expect(r.bands[3]).toMatchObject({ lower: 2_000_000, upper: 2_500_000, rate: 0.3, amountInBand: 500_000, tax: 150_000 });
    expect(r.totalTax).toBe(420_000);
  });

  it("balance at 36%", () => {
    const r = run({ employmentIncome: 4_800_000 }); // 3M taxable
    expect(r.bands).toHaveLength(5);
    expect(r.bands[4]).toMatchObject({ lower: 2_500_000, upper: null, rate: 0.36, amountInBand: 500_000, tax: 180_000 });
    expect(r.totalTax).toBe(600_000);
  });

  it("combines ordinary band tax with the 10% investment-gains tax", () => {
    const r = run({ employmentIncome: 2_800_000, investmentAssetGains: 1_000_000 });
    expect(r.bandTax).toBe(60_000);
    expect(r.investmentGainsTax).toBe(100_000);
    expect(r.totalTax).toBe(160_000);
  });

  it("zero income → zero tax, zero effective rate, no bands", () => {
    const r = run();
    expect(r.totalTax).toBe(0);
    expect(r.effectiveRate).toBe(0);
    expect(r.bands).toHaveLength(0);
  });

  it("rejects negative input", () => {
    expect(validateIndividualIncomeInput({ employmentIncome: -5 })).toContain("Employment income cannot be negative.");
    expect(() => run({ employmentIncome: -1 })).toThrow(/Invalid input/);
  });

  it("splits deductions correctly and never makes ordinary income negative", () => {
    const r = run({ businessIncome: 500_000, allowableDeductions: 2_000_000 });
    expect(r.ordinaryAssessableIncome).toBe(0);
    expect(r.taxableAfterRelief).toBe(0);
  });

  it("produces an audit trail ending in total tax", () => {
    const r = run({ employmentIncome: 2_800_000 });
    expect(r.audit[0].label).toBe("Ordinary assessable income");
    expect(r.audit[r.audit.length - 1]).toMatchObject({ label: "Total tax", amount: 60_000 });
  });

  it("audit chain is complete and shows applied relief, not the full cap", () => {
    const r = run({ employmentIncome: 3_000_000 }); // ordinary 3,000,000
    const labels = r.audit.map((s) => s.label);
    expect(labels).toContain("Personal relief applied");
    expect(labels).toContain("Taxable income");
    const reliefStep = r.audit.find((s) => s.label === "Personal relief applied");
    expect(reliefStep?.amount).toBe(1_800_000);
    const taxableStep = r.audit.find((s) => s.label === "Taxable income");
    expect(taxableStep?.amount).toBe(1_200_000);
  });
});

describe("coverage: relief, bands, boundaries, rounding, high income, invalid input", () => {
  it("applies only available relief when income is below the relief cap", () => {
    const r = run({ employmentIncome: 1_000_000 });
    expect(r.personalRelief).toBe(1_800_000);
    expect(r.personalReliefApplied).toBe(1_000_000);
    expect(r.taxableAfterRelief).toBe(0);
    expect(r.totalTax).toBe(0);
  });

  it("caps applied relief exactly at assessable income", () => {
    const r = run({ employmentIncome: 1_800_000 });
    expect(r.personalReliefApplied).toBe(1_800_000);
    expect(r.taxableAfterRelief).toBe(0);
  });

  it("high income crosses all five bands and caps relief at 1.8M", () => {
    const r = run({ employmentIncome: 21_800_000 }); // taxable 20,000,000
    expect(r.personalReliefApplied).toBe(1_800_000);
    expect(r.taxableAfterRelief).toBe(20_000_000);
    expect(r.bands).toHaveLength(5);
    expect(r.bandTax).toBe(6_720_000);
    expect(r.totalTax).toBe(6_720_000);
    expect(r.effectiveRate).toBeCloseTo(6_720_000 / 21_800_000, 10);
  });

  it("deductions reduce assessable income, so no relief is left to apply", () => {
    const r = run({ businessIncome: 500_000, allowableDeductions: 2_000_000 });
    expect(r.ordinaryAssessableIncome).toBe(0);
    expect(r.personalReliefApplied).toBe(0);
  });

  it("personal relief is not applied against investment-asset gains (combined)", () => {
    const r = run({ employmentIncome: 2_800_000, investmentAssetGains: 1_000_000 });
    expect(r.personalReliefApplied).toBe(1_800_000);
    expect(r.bandTax).toBe(60_000);
    expect(r.investmentGainsTax).toBe(100_000);
    expect(r.totalTax).toBe(160_000);
  });

  it("just below the first band boundary → only band 1 is reached", () => {
    const r = run({ employmentIncome: 2_799_000 }); // taxable 999,000
    expect(r.bands).toHaveLength(1);
    expect(r.bands[0]).toMatchObject({ amountInBand: 999_000, rate: 0.06 });
    expect(r.bandTax).toBe(59_940);
  });

  it("just above the first boundary → band 2 is entered with a real amount", () => {
    const r = run({ employmentIncome: 2_801_000 }); // taxable 1,001,000
    expect(r.bands).toHaveLength(2);
    expect(r.bands[1]).toMatchObject({ lower: 1_000_000, amountInBand: 1_000, rate: 0.18, tax: 180 });
    expect(r.totalTax).toBe(60_180);
  });

  it("just below the second boundary", () => {
    const r = run({ employmentIncome: 3_299_000 }); // taxable 1,499,000
    expect(r.bands).toHaveLength(2);
    expect(r.bandTax).toBe(149_820);
  });

  it("just above the second boundary → band 3 is entered", () => {
    const r = run({ employmentIncome: 3_301_000 }); // taxable 1,501,000
    expect(r.bands).toHaveLength(3);
    expect(r.totalTax).toBe(150_240);
  });

  it("just below the third boundary", () => {
    const r = run({ employmentIncome: 3_799_000 }); // taxable 1,999,000
    expect(r.bands).toHaveLength(3);
    expect(r.bandTax).toBe(269_760);
  });

  it("just above the third boundary → band 4 is entered", () => {
    const r = run({ employmentIncome: 3_801_000 }); // taxable 2,001,000
    expect(r.bands).toHaveLength(4);
    expect(r.totalTax).toBe(270_300);
  });

  it("just below the fourth boundary", () => {
    const r = run({ employmentIncome: 4_299_000 }); // taxable 2,499,000
    expect(r.bands).toHaveLength(4);
    expect(r.bandTax).toBe(419_700);
  });

  it("just above the fourth boundary → balance band is entered", () => {
    const r = run({ employmentIncome: 4_301_000 }); // taxable 2,501,000
    expect(r.bands).toHaveLength(5);
    expect(r.bands[4]).toMatchObject({ lower: 2_500_000, upper: null, amountInBand: 1_000, rate: 0.36, tax: 360 });
    expect(r.totalTax).toBe(420_360);
  });

  it("rounds sub-rupee rates to the nearest rupee (half up)", () => {
    // 999,999 × 0.06 = 59,999.94 → 60,000
    const r = run({ employmentIncome: 2_799_999 }); // taxable 999,999
    expect(r.bands[0].tax).toBe(60_000);
    expect(r.bandTax).toBe(60_000);
    expect(taxOnBand(333_333, 0.06)).toBe(20_000); // 19,999.98 → 20,000
  });

  it("rejects fractional (non-whole) rupees", () => {
    expect(validateIndividualIncomeInput({ employmentIncome: 1000.5 })).toContain(
      "Employment income must be a whole number of rupees."
    );
    expect(() => run({ employmentIncome: 1000.5 })).toThrow(/Invalid input/);
  });

  it("rejects non-finite number input", () => {
    expect(validateIndividualIncomeInput({ businessIncome: Number.NaN })).toContain(
      "Business income must be a number."
    );
  });

  it("effective rate is bounded for extremely high income", () => {
    const r = run({ employmentIncome: 100_000_000 }); // taxable 98,200,000
    expect(r.effectiveRate).toBeGreaterThan(0);
    expect(r.effectiveRate).toBeLessThan(1);
  });
});

describe("ruleset resolution", () => {
  it("resolves the exact 2025/2026 ruleset by selector", () => {
    const set = getRuleSet({ jurisdiction: "LK", taxType: "INDIVIDUAL_INCOME", taxYear: "2025/2026" });
    expect(set).toBe(SET);
  });

  it("returns null for a tax year with no registered ruleset", () => {
    const set = getRuleSet({ jurisdiction: "LK", taxType: "INDIVIDUAL_INCOME", taxYear: "2024/2025" });
    expect(set).toBeNull();
  });

  it("resolves the active ruleset within its effective window", () => {
    const set = getActiveRuleSet({ jurisdiction: "LK", taxType: "INDIVIDUAL_INCOME" }, "2025-07-01");
    expect(set).toBe(SET);
  });
});

describe("engine rounding", () => {
  it("rounds band tax to the nearest rupee", () => {
    expect(taxOnBand(333_333, 0.06)).toBe(20_000); // 19,999.98 → 20,000
  });

  it("applyProgressiveBands handles the balance band", () => {
    const bands = SET.rules.filter((r) => r.category === "PROGRESSIVE_BAND");
    const { bands: out, total } = applyProgressiveBands(2_500_000, bands);
    expect(out).toHaveLength(4);
    expect(total).toBe(420_000);
  });
});
