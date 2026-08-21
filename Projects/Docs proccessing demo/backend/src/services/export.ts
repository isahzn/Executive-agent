import ExcelJS from 'exceljs';

export interface ExportProject {
  id: number;
  name: string;
  description: string;
  extractionFields: string[];
  visibility: 'public' | 'private';
  ownerUsername: string | null;
  createdAt: string;
  updatedAt: string;
  documentCount: number;
}

export interface ExportDocument {
  filename: string;
  status: string;
  uploadedByUsername: string | null;
  createdAt: string;
  resultStatus: string | null;
  resultData: string | null;
  resultModel: string | null;
  resultError: string | null;
}

const HEADER_FILL = 'FF3056D3';
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 } as const;
const BORDER = {
  top: { style: 'thin' as const, color: { argb: 'FFE3E6EF' } },
  left: { style: 'thin' as const, color: { argb: 'FFE3E6EF' } },
  bottom: { style: 'thin' as const, color: { argb: 'FFE3E6EF' } },
  right: { style: 'thin' as const, color: { argb: 'FFE3E6EF' } },
};

/** Parses a stored extracted_data JSON blob into a string map (shared with routes). */
export function parseResultData(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const obj = parsed as Record<string, unknown>;
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(obj)) out[k] = v == null ? '' : String(v);
      return out;
    }
  } catch {
    // malformed result — treat as empty
  }
  return {};
}

/** Computes a sensible column width from the longest cell (capped). */
function widthFor(cells: (string | number | null | undefined)[]): number {
  let max = 10;
  for (const c of cells) {
    const len = c == null ? 0 : String(c).length;
    if (len > max) max = len;
  }
  return Math.min(max + 2, 42);
}

/**
 * Builds a fully-formatted .xlsx workbook for a project:
 *  - "Extracted data": one row per extracted document, one column per field
 *  - "Overview": project metadata + export info
 *  - "Document log": every document with its status and result metadata
 */
export function buildProjectWorkbook(project: ExportProject, documents: ExportDocument[]): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Doc Processor';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ── Sheet 1: Extracted data ──────────────────────────────────────────
  const extracted = documents.filter((d) => d.resultStatus === 'success');
  const dataSheet = workbook.addWorksheet('Extracted data', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  dataSheet.columns = [
    { header: 'Document', key: 'document', width: 30 },
    ...project.extractionFields.map((f) => ({ header: f, key: f, width: 20 })),
  ];
  dataSheet.getRow(1).font = HEADER_FONT;
  dataSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
  dataSheet.getRow(1).height = 22;

  if (extracted.length === 0) {
    dataSheet.addRow({ document: 'No documents extracted yet.' });
    dataSheet.getCell('A2').font = { italic: true, color: { argb: 'FF9AA0B5' } };
  } else {
    for (const doc of extracted) {
      const data = parseResultData(doc.resultData);
      const row: Record<string, string> = { document: doc.filename };
      for (const f of project.extractionFields) row[f] = data[f] ?? '';
      dataSheet.addRow(row);
    }
  }

  // Style all populated cells: borders + zebra stripes for readability.
  const lastRow = dataSheet.rowCount;
  for (let r = 2; r <= lastRow; r++) {
    const row = dataSheet.getRow(r);
    row.eachCell((cell, col) => {
      cell.border = BORDER;
      if (r % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4F6FC' } };
      }
      if (col === 1) cell.font = { bold: true };
    });
  }

  // Auto-width from actual content.
  for (let c = 1; c <= dataSheet.columnCount; c++) {
    const values: (string | number | null | undefined)[] = [];
    for (let r = 1; r <= dataSheet.rowCount; r++) {
      const v = dataSheet.getRow(r).getCell(c).value;
      values.push(v == null ? null : String(v));
    }
    dataSheet.getColumn(c).width = widthFor(values);
  }
  dataSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: Math.max(lastRow, 1), column: dataSheet.columnCount },
  };

  // ── Sheet 2: Overview ────────────────────────────────────────────────
  const overview = workbook.addWorksheet('Overview');
  const metaRows: [string, string][] = [
    ['Project', project.name],
    ['Description', project.description || '—'],
    ['Visibility', project.visibility === 'public' ? 'Public (company-wide)' : 'Private'],
    ['Owner', project.ownerUsername ?? '—'],
    ['Created', project.createdAt],
    ['Last updated', project.updatedAt],
    ['Documents', String(project.documentCount)],
    ['Extracted documents', String(extracted.length)],
    ['Extraction fields', project.extractionFields.join(', ') || '—'],
    ['Exported at', new Date().toISOString()],
  ];
  overview.columns = [
    { header: 'Field', key: 'field', width: 22 },
    { header: 'Value', key: 'value', width: 60 },
  ];
  overview.getRow(1).font = HEADER_FONT;
  overview.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
  overview.getRow(1).height = 22;
  for (const [field, value] of metaRows) {
    const row = overview.addRow({ field, value });
    row.getCell(1).font = { bold: true };
    row.getCell(1).border = BORDER;
    row.getCell(2).border = BORDER;
  }

  // ── Sheet 3: Document log ────────────────────────────────────────────
  const log = workbook.addWorksheet('Document log', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  log.columns = [
    { header: 'Document', key: 'document', width: 30 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Result', key: 'result', width: 14 },
    { header: 'Uploaded by', key: 'uploadedBy', width: 16 },
    { header: 'Uploaded at', key: 'uploadedAt', width: 22 },
    { header: 'Model', key: 'model', width: 22 },
    { header: 'Error', key: 'error', width: 30 },
  ];
  log.getRow(1).font = HEADER_FONT;
  log.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
  log.getRow(1).height = 22;

  for (const doc of documents) {
    const row: Record<string, string> = {
      document: doc.filename,
      status: doc.status,
      result: doc.resultStatus ?? '—',
      uploadedBy: doc.uploadedByUsername ?? '—',
      uploadedAt: doc.createdAt,
      model: doc.resultModel ?? '—',
      error: doc.resultError ?? '',
    };
    const logRow = log.addRow(row);
    logRow.eachCell((cell) => {
      cell.border = BORDER;
    });
  }

  return workbook;
}

/** Safe attachment filename for the downloaded workbook. */
export function exportFilename(projectName: string): string {
  const safe = projectName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60) || 'project';
  const date = new Date().toISOString().slice(0, 10);
  return `${safe}_results_${date}.xlsx`;
}
