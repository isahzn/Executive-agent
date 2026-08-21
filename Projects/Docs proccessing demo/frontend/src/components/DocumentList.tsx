import type { DocumentRecord, DocumentStatus, ExtractionResult } from '../api';
import { fileKindOf, formatBytes, KIND_CHIP } from '../lib/format';
import { formatDateTime } from '../lib/time';

export function extractionDuration(result: ExtractionResult | null): string | null {
  if (!result || result.status !== 'success' || !result.startedAt || !result.processedAt) return null;
  const ms = new Date(result.processedAt).getTime() - new Date(result.startedAt).getTime();
  if (Number.isNaN(ms) || ms < 0) return null;
  return `${(ms / 1000).toFixed(1)}s`;
}

function StatusBadge({ status, result }: { status: DocumentStatus; result: ExtractionResult | null }) {
  if (status === 'success') {
    const duration = extractionDuration(result);
    return (
      <span className="status-badge status-success">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Extracted{duration ? ` · ${duration}` : ''}
      </span>
    );
  }
  if (status === 'processing') {
    return (
      <span className="status-badge status-processing">
        <span className="spinner spinner-xs" /> Processing
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="status-badge status-error">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
        Failed
      </span>
    );
  }
  return (
    <span className="status-badge status-pending">
      <span className="dot" /> Pending
    </span>
  );
}

interface Props {
  documents: DocumentRecord[];
  canDelete: (doc: DocumentRecord) => boolean;
  canExtract: (doc: DocumentRecord) => boolean;
  onDelete: (doc: DocumentRecord) => void;
  onExtract: (doc: DocumentRecord) => void;
}

export default function DocumentList({ documents, canDelete, canExtract, onDelete, onExtract }: Props) {
  return (
    <div className="table-wrap">
      <table className="doc-table">
        <thead>
          <tr>
            <th>File</th>
            <th>Size</th>
            <th>Uploaded by</th>
            <th>Uploaded</th>
            <th>Status</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {documents.map((d) => {
            const kind = fileKindOf(d.filename);
            const style = KIND_CHIP[kind];
            return (
              <tr key={d.id}>
                <td>
                  <div className="doc-name-cell">
                    <span className={`kind-chip ${style.cls}`}>{style.label}</span>
                    <span className="doc-name" title={d.filename}>
                      {d.filename}
                    </span>
                  </div>
                </td>
                <td className="doc-muted">{formatBytes(d.sizeBytes)}</td>
                <td className="doc-muted">{d.uploadedByUsername ?? '—'}</td>
                <td className="doc-muted" title={formatDateTime(d.createdAt)}>
                  {formatDateTime(d.createdAt)}
                </td>
                <td>
                  <StatusBadge status={d.status} result={d.result} />
                </td>
                <td>
                  <div className="row-actions">
                    {canExtract(d) && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        title={d.status === 'error' ? 'Retry extraction' : 'Extract data'}
                        aria-label={`${d.status === 'error' ? 'Retry extraction for' : 'Extract data from'} ${d.filename}`}
                        onClick={() => onExtract(d)}
                      >
                        {d.status === 'error' ? 'Retry' : 'Extract'}
                      </button>
                    )}
                    {canDelete(d) && (
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        title="Delete document"
                        aria-label={`Delete ${d.filename}`}
                        onClick={() => onDelete(d)}
                      >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
