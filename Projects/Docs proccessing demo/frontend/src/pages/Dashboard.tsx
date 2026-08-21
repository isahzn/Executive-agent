import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  analyticsApi,
  ApiError,
  demoApi,
  projectsApi,
  type Analytics,
  type Project,
  type Visibility,
} from '../api';
import Topbar from '../components/Topbar';
import ProjectCard from '../components/ProjectCard';
import ProjectFormModal from '../components/ProjectFormModal';
import ConfirmModal from '../components/ConfirmModal';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Visibility>('public');
  const [projects, setProjects] = useState<Project[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [demoBusy, setDemoBusy] = useState(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, analyticsRes] = await Promise.all([projectsApi.list(), analyticsApi.get()]);
      setProjects(listRes.projects);
      setAnalytics(analyticsRes.analytics);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not load projects. Try again?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleLoadDemoData = async () => {
    setDemoBusy(true);
    setDemoMessage(null);
    setActionError(null);
    try {
      const { added } = await demoApi.seed();
      setDemoMessage(
        added > 0
          ? `Loaded ${added} sample document${added === 1 ? '' : 's'} with extraction results.`
          : 'Sample data already loaded — nothing to add.',
      );
      await load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Could not load sample data.');
    } finally {
      setDemoBusy(false);
    }
  };

  const handleClone = async (project: Project) => {
    setActionError(null);
    try {
      await projectsApi.clone(project.id);
      setTab('private');
      await load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Could not duplicate the project.');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await projectsApi.remove(deleting.id);
      setDeleting(null);
      await load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Could not delete the project.');
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const visible = projects.filter((p) => p.visibility === tab);
  const publicCount = projects.filter((p) => p.visibility === 'public').length;
  const privateCount = projects.length - publicCount;
  const totalFields = projects.reduce((sum, p) => sum + p.extractionFields.length, 0);

  return (
    <div className="app-shell">
      <Topbar />

      <main className="page">
        <div className="dashboard-head">
          <div className="hero">
            <h2>Projects</h2>
            <p>
              Pick a project to upload documents and extract data, or create a new extraction workflow.
            </p>
          </div>
          <div className="dashboard-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => void handleLoadDemoData()}
              disabled={demoBusy}
            >
              {demoBusy ? (
                <span className="spinner spinner-sm" />
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v2M5.6 5.6l1.4 1.4M3 12h2M19 12h2M17.4 5.6 16 7M12 17a3 3 0 0 1-3-3c0-1.5 1-2.2 3-4 2 1.8 3 2.5 3 4a3 3 0 0 1-3 3z" />
                </svg>
              )}
              Load sample data
            </button>
            <button type="button" className="btn btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New project
            </button>
          </div>
        </div>

        {demoMessage && (
          <div className="alert alert-info" role="status" style={{ marginBottom: 'var(--sp-5)' }}>
            {demoMessage}
          </div>
        )}

        {loading && !analytics ? (
          <div className="stats-grid" aria-label="Loading stats">
            {[0, 1, 2, 3, 4].map((i) => (
              <div className="stat-card" key={i}>
                <div className="skeleton skeleton-line skeleton-stat" />
                <div className="skeleton skeleton-line skeleton-short" />
              </div>
            ))}
          </div>
        ) : analytics ? (
          <section className="stats-grid" aria-label="Quick stats">
            <div className="stat-card">
              <div className="stat-value">{analytics.totalDocuments}</div>
              <div className="stat-label">Documents processed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{analytics.uploadsThisMonth}</div>
              <div className="stat-label">Uploads this month</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {analytics.avgExtractionSeconds == null ? '—' : `${analytics.avgExtractionSeconds}s`}
              </div>
              <div className="stat-label">Avg. extraction time</div>
            </div>
            <div className="stat-card">
              <div className="stat-value stat-with-bar">
                {analytics.successRate}%
                <span className="mini-progress" aria-hidden="true">
                  <span style={{ width: `${analytics.successRate}%` }} />
                </span>
              </div>
              <div className="stat-label">Extraction success rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalFields}</div>
              <div className="stat-label">Extraction fields</div>
            </div>
          </section>
        ) : null}

        <div className="segmented" role="tablist" aria-label="Project visibility">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'public'}
            className={`segment ${tab === 'public' ? 'active' : ''}`}
            onClick={() => setTab('public')}
          >
            Public <span className="segment-count">{publicCount}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'private'}
            className={`segment ${tab === 'private' ? 'active' : ''}`}
            onClick={() => setTab('private')}
          >
            Private <span className="segment-count">{privateCount}</span>
          </button>
        </div>

        {loadError && (
          <div className="alert alert-error" role="alert">
            {loadError}
          </div>
        )}

        {actionError && (
          <div className="alert alert-error" role="alert">
            {actionError}
          </div>
        )}

        {loading ? (
          <div className="grid-skeleton" aria-label="Loading projects">
            {[0, 1, 2].map((i) => (
              <div className="card skeleton-card" key={i}>
                <div className="skeleton skeleton-tile" />
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line skeleton-short" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <section className="card empty-state">
            <div className="empty-illustration" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M13 3v5h5" />
                <path d="M9 13h6M9 17h6" />
              </svg>
            </div>
            <h3>No {tab} projects yet</h3>
            <p>
              {tab === 'public'
                ? 'Public projects are shared with the whole company. Create one to start a shared extraction workflow.'
                : 'Private projects are only visible to you — perfect for experimenting with a new workflow.'}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => { setEditing(null); setFormOpen(true); }}
            >
              Create your first project
            </button>
          </section>
        ) : (
          <section className="project-grid" aria-label={`${tab} projects`}>
            {visible.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                canEdit={user?.id === p.ownerId}
                onOpen={() => navigate(`/projects/${p.id}`)}
                onEdit={() => { setEditing(p); setFormOpen(true); }}
                onDelete={() => setDeleting(p)}
                onClone={() => void handleClone(p)}
              />
            ))}
          </section>
        )}
      </main>

      {formOpen && (
        <ProjectFormModal
          project={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            void load();
          }}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Delete project?"
          message={
            <>
              This permanently deletes <strong>{deleting.name}</strong> and all of its documents and
              extracted results. This can't be undone.
            </>
          }
          confirmLabel="Delete"
          busy={deleteBusy}
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
