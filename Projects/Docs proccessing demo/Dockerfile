# ── Doc Processor — single-container image ──────────────────────────
# The Express backend serves both the API (/api) and the built React app,
# so one container is enough. Data (SQLite + uploads) lives on a volume.

# ── Stage 1: install deps (cached independently of source changes) ──
# node:22-slim (Debian/glibc) rather than Alpine: better-sqlite3 ships
# reliable prebuilt binaries for glibc, so no native toolchain is needed.
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci

# ── Stage 2: build both workspaces ──────────────────────────────────
FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build backend (tsc → dist) and frontend (vite → dist)
RUN npm run build

# ── Stage 3: production runtime ─────────────────────────────────────
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Production dependencies only (npm ci --omit=dev in the root workspace
# prunes dev deps from the installed tree).
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --omit=dev

# Built artifacts
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/frontend/dist ./frontend/dist

# Runtime data (SQLite DB + uploads) — mount a volume here.
ENV DATA_DIR=/app/data
RUN mkdir -p /app/data/uploads && chown -R node:node /app
USER node

EXPOSE 5000
# Node 22 has fetch built in — no wget/curl needed in the slim image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "backend/dist/index.js"]
