# Audit UI – Developer Guide

This guide explains how the Audit UI works end-to-end, how to run and test it locally, our accessibility and performance expectations, and a practical action plan you can use to assign/track work.

## Overview and Data Flow

The Audit UI renders normalized credit report data that flows through the system:

1) Upload
- The user uploads a credit report (HTML/ZIP) via the Web app (/upload).
- The API generates a pre-signed S3 URL, stores Upload metadata, and the browser PUTs the file.

2) Confirm → Parse job
- The client calls POST /api/uploads/confirm with the object key.
- The API enqueues a “parse” BullMQ job with (accountId, objectKey, downloadUrl).

3) Parser service
- The ingestion worker calls Parser (/parse-from-url).
- Parser returns a normalized payload:
  - bureaus, personalInfo, tradelines (with reportedBureaus), inquiries, publicRecords.

4) Normalized persistence
- The ingestion worker upserts a CreditReport and replaces the child records (BureauReport, PersonalInfo, Tradeline, Inquiry, PublicRecord).

5) Audit API → UI
- The Audit API (/api/audit/:id) aggregates and computes KPIs:
  - Scores, counts, utilization (overall/per-bureau), negative items, personal info issues, duplicates.
- The Web app loads /audit/:id and renders KPIs, tables, and lists with accessible semantics.

Notes:
- Request correlation: the web sends X-Request-ID which the API echoes back; use this for troubleshooting in logs/metrics.

## Run Locally

Prereqs: Node 20+, pnpm, Python 3.10+, Docker

1) Install deps
- pnpm install

2) Start infra
- docker compose up -d

3) API
- pnpm --filter @rapid/api prisma:migrate:dev
- pnpm --filter @rapid/api seed
- pnpm --filter @rapid/api dev
- Health: http://localhost:4000/api/health

4) Parser service
- cd services/parser
- pip install -r requirements.txt
- uvicorn services.parser.main:app --port 8001

5) Web
- pnpm --filter @rapid/web dev
- http://localhost:3000/reports and /audit/:id

## Tests – How to run

- Unit tests (workspace-wide)
  - pnpm -w test

- API unit test for AuditService compute logic
  - pnpm --filter @rapid/api test:audit:unit

- A11y E2E tests (Playwright + axe)
  - cd apps/web
  - pnpm exec playwright install --with-deps
  - pnpm test:e2e

- Visual/responsive snapshots (local-only; skipped in CI)
  - cd apps/web
  - pnpm test:e2e (runs audit-visual.spec.ts; snapshots stored locally)
  - Use: npx playwright test --update-snapshots to update baselines

- Storybook a11y tests (CI-style)
  - pnpm --filter @rapid/web build-storybook
  - npx http-server apps/web/storybook-static -p 6007
  - cd apps/web && STORYBOOK_URL=http://localhost:6007 pnpm test-storybook

## Accessibility Expectations

- Audit pages use semantic headings, landmarks, and table markup.
- Skip link is visible on focus and goes to #main.
- Negative items table:
  - <caption> provided (screen-reader) and column headers use scope="col".
- Color contrast must pass axe for WCAG AA (serious/critical rules).
- Keyboard focus:
  - Skip link shows a visible outline.
  - All interactive controls must be reachable and operable via keyboard.

How to debug failures:
- Run Playwright headed (npx playwright test --ui) and inspect the page.
- Use axe DevTools (browser extension) for local runs.
- Ensure CSS tokens (colors) meet contrast; prefer brand-700 or darker on light backgrounds.

## Performance Expectation

- TTFB budget on /audit/:id:
  - CI threshold: ≤ 1000 ms
  - Local dev baseline: ≤ 500 ms
- Test: apps/web/tests/perf-audit.spec.ts (uses Navigation Timing responseStart as TTFB proxy).
- If flakey in CI, warm the API (preload /reports), or increase headroom slightly.

## Practical Action Plan (Tasks)

- Tests
  - [x] Add unit tests for AuditService (utilization, negative item priorities, personal info, duplicates).
  - [x] Expand /audit/[id] Playwright + axe coverage (focus, tables, contrast).

- Storybook
  - [x] Add stories for UtilizationCard, PersonalInfoIssues list, Duplicates list.
  - [x] Keep test-storybook in CI with addon-a11y.

- Performance
  - [x] Add TTFB perf check for /audit/[id] with Playwright.

- UX polish
  - [x] Add loading state (skeletons) and aria-busy to audit page.
  - [x] Add error state with retry.
  - [x] Validate responsive behavior at sm/md/lg; horizontal scroll on tables at sm.

- Observability
  - [x] Metrics for http_request_duration_seconds and request counts.
  - [x] Request ID propagation (X-Request-ID) for correlation.
  - [ ] OpenTelemetry tracing (Epic 5) – span context across Web → API → Parser/DB.

- Documentation
  - [x] This audit-ui.md added.
  - [ ] Extend RUNBOOKS.md with links and triage steps.

## Acceptance Criteria

- Audit page renders data from normalized DB via /api/audit/:id.
- A11y tests (axe) pass with no serious/critical violations.
- Perf test meets TTFB budget in CI.
- Storybook a11y checks pass and demonstrate the core audit components.
- Loading/error states are present and accessible.
- Responsive behavior verified for sm/md/lg breakpoints.