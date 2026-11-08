# Software Engineering - Assignment 04

Dastan Karbuzov | 24B031050 | Tuesday 16:00-19:00 | 8 November 2026

Smart Campus Room Availability Checker: four fictional rooms, capacity and ALL-item
equipment filtering, room-specific availability and schedules, responsive feedback.
All original AC1-AC6 rules are retained. The demonstration clock stays at
27 October 2026, 10:00 in the browser's local timezone, regardless of today's date.

## Start here

- [PDF report](report/Assignment_04_Dastan_Karbuzov_24B031050.pdf)
- [Final application source](final/src)
- [Initial application source](initial/src)
- [Actual test results: 61/61](evidence/02-final-tests.txt)
- [AI-use evidence appendix](report/AI_Appendix.md)
- [Browser screenshots](screenshots)

All deliverables are ordinary repository files. The report can be attached to the
submission email, with this public repository linked for source code and evidence.

## Contents

- initial/: unchanged source snapshot from the working Practice 09 continuation
  of the Assignment 03 / repaired Practice 08 prototype. Its earlier AGENTS.md is
  excluded because it restricted scope to that earlier assignment.
- final/: complete revised React/TypeScript/Vite application and executable tests.
- report/: PDF report, editable Markdown, AI-use appendix and 200-300-word reflection.
- screenshots/: real gstack Chromium captures, original and final, desktop/mobile.
- evidence/: pre-edit context/plan, command logs, differential checks, metrics and diff.
- SUBMISSION_EMAIL.txt: ready-to-copy recipient, subject and message. No email sent.

## Setup and run

Verified with Node.js 22.23.2 and npm 10.9.8. Install Node.js 22.12 or newer.
From this directory:

```sh
cd final
npm ci --ignore-scripts
npm run dev -- --host 127.0.0.1 --port 5184 --strictPort
```

Open http://127.0.0.1:5184/ while the server is running.
For a production preview:

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4184
```

## Automated checks

```sh
cd final
npm test -- --reporter=verbose
npm run typecheck
npm run lint
npm run build
```

Actual result: 61/61 tests pass (26 original + 23 new pure + 12 mounted UI tests).
Typecheck, lint and production build pass. Full logs are included.
The original test files are byte-identical in initial/ and final/.

Baseline, from the package root:

```sh
cd initial
npm ci --ignore-scripts
npm test -- --reporter=verbose
```

Actual baseline: 26/26 tests pass.

Run finite-input behavior equivalence from the package root (Node 22.6+):

```sh
node --experimental-strip-types evidence/compare-behavior.mjs
```

Actual result: 5,610 original/final decisions match; frozen fixtures unchanged.
Non-finite timestamps are deliberately hardened in the final validator.

## Real browser verification (optional development tool)

Start initial on port 5183 and final on 5184 in separate terminals using `npm run dev`.
Then, with the user's gstack /browse tool installed:

```sh
BROWSE_BIN=/absolute/path/to/gstack/browse/dist/browse python3 evidence/check-browser.py
```

13/13 actual browser assertions passed. No horizontal overflow at widths 320, 390,
768 or 1440 pixels; no browser console errors in the tested session. The regular
61-test suite does not require gstack or a browser installation.

## Manual demonstration

1. Default 10:30-11:00: check Library Study Room A -> Available.
2. Select Innovation Studio -> result immediately changes to Unavailable (overlap);
   schedule shows Robotics Society, not library bookings.
3. Set attendees to 20; select Projector and Whiteboard -> only Innovation Studio.
4. Set attendees to 41 -> explicit empty state, no selected room/result, check disabled.
5. Reset filters; select Seminar Hall -> Unavailable because blocked.
6. Select Computing Lab -> Available. Switch to a narrow window; all controls remain usable.
7. On any unblocked room with a free interval, compare exactly 120 with 121 minutes.

## Design and limits

App coordinates state. data/ holds fixtures, domain/ holds Room/Equipment contracts,
lib/filtering.ts selects matches, lib/roomAvailability.ts binds the selected room to
lib/availability.ts, and components/ renders controls, schedule and result.
Blocked rooms remain visible when they meet requirements, with a Blocked badge;
filters describe suitability, while the availability check enforces booking policy.
Changing room/filters refreshes a previously checked result; editing time clears it
until Check is pressed again. A visible fallback is selected when a filter hides
the preferred room. No-match means no selected room and no stale result.

Limitations: fixed local demo time (not an IANA campus timezone), fictional in-memory
fixtures, no reservation/persistence, no assistive-technology audit. These are
explained in the report. All implementation and recorded checks were performed by
AI; independent student verification is not claimed.

## Provenance and integrity

The submission ZIP excludes node_modules, symlinks, .git, caches and dist. Install
from the included package-lock.json files. In this workspace only, node_modules
symlinks reuse the already installed matching dependencies from Practice 09.
`python3 evidence/run-checks.py` reproduces the final checks and logs.
`python3 evidence/measure-quality.py` reproduces module/duplication metrics.
`python3 evidence/verify-integrity.py` verifies the included SHA256 manifest.
