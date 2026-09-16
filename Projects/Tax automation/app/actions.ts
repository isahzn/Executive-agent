"use server";

import { randomUUID } from "node:crypto";
import { getPersistence } from "@/lib/database";
import type { CalculationType } from "@/lib/database";
import type {
  IndividualIncomeInput,
  IndividualIncomeResult,
  VatInput,
  VatCalculationResult,
  VatRegistrationContext,
  VatRegistrationAssessment,
  WithholdingInput,
  WithholdingResult,
  WhtPaymentCategory,
  BusinessTaxInput,
  BusinessTaxResult,
} from "@/lib/tax";
import {
  getRuleSet,
  calculateIndividualIncomeTax,
  validateIndividualIncomeInput,
  calculateVat as calculateVatEngine,
  assessVatRegistration as assessVatRegistrationEngine,
  validateVatInput,
  validateVatRegistrationContext,
  calculateWithholding as calculateWithholdingEngine,
  validateWithholdingInput,
  calculateBusinessTax as calculateBusinessTaxEngine,
  validateBusinessTaxInput,
} from "@/lib/tax";
import { parseSpreadsheet } from "@/lib/upload/parse";
import type { ParsedSheet } from "@/lib/upload/parse";

export type IndividualTaxState = {
  result?: IndividualIncomeResult;
  errors?: string[];
};

export type VatState = {
  result?: VatCalculationResult;
  registration?: VatRegistrationAssessment;
  errors?: string[];
};

export type WithholdingState = {
  result?: WithholdingResult;
  errors?: string[];
};

export type BusinessTaxState = {
  result?: BusinessTaxResult;
  errors?: string[];
};

export type UploadState = {
  parsed?: ParsedSheet;
  error?: string;
};

const RULESET_SELECTOR = {
  jurisdiction: "LK" as const,
  taxType: "INDIVIDUAL_INCOME" as const,
  taxYear: "2025/2026",
};

/** Read a numeric field from FormData, defaulting missing/empty to 0. */
function numberField(formData: FormData, key: string): number {
  const raw = formData.get(key);
  if (raw == null || raw === "") return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Persist a completed calculation (Phase 1 §5). Best-effort: a non-fatal
 * persistence failure never fails the calculation itself. The applied rule
 * version (rulesetId) is recorded so no figure is ever attributed to an
 * unverified rule. No auth yet → a stable local user label.
 */
async function persistResult(params: {
  type: CalculationType;
  taxYear: string;
  atDate: string;
  rulesetId: string;
  input: unknown;
  result: unknown;
}): Promise<void> {
  try {
    await getPersistence().save({
      id: randomUUID(),
      type: params.type,
      taxYear: params.taxYear,
      atDate: params.atDate,
      rulesetId: params.rulesetId,
      input: params.input,
      result: params.result,
      user: "local",
      createdAt: new Date().toISOString(),
    });
  } catch {
    // Ignore persistence errors; the calculation already succeeded.
  }
}

function parseIndividualInput(formData: FormData): IndividualIncomeInput {
  return {
    employmentIncome: numberField(formData, "employmentIncome"),
    businessIncome: numberField(formData, "businessIncome"),
    investmentIncome: numberField(formData, "investmentIncome"),
    otherIncome: numberField(formData, "otherIncome"),
    allowableDeductions: numberField(formData, "allowableDeductions"),
    investmentAssetGains: numberField(formData, "investmentAssetGains"),
  };
}

/** Validate input (non-negative numbers), run the deterministic engine, and save it. */
async function runIndividual(input: IndividualIncomeInput): Promise<IndividualTaxState> {
  const errors = validateIndividualIncomeInput(input);
  if (errors.length > 0) {
    return { errors };
  }
  const ruleset = getRuleSet(RULESET_SELECTOR);
  if (!ruleset) {
    return { errors: ["No verified ruleset is configured for tax year 2025/2026."] };
  }
  try {
    const result = calculateIndividualIncomeTax(input, ruleset);
    await persistResult({
      type: "INDIVIDUAL_INCOME",
      taxYear: ruleset.taxYear,
      atDate: ruleset.effectiveFrom,
      rulesetId: ruleset.id,
      input,
      result,
    });
    return { result };
  } catch (err) {
    return {
      errors: [
        err instanceof Error ? err.message : "The calculation could not be completed.",
      ],
    };
  }
}

/** Form action — calculates individual income tax from a submitted form. */
export async function calculateIndividualTax(
  _prev: IndividualTaxState,
  formData: FormData
): Promise<IndividualTaxState> {
  return runIndividual(parseIndividualInput(formData));
}

/** Programmatic server function — used by the upload flow after column mapping. */
export async function calculateIndividualTaxFromInput(
  input: IndividualIncomeInput
): Promise<IndividualTaxState> {
  return runIndividual(input);
}

const VAT_RULESET_SELECTOR = {
  jurisdiction: "LK" as const,
  taxType: "VAT" as const,
  taxYear: "2025/2026",
};

/** Reference date for the VAT registration assessment (non-resident e-platform rule in force from 2025-10-01). */
const VAT_ASSESSMENT_DATE = "2025-10-01";

/** Read an optional numeric field; empty/missing → undefined, else a number (possibly NaN for validation). */
function optionalNumberField(formData: FormData, key: string): number | undefined {
  const raw = formData.get(key);
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : Number.NaN;
}

function parseVatInput(formData: FormData): VatInput {
  return {
    standardRatedSales: numberField(formData, "standardRatedSales"),
    zeroRatedSales: numberField(formData, "zeroRatedSales"),
    financialServicesSales: numberField(formData, "financialServicesSales"),
    deductibleInputVat: numberField(formData, "deductibleInputVat"),
    nonDeductibleInputVat: numberField(formData, "nonDeductibleInputVat"),
  };
}

function parseVatRegistrationContext(formData: FormData): VatRegistrationContext {
  return {
    standardQuarterTurnover: optionalNumberField(formData, "standardQuarterTurnover"),
    standardAnnualTurnover: optionalNumberField(formData, "standardAnnualTurnover"),
    financialQuarterTurnover: optionalNumberField(formData, "financialQuarterTurnover"),
    financialAnnualTurnover: optionalNumberField(formData, "financialAnnualTurnover"),
    platformTurnoverLast3Months: optionalNumberField(formData, "platformTurnoverLast3Months"),
    platformTurnoverLast12Months: optionalNumberField(formData, "platformTurnoverLast12Months"),
    importsOrExportsForCommercialPurpose:
      formData.get("importsOrExportsForCommercialPurpose") === "on",
    isNonResidentElectronicPlatformSupplier:
      formData.get("isNonResidentElectronicPlatformSupplier") === "on",
    carriesOutTaxableSupplies: formData.get("carriesOutTaxableSupplies") === "on",
  };
}

/** Form action — calculates VAT from a submitted form. */
export async function calculateVat(
  _prev: VatState,
  formData: FormData
): Promise<VatState> {
  const input = parseVatInput(formData);
  const errors = validateVatInput(input);
  if (errors.length > 0) {
    return { errors };
  }
  const ruleset = getRuleSet(VAT_RULESET_SELECTOR);
  if (!ruleset) {
    return { errors: ["No verified VAT ruleset is configured for tax year 2025/2026."] };
  }
  try {
    const result = calculateVatEngine(input, ruleset);
    await persistResult({
      type: "VAT",
      taxYear: ruleset.taxYear,
      atDate: VAT_ASSESSMENT_DATE,
      rulesetId: ruleset.id,
      input,
      result,
    });
    return { result };
  } catch (err) {
    return {
      errors: [
        err instanceof Error ? err.message : "The VAT calculation could not be completed.",
      ],
    };
  }
}

/** Form action — assesses VAT registration obligations from a submitted form. */
export async function assessVat(
  _prev: VatState,
  formData: FormData
): Promise<VatState> {
  const ctx = parseVatRegistrationContext(formData);
  const errors = validateVatRegistrationContext(ctx);
  if (errors.length > 0) {
    return { errors };
  }
  const ruleset = getRuleSet(VAT_RULESET_SELECTOR);
  if (!ruleset) {
    return { errors: ["No verified VAT ruleset is configured for tax year 2025/2026."] };
  }
  try {
    return {
      registration: assessVatRegistrationEngine(ctx, ruleset, VAT_ASSESSMENT_DATE),
    };
  } catch (err) {
    return {
      errors: [
        err instanceof Error
          ? err.message
          : "The VAT registration assessment could not be completed.",
      ],
    };
  }
}

const WHT_RULESET_SELECTOR = {
  jurisdiction: "LK" as const,
  taxType: "WITHHOLDING" as const,
  taxYear: "2025/2026",
};

/** The effective date of the verified WHT/AIT schedule for Y/A 2025/2026. */
const WHT_ASSESSMENT_DATE = "2025-04-01";

/** Read a category from FormData; cast to the enum so validation can reject bad values. */
function readCategory(formData: FormData): WhtPaymentCategory {
  const raw = formData.get("category");
  return (typeof raw === "string" ? raw : "") as WhtPaymentCategory;
}

/** Read an optional monthly-aggregate field; empty → undefined, else a number (possibly NaN). */
function optionalMonthlyAggregate(formData: FormData): number | undefined {
  const raw = formData.get("monthlyAggregate");
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : Number.NaN;
}

function parseWithholdingInput(formData: FormData): WithholdingInput {
  return {
    category: readCategory(formData),
    gross: numberField(formData, "gross"),
    monthlyAggregate: optionalMonthlyAggregate(formData),
  };
}

/** Form action — calculates withholding tax from a submitted form. */
export async function calculateWithholding(
  _prev: WithholdingState,
  formData: FormData
): Promise<WithholdingState> {
  const input = parseWithholdingInput(formData);
  const errors = validateWithholdingInput(input);
  if (errors.length > 0) {
    return { errors };
  }
  const ruleset = getRuleSet(WHT_RULESET_SELECTOR);
  if (!ruleset) {
    return { errors: ["No verified WHT ruleset is configured for tax year 2025/2026."] };
  }
  try {
    const result = calculateWithholdingEngine(input, ruleset, WHT_ASSESSMENT_DATE);
    await persistResult({
      type: "WITHHOLDING",
      taxYear: ruleset.taxYear,
      atDate: WHT_ASSESSMENT_DATE,
      rulesetId: ruleset.id,
      input,
      result,
    });
    return { result };
  } catch (err) {
    return {
      errors: [
        err instanceof Error
          ? err.message
          : "The withholding calculation could not be completed.",
      ],
    };
  }
}

const BUSINESS_RULESET_SELECTOR = {
  jurisdiction: "LK" as const,
  taxType: "BUSINESS" as const,
  taxYear: "2025/2026",
};

/** The effective date of the Y/A 2025/2026 business tax window (assessment date). */
const BUSINESS_ASSESSMENT_DATE = "2025-04-01";

function parseBusinessInput(formData: FormData): BusinessTaxInput {
  return {
    standardIncome: numberField(formData, "standardIncome"),
    foreignCcyServiceIncome: numberField(formData, "foreignCcyServiceIncome"),
    foreignCcyForeignSourceIncome: numberField(formData, "foreignCcyForeignSourceIncome"),
    bettingGamingIncome: numberField(formData, "bettingGamingIncome"),
    liquorTobaccoIncome: numberField(formData, "liquorTobaccoIncome"),
    investmentAssetGains: numberField(formData, "investmentAssetGains"),
    ordinaryExpenses: numberField(formData, "ordinaryExpenses"),
    foreignCcyServiceExpenses: numberField(formData, "foreignCcyServiceExpenses"),
    foreignCcyForeignSourceExpenses: numberField(formData, "foreignCcyForeignSourceExpenses"),
    bettingGamingExpenses: numberField(formData, "bettingGamingExpenses"),
    liquorTobaccoExpenses: numberField(formData, "liquorTobaccoExpenses"),
    sharedExpenses: numberField(formData, "sharedExpenses"),
  };
}

/** Form action — computes business taxable profit and (where verified) tax. */
export async function calculateBusinessTax(
  _prev: BusinessTaxState,
  formData: FormData
): Promise<BusinessTaxState> {
  const input = parseBusinessInput(formData);
  const errors = validateBusinessTaxInput(input);
  if (errors.length > 0) {
    return { errors };
  }
  const ruleset = getRuleSet(BUSINESS_RULESET_SELECTOR);
  if (!ruleset) {
    return { errors: ["No Business Tax ruleset is configured for tax year 2025/2026."] };
  }
  try {
    const result = calculateBusinessTaxEngine(input, ruleset, BUSINESS_ASSESSMENT_DATE);
    await persistResult({
      type: "BUSINESS",
      taxYear: ruleset.taxYear,
      atDate: BUSINESS_ASSESSMENT_DATE,
      rulesetId: ruleset.id,
      input,
      result,
    });
    return { result };
  } catch (err) {
    return {
      errors: [
        err instanceof Error
          ? err.message
          : "The business tax calculation could not be completed.",
      ],
    };
  }
}

const MAX_FILE_BYTES = 8 * 1024 * 1024;

/**
 * Form action — parse an uploaded CSV/XLSX spreadsheet into headers + rows so
 * the client can preview and map columns before any calculation. The engine
 * never reads the file directly until the user maps and confirms columns.
 */
export async function parseUpload(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "No file provided." };
  }
  if (file.size === 0) {
    return { error: "The uploaded file is empty." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "File is too large (max 8 MB)." };
  }
  const supported = /\.(csv|xlsx|xls)$/i.test(file.name);
  if (!supported) {
    return { error: "Unsupported file type. Upload a CSV or Excel (.xlsx) file." };
  }

  try {
    const buffer = await file.arrayBuffer();
    const parsed = await parseSpreadsheet(buffer, file.name);
    if (parsed.headers.length === 0 || parsed.rows.length === 0) {
      return { error: "The file contains no usable data rows." };
    }
    return { parsed };
  } catch {
    return { error: "The file could not be parsed. Check that it is a valid spreadsheet." };
  }
}
