import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError, documentsApi, projectsApi, type DocumentRecord, type Project } from '../api';
import Topbar from '../components/Topbar';
import ProjectIcon, { templateKind } from '../components/ProjectIcon';
import ProjectFormModal from '../components/ProjectFormModal';
import ConfirmModal from '../components/ConfirmModal';
import DropZone from '../components/DropZone';
import DocumentList from '../components/DocumentList';
import ResultsTable from '../components/ResultsTable';
import ExportModal from '../components/ExportModal';
import { formatDateTime, timeAgo } from '../lib/time';

const VALID_NAME = /\.(pdf|png|jpe?g|webp|docx|txt)$/i;

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  state: 'uploading' | 'done' | 'error';
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState<DocumentRecord | null>(null);
  const [docDeleteBusy, setDocDeleteBusy] = useState(false);
  const [extractAllBusy, setExtractAllBusy] = useState(false);

  const loadedOnce = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { project: p } = await projectsApi.get(id!);
      setProject(p);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load this project.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadDocuments = useCallback(async () => {
    try {
      const { documents: list } = await documentsApi.list(id!);
      setDocuments(list);
      loadedOnce.current = true;
    } catch {
      // Project-level error already shown via load()
    } finally {
      setDocsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
    void loadDocuments();
  }, [load, loadDocuments]);

  // Poll while any document is processing
  const processing = documents.some((d) => d.status === 'processing');
  useEffect(() => {
    if (!processing) return;
    const timer = setInterval(() => void loadDocuments(), 1500);
    return () => clearInterval(timer);
  }, [processing, loadDocuments]);

  const handleDelete = async () => {
    if (!project) return;
    setDeleteBusy(true);
    try {
      await projectsApi.remove(project.id);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the project.');
      setDeleting(false);
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleFiles = async (raw: File[]) => {
    if (!project) return;
    const bad = raw.filter((f) => !VALID_NAME.test(f.name));
    if (bad.length > 0) {
      setUploadError(
        `Unsupported file${bad.length > 1 ? 's' : ''}: ${bad
          .map((f) => f.name)
          .join(', ')} — use PDF, PNG, JPG, WEBP, DOCX, or TXT.`,
      );
      return;
    }
    setUploadError(null);
    const files = raw.filter((f) => VALID_NAME.test(f.name));
    const items: UploadItem[] = files.map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      progress: 0,
      state: 'uploading',
    }));
    setUploads((prev) => [...prev, ...items]);

    const results = await Promise.allSettled(
      files.map((f, i) =>
        documentsApi.uploadOne(project.id, f, (loaded, total) => {
          const pct = total > 0 ? Math.round((loaded / total) * 100) : 0;
          const itemId = items[i].id;
          setUploads((prev) => prev.map((u) => (u.id === itemId ? { ...u, progress: pct } : u)));
        }),
      ),
    );

    const resultById = new Map<string, PromiseSettledResult<unknown>>();
    results.forEach((r, i) => resultById.set(items[i].id, r));
    setUploads((prev) =>
      prev.map((u) =>
        u.state === 'uploading' && resultById.has(u.id)
          ? { ...u, state: resultById.get(u.id)!.status === 'fulfilled' ? 'done' : 'error' }
          : u,
      ),
    );
    await loadDocuments();
    await load();
  };

  const handleExtract = useCallback(
    async (doc: DocumentRecord) => {
      setExtractError(null);
      try {
        await documentsApi.extract(doc.id);
        await loadDocuments();
      } catch (err) {
        setExtractError(err instanceof ApiError ? err.message : 'Could not start extraction.');
      }
    },
    [loadDocuments],
  );

  const handleExtractAll = useCallback(async () => {
    if (!project) return;
    setExtractAllBusy(true);
    setExtractError(null);
    try {
      await documentsApi.extractAll(project.id);
      await loadDocuments();
    } catch (err) {
      setExtractError(err instanceof ApiError ? err.message : 'Could not start extraction.');
    } finally {
      setExtractAllBusy(false);
    }
  }, [project, loadDocuments]);

  const handleDeleteDoc = async () => {
    if (!deletingDoc) return;
    setDocDeleteBusy(true);
    try {
      await documentsApi.remove(deletingDoc.id);
      setDeletingDoc(null);
      await loadDocuments();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the document.');
      setDeletingDoc(null);
    } finally {
      setDocDeleteBusy(false);
    }
  };

  const canDeleteDoc = useCallback(
    (d: DocumentRecord) => user?.id === d.uploadedBy || user?.id === project?.ownerId,
    [user, project],
  );

  const canExtract = useCallback(
    (d: DocumentRecord) => d.status === 'pending' || d.status === 'error',
    [],
  );

  if (loading && !loadedOnce.current) {
    return (
      <div className="app-shell">
        <Topbar />
        <main className="page">
          <div className="app-splash-inline">
            <div className="spinner" aria-label="Loading project" />
          </div>
        </main>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="app-shell">
        <Topbar />
        <main className="page">
          <section className="card empty-state">
            <h3>Project not found</h3>
            <p>{error}</p>
            <Link to="/" className="btn btn-ghost">
              Back to dashboard
            </Link>
          </section>
        </main>
      </div>
    );
  }

  if (!project) return null;

  const kind = templateKind(project.templateType);
  const isOwner = user?.id === project.ownerId;
  const pendingCount = documents.filter((d) => d.status === 'pending' || d.status === 'error').length;
  const hasResults = documents.some((d) => d.result?.status === 'success');

  return (
    <div className="app-shell">
      <Topbar
        right={
          <Link to="/" className="btn btn-ghost btn-sm">
            ← Dashboard
          </Link>
        }
      />

      <main className="page">
        <section className="card project-header">
          <div className="project-header-main">
            <ProjectIcon kind={kind} size={56} />
            <div className="project-header-info">
              <h2>{project.name}</h2>
              <div className="project-chips">
                {project.templateType && <span className="chip chip-template">Template</span>}
                <span className={`chip ${project.visibility === 'public' ? 'chip-public' : 'chip-private'}`}>
                  {project.visibility === 'public' ? 'Public' : 'Private'}
                </span>
                <span className="chip chip-neutral">
                  {project.extractionFields.length} field{project.extractionFields.length === 1 ? '' : 's'}
                </span>
                <span className="chip chip-neutral">
                  {project.documentCount} document{project.documentCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>
          <div className="project-header-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setExportOpen(true)}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 10 5 5 5-5" />
                <path d="M12 15V3" />
              </svg>
              Export
            </button>
            {isOwner && (
              <>
                <button type="button" className="btn btn-ghost" onClick={() => setFormOpen(true)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger-ghost" onClick={() => setDeleting(true)}>
                  Delete
                </button>
              </>
            )}
          </div>
        </section>

        {error && (
          <div className="alert alert-error" role="alert" style={{ marginBottom: 'var(--sp-5)' }}>
            {error}
          </div>
        )}

        <section className="card project-meta">
          <h3>About this project</h3>
          <p className="project-meta-desc">{project.description || 'No description.'}</p>
          <div className="project-meta-row">
            <span>
              Created <strong>{formatDateTime(project.createdAt)}</strong>
            </span>
            <span>
              Updated <strong>{timeAgo(project.updatedAt)}</strong>
            </span>
            {project.visibility === 'public' && project.ownerUsername && (
              <span>
                Owner <strong>{project.ownerUsername}</strong>
              </span>
            )}
          </div>
          <h4>Extraction fields</h4>
          <div className="field-chips">
            {project.extractionFields.length === 0 ? (
              <span className="text-faint">No fields defined yet — add some when you edit this project.</span>
            ) : (
              project.extractionFields.map((f) => (
                <span className="field-chip" key={f}>
                  {f}
                </span>
              ))
            )}
          </div>
        </section>

        <section className="card upload-section">
          <div className="section-head">
            <h3>Upload documents</h3>
            <span className="section-note">PDF · images · DOCX — drop to store, then extract</span>
          </div>

          <DropZone onFiles={(files) => void handleFiles(files)} />

          {uploadError && (
            <div className="alert alert-error" role="alert" style={{ marginTop: 'var(--sp-4)' }}>
              {uploadError}
            </div>
          )}

          {uploads.length > 0 && (
            <ul className="upload-queue" aria-label="Upload progress">
              {uploads.map((u) => (
                <li className="upload-item" key={u.id}>
                  {u.state === 'uploading' && (
                    <>
                      <span className="spinner spinner-sm" />
                      <div className="upload-item-main">
                        <span className="upload-item-name">{u.name}</span>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${u.progress}%` }} />
                        </div>
                      </div>
                      <span className="upload-item-pct">{u.progress}%</span>
                    </>
                  )}
                  {u.state === 'done' && (
                    <>
                      <span className="upload-state ok">✓</span>
                      <span className="upload-item-name">{u.name}</span>
                      <span className="upload-item-note">Stored — ready for extraction</span>
                    </>
                  )}
                  {u.state === 'error' && (
                    <>
                      <span className="upload-state err">✗</span>
                      <span className="upload-item-name">{u.name}</span>
                      <span className="upload-item-note">Upload failed</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="section-head" style={{ marginTop: 'var(--sp-6)' }}>
            <h3>Documents ({documents.length})</h3>
            <div className="section-actions">
              {extractError && (
                <span className="alert alert-error inline-alert" role="alert">
                  {extractError}
                </span>
              )}
              {pendingCount > 0 && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void handleExtractAll()}
                  disabled={extractAllBusy || processing}
                >
                  {extractAllBusy || processing ? <span className="spinner spinner-sm" /> : null}
                  Extract all ({pendingCount})
                </button>
              )}
            </div>
          </div>

          {docsLoading ? (
            <div className="app-splash-inline">
              <div className="spinner" aria-label="Loading documents" />
            </div>
          ) : documents.length === 0 ? (
            <div className="docs-empty">
              <p>No documents yet. Drop your first file above — it will appear here.</p>
            </div>
          ) : (
            <DocumentList
              documents={documents}
              canDelete={canDeleteDoc}
              canExtract={canExtract}
              onDelete={setDeletingDoc}
              onExtract={(d) => void handleExtract(d)}
            />
          )}
        </section>

        {project.extractionFields.length > 0 && documents.length > 0 && !hasResults && (
          <section className="card results-empty" aria-label="No extraction results yet">
            <div className="empty-illustration" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
            </div>
            <h3>No extracted data yet</h3>
            <p>
              Uploaded documents are stored and ready. Run extraction to pull values into the results
              table — then export everything to Excel.
            </p>
          </section>
        )}

        <ResultsTable fields={project.extractionFields} documents={documents} />
      </main>

      {exportOpen && project && (
        <ExportModal project={project} documents={documents} onClose={() => setExportOpen(false)} />
      )}

      {formOpen && (
        <ProjectFormModal
          project={project}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            void load();
          }}
        />
      )}

      {deleting && project && (
        <ConfirmModal
          title="Delete project?"
          message={
            <>
              This permanently deletes <strong>{project.name}</strong>, its {project.documentCount} document
              {project.documentCount === 1 ? '' : 's'} and all extracted results. This can't be undone.
            </>
          }
          confirmLabel="Delete"
          busy={deleteBusy}
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleting(false)}
        />
      )}

      {deletingDoc && (
        <ConfirmModal
          title="Delete document?"
          message={
            <>
              Remove <strong>{deletingDoc.filename}</strong> from this project? The file and any extraction
              results will be deleted.
            </>
          }
          confirmLabel="Delete"
          busy={docDeleteBusy}
          onConfirm={() => void handleDeleteDoc()}
          onCancel={() => setDeletingDoc(null)}
        />
      )}
    </div>
  );
}
