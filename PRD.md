# Product Requirements Document (PRD)
Option A: Next.js + Tailwind/Radix + NestJS + PostgreSQL + Python Parser

Date: 2025-09-30
Owner: Product + Engineering (L7 Lead)
Status: Draft (v0)

## 1. Overview
Build a modern, secure, and accessible credit-report audit platform. Users upload credit monitoring reports; the system parses data, generates a “Simple Audit,” recommends dispute items, and produces professional letters and PDFs. The experience is design-system-first with accessible UI and predictable performance.

## 2. Goals and Non‑Goals
Goals
- Simple Audit generation within 30s of upload with 99% success on supported report types.
- First-class accessibility (WCAG 2.1 AA) and responsive design.
- Professional, on-brand PDFs (1:1 with HTML) for audits and dispute letters.
- Clear dispute workflow with item selection, bureau targeting, and audit trails.

Non‑Goals (V1)
- Full client portal with multi-tenant billing (planned for V2).
- Vendor direct API integrations beyond HTML upload (planned adapters).
- ML-based classification (may be explored post-V1).

## 3. Users and Roles
- Admin: system settings, branding, user management, global reports.
- Analyst: accounts, uploads, audit generation, dispute packages.
- Client (optional V2): read-only access to their audits and letters.

## 4. Use Cases
- Upload credit report HTML (or ZIP) securely.
- Parse report → extract scores, tradelines, inquiries, public records, personal info.
- Generate Simple Audit view: summary, negative items with severity/priority, utilization analysis, personal info audit.
- Select dispute items; generate bureau-specific dispute letters with letterhead.
- Export audits/letters as PDFs.
- Persist reports; show deltas between versions.

## 5. Functional Requirements
5.1 Uploads
- Accept HTML/XHTML/ZIP; max 10MB; virus scanning; store in object storage; random filenames.
- Show upload progress and validation errors.

5.2 Parsing
- Event-driven: upload → queue → Python FastAPI parses → normalized DB + raw snapshot.
- Idempotent parsing; store “parse version” and vendor heuristics.

5.3 Simple Audit
- Summary KPIs: bureau scores, report date, counts.
- Negative items table: account, issue, priority (P1/P2/P3), flags, reasons, dates (TU/EX/EQ).
- Utilization: overall and per bureau; targets and deltas.
- Personal info audit: inconsistencies + risk level.
- Duplicates across bureaus.

5.4 Dispute Letters
- Selection UI (up to N items); bureau filter.
- Bureau address blocks and logo; letterhead; generated PDF.
- Persist “last_dispute” metadata with timestamp and items.

5.5 PDFs
- Render SSR pages with Playwright for 1:1 fidelity.
- Include header/letterhead and shared footer (brand, page numbers, timestamp).

5.6 Accounts & Reports
- Accounts CRUD.
- Reports list with latest audit quick links; report diff view (V1.1+).

5.7 Security & Privacy
- Field-level encryption of PII (at minimum SSN last4, addresses, emails).
- RBAC: Admin, Analyst (V1), Client (V2).
- Strict CSP, HSTS, secure cookies, CSRF protections where needed.

5.8 Accessibility
- WCAG 2.1 AA contrast; keyboard navigation; skip links; screen reader labels.
- Automated a11y tests in CI for key pages.

## 6. Non‑Functional Requirements
- Performance: Time-to-audit ≤ 30s (p95) for supported reports; TTFB ≤ 500ms for HTML pages (cached).
- Availability: 99.5% (single region acceptable in V1).
- Scalability: horizontal for queue workers and parser service; DB sized for 100k reports.
- Observability: structured logs, traces, metrics, error tracking (Sentry).
- Compliance: audit logs, data retention policy, purge on request (GDPR/CCPA-friendly design).

## 7. Success Metrics
- Audit generation success rate: ≥ 98% (on known vendors).
- Parse-to-Audit SLA: ≤ 30s p95.
- A11y checks: 0 critical violations on /login, /accounts, /audit pages.
- PDF generation error rate: ≤ 0.5%.
- Analyst NPS for workflow: ≥ 40.

## 8. Constraints & Assumptions
- Vendor HTML variability requires robust parsing heuristics and fixtures.
- Multi-tenant branding supported via design tokens and configuration.
- Object storage (e.g., S3) is available.

## 9. Dependencies
- Next.js 14, Tailwind CSS, Radix UI/shadcn.
- NestJS, Prisma, PostgreSQL, Redis, BullMQ.
- Python FastAPI, BeautifulSoup/lxml, pandas.
- Playwright for headless PDF; S3 for storage.

## 10. Risks & Mitigations
- HTML variance breaks parser → Maintain vendor fixtures; contract tests; fallback paths.
- PDF fidelity issues → Use Playwright with HTML sources used in UI.
- PII leakage risk → Field-level encryption, strict access logs, CSP/HSTS.
- Scope creep → Enforce V1 scope; track backlog in Tasks; gated releases.

## 11. Release Criteria (V1)
- All functional requirements implemented with acceptance tests.
- A11y baseline met; CI gates pass.
- Observability deployed; error budget defined.
- Security review completed; secrets vaulted; CSP/HSTS enforced.
