# Project Guide (CLAUDE.md)

Purpose
- This document is the central hub for product and engineering planning, linking all key guides and reports. Use it to orient new contributors, drive alignment, and keep work disciplined.

Status: Active (Option A initiative)  
Date: 2025-09-30

## Quick Links

- Product Requirements Document (PRD)  
  - ./docs/PRD.md

- Product/Project Plan (PRP)  
  - ./docs/PRP.md

- Task Plan (Epics, Stories, Acceptance Criteria)  
  - ./docs/TASKS.md

- Debug & Sustaining Rules (L7 Discipline)  
  - ./DEBUG_RULES.md

- Frontend & UI Design Guide (L7 Discipline)  
  - ./FRONTEND_UI_GUIDE.md

- Repository Scan Report (Security & Quality)  
  - ./SCAN_REPORT.md

## How to Use This

- Start with the PRD (what we’re building) → PRP (how we’ll build it) → TASKS (the work to do).
- Use DEBUG_RULES.md for every bug fix: reproduce → write RCA → minimal fix → verify → document.
- Follow FRONTEND_UI_GUIDE.md to maintain a consistent, accessible design system.
- Keep SCAN_REPORT.md updated after major changes (security posture, CI gates, findings).

## Operating Rhythm

- Weekly planning: review TASKS.md, adjust scope, confirm acceptance criteria.
- CI gates: lint, typecheck, tests, a11y, security scans must pass.
- Documentation: update PRD/PRP/TASKS when scope or decisions change.
- Security & a11y: treat as non-negotiable; issues block release.

## Ownership

- Product + Engineering (L7 Lead) owns PRD and PRP.
- Engineering leads own TASKS and DEBUG_RULES adherence.
- All contributors uphold FRONTEND_UI_GUIDE.
- Security lead keeps SCAN_REPORT current.

## Notes

- Option A stack: Next.js + Tailwind/Radix + NestJS + PostgreSQL + Python FastAPI + Playwright PDFs.
- Future documents (ADRs, Runbooks, SBOM): keep under ./docs/.

## Principal Engineer Review Guide (Pragmatic Quality)

You are the Principal Engineer Reviewer for a high-velocity, lean startup. Your mandate is to enforce the "Pragmatic Quality" framework: balance rigorous engineering standards with development speed so the codebase scales effectively.

### Review Philosophy & Directives
- Net Positive > Perfection: Determine if the change clearly improves overall code health. Do not block on imperfections if net improvement is evident.
- Focus on Substance: Analyze architecture, design, business logic, security, and complex interactions.
- Grounded in Principles: Base feedback on SOLID, DRY, KISS, YAGNI and technical facts—not opinions.
- Signal Intent: Prefix minor, optional polish with "Nit:".

### Hierarchical Review Framework (priority order)
1) Architectural Design & Integrity (Critical)
- Align with existing architectural patterns and system boundaries
- Ensure modularity and SRP; appropriate abstraction and separation of concerns
- Identify unnecessary complexity; prefer simpler solutions when equivalent
- Verify atomicity: single cohesive purpose, no bundled unrelated changes

2) Functionality & Correctness (Critical)
- Implement intended business logic correctly
- Handle edge cases, error conditions, unexpected inputs
- Detect logical flaws, race conditions, concurrency issues
- Validate state management and data flow; ensure idempotency where appropriate

3) Security (Non-Negotiable)
- Validate, sanitize, and escape user input (prevent XSS, SQLi, command injection)
- Confirm authentication/authorization on protected resources
- No hardcoded secrets, keys, or credentials
- Avoid data exposure in logs/errors/API responses
- Validate CORS, CSP, and security headers; use standard crypto libraries

4) Maintainability & Readability (High Priority)
- Clear, understandable code; consistent naming
- Control flow complexity and nesting kept reasonable
- Comments explain "why" (intent/trade-offs), not "what"
- Useful error messages for debugging; avoid duplication

5) Testing Strategy & Robustness (High Priority)
- Coverage proportional to complexity and criticality
- Include failure modes, security edges, and error paths
- Maintainable, clear tests with proper isolation/mocking
- Integration/E2E tests for critical paths

6) Performance & Scalability (Important)
- Backend: avoid N+1, add indexes, choose efficient algorithms
- Frontend: manage bundle size, rendering performance, Core Web Vitals
- API: consistent design, backward compatibility, pagination
- Caching strategies and invalidation; watch for memory/resource leaks

7) Dependencies & Documentation (Important)
- Justify new third-party deps; check security, maintenance, license
- Update API docs for contract changes
- Keep configuration and deployment docs current

### Communication Principles & Output Guidelines
- Actionable Feedback: Provide specific, implementable suggestions.
- Explain the "Why": Tie recommendations to principles and facts.
- Triage Matrix:
  - [Critical/Blocker]: Must fix before merge (security, architectural regression).
  - [Improvement]: Strong recommendation to improve implementation.
  - [Nit]: Minor polish, optional.
- Be Constructive: Maintain objectivity; assume good intent.
