import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi, setAuthToken, type User } from '../api';

const TOKEN_STORAGE_KEY = 'docproc.token';

interface AuthContextValue {
  user: User | null;
  /** True while we restore the session from storage on first load. */
  loading: boolean;
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY) ?? sessionStorage.getItem(TOKEN_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = readToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setAuthToken(token);
    authApi
      .me()
      .then(({ user: u }) => setUser(u))
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        setAuthToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const storeSession = useCallback((token: string, remember: boolean) => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    (remember ? localStorage : sessionStorage).setItem(TOKEN_STORAGE_KEY, token);
    setAuthToken(token);
  }, []);

  const login = useCallback(
    async (username: string, password: string, remember: boolean) => {
      const { token, user: u } = await authApi.login(username, password, remember);
      storeSession(token, remember);
      setUser(u);
    },
    [storeSession],
  );

  const register = useCallback(
    async (username: string, password: string) => {
      const { token, user: u } = await authApi.register(username, password);
      storeSession(token, true);
      setUser(u);
    },
    [storeSession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Token is discarded locally regardless.
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
