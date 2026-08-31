import { JsonFileAdapter } from "./json-adapter";
import type { PersistenceAdapter } from "./adapter";

/**
 * The ongoing default dev store is a JSON file in the repo's `data/` directory.
 * To use a real database, swap this one line for a Supabase/PostgreSQL adapter
 * implementing PersistenceAdapter (see ./schema.sql). Set
 * CALCULATIONS_DATA_FILE to relocate the dev file.
 */
const DEV_FILE = process.env.CALCULATIONS_DATA_FILE ?? "data/calculations.json";

let adapter: PersistenceAdapter | null = null;

/** Returns the app's persistence adapter (lazily initialised, cached). */
export function getPersistence(): PersistenceAdapter {
  if (!adapter) {
    adapter = new JsonFileAdapter(DEV_FILE);
  }
  return adapter;
}

export type { PersistenceAdapter } from "./adapter";
export type { SavedCalculation, CalculationType } from "./types";
