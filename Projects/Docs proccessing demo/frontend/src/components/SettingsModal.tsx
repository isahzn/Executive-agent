import { useEffect, useState, type FormEvent } from 'react';
import { ApiError, settingsApi } from '../api';
import { useCloseOnEscape } from '../lib/useCloseOnEscape';

interface Props {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: Props) {
  useCloseOnEscape(onClose);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [configured, setConfigured] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [testBusy, setTestBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    settingsApi
      .get()
      .then((s) => {
        setConfigured(s.configured);
        setModel(s.model);
      })
      .catch(() => setError('Could not load settings'))
      .finally(() => setLoaded(true));
  }, []);

  const handleTest = async () => {
    setTestBusy(true);
    setTestResult(null);
    try {
      setTestResult(await settingsApi.test());
    } catch (err) {
      setTestResult({ ok: false, message: err instanceof ApiError ? err.message : 'Connection failed' });
    } finally {
      setTestBusy(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await settingsApi.update({
        apiKey,
        model,
      });
      setConfigured(result.configured);
      setModel(result.model);
      setApiKey('');
      setTestResult(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save settings');
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
        aria-label="OpenRouter settings"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>OpenRouter settings</h3>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!loaded ? (
          <div className="modal-body">
            <div className="app-splash-inline">
              <div className="spinner" aria-label="Loading settings" />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="modal-body">
              <p className="settings-intro">
                Extraction uses the <a href="https://openrouter.ai" target="_blank" rel="noreferrer">OpenRouter</a>{' '}
                API. Grab a free key from{' '}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer">
                  openrouter.ai/keys
                </a>
                .
              </p>

              <label className="field">
                <span>API key {configured && <em className="key-status">✓ configured</em>}</span>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={configured ? 'Leave blank to keep the current key' : 'sk-or-v1-…'}
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>

              <label className="field">
                <span>Model</span>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. openai/gpt-4o-mini"
                  spellCheck={false}
                />
                <span className="field-hint">
                  Any OpenRouter model slug, e.g. <code>openai/gpt-4o-mini</code>,{' '}
                  <code>anthropic/claude-sonnet-4</code>
                </span>
              </label>

              <div className="settings-actions">
                <button type="button" className="btn btn-ghost" onClick={handleTest} disabled={testBusy}>
                  {testBusy && <span className="spinner spinner-sm" />}
                  Test connection
                </button>
              </div>

              {testResult && (
                <div className={`alert ${testResult.ok ? 'alert-info' : 'alert-error'}`} role="status">
                  {testResult.message}
                </div>
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
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {busy ? (
                  <>
                    <span className="spinner spinner-sm" /> Saving…
                  </>
                ) : (
                  'Save settings'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
