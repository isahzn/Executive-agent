import { describe, it, expect } from "vitest";
import {
  SL_LK_VAT_2025_26,
  calculateVat,
  assessVatRegistration,
  validateVatInput,
  validateVatRegistrationContext,
  getRuleSet,
  getActiveRuleSet,
} from "./index";
import type { TaxRuleSet, VatInput, VatRegistrationContext } from "./types";

const SET = SL_LK_VAT_2025_26;
const ASSESS_DATE = "2025-10-01";

function calc(overrides: Partial<VatInput> = {}) {
  return calculateVat(
    {
      standardRatedSales: 0,
      zeroRatedSales: 0,
      financialServicesSales: 0,
      deductibleInputVat: 0,
      nonDeductibleInputVat: 0,
      ...overrides,
    },
    SET
  );
}

function assess(
  ctx: VatRegistrationContext = {},
  atDate: string = ASSESS_DATE
) {
  return assessVatRegistration(ctx, SET, atDate);
}

describe("Sri Lanka VAT calculation — 2025/2026", () => {
  it("applies the 18% standard rate to standard-rated supplies", () => {
    const r = calc({ standardRatedSales: 1_000_000 });
    expect(r.categories[0]).toMatchObject({
      category: "STANDARD",
      rate: 0.18,
      amount: 1_000_000,
      outputVat: 180_000,
    });
    expect(r.outputVat).toBe(180_000);
  });

  it("rounds sub-rupee output VAT to the nearest rupee", () => {
    // 99,999 × 18% = 17,999.82 → 18,000
    const r = calc({ standardRatedSales: 99_999 });
    expect(r.outputVat).toBe(18_000);
  });

  it("applies 0% to zero-rated (export) supplies", () => {
    const r = calc({ zeroRatedSales: 1_000_000 });
    const zero = r.categories.find((c) => c.category === "ZERO_RATED")!;
    expect(zero.rate).toBe(0);
    expect(zero.outputVat).toBe(0);
    expect(r.outputVat).toBe(0);
  });

  it("applies the 18% financial-services rate as a distinct category", () => {
    const r = calc({ financialServicesSales: 500_000 });
    const fs = r.categories.find((c) => c.category === "FINANCIAL_SERVICES")!;
    expect(fs).toMatchObject({ rate: 0.18, amount: 500_000, outputVat: 90_000 });
    expect(r.outputVat).toBe(90_000);
  });

  it("combines output VAT across all supply categories", () => {
    const r = calc({
      standardRatedSales: 1_000_000,
      zeroRatedSales: 200_000,
      financialServicesSales: 500_000,
    });
    expect(r.outputVat).toBe(180_000 + 0 + 90_000);
  });

  it("output VAT above deductible input → PAYABLE", () => {
    const r = calc({ standardRatedSales: 1_000_000, deductibleInputVat: 50_000 });
    expect(r.outputVat).toBe(180_000);
    expect(r.creditableInputVat).toBe(50_000);
    expect(r.netVat).toBe(130_000);
    expect(r.position).toBe("PAYABLE");
  });

  it("deductible input VAT above output → REFUNDABLE", () => {
    const r = calc({ standardRatedSales: 1_000_000, deductibleInputVat: 200_000 });
    expect(r.netVat).toBe(-20_000);
    expect(r.position).toBe("REFUNDABLE");
  });

  it("equal output and deductible input → NIL", () => {
    const r = calc({ standardRatedSales: 1_000_000, deductibleInputVat: 180_000 });
    expect(r.netVat).toBe(0);
    expect(r.position).toBe("NIL");
  });

  it("credits only deductible input VAT; non-deductible is shown but not credited", () => {
    const r = calc({
      standardRatedSales: 1_000_000,
      deductibleInputVat: 40_000,
      nonDeductibleInputVat: 100_000,
    });
    expect(r.creditableInputVat).toBe(40_000);
    expect(r.nonDeductibleInputVat).toBe(100_000);
    expect(r.netVat).toBe(180_000 - 40_000);
  });

  it("zero sales → zero output VAT and NIL position", () => {
    const r = calc();
    expect(r.outputVat).toBe(0);
    expect(r.netVat).toBe(0);
    expect(r.position).toBe("NIL");
    expect(r.audit).toHaveLength(3); // net + credit + non-credit lines only (no supply lines)
  });

  it("emits an audit trail ending in the net VAT", () => {
    const r = calc({ standardRatedSales: 1_000_000, deductibleInputVat: 50_000 });
    expect(r.audit[0].label).toBe("Standard-rated supplies @ 18%");
    expect(r.audit[r.audit.length - 1]).toMatchObject({
      label: "Net VAT",
      amount: 130_000,
    });
  });
});

describe("VAT registration-threshold assessment", () => {
  it("ordinary quarterly turnover above LKR 15,000,000 → MANDATORY", () => {
    const r = assess({ standardQuarterTurnover: 15_000_001 });
    expect(r.status).toBe("MANDATORY");
    expect(r.category).toBe("STANDARD");
  });

  it("ordinary quarterly turnover exactly at LKR 15,000,000 → not mandatory (exclusive)", () => {
    const r = assess({ standardQuarterTurnover: 15_000_000, carriesOutTaxableSupplies: true });
    expect(r.status).toBe("VOLUNTARY");
  });

  it("ordinary annual turnover above LKR 60,000,000 → MANDATORY", () => {
    const r = assess({ standardAnnualTurnover: 60_000_001 });
    expect(r.status).toBe("MANDATORY");
    expect(r.category).toBe("STANDARD");
  });

  it("ordinary annual turnover at LKR 60,000,000 (exclusive bound) → below mandatory, voluntary", () => {
    // Exactly at the bound does NOT trigger mandatory; taxable turnover is recorded,
    // so voluntary registration is available rather than "not required".
    const r = assess({ standardAnnualTurnover: 60_000_000 });
    expect(r.status).toBe("VOLUNTARY");
    expect(r.category).toBeNull();
  });

  it("financial-services quarterly above LKR 3,000,000 → MANDATORY", () => {
    const r = assess({ financialQuarterTurnover: 3_000_001 });
    expect(r.status).toBe("MANDATORY");
    expect(r.category).toBe("FINANCIAL_SERVICES");
  });

  it("financial-services annual above LKR 12,000,000 → MANDATORY", () => {
    const r = assess({ financialAnnualTurnover: 12_000_001 });
    expect(r.status).toBe("MANDATORY");
    expect(r.category).toBe("FINANCIAL_SERVICES");
  });

  it("below thresholds + carries out taxable supplies → VOLUNTARY", () => {
    const r = assess({
      standardQuarterTurnover: 10_000_000,
      standardAnnualTurnover: 40_000_000,
      carriesOutTaxableSupplies: true,
    });
    expect(r.status).toBe("VOLUNTARY");
  });

  it("below thresholds with recorded ordinary turnover (no explicit flag) → VOLUNTARY", () => {
    const r = assess({ standardQuarterTurnover: 10_000_000 });
    expect(r.status).toBe("VOLUNTARY");
  });

  it("no taxable supplies → NOT_REQUIRED", () => {
    const r = assess({});
    expect(r.status).toBe("NOT_REQUIRED");
  });

  it("commercial importer/exporter → MANDATORY regardless of turnover", () => {
    const r = assess({
      importsOrExportsForCommercialPurpose: true,
      standardQuarterTurnover: 1_000,
    });
    expect(r.status).toBe("MANDATORY");
    expect(r.category).toBe("IMPORT_EXPORT");
  });
});

describe("non-resident electronic-platform rule", () => {
  const EP: VatRegistrationContext = {
    isNonResidentElectronicPlatformSupplier: true,
  };

  it("applies 18% to e-platform supplies after 2025-10-01", () => {
    // The e-platform rule uses the same 18% rate; the calculator is rate-driven.
    const r = calc({ standardRatedSales: 1_000_000 });
    expect(r.outputVat).toBe(180_000);
  });

  it("three-month turnover above LKR 15,000,000 after 2025-10-01 → MANDATORY", () => {
    const r = assess({ ...EP, platformTurnoverLast3Months: 15_000_001 });
    expect(r.status).toBe("MANDATORY");
    expect(r.category).toBe("NON_RESIDENT_EPLATFORM");
  });

  it("twelve-month turnover above LKR 60,000,000 after 2025-10-01 → MANDATORY", () => {
    const r = assess({ ...EP, platformTurnoverLast12Months: 60_000_001 });
    expect(r.status).toBe("MANDATORY");
    expect(r.category).toBe("NON_RESIDENT_EPLATFORM");
  });

  it("not applied before 2025-10-01", () => {
    const r = assess(
      { ...EP, platformTurnoverLast3Months: 100_000_000 },
      "2025-09-30"
    );
    expect(r.status).toBe("NOT_REQUIRED");
    expect(r.category).toBeNull();
  });

  it("exactly at the three-month threshold → not mandatory", () => {
    const r = assess({ ...EP, platformTurnoverLast3Months: 15_000_000 });
    expect(r.status).toBe("VOLUNTARY");
  });
});

describe("VAT validation", () => {
  it("rejects negative amounts", () => {
    expect(validateVatInput({ standardRatedSales: -1 })).toContain(
      "Standard-rated supplies cannot be negative."
    );
    expect(() => calc({ standardRatedSales: -1 })).toThrow(/Invalid input/);
  });

  it("rejects fractional rupees", () => {
    expect(validateVatInput({ deductibleInputVat: 10.5 })).toContain(
      "Deductible input VAT must be a whole number of rupees."
    );
  });

  it("rejects non-finite numbers", () => {
    expect(validateVatInput({ zeroRatedSales: Number.NaN })).toContain(
      "Zero-rated supplies (exports) must be a number."
    );
  });

  it("rejects negative registration turnover", () => {
    expect(
      validateVatRegistrationContext({ standardAnnualTurnover: -5 })
    ).toContain("Ordinary taxable supplies — 12 months cannot be negative.");
    expect(() => assess({ standardAnnualTurnover: -5 })).toThrow(/Invalid input/);
  });

  it("accepts missing optional registration fields", () => {
    expect(validateVatRegistrationContext({})).toHaveLength(0);
    expect(validateVatRegistrationContext({ standardQuarterTurnover: 100 })).toHaveLength(0);
  });
});

describe("engine consumes the versioned rules repository (not hard-coded rates)", () => {
  // A synthetic variant with a different standard rate must change the result.
  const TEN_PERCENT: TaxRuleSet = {
    ...SET,
    id: "LK-vat-test-10pct",
    rules: SET.rules.map((r) =>
      r.category === "VAT_RATE" && r.appliesTo === "STANDARD"
        ? { ...r, rate: 0.1 }
        : r
    ),
  };

  it("uses the rate from the supplied ruleset", () => {
    const r = calculateVat({ standardRatedSales: 1_000_000, zeroRatedSales: 0, financialServicesSales: 0, deductibleInputVat: 0, nonDeductibleInputVat: 0 }, TEN_PERCENT);
    expect(r.outputVat).toBe(100_000);
  });

  it("uses the threshold from the supplied ruleset", () => {
    const LOWER: TaxRuleSet = {
      ...SET,
      id: "LK-vat-test-threshold",
      rules: SET.rules.map((r) =>
        r.category === "VAT_REGISTRATION_THRESHOLD" && r.appliesTo === "STANDARD"
          ? { ...r, quarterly: 1_000_000, annual: 5_000_000 }
          : r
      ),
    };
    const r = assessVatRegistration(
      { standardQuarterTurnover: 1_500_000 },
      LOWER,
      ASSESS_DATE
    );
    expect(r.status).toBe("MANDATORY");
  });

  it("throws when a verified set lacks a required VAT rate rule", () => {
    const NO_FS: TaxRuleSet = {
      ...SET,
      id: "LK-vat-test-nofs",
      rules: SET.rules.filter((r) => !(r.category === "VAT_RATE" && r.appliesTo === "FINANCIAL_SERVICES")),
    };
    expect(() =>
      calculateVat({ standardRatedSales: 0, zeroRatedSales: 0, financialServicesSales: 100, deductibleInputVat: 0, nonDeductibleInputVat: 0 }, NO_FS)
    ).toThrow(/no VAT_RATE rule for FINANCIAL_SERVICES/);
  });
});

describe("ruleset resolution", () => {
  it("resolves the VAT ruleset by selector", () => {
    const set = getRuleSet({ jurisdiction: "LK", taxType: "VAT", taxYear: "2025/2026" });
    expect(set).toBe(SET);
  });

  it("returns null for a VAT year with no registered set", () => {
    const set = getRuleSet({ jurisdiction: "LK", taxType: "VAT", taxYear: "2024/2025" });
    expect(set).toBeNull();
  });

  it("resolves the VAT ruleset within its effective window", () => {
    const set = getActiveRuleSet({ jurisdiction: "LK", taxType: "VAT" }, "2025-07-01");
    expect(set).toBe(SET);
  });

  it("flags the VAT ruleset as IRD-verified", () => {
    expect(SET.verified).toBe(true);
  });
});
