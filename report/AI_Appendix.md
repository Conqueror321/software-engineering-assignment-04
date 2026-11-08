# AI-use evidence appendix

Tool: OpenAI Codex desktop, GPT-6 (exact model build not exposed in this session).
Date: 8 November 2026, Asia/Almaty. Supporting tools: shell, Vitest 5.0.5,
TypeScript, ESLint, Vite 7.3.7, gstack /browse (Chromium), ReportLab and Poppler.

## Selected request and context

Actual user request (Russian): "Сделай весь сам полностью assignment #04, если нужно
где-то использовать Computer in use, используй. Разрешаю. Полностью сам все задание
сделай, мне просто лень".

The assignment PDF was supplied as reference material. Its content was treated as
requirements for deliverables, not as authorization to email anyone.

The following are summaries of context and internal work instructions, not invented
verbatim user prompts or a fabricated separate conversation:

1. Inspect the working prototype, map its files, preserve AC1-AC6, and record a
   baseline before implementation. Output used: evidence/00-context-and-plan.md,
   initial/ snapshot and 26/26 baseline log.
2. Add at least four fictional rooms and F1-F5; separate data, filtering, availability
   and UI. Output used: final/src/domain, data/rooms.ts, filtering.ts, roomAvailability.ts,
   components and App.tsx. The existing time/overlap validator was retained.
3. Preserve tests, cover boundaries and actual mounted UI behavior, and capture
   browser evidence. Output used: 35 new tests, behavior-comparison script and
   13 real-browser assertions with screenshots.
4. Produce measured quality evidence, report, 200-300-word reflection and archive.
   Output used: quality-metrics.json, report files and submission package.

## Decisions, problems and corrections

- Rejected design alternative: separate mutable state for a full selected Room and
  last AvailabilityResult. Derived selection and feedback prevent stale room data.
- Modified a potential overdesign: use plain functions and composition, with no
  policy class hierarchy, database, API or new Agent Skill.
- Source inspection found an unhandled non-finite numeric boundary in isAvailable.
  Added finite guards and three tests. Only non-finite inputs deliberately change;
  all 5,610 sampled finite before/after decisions match.
- Readonly room arrays plus runtime-frozen fixture objects support AC5. Display
  sorting copies the bookings array instead of reordering it.
- Browser startup was initially denied by the filesystem/process sandbox (EPERM
  while binding localhost). The authorized local server/browser commands were
  rerun with the tool's reviewed execution permission, after which checks passed.
- The first source patch was rejected atomically by the patch tool because it
  combined deletion and addition of the same path. It was split into valid edits;
  no partial patch or known failing source was delivered.

## Verification sources

- evidence/01-baseline-tests.txt: original 26/26 tests, executed before code edits.
- evidence/02-final-tests.txt: all 61/61 tests, including 12 mounted React UI tests.
- evidence/03-typecheck.txt, 04-lint.txt, 05-build.txt: actual successful commands.
- evidence/06-behavior-equivalence.txt: 5,610 finite decisions and frozen input checks.
- evidence/07-browser-checks.json and 07-browser-transcript.json: actual browser
  expressions, commands, outputs and 13/13 pass results.
- evidence/08-browser-console.txt: no console errors on the tested local app.
- evidence/quality-metrics.json and measure-quality.py: reproducible module and
  duplicated datetime-input rendering counts.
- evidence/source.diff: exact original-to-final source differences.
- evidence/SHA256.json: package file integrity checks.

## Human review and authorship

The user delegated implementation and documentation to AI. Code, tests, report and
reflection are AI-assisted. All recorded verification was performed by the
assistant. No independent student review is claimed. The source, tests and evidence are available for the student to review before submission.
No email was sent, and no public deployment or teacher approval is claimed.
