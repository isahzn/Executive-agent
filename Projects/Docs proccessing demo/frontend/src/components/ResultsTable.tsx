import type { DocumentRecord } from '../api';
import { fileKindOf, KIND_CHIP } from '../lib/format';

interface Props {
  fields: string[];
  documents: DocumentRecord[];
}

export default function ResultsTable({ fields, documents }: Props) {
  const rows = documents.filter((d) => d.result?.status === 'success');

  if (fields.length === 0 || rows.length === 0) return null;

  return (
    <div className="results-block">
      <div className="section-head">
        <h3>Extracted data</h3>
        <span className="section-note">{rows.length} of {documents.length} documents extracted</span>
      </div>
      <div className="table-wrap">
        <table className="doc-table results-table">
          <thead>
            <tr>
              <th>Document</th>
              {fields.map((f) => (
                <th key={f}>{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => {
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
                  {fields.map((f) => (
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
    </div>
  );
}

