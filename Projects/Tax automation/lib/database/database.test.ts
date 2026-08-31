import { describe, it, expect, afterEach } from "vitest";
import { rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { JsonFileAdapter } from "./json-adapter";
import type { SavedCalculation } from "./types";

const tmpFiles: string[] = [];

function tmpFile(): string {
  const p = path.join(os.tmpdir(), `calc-store-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  tmpFiles.push(p);
  return p;
}

afterEach(async () => {
  await Promise.all(tmpFiles.splice(0).map((f) => rm(f, { force: true })));
});

function makeCalc(overrides: Partial<SavedCalculation> = {}): SavedCalculation {
  return {
    id: "c-1",
    type: "BUSINESS",
    taxYear: "2025/2026",
    atDate: "2025-04-01",
    rulesetId: "LK-business-2025-26",
    input: { standardIncome: 1_000_000 },
    result: { totalTax: 150_000, audit: [{ label: "Total tax", amount: 150_000 }] },
    user: "local",
    createdAt: "2025-08-31T10:00:00.000Z",
    ...overrides,
  };
}

describe("JsonFileAdapter (calculation history persistence)", () => {
  it("saves and lists most-recent first", async () => {
    const a = new JsonFileAdapter(tmpFile());
    await a.save(makeCalc({ id: "c-2", createdAt: "2025-08-31T11:00:00.000Z" }));
    await a.save(makeCalc({ id: "c-1", createdAt: "2025-08-31T10:00:00.000Z" }));
    const list = await a.list();
    expect(list.map((c) => c.id)).toEqual(["c-1", "c-2"]);
  });

  it("filters by calculation type", async () => {
    const a = new JsonFileAdapter(tmpFile());
    await a.save(makeCalc({ id: "b1", type: "BUSINESS" }));
    await a.save(makeCalc({ id: "v1", type: "VAT" }));
    expect((await a.list("VAT")).map((c) => c.id)).toEqual(["v1"]);
    expect((await a.list("BUSINESS")).map((c) => c.id)).toEqual(["b1"]);
  });

  it("gets a saved calculation by id, preserving input/result/rulesetId", async () => {
    const a = new JsonFileAdapter(tmpFile());
    await a.save(makeCalc());
    const got = await a.get("c-1");
    expect(got).not.toBeNull();
    expect(got?.rulesetId).toBe("LK-business-2025-26");
    expect(got?.result).toMatchObject({ totalTax: 150_000 });
    expect(got?.input).toMatchObject({ standardIncome: 1_000_000 });
  });

  it("returns null for a missing id and an empty list for a fresh store", async () => {
    const a = new JsonFileAdapter(tmpFile());
    expect(await a.get("nope")).toBeNull();
    expect(await a.list()).toEqual([]);
  });

  it("persists across adapter instances (reload from disk)", async () => {
    const file = tmpFile();
    await new JsonFileAdapter(file).save(makeCalc());
    // A fresh instance must read the on-disk data — the reopen path.
    const reloaded = await new JsonFileAdapter(file).get("c-1");
    expect(reloaded?.taxYear).toBe("2025/2026");
    expect(reloaded?.result).toMatchObject({ totalTax: 150_000 });
  });
});
