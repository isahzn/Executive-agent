import { Router } from 'express';
import { getDb } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

/**
 * Real dashboard analytics scoped to the projects the caller can see
 * (public + their own private), like every other read endpoint.
 */
router.get('/', (req, res) => {
  const userId = req.user!.id;
  const db = getDb();

  // Docs across visible projects, with per-status counts.
  const docStats = db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN d.status = 'success' THEN 1 ELSE 0 END) AS extracted,
         SUM(CASE WHEN d.status = 'processing' THEN 1 ELSE 0 END) AS processing,
         SUM(CASE WHEN d.status = 'error' THEN 1 ELSE 0 END) AS failed,
         SUM(CASE WHEN d.created_at >= strftime('%Y-%m-01', 'now') THEN 1 ELSE 0 END) AS uploads_this_month
       FROM documents d
       JOIN projects p ON p.id = d.project_id
       WHERE p.visibility = 'public' OR p.owner_id = ?`,
    )
    .get(userId) as {
    total: number;
    extracted: number;
    processing: number;
    failed: number;
    uploads_this_month: number;
  };

  // Average extraction time (seconds) across successful extractions in visible projects.
  const avgRow = db
    .prepare(
      `SELECT AVG((julianday(r.processed_at) - julianday(r.started_at)) * 86400) AS avg_seconds
       FROM extraction_results r
       JOIN documents d ON d.id = r.document_id
       JOIN projects p ON p.id = d.project_id
       WHERE r.status = 'success' AND r.started_at IS NOT NULL AND r.processed_at IS NOT NULL
         AND (p.visibility = 'public' OR p.owner_id = ?)`,
    )
    .get(userId) as { avg_seconds: number | null };

  const total = Number(docStats.total ?? 0);
  const extracted = Number(docStats.extracted ?? 0);

  res.json({
    analytics: {
      totalDocuments: total,
      extractedDocuments: extracted,
      processingDocuments: Number(docStats.processing ?? 0),
      failedDocuments: Number(docStats.failed ?? 0),
      uploadsThisMonth: Number(docStats.uploads_this_month ?? 0),
      successRate: total > 0 ? Math.round((extracted / total) * 100) : 0,
      avgExtractionSeconds: avgRow.avg_seconds == null ? null : Math.round(avgRow.avg_seconds * 10) / 10,
    },
  });
});

export default router;
