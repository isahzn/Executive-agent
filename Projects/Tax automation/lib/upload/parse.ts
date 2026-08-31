import ExcelJS from "exceljs";

export type CellValue = string | number | null;
export type ParsedSheet = {
  filename: string;
  sheetName: string;
  headers: string[];
  rows: CellValue[][];
};

/** Minimal CSV parser: handles quoted fields, escaped quotes, CRLF/LF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else if (ch === "\r") {
      // ignore; handled by the following \n
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Drop fully-empty trailing rows.
  return rows.filter((r) => r.some((c) => String(c).trim() !== ""));
}

function toCell(value: unknown): CellValue {
  if (value == null) return null;
  if (typeof value === "number") return value;
  const s = String(value).trim();
  if (s === "") return null;
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

function firstSheetName(ws: ExcelJS.Worksheet): string {
  return ws.name || "Sheet1";
}

/** Parse an uploaded spreadsheet buffer into headers + rows (first non-blank row = header). */
export async function parseSpreadsheet(
  buffer: ArrayBuffer,
  filename: string
): Promise<ParsedSheet> {
  const isXlsx = /\.xlsx$/i.test(filename) || /\.xls$/i.test(filename);
  if (isXlsx) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const ws = wb.worksheets[0];
    if (!ws) {
      return { filename, sheetName: "", headers: [], rows: [] };
    }
    const matrix: CellValue[][] = [];
    ws.eachRow({ includeEmpty: false }, (row) => {
      matrix.push(Array.from(row.values as CellValue[]).slice(1).map(toCell));
    });
    return normalize(matrix, filename, firstSheetName(ws));
  }

  const text = new TextDecoder().decode(buffer);
  const matrix = parseCsv(text).map((r) => r.map(toCell));
  return normalize(matrix, filename, "CSV");
}

/** Treat the first row as headers and align rows to that header count. */
function normalize(
  matrix: CellValue[][],
  filename: string,
  sheetName: string
): ParsedSheet {
  if (matrix.length === 0) {
    return { filename, sheetName, headers: [], rows: [] };
  }
  const headers = matrix[0].map((h, i) =>
    h != null && String(h).trim() !== "" ? String(h).trim() : `Column ${i + 1}`
  );
  const maxCols = headers.length;
  const rows = matrix.slice(1).map((r) => {
    const padded = r.slice(0, maxCols);
    while (padded.length < maxCols) padded.push(null);
    return padded;
  });
  return { filename, sheetName, headers, rows };
}
