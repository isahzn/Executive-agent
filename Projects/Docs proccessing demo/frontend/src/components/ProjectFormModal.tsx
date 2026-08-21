import { useState, type FormEvent } from 'react';
import { ApiError, projectsApi, type Project, type Visibility } from '../api';
import { useCloseOnEscape } from '../lib/useCloseOnEscape';

interface Props {
  /** The project being edited, or null to create a new one. */
  project: Project | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProjectFormModal({ project, onClose, onSaved }: Props) {
  useCloseOnEscape(onClose);
  const isEdit = project !== null;
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [fieldsText, setFieldsText] = useState(project?.extractionFields.join('\n') ?? '');
  const [visibility, setVisibility] = useState<Visibility>(project?.visibility ?? 'public');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Give your project a name');
      return;
    }
    setBusy(true);
    setError(null);
    const fields = fieldsText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);
    try {
      if (isEdit) {
        await projectsApi.update(project.id, {
          name: name.trim(),
          description: description.trim(),
          extractionFields: fields,
          visibility,
        });
      } else {
        await projectsApi.create({
          name: name.trim(),
          description: description.trim(),
          extractionFields: fields,
          visibility,
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again?');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit project' : 'New project'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{isEdit ? 'Edit project' : 'New project'}</h3>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label className="field">
              <span>Project name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vendor Invoice Processing"
                autoFocus
                required
              />
            </label>

            <label className="field">
              <span>Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What kind of documents will you process here?"
              />
            </label>

            <label className="field">
              <span>Extraction fields</span>
              <textarea
                className="field-monospace"
                value={fieldsText}
                onChange={(e) => setFieldsText(e.target.value)}
                placeholder={'Invoice number\nVendor name\nTotal amount\nDue date'}
                spellCheck={false}
              />
              <span className="field-hint">One field per line. These become the columns in your results table and Excel export.</span>
            </label>

            <div className="field">
              <span>Visibility</span>
              <div className="radio-cards">
                <label className={`radio-card ${visibility === 'public' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={() => setVisibility('public')}
                  />
                  <span className="radio-card-title">Public</span>
                  <span className="radio-card-desc">Visible to everyone in the company</span>
                </label>
                <label className={`radio-card ${visibility === 'private' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={() => setVisibility('private')}
                  />
                  <span className="radio-card-title">Private</span>
                  <span className="radio-card-desc">Only you can see and edit it</span>
                </label>
              </div>
            </div>

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
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? (
                <>
                  <span className="spinner spinner-sm" /> Saving…
                </>
              ) : isEdit ? (
                'Save changes'
              ) : (
                'Create project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
