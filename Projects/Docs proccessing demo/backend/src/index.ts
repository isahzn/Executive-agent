import './env.js';
import express from 'express';
import cors from 'cors';
import type { ErrorRequestHandler } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import documentsRoutes from './routes/documents.js';
import settingsRoutes from './routes/settings.js';
import analyticsRoutes from './routes/analytics.js';
import demoRoutes from './routes/demo.js';
import { seedDemoUsers, seedSampleData, seedTemplateProjects } from './db/seed.js';
import { resetStuckDocuments } from './services/extraction.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT ?? 5000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:3000';

if (!process.env.JWT_SECRET) {
  console.warn(
    '⚠️  JWT_SECRET is not set — using an insecure dev fallback. Set it in .env before deploying.',
  );
}
if (!process.env.OPENROUTER_API_KEY) {
  console.warn(
    'ℹ️  OPENROUTER_API_KEY is not set — extraction will fail until a key is added in Settings or .env.',
  );
}

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '25mb' }));

// Health check for the demo / uptime monitors
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'doc-processor-backend', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api', documentsRoutes);

// ── Production: serve the built React app ───────────────────────────
const distDir = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(distDir));

// Unknown API routes → JSON 404 (never the SPA HTML)
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// SPA fallback for any other GET
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Frontend not built. Run `npm run dev` or `npm run build`.');
    }
  });
});

// Friendly error handler — never leak stack traces or internals to the client.
// Messages from errors with an explicit 4xx status are safe to surface;
// anything 5xx gets the generic message.
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const raw = err as { status?: unknown; message?: unknown };
  const status = typeof raw?.status === 'number' ? raw.status : 500;
  if (status >= 500) {
    console.error('[error]', err);
    res.status(status).json({ error: 'Something went wrong. Try again?' });
    return;
  }
  res.status(status).json({
    error: typeof raw?.message === 'string' ? raw.message : 'Something went wrong. Try again?',
  });
};
app.use(errorHandler);

seedDemoUsers();
seedTemplateProjects();
seedSampleData();
resetStuckDocuments();

app.listen(PORT, () => {
  console.log(`⚡ Backend listening on http://localhost:${PORT}`);
});
