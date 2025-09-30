# Runbooks

## Local Development

- Prereqs: Node 20+, pnpm, Python 3.10+, Docker
- Install: `pnpm install`
- Infra: `docker compose up -d` (Postgres, Redis, MinIO)
- API:
  - `cd apps/api && cp ../../.env.example .env`
  - `pnpm prisma:migrate:dev`
  - `pnpm dev`
- Web:
  - `cd apps/web && pnpm dev` (http://localhost:3000)
- Parser:
  - `cd services/parser && python -m venv .venv && source .venv/bin/activate`
  - `pip install -r requirements.txt && uvicorn main:app --reload --port 8001`

## Health Checks

- API: http://localhost:4000/api/health and /api/health/db
- Parser: http://localhost:8001/health
- Web: http://localhost:3000/login

## CI Expectations

- Lint: ESLint on web/api
- Typecheck: TypeScript across workspaces
- Build: Next.js, NestJS
- Tests:
  - Unit: Vitest (web)
  - A11y E2E: Playwright + axe on /login

## Common Issues

- Prisma DB URL: ensure .env is present in apps/api with DATABASE_URL
- Playwright: CI installs browsers via `pnpm exec playwright install --with-deps`
- Ports in use: stop previous dev servers or set alternate ports