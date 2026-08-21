import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api';

type Mode = 'login' | 'register';

export default function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  // Already signed in? Skip the form.
  if (user) {
    return <Navigate to="/" replace />;
  }

  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(username, password, remember);
      } else {
        await register(username, password);
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again?');
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = () => {
    setUsername('demo');
    setPassword('demo1234');
    setMode('login');
    setError(null);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="40" height="40">
              <rect width="32" height="32" rx="7" fill="var(--primary)" />
              <path d="M9 8.5A2.5 2.5 0 0 1 11.5 6h6l5 5v12.5A2.5 2.5 0 0 1 20 26h-8.5A2.5 2.5 0 0 1 9 23.5z" fill="#fff" />
              <path d="M17.5 6v4.5a1 1 0 0 0 1 1H23z" fill="#99f6e4" />
            </svg>
          </span>
          <h1>Doc Processor</h1>
          <p className="auth-tagline">Upload documents. Extract data with AI. Export to Excel.</p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. demo"
              autoComplete="username"
              required
              minLength={3}
              autoFocus
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />
          </label>

          {mode === 'login' && (
            <label className="checkbox">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Keep me signed in</span>
            </label>
          )}

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? (
              <>
                <span className="spinner spinner-sm" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}
              </>
            ) : mode === 'login' ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <div className="auth-demo">
          <p>
            Demo accounts are pre-created — use <code>demo</code> / <code>demo1234</code>
          </p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={fillDemo}>
            Fill demo credentials
          </button>
        </div>
      </div>
    </div>
  );
}
