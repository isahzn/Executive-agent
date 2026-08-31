import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { PersistenceAdapter } from "./adapter";
import type { SavedCalculation, CalculationType } from "./types";

/**
 * A file-backed persistence adapter for local dev and demo use. It persists
 * across restarts without requiring cloud infrastructure or native modules.
 * Production should swap to the Supabase/PostgreSQL adapter (see schema.sql);
 * the caller only ever sees the PersistenceAdapter interface, so the swap is
 * a one-line change in index.ts.
 *
 * The whole list is read into memory and rewritten on each save. That is fine
 * at demo scale; a real database (schema.sql) is the target for any larger use.
 */
export class JsonFileAdapter implements PersistenceAdapter {
  name = "json-file";

  private file: string;
  private cache: SavedCalculation[] | null = null;

  constructor(file: string) {
    this.file = file;
  }

  static newId(): string {
    return randomUUID();
  }

  private async load(): Promise<SavedCalculation[]> {
    if (this.cache) return this.cache;
    try {
      const raw = await readFile(this.file, "utf-8");
      this.cache = (JSON.parse(raw) as SavedCalculation[]) ?? [];
    } catch {
      // No file yet (first run) or corrupt — start empty rather than crash.
      this.cache = [];
    }
    return this.cache;
  }

  private async write(list: SavedCalculation[]): Promise<void> {
    this.cache = list;
    await mkdir(path.dirname(this.file), { recursive: true });
    await writeFile(this.file, JSON.stringify(list, null, 2), "utf-8");
  }

  async save(calc: SavedCalculation): Promise<void> {
    const list = await this.load();
    list.unshift(calc); // most-recent first
    await this.write(list);
  }

  async list(type?: CalculationType): Promise<SavedCalculation[]> {
    const list = await this.load();
    return type ? list.filter((c) => c.type === type) : [...list];
  }

  async get(id: string): Promise<SavedCalculation | null> {
    const list = await this.load();
    return list.find((c) => c.id === id) ?? null;
  }
}
