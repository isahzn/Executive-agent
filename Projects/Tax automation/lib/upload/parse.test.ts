import { describe, it, expect } from "vitest";
import ExcelJS from "exceljs";
import { parseCsv, parseSpreadsheet } from "./parse";

function toBuffer(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer;
}

describe("parseCsv", () => {
  it("handles quoted fields, commas, and blank lines", () => {
    const rows = parseCsv(
      'name,salary\n"Smith, John",2500000\nJane,1800000\n\n'
    );
    expect(rows).toEqual([
      ["name", "salary"],
      ["Smith, John", "2500000"],
      ["Jane", "1800000"],
    ]);
  });

  it("handles escaped quotes", () => {
    const rows = parseCsv('a,b\n"he said ""hi""",3\n');
    expect(rows[1]).toEqual(['he said "hi"', "3"]);
  });
});

describe("parseSpreadsheet", () => {
  it("parses CSV into headers + typed numeric rows", async () => {
    const parsed = await parseSpreadsheet(
      toBuffer("employment,business\n2500000,500000\n"),
      "data.csv"
    );
    expect(parsed.headers).toEqual(["employment", "business"]);
    expect(parsed.rows).toEqual([[2500000, 500000]]);
  });

  it("parses an .xlsx worksheet", async () => {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Income");
    ws.addRow(["employment", "investment"]);
    ws.addRow([3000000, 200000]);
    const buffer = (await wb.xlsx.writeBuffer()) as unknown as Uint8Array;
    const buf = buffer.slice().buffer as ArrayBuffer;

    const parsed = await parseSpreadsheet(buf, "data.xlsx");
    expect(parsed.sheetName).toBe("Income");
    expect(parsed.headers).toEqual(["employment", "investment"]);
    expect(parsed.rows).toEqual([[3000000, 200000]]);
  });

  it("returns empty headers for an empty sheet", async () => {
    const parsed = await parseSpreadsheet(toBuffer("\n"), "empty.csv");
    expect(parsed.rows).toEqual([]);
  });
});
