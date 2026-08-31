import type { TaxType } from "../tax/types";

/** The kind of calculation saved to history (matches the engine's tax type). */
export type CalculationType = TaxType;

/**
 * One persisted calculation (Phase 1 §5). The engine is the single source of
 * truth; this is a durable snapshot of what it computed, so a past result can
 * be reopened with its exact inputs, applied rule version and audit trail.
 * `user` is a stable label today because auth/roles are a later phase.
 */
export interface SavedCalculation {
  id: string;
  type: CalculationType;
  taxYear: string;
  /** The assessment/transaction date the calculation was run at (ISO). */
  atDate: string;
  /** The versioned ruleset id applied — the "applied rule version". */
  rulesetId: string;
  /** The calculator input payload (JSON-safe). */
  input: unknown;
  /** The calculator result payload (JSON-safe, includes the audit trail). */
  result: unknown;
  /** Stable local user label (no auth yet — see roadmap Phase 1 §5). */
  user: string;
  /** ISO timestamp the calculation was completed. */
  createdAt: string;
}
