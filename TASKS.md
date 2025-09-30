# Task Plan (Epics, Stories, Acceptance Criteria)
Option A: Next.js + Tailwind/Radix + NestJS + PostgreSQL + Python Parser

Date: 2025-09-30
Owner: Engineering (L7 Lead)
Status: Draft (v0)

## Epic 0 — Foundations
Stories
- Monorepo scaffolding with pnpm workspaces and Docker Compose (Postgres, Redis, MinIO).
- CI pipelines (lint, typecheck, unit tests, a11y for /login).
- Design tokens & base layout; auth skeleton.

Acceptance Criteria
- Repo builds locally and in CI; all checks pass.
- Base layout renders with tokens; login page accessible (WCAG AA baseline).

Definition of Done (DoD)
- Tests written; CI green; docs updated (README, runbooks).

## Epic 1 — Uploads & Storage
Stories
- Upload form with client/server validation; progress and error feedback.
- Backend endpoint to sign uploads; store in S3 (MinIO locally); random filenames; malware scan hook.
- List uploads per account; object URL generation via signed URLs.

Acceptance Criteria
- Upload succeeds for valid files; rejects invalid types/sizes.
- Files stored with randomized names; visible in account detail; secure access via signed URLs.

DoD
- Unit/integration tests; S3 emulator working locally; observability logs.

## Epic 2 — Parser Service & Ingestion
Stories
- BullMQ job enqueuing on upload; FastAPI worker consumes queue.
- Parsing pipeline: extract scores, tradelines, inquiries, public records, personal info; normalized persistence.
- Vendor fixtures and contract tests.

Acceptance Criteria
- Upload triggers parse; normalized DB populated; raw artifact retained.
- Parser contract tests pass against fixtures; idempotent parsing verified.

DoD
- Parser runbook; error monitoring; metrics for parse latency and success rate.

## Epic 3 — Simple Audit UI
Stories
- KPIs: scores, report date; negative items table; severity/priority; flags (mismatch); reasons.
- Utilization: overall + per-bureau targets; deltas; personal info audit; duplicates.
- UI accessibility and responsive behavior; component library entries.

Acceptance Criteria
- Core audit sections render correctly for parsed data; a11y checks pass; responsive across breakpoints.
- Performance: TTFB ≤ 500ms on cached pages (dev acceptable baseline).

DoD
- Unit tests for compute functions; Storybook entries; a11y CI configured.

## Epic 4 — PDFs & Dispute Letters
Stories
- Playwright PDF generation for audit pages.
- Dispute selection UI; bureau targeting; letter PDF with letterhead; last_dispute persistence.
- Shared PDF footer with brand, page numbers, timestamp.

Acceptance Criteria
- PDFs match HTML layout; no clipped text or low-contrast issues.
- Dispute letters generated with selected items; metadata persisted.

DoD
- E2E tests (Playwright) for PDF routes; a11y checks on printable HTML.

## Epic 5 — Security & Observability
Stories
- Field-level encryption for PII; secrets management; CSP/HSTS; secure cookies.
- OpenTelemetry setup; Prometheus metrics; Sentry error tracking.
- Role-based access (Admin, Analyst), audit logging.

Acceptance Criteria
- Threat model reviewed; a11y and security headers present; encryption verified.
- Dashboards display core KPIs; alerts configured; audit trails in place.

DoD
- Documentation: security runbook; monitoring dashboard references; incident response checklist.

## Backlog (V1.1+)
- Report diff view across versions.
- Vendor import adapters (CSV/JSON).
- Client portal and secure share links.
- ML heuristics for dispute reason suggestions.

## References
- See PRD.md (requirements) and PRP.md (plan/timeline).
- Design system components in /packages/ui and Storybook.
