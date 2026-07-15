---
target: Dashboard and Login/Signup auth pages
total_score: 16
p0_count: 2
p1_count: 3
timestamp: 2026-07-15T03-53-36Z
slug: src-pages-dashboard-and-auth
---
# Critique — Dashboard + Login/Signup (Zigfly ERP)

Method: dual-agent (A: ad142c9ad5a95c8e0 · B: ae474d35284b4f193)

## Design Health Score — 16/40 (Poor: major UX overhaul required)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | "Live · Last Sync" is just render time (Dashboard.jsx:112); fetch failure silent — stale zeros render as data |
| 2 | Match System / Real World | 2 | Donut "Total" sums Metric-Tons + Kilograms into one number (OverallStatusChart.jsx:35,57); "Welcome Back, Admin!" hardcoded |
| 3 | User Control and Freedom | 1 | Login error modals auto-dismiss in 2000ms (Login.jsx:28-29); "Forgot password?" dead link |
| 4 | Consistency and Standards | 1 | 3 font families, 4+ reds, 4 focus systems, duplicated animation tokens |
| 5 | Error Prevention | 2 | Password rules only revealed after failure; Enter can double-submit login (no loading guard) |
| 6 | Recognition Rather Than Recall | 2 | Tray age color semantics never explained; password policy invisible until failed |
| 7 | Flexibility and Efficiency | 1 | autoComplete="off" kills password managers; zero shortcuts; KPI clicks are no-ops |
| 8 | Aesthetic and Minimalist Design | 2 | 3 metrics shown twice on one screen; glow effects; dot-grid ornament |
| 9 | Error Recovery | 2 | Non-401 errors show "Database Offline — use admin/admin123" (Login.jsx:89-102); no dashboard retry |
| 10 | Help and Documentation | 1 | No explanation of "Bioconversion Rate", the headline metric |
| **Total** | | **16/40** | **Poor** |

## Anti-Patterns Verdict

**LLM assessment:** Yes — a designer would clock it as AI-made in under a minute. Side-stripe borders on all 8 KPI tiles in 5 colors, hero-metric template with a glowing green number (textShadow on TrayStatusWidget.jsx:86), glassmorphism in auth.css (dead .lp-status-card with backdrop-filter, banned by DESIGN.md), a gradient submit button using two colors outside the token ramp (auth.css:477), fake "LIVE" badges (two, differently styled), 1500ms count-up fireworks, identical 8-card grid with a 6+2 orphan row.

**Deterministic scan (exit 2, 6 findings):** side-tab borders confirmed at KPICard.jsx:27 and OverallStatusChart.jsx:92 (warnings); off-design-system colors #29b6f6, #f7b84b (KPICard.jsx:9-10), #000000 (OverallStatusChart.jsx:56,62 — likely chart-config false positives). Login.jsx/Signup.jsx mechanically clean. Grep evidence: #25a96b hardcoded 12× where --primary-green exists; 32 literal transition durations bypass the --anim-* tokens across animations.css/ux.css/darkmode.css; skeleton system defined (animations.css:273) but zero usage — spinner is the only loading pattern; darkmode.css has 0 prefers-reduced-motion coverage of its own.

**Where A and B agree:** side-stripes, off-token colors, token bypass, unused skeletons. **Detector-only:** exact literal-duration line inventory. **A-only (beyond detector reach):** the token schism (--anim-duration-fast defined twice with different values in index.css:77 vs animations.css:9), IBM Plex Mono referenced but never loaded (renders as Courier), unscoped .form-check-input override turning every app checkbox into a circle.

## Overall Impression

The auth hero and empty-state craft show real intent, but the two surfaces feel like two different products (Inter + Tailwind-slate + glass + gradients on auth vs Poppins + GitHub-dark + flat in the app), and the dashboard's flagship idea — green as the One Signal — is dead under 5 competing accent colors. Biggest opportunity: the trust layer. The product's own PRODUCT.md promises "trust through clarity," yet the login error path leaks demo credentials, the Live pill lies, and failed fetches render confident zeros.

## What's Working

1. Auth accessibility fundamentals where attempted: real label htmlFor, aria-labels on toggles, keyboard handler on the theme pill.
2. Designed chart empty states (icon + sentence) and centralized chart theming with theme-key remount.
3. Written design rationale in code (pit-age axis floor, in-bar labels) — evidence of care, not scaffolding.

## Priority Issues

- **[P0] Login failure path leaks demo credentials & misclassifies errors** — Login.jsx:89-102 shows admin/admin123 for ANY non-401 (a transient 500 tells a valid user to log in as admin); error modals vanish in 2s. Fix: persistent inline coral error (role="alert"), distinct copy for bad-credentials vs server-unreachable, demo hint gated behind import.meta.env.DEV. Suggested: /impeccable harden
- **[P0] Unscoped .form-check-input override (auth.css:532-573) deforms every checkbox app-wide into circles** — checkboxes read as radio buttons everywhere. Fix: prefix selectors with .lp-root. Suggested: /impeccable polish
- **[P1] One Signal Rule collapse on dashboard** — 5 accent stripes (KPICard.jsx:5-12,27), 8-hue donut with purple + second green (chartTheme.js:23-24). Fix: neutral tiles, green reserved for the bioconversion hero, sequential single-hue donut. Suggested: /impeccable colorize (as reduction)
- **[P1] Fake liveness + false affordances** — "Live · Last Sync {render time}" (Dashboard.jsx:112,138); 8 pointer-cursor no-op tiles. Fix: real fetch timestamp "Updated 14:32"; drop onClick/cursor until drill-down exists. Suggested: /impeccable clarify
- **[P1] Typography: 3 families, one never loads** — Inter imported for auth only; IBM Plex Mono referenced 10+ times with no @font-face → renders as Courier New. Fix: delete Inter import, replace mono stacks with Poppins + font-variant-numeric: tabular-nums. Suggested: /impeccable typeset
- **[P2] Animation token schism** — --anim-duration-fast/--anim-ease-out defined twice with different values (index.css:77-78 vs animations.css:9-12); duplicate .card/.btn/.badge motion in animations.css AND ux.css; 1500ms count-up and 500ms ApexCharts ignore prefers-reduced-motion. Fix: one token block, delete the duplicate section, cap count-up ~400ms + matchMedia gate. Suggested: /impeccable animate
- **[P2] Dashboard loading/error states** — full blank + off-brand indigo spinner per month change (text-primary isn't green in light mode), unused skeleton system, silent fetch failure. Fix: skeleton tiles preserving layout, error banner with Retry, keep previous data dimmed while refetching. Suggested: /impeccable harden

## Persona Red Flags

**Alex (power user):** autoComplete="off" + missing autocomplete="username"/"current-password" — types password every morning; Enter can double-submit (form onSubmit + onKeyUp on .lp-root, no loading guard); month comparison costs ~3s of animation per switch; 8 clickable tiles that do nothing; signup success forces a modal click; year picker is one-click-per-year.

**Sam (accessibility):** clickable KPI div with no role/tabIndex/key handler; MonthYearPicker: no Escape, no focus management, unlabeled ◀/▶ buttons; auth focus = 15%-alpha glow with unchanged border (fails non-text contrast); #6e7681 on #161b22 ≈ 3.5:1 (fails AA, let alone the AAA ambition); 9.6px uppercase labels; .lp-field-error has no role="alert", inputs lack aria-invalid/aria-describedby; JS animations ignore reduced-motion; Live status is a green dot + color only.

## Minor Observations

- Donut units derived by splitting the label string ("(mt)" with parenthesis) — fragile.
- EfficiencyStrip renders `waste || '—'`: a legitimate 0 shows as em-dash, contradicting the backend "preserve 0.0" fix.
- ~100 lines dead .lp-status-* CSS; dead .auth-page-content overrides in index.css:100-118.
- Login "remember" checkbox state never used.
- Theme toggle exists on Login only — arrive at Signup in dark and you're stuck.
- Login validates via blocking Swal modal, Signup inline — two error philosophies in one flow; three required-field conventions app-wide.
- Radius anarchy: tokens say 4/6/8px; actual 10/14/16/28px on these surfaces.
- Two dueling universal reduced-motion selectors (ux.css:1129 vs animations.css:376).

## Questions to Consider

1. The bioconversion rate is green at 45% and at 2%. If green means "correct," what is it signaling — and what color is a bad month?
2. Auth is Inter/slate/glass/gradients; the app is Poppins/GitHub-dark/flat. Which one is Zigfly — and why does the door not match the house?
3. If every account "will be reviewed and activated by an administrator," should public self-signup exist at all — or is the right design an admin-side invite flow that deletes this whole surface (and its P0s) in one move?
