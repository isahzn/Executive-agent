# Deploying Doc Processor

The app is a single Node.js process: the Express backend serves both the API
(`/api/*`) and the built React frontend (`frontend/dist`). That means one
container — or one systemd service — is all you need.

---

## 0. Prerequisites

- Node.js **22+** (or Docker)
- Copy `.env.example` → `.env` and fill in at least:
  - `OPENROUTER_API_KEY` — your key (you can also set it in-app under Settings)
  - `JWT_SECRET` — generate with:
    ```sh
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```
- Never commit `.env` (it's gitignored).

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | — | OpenRouter key for AI extraction. In-app Settings value wins. |
| `OPENROUTER_MODEL` | `google/gemini-3.1-flash-lite` | Model slug used for extraction. Gemini/Anthropic models accept PDFs; OpenAI models on OpenRouter reject PDF file inputs. Changeable in-app under Settings. |
| `OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1` | Advanced: point at a proxy/custom gateway. |
| `JWT_SECRET` | dev fallback | Signs session tokens — **must** be set in production. |
| `PORT` | `5000` | Port the backend listens on. |
| `CLIENT_ORIGIN` | `http://localhost:3000` | Allowed CORS origin (only matters for cross-origin dev setups). |
| `DATA_DIR` | `backend/data` | Where the SQLite DB and uploads live. |

---

## 1. Docker (recommended)

### Build & run

```sh
# one-time
docker compose up -d --build

# app is now at http://localhost:8080
docker compose ps
docker compose logs -f app
```

- SQLite DB + uploads are stored in the named volume `docproc-data`, so data
  survives rebuilds and restarts.
- Secrets are read from the root `.env` via `env_file`.
- A healthcheck hits `/api/health` every 30s.

### Manual image build (no compose)

```sh
docker build -t doc-processor .
docker run -d --name doc-processor \
  -p 8080:5000 \
  --env-file .env \
  -v docproc-data:/app/data \
  doc-processor
```

### Updating

```sh
git pull
docker compose up -d --build
```

### Backing up

```sh
# copy the data volume to a tarball
docker run --rm -v docproc-data:/data -v "$PWD":/backup \
  alpine tar czf /backup/docproc-backup-$(date +%F).tar.gz -C /data .
```

---

## 2. Bare metal / VPS (systemd)

### Build

```sh
npm ci
npm run build          # tsc for backend, vite for frontend
```

### Install

```sh
sudo mkdir -p /opt/doc-processor /var/lib/doc-processor
sudo cp -r . /opt/doc-processor        # or clone the repo there
sudo cp .env /opt/doc-processor/.env    # secrets
sudo useradd -r -s /usr/sbin/nologin docproc || true
sudo chown -R docproc:docproc /opt/doc-processor /var/lib/doc-processor
```

Set `DATA_DIR=/var/lib/doc-processor` in `.env` — the systemd unit also sets it
in `Environment=`, which **overrides** `EnvironmentFile` values for that var.

### Enable the service

```sh
sudo cp deploy/doc-processor.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now doc-processor
systemctl status doc-processor
```

### Put it behind nginx on port 80 / HTTPS (optional)

```sh
sudo cp deploy/nginx.conf /etc/nginx/sites-available/doc-processor
sudo ln -s /etc/nginx/sites-available/doc-processor /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
# HTTPS:
sudo certbot --nginx -d your-domain.com
```

Edit `deploy/nginx.conf` first: change `server_name`, and if the service runs
on a different port than 5000, update `proxy_pass`.

---

## 3. Production checklist

- [ ] `JWT_SECRET` is a long random value (not the dev fallback)
- [ ] `OPENROUTER_API_KEY` is set (or will be added via Settings)
- [ ] Data directory is persistent (volume / `DATA_DIR`)
- [ ] Backups are scheduled
- [ ] HTTPS is enabled (certbot + nginx) if exposed publicly
- [ ] Demo accounts are disabled or changed if you don't want them public
      (they're seeded on first run with password `demo1234`)

---

## 4. Troubleshooting

| Symptom | Fix |
|---|---|
| `⚠️ JWT_SECRET is not set` on boot | Set `JWT_SECRET` in `.env` and restart |
| `OpenRouter API key not configured` on extract | Add a key in Settings (gear icon) or `.env`, then retry the document |
| 401 on every API call | Tokens are signed with `JWT_SECRET` — changing it invalidates all sessions |
| Uploads 413 | nginx `client_max_body_size` is too small (see nginx.conf) |
| Uploads rejected | Allowed types: PDF, PNG, JPG, WEBP, DOCX, TXT (max 25MB each) |
