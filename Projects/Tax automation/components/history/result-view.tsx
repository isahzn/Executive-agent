import type { SavedCalculation } from "@/lib/database";
import type {
  IndividualIncomeResult,
  VatCalculationResult,
  WithholdingResult as WithholdingResultType,
  BusinessTaxResult as BusinessTaxResultType,
} from "@/lib/tax";
import { TaxResult } from "@/components/tax/individual/result";
import { VatResult } from "@/components/tax/vat/result";
import { WithholdingResult } from "@/components/tax/withholding/result";
import { BusinessTaxResult } from "@/components/tax/business/result";

/**
 * Renders a saved calculation's stored result using the same result component
 * the live calculation used, so reopening shows exactly how it was calculated.
 */
export function HistoryResult({ saved }: { saved: SavedCalculation }) {
  switch (saved.type) {
    case "INDIVIDUAL_INCOME":
      return <TaxResult result={saved.result as IndividualIncomeResult} />;
    case "VAT":
      return <VatResult result={saved.result as VatCalculationResult} />;
    case "WITHHOLDING":
      return <WithholdingResult result={saved.result as WithholdingResultType} />;
    case "BUSINESS":
      return <BusinessTaxResult result={saved.result as BusinessTaxResultType} />;
    default:
      return null;
  }
}
