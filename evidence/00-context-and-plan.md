# Context and plan recorded before implementation

Date: 8 November 2026, Asia/Almaty. Assistant: OpenAI Codex (GPT-6).
Student: Dastan Karbuzov, 24B031050, Tuesday 16:00-19:00.

## Repository map supplied to the assistant
Starting source: ../Software_Engineering_Practice_09/project, itself continued
from the repaired Practice 08 / Assignment 03 Smart Campus prototype.
The initial/ snapshot copies all source and configuration unchanged; AGENTS.md
(instructions specific to the earlier assignment) is deliberately excluded.
- src/App.tsx: single-room state, two datetime inputs, result, bookings rendering.
- src/data/campus.ts: fictional fixtures; fixed 2026-10-27 10:00 local demo clock.
- src/lib/availability.ts: isAvailable, half-open interval overlap, 120-minute cap.
- src/lib/presentation.ts: messages and local date/time conversion.
- src/lib/{availability,practice09}.test.ts: 26 existing test cases.
- Vite / React / TypeScript / Tailwind; no backend required.

## Contract supplied to the assistant
AC1: finite valid start < end, start >= fixed NOW. AC2: <=120 minutes.
AC3: blocked rooms unavailable. AC4: strict overlap rejected, touching allowed.
AC5: no booking mutation. AC6: clear responsive feedback.
F1: capacity >= attendees. F2: ALL equipment required. F3: blocked never available.
F4: explicit empty state. F5: room change refreshes the result and booking list.
At least four rooms, each with its own ID/name/capacity/equipment/blocked/bookings.
Only fictional data. No login, database, network API or booking writes.
Preserve all 26 tests, add boundaries and actual mounted UI integration checks.

## Maintainability risks and prioritized plan
1. High: App.tsx/App assumes ROOM_NAME + one bookings array; handleCheck can use
   stale or unrelated bookings after room selection is added. Introduce typed Room,
   catalog, pure filterRooms and a chosen-room availability adapter. Derive a checked
   result from the current room rather than storing a stale result object.
2. Medium: App.tsx/App mixes form controls, status presentation and schedule mapping.
   Extract small presentational components with explicit props; App only coordinates.
3. Medium: App.tsx contains two nearly identical datetime label/input/onChange
   blocks and separate invalidation calls. Extract a reusable TimeField and share
   time-change invalidation. Count precisely those two source locations in quality evidence.
4. Medium: AvailabilityInput.bookings is mutable Booking[], despite the no-mutation
   contract. Accept readonly arrays and make the catalog deeply immutable.
5. Low: isAvailable checks ordering but would accept an infinite end/start pair.
   Add finite-number guards without changing finite-input behavior.

## Priorities / execution order
P0: snapshot original source and run baseline (26/26 actual pass).
P1: add typed four-room data, independent filters and boundary tests.
P2: extract presentation and wire selection, result refresh and empty states.
P3: execute all tests, typecheck, lint, production build and before/after comparisons.
P4: check real browser desktop/mobile states, capture screenshots, write report,
AI appendix, reflection and reproducible archive with checksums.

## Suggestion rejected / modified
Design alternative considered by the assistant: store the full selected Room and
last AvailabilityResult in React state, clearing them in every change handler.
Rejected before implementation: these duplicate current catalog/input state and
can disagree after filtering. Store only preferredRoomId and whether a check was
requested; derive the visible selected room and recompute its result. Preserve
the existing pure validation function rather than create a policy class hierarchy.

## Evidence integrity
All code, tests, report and reflection are AI-assisted. Verification below is
performed by the assistant using executable tools. No independent student review,
email submission, public deployment or teacher approval is claimed.
