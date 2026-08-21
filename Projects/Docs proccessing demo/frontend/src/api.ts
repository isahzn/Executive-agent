const API_BASE = '/api';

export interface User {
  id: number;
  username: string;
}

export type Visibility = 'public' | 'private';

export interface Project {
  id: number;
  name: string;
  description: string;
  extractionFields: string[];
  visibility: Visibility;
  ownerId: number | null;
  ownerUsername: string | null;
  templateType: string | null;
  createdAt: string;
  updatedAt: string;
  documentCount: number;
}

export interface ProjectInput {
  name: string;
  description: string;
  extractionFields: string[];
  visibility: Visibility;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;

  if (!res.ok) {
    throw new ApiError(data.error || 'Something went wrong. Try again?', res.status);
  }
  return data;
}

export const authApi = {
  register: (username: string, password: string) =>
    api<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  login: (username: string, password: string, remember: boolean) =>
    api<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, remember }),
    }),
  me: () => api<{ user: User }>('/auth/me'),
  logout: () => api<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
};

export const projectsApi = {
  list: () => api<{ projects: Project[] }>('/projects'),
  get: (id: number | string) => api<{ project: Project }>(`/projects/${id}`),
  create: (input: ProjectInput) =>
    api<{ project: Project }>('/projects', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: number, input: ProjectInput) =>
    api<{ project: Project }>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  remove: (id: number) => api<{ ok: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
  clone: (id: number) => api<{ project: Project }>(`/projects/${id}/clone`, { method: 'POST' }),
};

export type DocumentStatus = 'pending' | 'processing' | 'success' | 'error';

export interface ExtractionResult {
  status: DocumentStatus;
  extractedData: Record<string, string>;
  model: string | null;
  error: string | null;
  startedAt: string | null;
  processedAt: string | null;
}

export interface DocumentRecord {
  id: number;
  projectId: number;
  filename: string;
  mimeType: string | null;
  sizeBytes: number | null;
  status: DocumentStatus;
  uploadedBy: number | null;
  uploadedByUsername: string | null;
  createdAt: string;
  result: ExtractionResult | null;
}

function uploadOne(
  projectId: number,
  file: File,
  onProgress?: (loaded: number, total: number) => void,
): Promise<{ documents: DocumentRecord[] }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('files', file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/projects/${projectId}/documents`);
    const token = getAuthToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded, e.total);
    };
    xhr.onload = () => {
      let data: { error?: string } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // non-JSON response — fall through to generic error
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as { documents: DocumentRecord[] });
      } else {
        reject(new ApiError(data.error || 'Upload failed', xhr.status));
      }
    };
    xhr.onerror = () => reject(new ApiError('Network error while uploading', 0));
    xhr.send(form);
  });
}

export const documentsApi = {
  uploadOne,
  list: (projectId: number | string) => api<{ documents: DocumentRecord[] }>(`/projects/${projectId}/documents`),
  remove: (id: number) => api<{ ok: boolean }>(`/documents/${id}`, { method: 'DELETE' }),
  extract: (id: number) => api<{ ok: boolean }>(`/documents/${id}/extract`, { method: 'POST' }),
  extractAll: (projectId: number | string) =>
    api<{ ok: boolean; queued: number }>(`/projects/${projectId}/extract-all`, { method: 'POST' }),
};

export const exportApi = {
  /** Fetches the formatted .xlsx workbook for a project as a Blob. */
  async download(projectId: number | string): Promise<{ blob: Blob; filename: string }> {
    const headers = new Headers();
    if (authToken) headers.set('Authorization', `Bearer ${authToken}`);
    const res = await fetch(`${API_BASE}/projects/${projectId}/export`, { headers });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new ApiError(data.error || 'Export failed', res.status);
    }
    const blob = await res.blob();
    // Best-effort: pull the filename out of Content-Disposition.
    const disposition = res.headers.get('Content-Disposition') ?? '';
    const match = /filename="?([^";]+)"?/.exec(disposition);
    const fallback = `project-${projectId}-results.xlsx`;
    return { blob, filename: match?.[1] ? decodeURIComponent(match[1]) : fallback };
  },
};

export interface Analytics {
  totalDocuments: number;
  extractedDocuments: number;
  processingDocuments: number;
  failedDocuments: number;
  uploadsThisMonth: number;
  successRate: number;
  avgExtractionSeconds: number | null;
}

export const analyticsApi = {
  get: () => api<{ analytics: Analytics }>('/analytics'),
};

export const demoApi = {
  /** Seeds sample documents into empty template projects (idempotent). */
  seed: () => api<{ ok: boolean; added: number }>('/demo/seed', { method: 'POST' }),
};

export interface OpenRouterSettings {
  configured: boolean;
  model: string;
}

export const settingsApi = {
  get: () => api<OpenRouterSettings>('/settings/openrouter'),
  update: (input: { apiKey?: string; model?: string }) =>
    api<OpenRouterSettings>('/settings/openrouter', { method: 'PUT', body: JSON.stringify(input) }),
  test: () => api<{ ok: boolean; message: string }>('/settings/openrouter/test', { method: 'POST' }),
};
