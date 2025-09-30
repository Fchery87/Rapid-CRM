# Product/Project Plan (PRP)
Option A: Next.js + Tailwind/Radix + NestJS + PostgreSQL + Python Parser

Date: 2025-09-30
Owner: Engineering (L7 Lead)
Status: Draft (v0)

## 1. Architecture Decisions
- Frontend: Next.js 14 (App Router), React 18, Tailwind CSS, Radix UI, shadcn/ui.
- Backend: NestJS (REST/OpenAPI), PostgreSQL, Prisma ORM, BullMQ + Redis for jobs.
- Parser microservice: Python FastAPI (BeautifulSoup/lxml; pandas), HTTP + queue worker.
- PDFs: Playwright rendering SSR pages (audit, letter).
- Storage: S3 (raw artifacts), CDN for static assets.
- Observability: OpenTelemetry, JSON logs, Prometheus metrics, Sentry.
- Security: Field-level encryption (pgcrypto or app-level AES), CSP/HSTS, secure cookies.

## 2. Repo Layout (Monorepo)
- /apps/web (Next.js)
- /apps/api (NestJS)
- /services/parser (FastAPI)
- /packages/ui (design system components)
- /infra (IaC: Terraform, GitHub Actions workflows)
- /docs (PRD, PRP, ADRs, runbooks)

Use pnpm workspaces; Docker Compose for local dev (db, redis, minio/S3).

## 3. Environments
- Dev: Docker Compose; MinIO for S3; local Redis/Postgres.
- Staging: Cloud-hosted, mirrors prod; test data.
- Prod: Managed Postgres/Redis/S3; CDN; autoscaled workers.

## 4. Data & Migrations
- Prisma migrations with code review gates.
- Entities: CreditReport, BureauReport, Tradeline, Inquiry, PublicRecord, PersonalInfo, DisputeSelection, DisputeLetter, Account, User.
- Snapshots: raw HTML/PDF per version; diff view built on normalized tables.

## 5. CI/CD
- Pipelines: lint, typecheck, unit/integration tests, a11y gates, E2E (Playwright), SBOM.
- Branching: trunk-based with short-lived feature branches; protected main.
- Releases: tags + changelog; automated deploy to staging; gated prod release.

## 6. Security Plan
- Secrets in KMS/Vault; no plaintext in code.
- Field-level encryption: SSN last4, addresses, emails; per-tenant key if needed.
- CSP/HSTS; secure, sameSite cookies; CSRF where applicable.
- Malware scanning for uploads; signed URLs for object storage access.
- Audit logging of access and modifications.

## 7. Observability Plan
- OpenTelemetry traces across web/api/parser.
- Sentry for error monitoring; alerting via PagerDuty/Email.
- Dashboards: parse latency, audit SLA, PDF generation success, queue backlogs.

## 8. Milestones & Timeline (6 Weeks)
Week 1: Foundations
- Monorepo scaffolding (pnpm workspaces).
- Docker Compose (Postgres, Redis, MinIO).
- CI pipelines; lint/typecheck/tests; a11y gate for /login.
- Basic design tokens and base layout; auth skeleton (sessions/JWT).

Week 2: Ingestion & Parser
- Upload UI; server-side validation; store in S3.
- NestJS job queue; FastAPI parser service; normalized persistence.
- Vendor fixtures and parser contract tests.

Week 3: Simple Audit MVP
- Audit UI with KPIs, negative items, utilization, personal info audit.
- Duplicates detection; severity/priority heuristics.
- Observability wired; initial SLO dashboards.

Week 4: PDFs & Disputes
- Playwright PDF for audit; professional letterhead.
- Dispute selection UI; bureau targeting; letter PDF.
- Persist dispute metadata.

Week 5: Hardening
- A11y passes; performance tuning; caching.
- Security hardening (CSP/HSTS; PII encryption).
- E2E tests for core flows; data diff view (V1.1 stub).

Week 6: Release Readiness
- Docs/runbooks; support model; error budgets.
- Staging soak; prod go/no-go checklist; rollback plan validated.

## 9. Staffing & Estimates
- L7 Eng Lead (you), 1–2 senior full-stack, 1 FE engineer, 1 BE engineer, 1 QA/a11y specialist (part-time), 1 DevOps (part-time).
- Effort: ~6 weeks for V1; V1.1 adds diffing and vendor adapter.

## 10. Risks & Mitigations
- Parser variability → robust fixtures, layered heuristics, quick adapter system.
- PDF fidelity → Playwright rendering of SSR pages; template QA.
- Security posture → early hardening, encryption, threat model review.

## 11. Go/No-Go Checklist
- All acceptance criteria met (see PRD).
- A11y gate: 0 critical violations on core pages.
- Observability dashboards in place; alerts configured.
- Security review complete; secrets rotated; CSP/HSTS enforced.
- Rollback rehearsed; backups validated.

## 12. Rollback & Recovery
- Blue/green deploy for API/web.
- Queue draining; replayable ingestion events.
- DB migrations reversible; snapshot backups; restore runbook.

