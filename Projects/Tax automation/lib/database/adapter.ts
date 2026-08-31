import type { SavedCalculation, CalculationType } from "./types";

/**
 * Persistence seam for calculation history. The app currently ships a
 * JSON-file adapter (see json-adapter.ts) that needs no cloud infra; a
 * Supabase/PostgreSQL adapter can be dropped in behind the same interface
 * (schema in ./schema.sql) once credentials exist — no action/UI change.
 */
export interface PersistenceAdapter {
  /** Human-readable name of the backing store, for display/debugging. */
  name: string;
  save(calc: SavedCalculation): Promise<void>;
  /** List saved calculations, most-recent first, optionally filtered by type. */
  list(type?: CalculationType): Promise<SavedCalculation[]>;
  get(id: string): Promise<SavedCalculation | null>;
}
