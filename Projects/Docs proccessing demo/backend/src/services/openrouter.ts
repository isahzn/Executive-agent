import fs from 'node:fs';
import path from 'node:path';
import mammoth from 'mammoth';
import { getSetting } from './settings.js';

export const DEFAULT_MODEL = 'google/gemini-3.1-flash-lite'; // fast, cheap, accepts PDFs (OpenAI models on OpenRouter reject PDF file inputs)
const REQUEST_TIMEOUT_MS = 150_000;
const MAX_ATTEMPTS = 3;

export class OpenRouterError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'OpenRouterError';
    this.status = status;
  }
}

/** Effective API key: in-app setting wins, env var as fallback. */
export function getApiKey(): string {
  return getSetting('openrouter_api_key') || process.env.OPENROUTER_API_KEY || '';
}

/** Effective model: in-app setting wins, env var, then the default. */
export function getModel(): string {
  return getSetting('openrouter_model') || process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
}

function getBaseUrl(): string {
  return process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1';
}

function isoNow(): string {
  return new Date().toISOString();
}

/** Validates a key by hitting the models endpoint (cheap, no tokens used). */
export async function testConnection(apiKey: string): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(20_000),
  });
  if (res.status === 401) throw new OpenRouterError('Invalid API key', 401);
  if (!res.ok) throw new OpenRouterError(`Connection test failed (HTTP ${res.status})`, res.status);
}

interface ExtractInput {
  filePath: string;
  filename: string;
  mimeType: string | null;
  fields: string[];
  apiKey: string;
  model: string;
}

function toDataUrl(filePath: string, mimeType: string): string {
  const base64 = fs.readFileSync(filePath).toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

function buildFieldPrompt(fields: string[]): string {
  if (fields.length === 0) {
    return 'Extract all meaningful data fields from this document and return them as a JSON object with descriptive keys.';
  }
  const list = fields.map((f) => `"${f}"`).join('\n');
  return `Extract the following fields from the document and return them as a JSON object with EXACTLY these keys:\n${list}\n\nRules:\n- Use the exact key names listed above (spaces and case as written).\n- If a value is not present in the document, use an empty string "" — never invent data.\n- Values must be plain strings (numbers/dates formatted as text).`;
}

const SYSTEM_PROMPT =
  'You are a precise document data extraction engine. Read the provided document carefully and return ONLY a single valid JSON object — no markdown fences, no commentary, no trailing text.';

async function buildContent(input: ExtractInput): Promise<{ type: string; [k: string]: unknown }[]> {
  const ext = path.extname(input.filename).toLowerCase();

  if (ext === '.txt') {
    return [{ type: 'text', text: fs.readFileSync(input.filePath, 'utf8') }];
  }

  if (ext === '.docx') {
    const { value } = await mammoth.extractRawText({ path: input.filePath });
    return [{ type: 'text', text: value }];
  }

  const mime = input.mimeType ?? 'application/octet-stream';
  const dataUrl = toDataUrl(input.filePath, mime);

  if (mime.startsWith('image/')) {
    return [{ type: 'image_url', image_url: { url: dataUrl } }];
  }

  // PDF — prefer a native file block; fall back to image_url if the model rejects it.
  return [{ type: 'file', file: { data: dataUrl, mime_type: 'application/pdf' } }];
}

interface CompletionResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

async function chatCompletion(apiKey: string, body: unknown): Promise<CompletionResponse> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 2000 * attempt));
    try {
      const res = await fetch(`${getBaseUrl()}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      const data = (await res.json().catch(() => ({}))) as CompletionResponse;

      if (res.status === 401) throw new OpenRouterError('Invalid OpenRouter API key. Check it in Settings.', 401);
      if (res.status === 429 || res.status >= 500) {
        lastError = data.error?.message ?? `OpenRouter server error (HTTP ${res.status})`;
        continue; // retry with backoff
      }
      if (!res.ok) {
        throw new OpenRouterError(
          data.error?.message ? `OpenRouter: ${data.error.message}` : `OpenRouter request failed (HTTP ${res.status})`,
          res.status,
        );
      }
      return data;
    } catch (err) {
      if (err instanceof OpenRouterError && err.status !== 429) throw err;
      lastError = err;
    }
  }
  throw new OpenRouterError(
    lastError instanceof Error ? `OpenRouter request failed: ${lastError.message}` : 'OpenRouter request failed',
  );
}

function parseJsonResponse(text: string, fields: string[]): Record<string, string> {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');

  let parsed: unknown;
  if (cleaned.startsWith('[')) {
    // Array response (e.g. one object per line item). Parse the whole array —
    // slicing on {} would cut the array brackets off and produce invalid JSON.
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = null;
    }
  } else {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        parsed = JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        parsed = null;
      }
    } else {
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = null;
      }
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new OpenRouterError('The model did not return a JSON object.');
  }

  if (Array.isArray(parsed)) {
    // Some models return an array of objects (one per line item) when the
    // fields look line-item-like. Merge them into a single row: for each
    // field, join the distinct values in order with " | " (so a repeated
    // invoice number appears exactly once).
    const seen: Record<string, Set<string>> = {};
    for (const item of parsed) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
      for (const key of fields) {
        const raw = (item as Record<string, unknown>)[key];
        if (raw == null || String(raw).trim() === '') continue;
        (seen[key] ??= new Set()).add(String(raw));
      }
    }
    const merged: Record<string, string> = {};
    for (const key of fields) {
      merged[key] = seen[key] ? [...seen[key]].join(' | ') : '';
    }
    return merged;
  }

  const obj = parsed as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const key of fields) {
    const value = obj[key];
    result[key] = value == null ? '' : String(value);
  }
  return result;
}

/** Runs a full extraction for one document. Returns field → value map. */
export async function extractWithOpenRouter(input: ExtractInput): Promise<Record<string, string>> {
  const content = await buildContent(input);
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: [{ type: 'text', text: buildFieldPrompt(input.fields) }, ...content] },
  ];

  const body = {
    model: input.model,
    messages,
    temperature: 0,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  };

  try {
    const data = await chatCompletion(input.apiKey, body);
    const text = data.choices?.[0]?.message?.content ?? '';
    if (!text) throw new OpenRouterError('The model returned an empty response.');
    return parseJsonResponse(text, input.fields);
  } catch (err) {
    // PDFs sent as file blocks aren't supported by every model/provider — OpenAI
    // rejects them outright, and Anthropic uses a different file schema. Retry as
    // an image whenever the failure is a content/provider rejection (400/404 or
    // an unstamped error), never on auth (401/403), rate-limit (429), or server
    // (5xx) failures. Most providers accept a PDF in an image_url part.
    const status = err instanceof OpenRouterError ? err.status : undefined;
    if (status === undefined || status === 400 || status === 404) {
      const dataUrl = toDataUrl(input.filePath, input.mimeType ?? 'application/pdf');
      const retryContent = [{ type: 'image_url', image_url: { url: dataUrl } }];
      const retryBody = {
        ...body,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: [{ type: 'text', text: buildFieldPrompt(input.fields) }, ...retryContent] },
        ],
      };
      const data = await chatCompletion(input.apiKey, retryBody);
      const text = data.choices?.[0]?.message?.content ?? '';
      if (!text) throw new OpenRouterError('The model returned an empty response.');
      return parseJsonResponse(text, input.fields);
    }
    throw err;
  }
}

export { isoNow };
