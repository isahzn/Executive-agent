import { useState } from 'react';
import { ApiError, exportApi, type DocumentRecord, type Project } from '../api';
import { fileKindOf, KIND_CHIP } from '../lib/format';
import { useCloseOnEscape } from '../lib/useCloseOnEscape';

interface Props {
  project: Project;
  documents: DocumentRecord[];
  onClose: () => void;
}

export default function ExportModal({ project, documents, onClose }: Props) {
  useCloseOnEscape(onClose);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rows = documents.filter((d) => d.result?.status === 'success');
  const previewRows = rows.slice(0, 10);
  const hiddenCount = rows.length - previewRows.length;

  const handleDownload = async () => {
    setBusy(true);
    setError(null);
    try {
      const { blob, filename } = await exportApi.download(project.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Delay the revoke — a synchronous one can cancel the download in some browsers.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not export the workbook.');
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal modal-export"
        role="dialog"
        aria-modal="true"
        aria-label="Export to Excel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Export to Excel</h3>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <p className="export-summary">
            <strong>{project.name}</strong> — {rows.length} of {documents.length} document
            {documents.length === 1 ? '' : 's'} extracted.
            <br />
            <span className="text-faint">
              The workbook includes an <em>Extracted data</em> sheet, an <em>Overview</em> sheet, and a{' '}
              <em>Document log</em> — with styled headers and auto-sized columns.
            </span>
          </p>

          {rows.length === 0 ? (
            <div className="export-empty">
              <p>No extracted data yet — run extraction on your documents first.</p>
            </div>
          ) : (
            <div className="table-wrap export-preview">
              <table className="doc-table results-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    {project.extractionFields.map((f) => (
                      <th key={f}>{f}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((d) => {
                    const kind = fileKindOf(d.filename);
                    return (
                      <tr key={d.id}>
                        <td>
                          <div className="doc-name-cell">
                            <span className={`kind-chip ${KIND_CHIP[kind].cls}`}>{KIND_CHIP[kind].label}</span>
                            <span className="doc-name" title={d.filename}>
                              {d.filename}
                            </span>
                          </div>
                        </td>
                        {project.extractionFields.map((f) => (
                          <td key={f} className="result-cell">
                            {d.result?.extractedData[f] || <span className="result-empty">—</span>}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {hiddenCount > 0 && (
            <p className="export-more">
              …and {hiddenCount} more row{hiddenCount === 1 ? '' : 's'} will be included in the file.
            </p>
          )}

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void handleDownload()} disabled={busy}>
            {busy ? (
              <>
                <span className="spinner spinner-sm" /> Preparing…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M12 15V3" />
                </svg>
                Download .xlsx
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
