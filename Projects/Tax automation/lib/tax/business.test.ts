import { describe, it, expect } from "vitest";
import {
  SL_LK_BUSINESS_2025_26,
  calculateBusinessTax,
  validateBusinessTaxInput,
  getRuleSet,
  getActiveRuleSet,
} from "./index";
import type {
  TaxRuleSet,
  BusinessTaxInput,
  BusinessIncomeCategory,
} from "./types";

const SET = SL_LK_BUSINESS_2025_26;
const ASSESS_DATE = "2025-04-01";

const BASE_INPUT: BusinessTaxInput = {
  standardIncome: 1_000_000,
  foreignCcyServiceIncome: 0,
  foreignCcyForeignSourceIncome: 0,
  bettingGamingIncome: 0,
  liquorTobaccoIncome: 0,
  investmentAssetGains: 0,
  ordinaryExpenses: 300_000,
  foreignCcyServiceExpenses: 0,
  foreignCcyForeignSourceExpenses: 0,
  bettingGamingExpenses: 0,
  liquorTobaccoExpenses: 0,
  sharedExpenses: 0,
};

/** Zero every (per-category + shared) expense input, for gross single-category tests. */
const NO_EXP: Partial<BusinessTaxInput> = {
  ordinaryExpenses: 0,
  foreignCcyServiceExpenses: 0,
  foreignCcyForeignSourceExpenses: 0,
  bettingGamingExpenses: 0,
  liquorTobaccoExpenses: 0,
  sharedExpenses: 0,
};

function calc(
  overrides: Partial<BusinessTaxInput> = {},
  set: TaxRuleSet = SET,
  atDate: string = ASSESS_DATE
) {
  return calculateBusinessTax({ ...BASE_INPUT, ...overrides }, set, atDate);
}

function validated(input: Partial<BusinessTaxInput> = {}) {
  return validateBusinessTaxInput({ ...BASE_INPUT, ...input });
}

/** The full set of verified 2025/2026 business rates, keyed by category. */
const FULL_RATES: Record<BusinessIncomeCategory, number> = {
  STANDARD: 0.3,
  FXCY_SERVICE: 0.15,
  FXCY_FOREIGN_SOURCE: 0.15,
  BETTING_GAMING: 0.45,
  LIQUOR_TOBACCO: 0.45,
  INVESTMENT_ASSET_GAINS: 0.3,
};

/**
 * Build a verified ruleset carrying a BUSINESS_TAX rule for exactly the
 * categories in `rates` (defaults to all six). Used to drive the COMPUTED path.
 */
function verifiedSet(
  rates: Partial<Record<BusinessIncomeCategory, number>> = FULL_RATES,
  effectiveFrom = "2025-04-01"
): TaxRuleSet {
  const rules = (Object.entries(rates) as Array<[BusinessIncomeCategory, number]>).map(
    ([appliesTo, rate]) => ({
      id: `biz-${appliesTo}`,
      category: "BUSINESS_TAX" as const,
      appliesTo,
      kind: "FLAT_RATE" as const,
      rate,
      effectiveFrom,
      effectiveTo: null,
      note: "synthetic",
    })
  );
  return {
    ...SET,
    id: `LK-business-test-${rules.length}`,
    verified: true,
    rules,
  };
}

describe("business income computation (deterministic, no rate required)", () => {
  it("computes total gross income, attributable expenses and standard taxable profit", () => {
    const r = calc();
    expect(r.totalGrossIncome).toBe(1_000_000);
    expect(r.allowableExpenses).toBe(300_000);
    expect(r.unallocatedExpenses).toBe(0);
    expect(r.standardTaxableIncome).toBe(700_000);
    expect(r.totalTaxableIncome).toBe(700_000);
    expect(r.components).toHaveLength(1);
    expect(r.components[0].category).toBe("STANDARD");
    expect(r.components[0].netted).toBe(true);
    expect(r.components[0].expenses).toBe(300_000);
  });

  it("zero inputs → zero income, expenses, taxable", () => {
    const r = calc({
      standardIncome: 0,
      foreignCcyServiceIncome: 0,
      foreignCcyForeignSourceIncome: 0,
      bettingGamingIncome: 0,
      liquorTobaccoIncome: 0,
      investmentAssetGains: 0,
      ...NO_EXP,
    });
    expect(r.totalGrossIncome).toBe(0);
    expect(r.allowableExpenses).toBe(0);
    expect(r.standardTaxableIncome).toBe(0);
    expect(r.totalTaxableIncome).toBe(0);
    expect(r.components).toHaveLength(0);
  });

  it("clamps standard taxable at zero when attributed expenses exceed standard income (no loss carry-forward)", () => {
    const r = calc({
      standardIncome: 100_000,
      ordinaryExpenses: 200_000,
    });
    expect(r.allowableExpenses).toBe(200_000);
    expect(r.standardTaxableIncome).toBe(0);
    expect(r.totalTaxableIncome).toBe(0);
  });

  it("standard income exactly equal to attributed expenses → zero taxable", () => {
    const r = calc({
      standardIncome: 400_000,
      ordinaryExpenses: 400_000,
    });
    expect(r.standardTaxableIncome).toBe(0);
  });

  it("expenses attributed to ordinary reduce ordinary only — a foreign-source category with no attributed expenses stays gross", () => {
    const r = calc({
      standardIncome: 1_000_000,
      foreignCcyForeignSourceIncome: 200_000,
      ordinaryExpenses: 800_000,
      foreignCcyServiceExpenses: 0,
    });
    const std = r.components.find((c) => c.category === "STANDARD")!;
    const fx = r.components.find((c) => c.category === "FXCY_FOREIGN_SOURCE")!;
    expect(std.taxable).toBe(200_000); // 1M - 800k
    expect(fx.taxable).toBe(200_000); // gross, no expenses attributed to it
    expect(fx.expenses).toBe(0);
  });
});

describe("verified 2025/2026 business rates (six categories)", () => {
  it("standard company taxable income at 30%", () => {
    const r = calc({}, verifiedSet());
    expect(r.taxStatus).toBe("COMPUTED");
    expect(r.components[0].rate).toBe(0.3);
    expect(r.components[0].tax).toBe(210_000); // (1M - 300k) × 30%
    expect(r.totalTax).toBe(210_000);
    expect(r.estimatedLiability).toBe(210_000);
  });

  it("qualifying foreign-currency service income at 15%", () => {
    const r = calc(
      { standardIncome: 0, foreignCcyServiceIncome: 1_000_000, ...NO_EXP },
      verifiedSet()
    );
    const c = r.components.find((x) => x.category === "FXCY_SERVICE")!;
    expect(c.rate).toBe(0.15);
    expect(c.gross).toBe(1_000_000);
    expect(c.expenses).toBe(0);
    expect(c.tax).toBe(150_000);
    expect(r.totalTax).toBe(150_000);
  });

  it("qualifying foreign-source income in foreign currency at 15%", () => {
    const r = calc(
      { standardIncome: 0, foreignCcyForeignSourceIncome: 1_000_000, ...NO_EXP },
      verifiedSet()
    );
    const c = r.components.find((x) => x.category === "FXCY_FOREIGN_SOURCE")!;
    expect(c.rate).toBe(0.15);
    expect(c.tax).toBe(150_000);
    expect(r.totalTax).toBe(150_000);
  });

  it("betting and gaming at 45%", () => {
    const r = calc(
      { standardIncome: 0, bettingGamingIncome: 1_000_000, ...NO_EXP },
      verifiedSet()
    );
    const c = r.components.find((x) => x.category === "BETTING_GAMING")!;
    expect(c.rate).toBe(0.45);
    expect(c.tax).toBe(450_000);
    expect(r.totalTax).toBe(450_000);
  });

  it("manufacture/import and sale of liquor or tobacco at 45%", () => {
    const r = calc(
      { standardIncome: 0, liquorTobaccoIncome: 1_000_000, ...NO_EXP },
      verifiedSet()
    );
    const c = r.components.find((x) => x.category === "LIQUOR_TOBACCO")!;
    expect(c.rate).toBe(0.45);
    expect(c.tax).toBe(450_000);
    expect(r.totalTax).toBe(450_000);
  });

  it("investment-asset gains separately at 30%, gross (no expense deduction)", () => {
    const r = calc(
      { standardIncome: 0, investmentAssetGains: 1_000_000, ...NO_EXP },
      verifiedSet()
    );
    const c = r.components.find((x) => x.category === "INVESTMENT_ASSET_GAINS")!;
    expect(c.rate).toBe(0.3);
    expect(c.netted).toBe(false);
    expect(c.gross).toBe(1_000_000);
    expect(c.expenses).toBe(0);
    expect(c.taxable).toBe(1_000_000);
    expect(c.tax).toBe(300_000);
    expect(r.totalTax).toBe(300_000);
  });
});

describe("mixed scenarios — tax is the sum across categories", () => {
  it("sums standard (net of expenses) + betting at their own rates", () => {
    const r = calc({
      standardIncome: 1_000_000,
      bettingGamingIncome: 200_000,
      ordinaryExpenses: 0,
    });
    expect(r.components).toHaveLength(2);
    // standard taxable 1M → 300k; betting gross 200k → 90k
    expect(r.totalTax).toBe(390_000);
    expect(r.estimatedLiability).toBe(390_000);
  });

  it("each category is an explicit rule variant (15% pairs and 45% pairs)", () => {
    const r = calc(
      {
        standardIncome: 0,
        foreignCcyServiceIncome: 1_000_000,
        foreignCcyForeignSourceIncome: 1_000_000,
        bettingGamingIncome: 1_000_000,
        liquorTobaccoIncome: 1_000_000,
        investmentAssetGains: 1_000_000,
        ...NO_EXP,
      },
      verifiedSet()
    );
    expect(r.components.map((c) => c.category).sort()).toEqual([
      "BETTING_GAMING",
      "FXCY_FOREIGN_SOURCE",
      "FXCY_SERVICE",
      "INVESTMENT_ASSET_GAINS",
      "LIQUOR_TOBACCO",
    ]);
    // 15%+15%+45%+45%+30% on 1M each = 150k+150k+450k+450k+300k
    expect(r.totalTax).toBe(1_500_000);
  });
});

describe("per-category expense attribution (Inland Revenue Act s60(2))", () => {
  it("an expense attributed to a 15% category reduces ONLY that category", () => {
    const r = calc(
      {
        standardIncome: 1_000_000,
        foreignCcyServiceIncome: 200_000,
        ordinaryExpenses: 0,
        foreignCcyServiceExpenses: 50_000,
      },
      verifiedSet()
    );
    const std = r.components.find((c) => c.category === "STANDARD")!;
    const fx = r.components.find((c) => c.category === "FXCY_SERVICE")!;
    expect(std.taxable).toBe(1_000_000); // ordinary expense not applied here
    expect(fx.expenses).toBe(50_000);
    expect(fx.taxable).toBe(150_000); // 200k - 50k
    expect(fx.tax).toBe(22_500); // 150k × 15%
    expect(r.totalTax).toBe(322_500);
  });

  it("an expense attributed to a 45% category reduces ONLY that category", () => {
    const r = calc(
      {
        standardIncome: 0,
        bettingGamingIncome: 1_000_000,
        ordinaryExpenses: 0,
        bettingGamingExpenses: 200_000,
      },
      verifiedSet()
    );
    const bet = r.components.find((c) => c.category === "BETTING_GAMING")!;
    expect(bet.expenses).toBe(200_000);
    expect(bet.taxable).toBe(800_000);
    expect(bet.tax).toBe(360_000); // 800k × 45%
    expect(r.totalTax).toBe(360_000);
  });

  it("changing ordinary expenses changes ordinary tax but not the 15%/45% categories (no cross-category offset)", () => {
    const low = calc(
      {
        standardIncome: 1_000_000,
        bettingGamingIncome: 200_000,
        foreignCcyServiceIncome: 100_000,
        ordinaryExpenses: 0,
        ...NO_EXP,
      },
      verifiedSet()
    );
    const high = calc(
      {
        standardIncome: 1_000_000,
        bettingGamingIncome: 200_000,
        foreignCcyServiceIncome: 100_000,
        ordinaryExpenses: 500_000,
      },
      verifiedSet()
    );
    const bet = (r: ReturnType<typeof calc>) =>
      r.components.find((c) => c.category === "BETTING_GAMING")!.tax;
    const fx = (r: ReturnType<typeof calc>) =>
      r.components.find((c) => c.category === "FXCY_SERVICE")!.tax;
    const std = (r: ReturnType<typeof calc>) =>
      r.components.find((c) => c.category === "STANDARD")!.tax;
    expect(bet(low)).toBe(90_000);
    expect(bet(high)).toBe(90_000);
    expect(fx(low)).toBe(15_000);
    expect(fx(high)).toBe(15_000);
    expect(std(low)).toBe(300_000);
    expect(std(high)).toBe(150_000); // (1M - 500k) × 30%
    expect(low.totalTax).not.toBe(high.totalTax);
  });
});

describe("investment gain immunity", () => {
  it("changing attributed expenses does not change investment-gain tax", () => {
    const low = calc(
      {
        standardIncome: 1_000_000,
        investmentAssetGains: 1_000_000,
        ordinaryExpenses: 0,
        ...NO_EXP,
      },
      verifiedSet()
    );
    const high = calc(
      {
        standardIncome: 1_000_000,
        investmentAssetGains: 1_000_000,
        ordinaryExpenses: 800_000,
      },
      verifiedSet()
    );
    const gainsLow = low.components.find((c) => c.category === "INVESTMENT_ASSET_GAINS")!;
    const gainsHigh = high.components.find((c) => c.category === "INVESTMENT_ASSET_GAINS")!;
    expect(gainsLow.tax).toBe(300_000);
    expect(gainsHigh.tax).toBe(300_000);
    expect(gainsHigh.expenses).toBe(0);
    const stdLow = low.components.find((c) => c.category === "STANDARD")!;
    const stdHigh = high.components.find((c) => c.category === "STANDARD")!;
    expect(stdLow.tax).toBe(300_000);
    expect(stdHigh.tax).toBe(60_000); // (1M - 800k) × 30%
  });
});

describe("shared / unallocated expenses — never silently assigned", () => {
  it("shared expenses are reported unallocated and never reduce any category", () => {
    // BASE_INPUT attributes 300k to ordinary; adding shared must not change that.
    const base = calc({}, verifiedSet());
    const r = calc({ sharedExpenses: 100_000 }, verifiedSet());
    expect(r.unallocatedExpenses).toBe(100_000);
    // Ordinary taxable is the same with or without the shared 100k — the shared
    // amount is NOT silently added to ordinary expenses.
    expect(r.standardTaxableIncome).toBe(base.standardTaxableIncome);
    expect(r.standardTaxableIncome).toBe(700_000); // 1M − 300k ordinary, shared not applied
    expect(r.taxStatus).toBe("NEEDS_ALLOCATION");
    expect(r.totalTax).toBeNull();
    expect(r.estimatedLiability).toBeNull();
    const std = r.components.find((c) => c.category === "STANDARD")!;
    expect(std.expenses).toBe(300_000); // only the attributed ordinary expenses
    expect(std.taxable).toBe(700_000);
  });

  it("shared expenses hold the computation at NEEDS_ALLOCATION even on a verified, fully-ruled set", () => {
    const r = calc(
      { standardIncome: 1_000_000, sharedExpenses: 6_530 },
      verifiedSet()
    );
    expect(r.taxStatus).toBe("NEEDS_ALLOCATION");
    expect(r.totalTax).toBeNull();
  });

  it("the given example must NOT automatically move the 6,530 into the ordinary 30% category", () => {
    // Ordinary business income Rs. 30,000; foreign-source income Rs. 15,000;
    // expenses Rs. 6,530 (not attributed to any specific source).
    const r = calc(
      {
        standardIncome: 30_000,
        foreignCcyForeignSourceIncome: 15_000,
        ordinaryExpenses: 0,
        foreignCcyServiceExpenses: 0,
        foreignCcyForeignSourceExpenses: 0,
        bettingGamingExpenses: 0,
        liquorTobaccoExpenses: 0,
        sharedExpenses: 6_530,
      },
      verifiedSet()
    );
    expect(r.unallocatedExpenses).toBe(6_530);
    expect(r.taxStatus).toBe("NEEDS_ALLOCATION");
    expect(r.totalTax).toBeNull();
    // Ordinary taxable must NOT be (30,000 − 6,530) = 23,470.
    expect(r.standardTaxableIncome).toBe(30_000);
    const std = r.components.find((c) => c.category === "STANDARD")!;
    expect(std.taxable).toBe(30_000);
    expect(std.expenses).toBe(0);
  });

  it("the same example becomes COMPUTED once the expenses are explicitly attributed", () => {
    // Rs. 4,000 attributed to ordinary; Rs. 2,530 attributed to foreign-source.
    const r = calc(
      {
        standardIncome: 30_000,
        foreignCcyForeignSourceIncome: 15_000,
        ordinaryExpenses: 4_000,
        foreignCcyForeignSourceExpenses: 2_530,
      },
      verifiedSet()
    );
    expect(r.taxStatus).toBe("COMPUTED");
    expect(r.unallocatedExpenses).toBe(0);
    const std = r.components.find((c) => c.category === "STANDARD")!;
    const fx = r.components.find((c) => c.category === "FXCY_FOREIGN_SOURCE")!;
    expect(std.taxable).toBe(26_000); // 30k - 4k
    expect(fx.taxable).toBe(12_470); // 15k - 2,530
    expect(std.tax).toBe(7_800); // 26k × 30%
    expect(fx.tax).toBe(1_871); // 12,470 × 15% = 1,870.5 → half-up 1,871
    expect(r.totalTax).toBe(9_671);
  });

  it("expenses attributed to one source are never netted against a differently-taxed source", () => {
    // Attribute 6,530 entirely to ordinary — the foreign-source category is untouched.
    const r = calc(
      {
        standardIncome: 30_000,
        foreignCcyForeignSourceIncome: 15_000,
        ordinaryExpenses: 6_530,
      },
      verifiedSet()
    );
    expect(r.taxStatus).toBe("COMPUTED");
    const std = r.components.find((c) => c.category === "STANDARD")!;
    const fx = r.components.find((c) => c.category === "FXCY_FOREIGN_SOURCE")!;
    expect(std.taxable).toBe(23_470); // 30k - 6,530 (explicitly attributed)
    expect(fx.taxable).toBe(15_000); // untouched
  });
});

describe("COMPUTED path — engine consumes verified rates from the repository", () => {
  it("changes the standard liability when the verified rate changes (not hard-coded)", () => {
    const at30 = calc({}, verifiedSet({ STANDARD: 0.3 }));
    const at15 = calc({}, verifiedSet({ STANDARD: 0.15 }));
    expect(at30.totalTax).toBe(210_000);
    expect(at15.totalTax).toBe(105_000);
    expect(at30.totalTax).not.toBe(at15.totalTax);
  });

  it("rounds sub-rupee tax to the nearest rupee (half-up)", () => {
    const r = calc(
      { standardIncome: 0, investmentAssetGains: 333_333, ...NO_EXP },
      verifiedSet({ INVESTMENT_ASSET_GAINS: 0.14 })
    );
    const c = r.components.find((x) => x.category === "INVESTMENT_ASSET_GAINS")!;
    expect(c.taxable).toBe(333_333);
    // 333,333 × 14% = 46,666.62 → 46,667
    expect(c.tax).toBe(46_667);
  });
});

describe("refusing to compute when the rule is not trustworthy", () => {
  it("does not compute on a ruleless set even if marked verified", () => {
    const noRule = { ...SET, id: "LK-biz-norule", verified: true, rules: [] };
    const r = calc({}, noRule);
    expect(r.taxStatus).toBe("NOT_IMPLEMENTED");
    expect(r.totalTax).toBeNull();
    expect(r.estimatedLiability).toBeNull();
  });

  it("does not compute on an unverified set even if it carries verified-shaped rules", () => {
    const unverified = {
      ...SET,
      id: "LK-biz-unverified",
      verified: false,
      rules: verifiedSet().rules,
    };
    const r = calc({}, unverified);
    expect(r.taxStatus).toBe("NOT_IMPLEMENTED");
    expect(r.totalTax).toBeNull();
  });

  it("does not compute when a category with income has no active rule", () => {
    const partial = verifiedSet({ STANDARD: 0.3 });
    const r = calc(
      { standardIncome: 1_000_000, bettingGamingIncome: 200_000, ...NO_EXP },
      partial
    );
    expect(r.taxStatus).toBe("NOT_IMPLEMENTED");
    expect(r.totalTax).toBeNull();
  });

  it("does not compute when the only rule is not yet in force at the date", () => {
    const future = verifiedSet(FULL_RATES, "2026-01-01");
    const r = calc({}, future, "2025-04-01");
    expect(r.taxStatus).toBe("NOT_IMPLEMENTED");
    expect(r.totalTax).toBeNull();
  });
});

describe("input validation", () => {
  const FIELD_LABELS: Record<keyof BusinessTaxInput, string> = {
    standardIncome: "Ordinary business income",
    foreignCcyServiceIncome: "Foreign-currency service income",
    foreignCcyForeignSourceIncome: "Foreign-source income (FC)",
    bettingGamingIncome: "Betting & gaming",
    liquorTobaccoIncome: "Liquor & tobacco",
    investmentAssetGains: "Investment-asset gains",
    ordinaryExpenses: "Ordinary business income expenses",
    foreignCcyServiceExpenses: "Foreign-currency service expenses",
    foreignCcyForeignSourceExpenses: "Foreign-source income expenses",
    bettingGamingExpenses: "Betting & gaming expenses",
    liquorTobaccoExpenses: "Liquor & tobacco expenses",
    sharedExpenses: "Shared / unallocated expenses",
  };
  const fields: Array<[keyof BusinessTaxInput, number]> = [
    ["standardIncome", -1],
    ["foreignCcyServiceIncome", -1],
    ["foreignCcyForeignSourceIncome", -1],
    ["bettingGamingIncome", -1],
    ["liquorTobaccoIncome", -1],
    ["investmentAssetGains", -1],
    ["ordinaryExpenses", -1],
    ["foreignCcyServiceExpenses", -1],
    ["foreignCcyForeignSourceExpenses", -1],
    ["bettingGamingExpenses", -1],
    ["liquorTobaccoExpenses", -1],
    ["sharedExpenses", -1],
  ];
  for (const [field] of fields) {
    it(`rejects a negative ${field}`, () => {
      expect(validated({ [field]: -1 })).toContain(`${FIELD_LABELS[field]} cannot be negative.`);
      expect(() => calc({ [field]: -1 })).toThrow(/Invalid input/);
    });
  }

  it("rejects a fractional amount", () => {
    expect(validated({ standardIncome: 10.5 })).toContain(
      "Ordinary business income must be a whole number of rupees."
    );
    expect(() => calc({ standardIncome: 10.5 })).toThrow(/Invalid input/);
  });

  it("rejects a non-finite amount", () => {
    expect(validated({ sharedExpenses: Number.NaN })).toContain(
      "Shared / unallocated expenses must be a number."
    );
  });

  it("accepts a fully valid input", () => {
    expect(validated()).toHaveLength(0);
  });
});

describe("ruleset resolution + verified data", () => {
  it("the registered 2025/2026 business set is verified and carries six rate rules", () => {
    expect(SET.verified).toBe(true);
    const rules = SET.rules.filter((r) => r.category === "BUSINESS_TAX");
    expect(rules).toHaveLength(6);
    expect(new Set(rules.map((r) => (r.category === "BUSINESS_TAX" ? r.appliesTo : ""))).size).toBe(6);
  });

  it("resolves the business ruleset within its effective window", () => {
    const set = getActiveRuleSet({ jurisdiction: "LK", taxType: "BUSINESS" }, "2025-10-01");
    expect(set).toBe(SET);
    expect(set?.verified).toBe(true);
  });

  it("returns null for a business tax year with no registered set", () => {
    const set = getRuleSet({ jurisdiction: "LK", taxType: "BUSINESS", taxYear: "2024/2025" });
    expect(set).toBeNull();
  });

  it("resolves the business ruleset by selector", () => {
    const set = getRuleSet({ jurisdiction: "LK", taxType: "BUSINESS", taxYear: "2025/2026" });
    expect(set).toBe(SET);
    expect(set?.verified).toBe(true);
  });
});
