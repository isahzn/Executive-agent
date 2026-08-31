import type { AuditStep } from "../types";

/** Build the ordered audit trail of a calculation — the AI-free explanation. */
export function buildAudit(stepLabels: Array<{ label: string; amount: number; detail?: string }>): AuditStep[] {
  return stepLabels.map((s) => ({ label: s.label, amount: s.amount, detail: s.detail }));
}
