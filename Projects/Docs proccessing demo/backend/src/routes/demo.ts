import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { seedSampleDocumentsIfMissing } from '../db/seed.js';

const router = Router();
router.use(requireAuth);

/**
 * One-click demo data: seeds realistic sample documents (with extraction
 * results) into template projects that don't have any documents yet.
 * Idempotent — safe to press repeatedly; returns how many were added.
 */
router.post('/seed', (_req, res) => {
  const added = seedSampleDocumentsIfMissing();
  res.json({ ok: true, added });
});

export default router;
