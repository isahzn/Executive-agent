import { Router } from 'express';
import { deleteSetting, setSetting } from '../services/settings.js';
import { getApiKey, getModel, testConnection, DEFAULT_MODEL } from '../services/openrouter.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/openrouter', (_req, res) => {
  res.json({
    configured: getApiKey().length > 0,
    model: getModel(),
    defaultModel: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
  });
});

router.put('/openrouter', (req, res) => {
  const { apiKey, model } = (req.body ?? {}) as { apiKey?: unknown; model?: unknown };

  if (apiKey !== undefined) {
    if (typeof apiKey !== 'string' || apiKey.length > 1000) {
      res.status(400).json({ error: 'Invalid API key value' });
      return;
    }
    if (apiKey.trim() === '') {
      deleteSetting('openrouter_api_key');
    } else {
      setSetting('openrouter_api_key', apiKey.trim());
    }
  }

  if (model !== undefined) {
    if (typeof model !== 'string' || model.length > 200) {
      res.status(400).json({ error: 'Invalid model value' });
      return;
    }
    if (model.trim() === '') {
      deleteSetting('openrouter_model');
    } else {
      setSetting('openrouter_model', model.trim());
    }
  }

  res.json({ configured: getApiKey().length > 0, model: getModel() });
});

router.post('/openrouter/test', async (_req, res) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    res.status(400).json({ ok: false, message: 'No API key configured yet. Save one first.' });
    return;
  }
  try {
    await testConnection(apiKey);
    res.json({ ok: true, message: 'Connection successful — your API key works.' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Connection failed';
    res.json({ ok: false, message });
  }
});

export default router;
