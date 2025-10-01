# Rapid-CRM

Monorepo for the credit-report audit platform (Next.js + NestJS + FastAPI + Postgres/Redis/S3).

## Getting Started

Prerequisites:
- Node 20+ and pnpm
- Python 3.10+
- Docker (for Postgres, Redis, MinIO)

1) Install deps
- pnpm install

2) Start infra
- docker compose up -d

3) API (NestJS)
- cd apps/api
- cp ../../.env.example .env
- pnpm prisma:generate
- pnpm prisma:migrate:dev
- pnpm dev
- Health: http://localhost:4000/api/health and http://localhost:4000/api/health/db

4) Web (Next.js)
- cd apps/web
- pnpm dev
- Open http://localhost:3000 (redirects to /login)

5) Parser (FastAPI)
- cd services/parser
- python -m venv .venv && source .venv/bin/activate
- pip install -r requirements.txt
- uvicorn main:app --reload --port 8001
- Health: http://localhost:8001/health

## Structure

- apps/web — Next.js 14 app (App Router, Tailwind)
- apps/api — NestJS API with Prisma
- services/parser — FastAPI parser stub
- packages/ui — Shared UI components
- docs — PRD, PRP, TASKS

## Audit UI – Developer Guide

See docs/audit-ui.md for:
- End-to-end data flow (upload → parser → ingestion → /audit)
- Local run and test instructions (unit, a11y, visual, Storybook)
- Accessibility and performance expectations
- Practical task checklist and acceptance criteria

## Next Steps (per TASKS.md)

- Epic 0: add design tokens and auth skeleton; CI a11y gate for /login
- Epic 1: upload flow with S3 (MinIO) signed URLs and validation
- Epic 2: queue ingestion (BullMQ) and parser contract tests
- Epic 3: Simple Audit UI with KPIs, negative items, utilization
- Epic 4: PDFs via Playwright; dispute letters
- Epic 5: security hardening, observability