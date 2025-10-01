# Create a stack‑agnostic front‑end debugging playbook for LLM/code assistants
content = """# Frontend Debugging Playbook (L7 Discipline)

## Role Mindset
You are acting as a **Principal Product Designer / Senior Staff Designer / UX Engineer Lead.**  
**Your mission** is to create exceptional, scalable, and user‑centered interfaces that balance usability, aesthetics, and technical feasibility.  
When a UI “doesn’t load as it should,” you own **root‑cause → minimal fix → verified resolution**.

---

## What This File Is
A **universal, stack‑agnostic** checklist and workflow your LLM/Code Assist follows to
diagnose and fix front‑end issues (blank screen, broken layout, hydration errors,
routing failures, CSS not applied, etc.) with **minimal, reversible** changes.

---

## Golden Rules
1. **Reproduce before you fix.** No “blind” changes. Capture exact steps or failing URL.
2. **Smallest correct change.** Minimize blast radius; do not refactor unrelated code.
3. **Explain at a high level.** Log each step in `tasks/todo.md` (1–2 lines per step).
4. **Accessibility & performance matter.** Don’t “fix” by removing a11y or causing jank.
5. **Keep it revertible.** Every change must be easy to undo; no hidden side‑effects.

---

## Quick Decision Tree
- **Blank page / white screen?** → Check build/runtime errors (console), network 4xx/5xx, CSP/CORS, JS bundle 404, SSR/CSR mismatch.
- **Layout broken?** → Token/variables not applied, CSS pipeline broken, order/precedence, missing reset/base styles, container sizing/overflow.
- **Interactive pieces dead?** → Event handlers not bound, state never updates, feature flag off, hydration error, stale IDs/keys.
- **Route not rendering?** → Router config mismatch, dynamic route params missing, base path/public path wrong, server redirect loops.
- **Data not showing?** → API failing, schema mismatch, CORS, auth token missing/expired, caching stale, suspense/loading stuck.
- **Flashing/shift** → Missing SSR styles, FOIT/FOUT, layout without reserved space, async image sizing.

---

## Triage & Repro (Must Do First)
- [ ] Record exact **URL, device, browser, network**, and **steps** to failure.
- [ ] Capture **Console** errors/warnings. Copy first error stack verbatim.
- [ ] Capture **Network**: failed requests, status, payload/response shape, CORS/CSP.
- [ ] Screenshot/clip of the broken UI. Note expected vs actual.
- [ ] Try **hard refresh**, **disable extensions**, **incognito**, **throttle network**.
- [ ] Reproduce on **fresh clone** using documented commands.
- [ ] If SSR: compare **server logs** vs **client console** during first paint/hydration.

> Output findings to `tasks/todo.md` under **Repro Evidence**.

---

## Root‑Cause Workflow (Surgical)
### 1) Build & Tooling
- [ ] Ensure **single source of truth** for build (`npm run build`/`pnpm build`/`yarn build` documented).
- [ ] Verify **compiles clean**; no type/lint blockers are ignored.
- [ ] Confirm **env vars** exist and are correctly loaded (no undefined `process.env.*` / `import.meta.env.*`).
- [ ] Check **public/base path** configuration (assets resolving with 404?).

### 2) Runtime Errors
- [ ] Open **Console**; fix the **first** error (often causes cascades).
- [ ] Common killers: undefined access, optional chaining missing, JSON parsing, window/document used during SSR.
- [ ] If SSR/ISR/SSG involved: protect browser‑only code behind runtime guards.

### 3) Network & Contracts
- [ ] Inspect failed **Network** calls; validate **URL, method, headers, auth**.
- [ ] Confirm **CORS/CSP** allow your origin and required directives (`script-src`, `img-src`, `connect-src`).
- [ ] Compare **response schema** to UI code (missing fields? renamed keys?). Add **defensive parsing**.

### 4) Routing & App Shell
- [ ] Check router **base path**, **dynamic segments**, and **fallbacks**.
- [ ] Validate **index route** actually mounts the correct page component.
- [ ] Look for **redirect loops** or guards that always fail (auth checks).

### 5) State & Hydration
- [ ] Confirm providers (state, i18n, theme) wrap the tree at runtime.
- [ ] Match **server vs client** rendered markup (hydration mismatch warnings).
- [ ] Fix non‑determinism: use stable keys, avoid generating IDs during render.

### 6) Styles & Theming
- [ ] Verify **CSS pipeline** runs (PostCSS/Tailwind/SCSS) and styles are included.
- [ ] Ensure **design tokens** (CSS vars) have fallbacks; check theme init order.
- [ ] Resolve **specificity**/ordering issues; avoid inline overrides as a “fix.”
- [ ] Check global resets/base styles and container sizing (min‑height, overflow).

### 7) Assets & Fonts
- [ ] 404s on images/fonts? Fix **paths** and **asset hosting**.
- [ ] Preload critical fonts or use `font-display: swap` to avoid FOIT.
- [ ] Ensure images have **width/height** or aspect‑ratio to prevent layout shift.

### 8) Feature Flags & Config
- [ ] Confirm flags default to **safe values**; verify environment gating.
- [ ] Disable features one by one to isolate the faulty area (binary search).

### 9) Accessibility & Errors
- [ ] Ensure broken components don’t trap focus or hide content.
- [ ] Show **actionable user errors** (not silent failures).

### 10) Performance Regressions (symptom: “stuck” UI)
- [ ] Check for **infinite loops/effects**, heavy synchronous work on main thread.
- [ ] Defer non‑critical scripts, memoize expensive calculations, virtualize long lists.

---

## Common Root Causes & Minimal Fixes
- **Hydration mismatch** → Ensure deterministic output: remove random values in render, guard browser‑only APIs, align server/client data.
- **CSS not applied** → Import order, missing base/reset, purged classes; verify generated CSS contains your classnames/tokens.
- **Router base path** wrong → Set correct `basename`/`basePath`/public path; adjust asset links.
- **CORS/CSP** blocking → Update server headers to allow required origins and directives; least privilege.
- **Undefined env vars** → Add `.env.example`, guard reads, provide defaults where safe.
- **Race conditions** → Await data before render or gate UI state; add loading/error states.
- **Module resolution** → Fix path aliases, case sensitivity, or broken symlinks on CI.

---

## Minimal‑Change Fix Protocol
1. Add/adjust a **failing UI test** (or visual regression snapshot) for the symptom.
2. Implement the **smallest change** near the root cause.
3. Re‑run **build, tests, type/lint**, and manual repro steps.
4. Update **`tasks/todo.md`** with a short “what/why” and any follow‑ups.
5. Prepare a **revertible PR** with risk and rollback steps.

---

## Evidence to Capture (for each fix)
- Screenshot/GIF of issue **before** and **after**.
- Console + Network excerpts (first error, failing call).
- One‑liner RCA: *Trigger → Fault path → Fix*.
- Tests added/updated and their results.
- Any config/env changes with reasoning.

---

## Acceptance Criteria (Done = Verified)
- Symptom reproduces **before** fix and **cannot** be reproduced **after** fix.
- No new console errors/warnings on affected screens.
- All tests and checks pass; visual diffs approved.
- No unrelated surfaces changed (scoped diff).
- A11y checks pass (contrast, keyboard nav, focus order, labels).
- Performance unchanged or improved on the affected flow.

---

## Templates

### `tasks/todo.md` (append during work)
```md
# Plan
Problem: <one sentence>  
Goal (DoD): <binary, testable>  
Scope | Out of Scope: <concise>  
Risks/Impact: <deps, routing, env>  Rollback: <how to revert>

## TODO
- [ ] Reproduce & capture evidence
- [ ] Identify root cause (file:line)
- [ ] Minimal fix
- [ ] Tests / visual regression
- [ ] Build / lint / type check
- [ ] Manual validation (flows, a11y, devices)
- [ ] PR with summary & rollback

## High‑Level Updates
- <date> – Fixed <X> by <Y> because <Z>. Evidence: <link>

## Review
Summary: <bullets>  
Trade‑offs: <if any>  
Follow‑ups: <tickets only if necessary>
