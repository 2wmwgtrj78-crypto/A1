# Archive: pre-15.3 release notes, QA reports and debug audits

**v16.0.0 consolidation.** This repository's per-version release notes, final
QA reports and debug audits — 36 separate files, one per build, going back to
the first rollout candidate — are collected here as a single file. Nothing was
rewritten or summarized; each section below is the ORIGINAL file's content
verbatim, under its original filename as a heading, in build order.

This exists because GitHub's web uploader caps a single upload at 100 files,
and the per-file history had grown past what the app itself needs on disk.
CHANGELOG.md continues to carry every release from 15.3.0 onward in the same
format as before; this archive is where everything earlier than that now
lives. If you are looking for why a specific rule in the code exists, check
LESSONS_LEARNED.md first — it is the living document distilled FROM this
history, and is far shorter than reading the raw archive below.

---


## FINAL_RELEASE_NOTES_V1.md

# Dakshinamurthy — Final Rollout Candidate

## Release
- App: Dakshinamurthy
- Version: 4.6.6
- UI branch: V33.6 UI-only
- Tagline: HIGHER EVERY HOUR

## Rollout scope
- Final UI refinement and hardening only.
- Core adaptive learning, curriculum, persistence, and intelligence engines are unchanged by the V33.6 UI layer.
- Legacy visual-engine files remain in the package for compatibility/history but are not loaded by `index.html` or the offline shell.
- `visual-v33-ui.js` is the only V33 visual runtime loaded.

## Verification
- SMOKE PASS
- CONSERVATION PASS — 13,729 questions × 3 passes
- INTELLIGENCE PASS
- JavaScript syntax checks pass
- E2E test: SKIPPED because Playwright is not installed in the build environment

## Rollout recommendation
READY FOR FINAL ROLLOUT as the V33.6 UI-only release candidate.

Before store/distribution submission, run the platform-specific packaging/signing process and one real-device acceptance pass (iPhone/iPad if iOS is the target), including cold launch, navigation, offline launch, persistence after relaunch, safe-area layout, and reduced-motion accessibility.

---

## V10_RELEASE_NOTES.md

# Dakshinamurthy v10.0.0

## Focus
Major workflow and usability release: fewer decisions, clearer question logging, and a decision-oriented Progress screen.

## Changes
- Primary workflow is now **Today → Learn → Practice → Progress → More**.
- Practice opens with **Log a question** as the dominant action.
- Added a three-step logging guide: identity → result → adaptive scheduling.
- Progress rebuilt around: at-a-glance signals, next useful work, needs-attention topics, and collapsed detailed evidence.
- Viva removed from active Coach actions and user-facing flows.
- Mock exam data is no longer retained in live state or exported backups; old backup fields are ignored safely.
- Taper/scheduler remains retrieval-only; no mock/mock-review days are generated.
- Offline-first architecture retained.
- Version/cache bumped to 10.0.0.

## Validation
- Node syntax checks: PASS
- Core smoke/conservation/intelligence/export/backup tests: PASS
- Plan: 72 special days, no mock/mock-review days; 1,987 scheduled blocks point to real curriculum topics.
- E2E/UI geometry tests: SKIPPED because Playwright is not installed in the supplied environment. No browser E2E claim is made.

---

## V11_RELEASE_NOTES.md

# Dakshinamurthy v11.0.0 — Adaptive Mastery Engine

- Familiar v10.0.1 navigation retained; no new tabs.
- Today now surfaces one evidence-aware “Do the highest-value thing next” action.
- Today shows exam runway and an estimated completion date when activity supports it.
- Progress adds a compact topic mastery map and weakness radar.
- Existing adaptive engine, retrieval queue, mistake evidence and mastery data remain the source of truth.
- Viva and Mocks remain absent from the user-facing workflow.
- Offline cache/version updated to 11.0.0.

---

## V11.1_RELEASE_NOTES.md

# Dakshinamurthy v11.1.0 — usability correction

- Restored the familiar 9-screen navigation: Today, My Day, Log, Practice, Progress + Learn, Plan, Coach, Setup.
- Removed the remaining More destination from navigation.
- Viva and Mocks remain absent from the user-facing navigation/workflow; no mock/viva scheduling is introduced.
- Added a prominent Question Logging explainer and one-tap jump to the topic list.
- Progress is now intentionally compact: four headline metrics, next useful work, weakest signals, and one collapsed evidence section.
- Existing study state, adaptive engine, FSRS and offline-first architecture are preserved.

---

## V11.1.1_RELEASE_NOTES.md

# Dakshinamurthy v11.1.1 — stability, redundancy & visibility pass

- Kept the familiar v10.0.1/v11.1 navigation structure; no new tabs added.
- Removed the extra v11 Topic Mastery Map and Weakness Radar cards from Progress because they duplicated the decision dashboard and increased density.
- Kept Progress focused on four core signals, next useful work, needs attention, and optional detailed evidence.
- Improved touch target visibility with 44px minimum controls and clearer primary-action emphasis.
- Improved mobile readability for Progress metrics and headings.
- Removed sticky positioning from the question-log orientation banner so it does not obscure content while scrolling.
- Bumped package, HTML, service-worker cache/release, and UI bundle stamps to 11.1.1.
- Automated regression suite: PASS.
- Browser E2E/resilience/search tests remain unexecuted because Playwright is not installed in the supplied environment.

---

## V11.1.3_RELEASE_NOTES.md

# Dakshinamurthy v11.1.3

## AI Feedback Transfer
- Feedback remains local/offline by default.
- Added **Copy for AI**: creates a structured, AI-ready feedback packet.
- Added **Share**: uses the device share sheet when available; otherwise copies the packet.
- Added **Download**: exports `dakshinamurthy-ai-feedback.json` for reuse or upload to an AI system.
- No automatic upload or background transmission.
- Existing Viva/Mock removal and familiar navigation preserved.

---

## V12_RELEASE_NOTES.md

# Dakshinamurthy v12.0.0

## Focus
AI-ready feedback loop + release hardening. Existing navigation is preserved; no new study tabs are introduced.

## Changes
- Preserved the familiar navigation from v11.1.x.
- Kept Viva and mock-exam workflows/content excluded.
- Feedback storage upgraded to a v2 local format with a stable local feedback ID and screen context.
- AI feedback packet now carries app version, current screen, feedback IDs and a clear analysis instruction.
- Added one-tap **AI prompt** copy alongside Copy for AI, Share and Download.
- JSON export remains offline/local and is suitable for later AI ingestion.
- Updated application and service-worker release markers to 12.0.0.

## Safety / privacy
Feedback is stored locally. No automatic upload or background transmission is added.

---

## V13_RELEASE_NOTES.md

# Dakshinamurthy v13.0.0

Focused consolidation release.

- Preserved the familiar tab structure.
- Kept Help as a first-class tab with local feedback storage and AI-ready export/share.
- Removed redundant legacy v10/v11/v34 overlay runtimes from the deployable app.
- Integrated Help into the production renderer so it is available on first load.
- Improved Help/feedback mobile visibility and touch targets.
- Retained Viva/Mocks removal and retrieval-only scheduling.
- Retained offline-first architecture and existing study data.
- Automated core regression suite: PASS.
- Browser/device E2E: not run in this environment because Playwright is not installed.

---

## V13.2.1_RELEASE_NOTES.md

# 13.2.1 — dead navigation, invisible copy, and two tests that were lying

Found by running the full gate in real Chromium. Every fix below was
control-tested: the defect was reintroduced and the suite was confirmed to FAIL
before the fix was accepted.

## Defects fixed

### 1. The Log tab was dead (critical)

`render()` had no `tab==="log"` branch, so clicking **Log** fell through to
`renderToday()`. `renderLog()` existed and was reachable only via
`practiceMode==="log"` inside Practice. A comment in
`ui-practice-progress.part.js` asserted the opposite: *"Log is a top-level tab —
renderLog() is dispatched directly for tab==='log'"*.

Collateral: every `data-nav="log"` button pointed at the same hole — including
the **Start** button on the Revise screen, the entry point to the retrieval
loop. Three buttons plus the tab, all silently landing on Today.

Fixed by adding the dispatch branch. `SCREEN_NAME` also gained `log` and `help`,
which were both announcing themselves to screen readers as "Today".

### 2. "My Day" had the same dead branch — and is NOT a duplicate

`render()` had no `myday` branch either, so My Day also rendered
`renderToday()`. My first reading was that it was a redundant second button for
Today, and I removed it. That was wrong: `renderMyDay()` exists in
`ui-learning.part.js` and is a distinct screen — the feasibility panel, the calm
card, the next-30 strip and the progress section, i.e. "the full shape of
today" as opposed to "what do I do right now". It was unwired, not redundant.

The button and both `data-nav="myday"` links are restored, and `myday` now
dispatches to its own renderer.

This is the failure mode worth naming: a missing dispatch branch and a genuinely
redundant tab look identical from the outside. Deleting on that evidence loses a
screen.

### 3. The More screen was unreachable dead code

`renderMore()` was still dispatched on `tab==="more"`, but no button, link or
`data-go-tab` anywhere in the app produced that value. Its three tiles (Plan,
Coach, Setup) duplicated rail buttons. Removed, along with `more` in
`SCREEN_NAME`.

Navigation: 10 destinations, all 10 now reaching their own screen; the dead
More branch removed.

### 4. Practice intro copy was invisible in both light modes

`.sm-simple-intro` paints a dark maroon gradient (`#351116`→`#42171D`). Its
kicker, title and action tiles all set explicit light colours on it.
`.sm-simple-copy` set **no colour at all**, so it inherited body ink `#1F1717` —
near-black on near-black, **1.09:1**. Night mode happened to be readable only
because body ink is cream there.

This is the same defect class the V35 geometry test was written to catch, on the
screen the app calls "one home for question work".

Fixed: `.sm-simple-copy{color:#E8D9CE}`.

### 5. Saved feedback never appeared until a reload

`help.js` guarded its post-save refresh with `typeof render === 'function'`.
`render()` lives inside the UI IIFE and is not global, so that test was **always
false**. The row persisted correctly; the list kept saying "No feedback saved
yet" and *Copy for AI* stayed disabled until the app was reloaded.

Fixed by publishing one explicit hook, `SM.rerender`, and calling it — rather
than leaking the closure. The status line is restored after the repaint.

### 6. A 120-hour deficit was reported as "Plan looks workable"

`SM.feasibility()` measures the campaign against the target exam date and
returns, for the default configuration: **1,432 h needed, 1,312 h available
before 25 Apr 2027, 120 h short, `fits: false`.** Two places then failed to say
so.

- The Coach strip at the top of Plan chose its verdict from `F.drift` alone and
  printed *"Plan looks workable"*. `F.fits` and `F.deficitH` are computed at the
  top of the same file and were never read. Being *behind* (recoverable by
  rebuilding) and *not fitting* (not recoverable that way) are different
  problems; the strip now distinguishes them.
- The deficit panel itself rendered inside `examCard()`, inside a collapsed
  disclosure headed "About this plan", below five other cards — 3,935 px down
  the page. It now opens the Plan screen whenever the plan does not fit, and
  stays inside the disclosure when it does.

## Test harness fixes

Two suites were asserting against a layout the app left behind, which is worse
than no coverage because it reports green.

- `ui-geometry.test.js` still used `TABS = ['today','study','revise','progress','more']`.
  There is no `more` button, so `[mode/more]` clicked nothing, measured whichever
  screen was already up, and **passed for a screen it never opened**. All three
  tab loops now fail loudly if a tab button is absent.
- The same file asserted `railTabs.length === 5` and *"Log is no longer a
  separate destination"*. Both described a layout two versions old.
- `e2e.test.js` looked for Log controls via `[data-qconf],[data-qerr],#qChose,[data-qapp]`
  — all of which only exist *after* a question is chosen. The check could not
  pass even on a perfectly rendered screen. It now also accepts the front
  controls (`[data-qr]`, `[data-qlog]`, `[data-qopen]`).
- The contrast probe flagged the greyed Copy/Share/Download buttons on Help.
  WCAG 1.4.3 exempts inactive controls; disabled elements are now skipped.

### Dispatch coverage, in `smoke.test.js`

The browser suites could not catch a fall-through by comparing rendered text: a
post-render mount makes Today's own output differ between visits, so a tab
falling through to `renderToday()` still looked "distinct". Compare the
declaration instead — every `data-tab` in `index.html` must have a matching
`tab==="x" ?` branch in the bundle. Exact, covers every tab at once, and
control-tested against both `log` and `myday`.

## Gate status

All nine suites green: smoke, conservation, intelligence, exports, backup,
resilience, search, e2e (Playwright), ui-geometry (Playwright).

---

## V13.2.2_RELEASE_NOTES.md

# Dakshinamurthy v13.2.2 — Simplified UI

## Changes
- Removed the “How are you arriving today?” emotional check-in.
- Removed the separate My Day tab; Today now contains the useful daily schedule.
- Removed hourly check-in reminders. Calendar export now creates a reminder at the start of each scheduled study block.
- Added a simple two-tap MCQ logger on Today: choose topic → Right / Fragile / Wrong.
- MCQ quick logging does not require source, subtopic, or question number.
- Kept Normal and Empathy as the only day modes; removed the separate Calm Day/minimum-day layer.
- Removed Coach from primary navigation to reduce feature overload.
- Removed the AI/Coach intelligence card from Today.
- Kept existing learning, practice, progress, plan, setup and help functionality intact.

## QA
- `npm test` PASS.
- JavaScript syntax checks PASS.
- Playwright E2E/UI tests could not run because Playwright was not installed in the build environment.

---

## V13.2.3_RELEASE_NOTES.md

# Dakshinamurthy v13.2.3

## Navigation simplification
- Reduced primary navigation to exactly five fixed bottom tabs: Today, Learn, Practice, Progress, More.
- Removed the separate top navigation bar.
- Added a simple More screen containing Log MCQ, Plan, Setup, Help and optional AI tools.
- Secondary screens highlight More so the user always knows where they are.
- Search destinations updated to reflect the five-tab structure.
- Kept the existing study data, curriculum, adaptive engine and schedule intact.

---

## V13.2.4_RELEASE_NOTES.md

# Dakshinamurthy v13.2.4 — Simplify the daily workflow

- Reduced primary navigation to exactly five fixed bottom tabs: Today, Learn, Practice, Progress, More.
- Simplified Today to date/exam/mode, daily completion, schedule, and quick MCQ logging.
- Kept Normal and Empathy as the only visible day modes; removed the separate minimum/Calm-day entry point from the primary workflow.
- Simplified Practice to Log an MCQ and Revise Due, with one-tap Right/Fragile/Wrong logging.
- Simplified Progress to six essential signals with detailed topic data behind a disclosure.
- Simplified Learn to Current Phase + All Phases.
- Kept infrequent tools under More.
- Preserved the adaptive engine, three-pass curriculum, calendar/reminder generation, backup and existing data structures.

---

## V14_RELEASE_NOTES.md

# Dakshinamurthy v14.0.0 — Simplification & Stabilisation

## Navigation
- Four fixed bottom tabs: Today, Practice, Progress, More.
- Learn moved into More.
- Removed the legacy top/reference navigation from the shell.
- Fixed More routing and secondary-screen highlighting.

## Visibility
- Larger touch targets and stronger text contrast.
- Tighter content width and safer bottom padding for mobile devices.
- Reduced card density on Today, Practice and More.

## Simplification
- Removed redundant streak display from Today.
- Removed duplicate quick MCQ logger from Practice home; logging opens as a focused action.
- Reduced explanatory copy where the interface is self-explanatory.
- Kept adaptive intelligence underneath the UI rather than exposing unnecessary controls.

## Stabilisation
- Package, HTML, UI bundle and service-worker release versions are generated from one version source.
- More navigation is explicitly handled to avoid dead taps or incorrect route fallbacks.
- Existing conservation, intelligence, export and backup tests remain part of the release gate.

---

## V14.0.1_RELEASE_NOTES.md

# Dakshinamurthy v14.0.1

## More navigation hotfix
- Fixed the bottom **More** button so it opens the More screen reliably even if delegated click handling is delayed or affected by browser/PWA event state.
- Added a minimal public navigation bridge (`SMNAV`) for the static navigation shell.
- Static bottom navigation now uses an immediate, deterministic click path while preserving the existing delegated navigation for generated content.
- Kept the four fixed bottom tabs: Today, Practice, Progress, More.
- Learn remains inside More.

## Validation
- Core release test suite passes.
- Curriculum/question-bank conservation checks pass.
- Intelligence, exports, and backup round-trip checks pass.

---

## V14.1.0_RELEASE_NOTES.md

# Dakshinamurthy v14.1.0 — Clarity & Reliability

- Reworked navigation into a single validated navigation contract.
- Added capture-phase navigation for the fixed bottom rail and generated More actions.
- Removed competing inline navigation handlers from the static shell.
- More is reorganized into Study and App groups with clearer touch targets.
- Added a concise workflow tip to reduce decision paralysis.
- No curriculum, question-bank, scheduling, or study-data changes.

## QA
- Core release, conservation, intelligence, export, and backup tests are run after build.
- Browser E2E remains environment-dependent if Playwright browsers are unavailable.

---

## V14.2.0_RELEASE_NOTES.md

# Dakshinamurthy v14.2.0 — Adaptive Today

- Promoted the existing adaptive engine to a single, prominent **Next Best Action** on Today.
- One-tap start for the recommended 30-minute block, plus the existing 15-minute minimum option.
- Recommendation is evidence-based and uses the existing mastery, retrieval, confidence, retention-risk and planned-work signals.
- Preserved curriculum, 13,729-question bank, 3-pass plan, 60:40 MCQ-heavy rule, 1.5× lecture playback, Normal/Empathy modes, offline architecture and existing study data.
- No Viva or mock content restored.
- Added mobile-friendly visual treatment and touch targets.

---

## V14.3.0_RELEASE_NOTES.md

# Dakshinamurthy v14.3.0 — Adaptive Session Intelligence

## Focus
Make the adaptive session resilient, visible, and recoverable on mobile devices.

## Changes
- Added an active-session cockpit to Today.
- An unfinished adaptive session is explicitly shown as **ACTIVE SESSION · RESUMED**.
- Shows current block, block position, session type, and progress bar.
- Added one-tap completion and finish-session controls from Today.
- Session state remains local and survives reload/background suspension through the existing persistence layer.
- Keeps the existing adaptive engine, curriculum, MCQ bank, 3-pass plan, 60:40 rule, Normal/Empathy modes, and offline-first architecture unchanged.
- No Viva or mock content reintroduced.

## Validation
- JavaScript syntax check passed.
- `npm test` passed: smoke, conservation, intelligence, exports, and backup suites.
- Playwright browser tests are not claimed as passed unless the browser dependency is installed and executed.

---

## V14.4.1_RELEASE_NOTES.md

# Dakshinamurthy v14.4.1 — Recovery Refinement

- Refines v14.4 Intelligent Recovery without changing the recovery philosophy.
- Recovery uses actual scheduled block durations (minimum 15 minutes) rather than a flat 30-minute estimate.
- Recovery offers now have a daily lifecycle: completed, stopped, or dismissed.
- Completing a recovery block records the recovery so the same offer does not immediately reappear.
- “Not today” dismisses recovery for the current day only; no catch-up debt is created.
- Stopping an active recovery session prevents repeated prompting on that day.
- Recovery lifecycle state is included in backup/restore.
- Existing Normal/Empathy schedules, curriculum, 3-pass coverage, MCQ banks, and offline persistence remain unchanged.

---

## V14.4.3_RELEASE_NOTES.md

# Dakshinamurthy v14.4.3 — Recovery Signal Refinement

- Recovery remains bounded and optional.
- Recovery card now shows recent affected days and total missed minutes.
- Messaging explicitly frames recovery as an opportunity, not a second plan.
- Normal campaign remains protected; no catch-up debt is created.
- No curriculum, MCQ bank, scheduling model, or study-mode changes.

---

## V14.4.5_RELEASE_NOTES.md

# Dakshinamurthy v14.4.5 — Today Intelligence: Recovery + Repair

## Purpose
Merge recovery and repair into Today so the user does not have to decide between separate queues.

## Changes
- Today now has one intelligent next-step card.
- Unfinished scheduled work remains the primary route; repair/retrieval evidence is folded into that block rather than creating a second queue.
- When the day has no unfinished campaign work, due retrieval / repair sets can become the next useful action.
- When a meaningful recent miss pattern exists and the campaign has no unfinished work, the recovery block becomes the single bounded bridge back into Today.
- Recovery remains optional, capped at 30 minutes, and never creates catch-up debt.
- No campaign schedule mutation is performed by recovery or repair presentation.
- Existing 15-minute minimum-day escape remains available on normal Today actions.

## Product principle
Today should answer one question: **what is the most useful thing to do now?** Recovery and repair are signals inside that decision, not separate destinations.

---

## V14.4.6_RELEASE_NOTES.md

# Dakshinamurthy v14.4.6 — Today Recovery Bridge

## Purpose
Make Recovery and Repair part of the same Today decision, so the user never has to choose between competing queues or watch the engine change its mind between the Today card and the started session.

## Changes
- Today now computes a single recovery bridge target.
- When meaningful recovery is warranted, existing repair evidence (repair flag, repeated miss, or confident-wrong signal) is preferred before broad new learning.
- Recovery target selection is deterministic and uses retention risk, due evidence and topic name as tie-breakers.
- The exact Today-selected target is persisted into the recovery session so the session cannot drift to a different topic on start.
- Recovery remains optional, bounded to 30 minutes, and creates no catch-up debt.
- The campaign schedule remains untouched.
- Repair/retrieval signals continue to be folded into unfinished Today work first.

## Product principle
**Today is the director. Recovery and Repair are signals, not destinations.**

---

## V14.4.7_RELEASE_NOTES.md

# Dakshinamurthy v14.4.7 — Today Anchor

## Purpose
Make Today the stable bridge between the campaign schedule and adaptive repair/recovery.

## Changes
- Today now identifies the first genuinely unfinished scheduled block as its anchor.
- Adaptive repair/retrieval evidence can shape how that block is studied, but cannot silently replace the scheduled block.
- Starting the Today session persists the same anchor label, preventing a mismatch between the Today card and the session.
- Recovery remains a bounded, optional bridge only when meaningful recent misses qualify.
- No campaign schedule mutation and no catch-up debt.

## Product principle
**The plan tells you what matters today; evidence tells you how to work on it.**

---

## V14.4.8_RELEASE_NOTES.md

# Dakshinamurthy v14.4.8 — Today Bridge

## Purpose
Merge Today, repair and recovery into one stable decision without creating a second plan.

## Changes
- Added a single Today bridge decision layer shared by the Today card and session start.
- When an unfinished scheduled block exists, repair/retrieval becomes an overlay on that block rather than a competing destination.
- The exact Today bridge is persisted into the session so Start cannot silently select a different target.
- Recovery remains the fallback only after Today’s scheduled work is clear and a meaningful recent-miss threshold is met.
- Today remains the single user-facing decision point; no catch-up debt and no campaign schedule mutation.

## Product principle
**Today decides the next action; repair and recovery change the method, not the plan.**

---

## V44_RELEASE_NOTES.md

# Dakshinamurthy v14.4.0 — Intelligent Recovery & Daily Flow

- Added bounded recovery guidance for recent unfinished scheduled work.
- Recovery never converts missed work into automatic catch-up debt.
- Today remains protected; at most one 30-minute recovery block is offered.
- Recovery uses the existing adaptive decision engine to select the action/topic.
- Recovery blocks persist through reload/backgrounding using the existing session state.
- No curriculum, MCQ bank, pass structure, lecture speed, or Viva/Mocks content changed.

---

## DEBUG_AUDIT_2026-09-12.md

# Dakshinamurthy — Debug & Usability Audit (12 Sep 2026)

Method: not a manual read-through only. All files were syntax-checked with
`node --check`, then the actual app was served locally and driven with a
real headless Chromium (Playwright) — clicking through every tab and dozens
of buttons — capturing genuine console errors, failed network requests, and
real hit-testing results, before and after each fix.

## Fixed in this pass

### 1. [Critical] The entire "V20 visual layer" never rendered, on any screen
`visual-v20.js` threw `ReferenceError: state is not defined` on **every
single render**, confirmed on Today/Learn/Practice/Progress/More and after
essentially every button click. Cause: `state`, `tab`, and
`progressBreakdown()` are private variables inside `ui.js`'s IIFE;
`visual-v20.js` runs in its own IIFE and has no access to them. The error
was swallowed by a `try/catch` in `smV20VisualRefresh`, so it failed 100%
silently — the "Your Journey" hero, coverage %, weekly-hours chip, mode
chip, and all card/row icon decorations had never actually appeared.
- **Fix**: `ui.js` now publishes `window.__smVisual = {tab, visualMode,
  progress}` at the end of every `render()`; `visual-v20.js` reads that
  bridge instead of reaching into `ui.js`'s closure.
- **Verified**: 0 console errors/warnings across all 5 tabs after the fix;
  the Journey hero now renders with live coverage/velocity data.

### 2. [Critical usability] The header's mode button was untappable
The "FOCUS/STUDY/NIGHT MODE" pill in the brand header — the only header
shortcut into Settings — was covered by its own parent's decorative
`::after` ring. This isn't a guess: Chromium's real hit-test reported
`.sm-v16-brand intercepts pointer events` when attempting the click. Since
the brand header is global chrome, this button was dead on every screen.
- **Fix**: added `pointer-events:none` to `.sm-v16-brand:after`
  (`surgimaster.css`).
- **Verified**: the button now receives clicks in Chromium.

### 3. Missing PWA manifest
`index.html` and `sw.js` both reference `manifest.webmanifest`, but the
file didn't exist anywhere in the project — degrading "Add to Home
Screen" (no name/theme/icons for the OS to use).
- **Fix**: added `manifest.webmanifest` with name, theme colour matching
  `index.html`'s `<meta name="theme-color">`, and both existing icons.
- **Note**: `icon.png` is actually 196×196 and `icon512.png` is actually
  532×532 (not the round 192/512 the filenames imply). The manifest now
  declares the *real* dimensions so it's honest, but for best OS/installer
  compatibility you should re-export both icons at exactly 192×192 and
  512×512 — flagging this rather than silently leaving it.

### 4. Icon filename mismatch in the service worker
`sw.js` precached and referenced `./icon-512.png` (with a hyphen); the
shipped file is `icon512.png` (no hyphen). That asset never precached, and
push notifications would have shown a broken icon.
- **Fix**: corrected both references in `sw.js`.

### 5. Cruft in `index.html`
A stray literal `\n\n` text node and ~20 blank lines were sitting directly
in `<head>` (harmless to rendering, but debug leftovers).
- **Fix**: removed.

## Confirmed NOT broken (checked, worth knowing)
- All 7 JS files pass `node --check` — no syntax errors anywhere.
- `save()` in `ui.js` is solid: three-generation recovery ring in
  localStorage, JSON validation before trusting a snapshot, and a visible
  `#saveWarn` banner on failure. No changes needed.
- Clicked through ~150 buttons/toggles across Today, Learn, Practice,
  Progress, and More with no crashes traceable to the app itself (one
  browser-automation flake unrelated to app code, not reproducible in a
  narrower re-test).

## Round 2 — engine.js (the scheduling/SRS core, previously unexamined)

Tested by loading the live app in headless Chromium and calling every major
`window.SM` function directly with edge-case and malformed inputs (bad
dates, negative/NaN numbers, null collections), then reading the real
results rather than the source alone.

### 6. [Real, fixed] Three functions crash on a corrupted/edited state
`dueQueue()`, `loopQueue()`, and `failsafe()`/`evidenceNeeded()` all call
`.filter()`/`Object.keys()` directly on their `misses`/`days` parameters
with no null-guard. `dueQueue` runs on **every render** (it computes the
Practice-tab badge count), so if `state.misses` or `state.days` were ever
`null` — e.g. from a manually edited backup, a partial restore, or a future
migration slip — the whole app would hard-crash to the boot-error screen
instead of degrading gracefully.

This is a real inconsistency, not a hypothetical: `failsafe()`'s own
`scores` parameter is already guarded with `scores||{}` two lines above the
unguarded `days`/`misses` use in the same function, and `repairSets()` /
`mergeScores()` elsewhere in the same file already follow the `(x||{})`
convention throughout. These four were the only outliers.
- **Fix**: added the same `x = x||{}` / `x = x||[]` guard the rest of the
  file already uses, in `dueQueue`, `loopQueue`, `failsafe`, and
  `evidenceNeeded` (`engine.js`).
- **Also hardened**: `validStateJSON()` in `ui.js` only checked that
  `prefs` was an object — it didn't check `misses` was an array or `days`
  was an object, so a state file that would crash `dueQueue` could still
  pass validation and get treated as a trustworthy recovery snapshot. It
  now checks both, so a genuinely malformed snapshot gets rejected at the
  door instead of being accepted and crashing later.
- **Verified**: `SM.dueQueue(null, Date.now(), 10)` now returns
  `{queue:[], total:0}` instead of throwing; full tab walkthrough still
  shows 0 console errors.

### 7. Ruled out (initially looked like a bug, wasn't)
I first tested `calculateNextInterval()` — the core SM-2 spaced-repetition
formula — with what I thought were "total fail" vs "perfect recall" inputs
and got identical output for both, which would have been a serious bug in
the retention scheduling itself. On inspecting the source, my test had the
four arguments in the wrong order/count. Re-tested with the correct
signature (`quality, ef, interval, reps`) across a 5-repetition success
streak and a failure case: intervals grow correctly (1 → 6 → 16 → 45 → 131
days) on repeated success and reset to 1 on failure, EF moves in the
expected direction each time. **No bug here** — noting it so you know it
was checked, not skipped.

### 8. Minor, low-priority, not fixed
- `SM.hhmm()` and date-formatting helpers (`pretty`, `shortDate`) produce
  literal `"NaN:NaN"` / `"undefined NaN"` strings if ever given corrupted
  input, rather than a safe fallback. Given #6's fix now stops corrupted
  collections from reaching the engine, and the recovery-snapshot
  validation is stricter, this is unlikely to surface — flagging it as a
  "belt and suspenders" item rather than fixing it now, since guessing at
  the right fallback text without seeing where each is displayed risks
  introducing a worse message than the current obviously-broken one.

## Round 3 — functional/state-mutation testing + a correction to Round 2

I want to correct something from the last round rather than let an
overstated claim stand. I re-checked where `dueQueue`'s `misses` argument
actually comes from in practice: **`load()` already sanitizes
`state.misses`/`state.days` into safe types on every code path** — the
normal load, the corrupted-JSON recovery path, and the final hard-coded
default — all three explicitly do `Array.isArray(x.misses)?x.misses:[]`
before `state` is ever touched elsewhere. So the null-guards added to
`dueQueue`/`loopQueue`/`failsafe`/`evidenceNeeded` are correct, harmless,
and good practice (defense-in-depth, consistent with the rest of the
file) — but I was overstating it as something that would crash the app
today. It wouldn't have, given the existing `load()` sanitization. I'm
flagging the correction so you have an accurate severity picture, not a
scarier one than the facts support.

I also traced `mergeBackup()` — the function that processes an actual
user-uploaded backup file, the one place truly external/unpredictable
data enters the app — back through its caller. `parseBackup()` already
validates the uploaded JSON thoroughly (`Array.isArray`, per-entry `id`/
`topicId` checks) before anything reaches `mergeBackup`, so that path was
already solid. Confirmed by testing three deliberately malformed backups
against the real `SM.parseBackup`: a wrong-shape object, unparseable
text, and an array with a null/undefined entry — all three were rejected
with a clear, correct error message (`"That is not a SurgiMaster
backup."` / `"That is not valid backup text."` / `"Some entries are
damaged — not importing."`), none crashed.

### 9. Confirmed working correctly (no changes needed)
- **Session lifecycle**: starting a session via the real "Start this
  session" button populates `state.session` with the expected shape
  (blocks, strategy, mode) and persists it to localStorage immediately;
  "Finish session" clears it back to `null`. Verified by reading
  localStorage directly before/after each real click, not just watching
  for console errors.
- **Storage-quota failure handling**: stubbed `localStorage.setItem` to
  throw `QuotaExceededError` (simulating a full/blocked storage device,
  a real scenario on older iPads), then triggered a real save through
  the actual UI (toggling visual mode in Settings). The `#saveWarn`
  banner correctly appears ("Not saving right now — check available
  storage."), the app keeps navigating and responding normally instead
  of locking up, and once storage is available again the very next save
  succeeds and the banner clears itself automatically. This is exactly
  the right behavior and needed no changes.
- **Timer architecture**: the one `setInterval` in the app (the session
  clock tick) is created once at script load, not recreated per render —
  confirmed no interval-stacking leak.
- **Event-listener architecture**: per-render controls use `.onclick=`/
  `.oninput=` assignment (which replaces rather than stacks), and the
  global delegated listeners (settings, navigation) are registered once
  behind an idempotency flag (`document.documentElement.dataset.sm...`).
  No duplicate-handler risk found from repeated renders.
- Re-scanned the five other functions flagged by a broader static pass
  (`cloneItems`, `layoutDay`, `trimItems`, `splitItems`, `cutToTarget`) —
  all are only ever called with arrays the scheduling algorithm builds
  internally in the same call chain, never with anything from persisted
  or external state. No realistic path to a null input, so left
  unchanged rather than adding guards with nothing to guard against.

## Overall stability assessment after three rounds
Between the two visible/interactive bugs fixed in round 1 (dead visual
layer, untappable header button) and the state-handling hardening in
round 2, plus everything re-confirmed working correctly in round 3, I
don't have any further reproducible defect to chase. The remaining items
below are deliberate judgment calls I'm leaving to you rather than
things I couldn't find — the difference between "debugged" and "polished
to your taste" on the CSS consolidation in particular.

## Round 4 — active improvements (not just debugging)

Everything above was finding and fixing defects. This round acts on items
previously only flagged, plus one new visible bug found along the way —
each verified with the same screenshot/console-error process as before.

### 10. [Real, fixed] "More" tab icons rendered as solid black blobs
Found while re-screenshotting after the CSS cleanup below (not something I
was told about — screenshot comparison caught it). The Plan/Settings/
Tools/AI Study icons on the More tab use the same `smV21Icon()` SVG
helper as two other icon contexts in the app (`.simple-icon`,
`.sm-v21-tile .ico`), but unlike those two, the CSS for this context
(`.sm-v29-more-simple .mi`) never set `fill:none;stroke:currentColor` on
the child SVG — so the browser fell back to the SVG default of solid
black fill instead of the app's gold outline-icon style used everywhere
else. Confirmed the other two contexts already had the correct rule
before copying their exact pattern across, so this is now visually
consistent with the rest of the app rather than a guess at what looked
right.
- **Fix**: added `.sm-v29-more-simple .mi svg{fill:none;stroke:currentColor;...}`
  matching the established pattern exactly.
- **Verified**: before/after screenshots — solid black shapes → clean gold
  line icons.

### 11. Dead CSS removed (with a near-miss worth mentioning)
Found and removed 18 CSS rules (`.sm-v26-more-card`, `.sm-v26-more-grid`,
`.sm-v26-practice`, `.sm-v26-practice-grid`, and their descendants) and
the unused `.sm-v19-divider` — confirmed genuinely dead by checking every
class in the family against `ui.js`, not just the one class I happened to
notice.

Worth being transparent about a mistake I caught before shipping it: I
initially also flagged `.card.t-drape`/`.card.t-amber` as dead, because a
literal string search for `"t-drape"` in `ui.js` finds nothing. But
`ui.js` builds that class name dynamically — `card(inner, tone)` does
`"t-"+tone`, and `"drape"`/`"amber"` are passed as the `tone` argument in
dozens of places across the file. Those two are actually among the most
heavily-used styles in the entire app (they color nearly every card).
Deleting them would have broken visible styling almost everywhere. I
checked for exactly this dynamic-construction pattern before deleting
anything and reverted that part of the plan — but I'm telling you about
the near-miss rather than only the clean result, since "I checked
carefully" is only meaningful if I show what checking carefully caught.
- **Removed**: 18 confirmed-dead rules, ~1.9KB.
- **Verified**: full tab walkthrough shows 0 console errors after removal;
  screenshot comparison shows no visual change on any screen (since none
  of the removed classes were ever applied to anything on screen).

### 12. Icons resized to standard PWA dimensions
Per the caveat flagged two rounds ago: `icon.png` was 196×196 and
`icon512.png` was 532×532 — non-standard sizes that some OS install
flows check for exactly. Resized both to 192×192 and 512×512 (center-crop,
imperceptible — confirmed by viewing the result) and updated
`manifest.webmanifest` to declare the correct, honest sizes.

### 13. Engine changelog moved out of the shipped file
`engine.js` opened with ~380 lines of build-history comments before any
code. Moved verbatim into `CHANGELOG.md` (new file, matches the project's
existing `*.md` convention) and replaced it in `engine.js` with a 4-line
pointer comment. `engine.js` is now 2189 lines instead of 2569 — same
behavior, confirmed by `node --check` and the full test suite, smaller
file shipped to every user's browser.

## Files changed this round (attached)
- `surgimaster.css` (dead-code removal + More-tab icon fix)
- `engine.js` (changelog extracted)
- `CHANGELOG.md` (new)
- `manifest.webmanifest` (correct icon sizes)
- `icon.png`, `icon512.png` (resized to 192×192 / 512×512)

## Round 5 — the CSS consolidation, done properly (not skipped, not brute-forced)

You asked me to fix the 303 `!important` declarations. I want to walk you
through exactly what I did and why the honest result is "partially, with
proof," not "all fixed" — because pretending otherwise would leave you
worse off than knowing the real shape of the problem.

**First, I built a regression harness**, since hand-editing 300 rules in a
file that controls every screen, in three visual modes, was too risky to
do by inspection alone (round 4 already had one near-miss). The harness
captures the actual *computed style* — not the source CSS, the real
values the browser resolves — of every element, on all 5 tabs, in all 3
visual modes (focus/study/night): 17,307 individual element/property
readings as a baseline, then diffs any change after each edit.

**Step 1 — merge duplicate selectors.** 55 selectors were defined 2+ times
across the file (`.sm-v17-nav` 21 times, `.sm-v16-brand` 10 times, etc.).
My first instinct — merge same-selector rules in file order, since same
selector means same specificity — turned out to be wrong. I ran it
through the harness and got **114 real diffs**: `.eyebrow.drape` text
color changed from gold to grey, header sizing shifted, and more. The
cause: when an earlier occurrence sets a property the later one doesn't
restate, merging "carries it forward" to the later position — jumping
over some other unrelated rule that was supposed to override it in
between. I reverted that immediately rather than ship it.

I derived the actual safe condition instead: merging is provably harmless
only when the *last* occurrence's properties are a superset of every
earlier occurrence's properties (nothing gets moved past a point where it
would've been overridden anyway). Checked all 55 against that condition:
**only 10 qualified.** The other 45 are the "later version only overrides
what changed, still relies on the earlier rule for the rest" pattern —
not copy-paste mistakes, a real (if untidy) incremental-versioning
convention. Applied the 10 safe merges, re-ran the harness: **0 diffs.**

**Step 2 — quantify the `!important` count.** Rather than guess which of
the 282 remaining `!important` flags are dead weight versus load-bearing,
I measured it: stripped every single one in one pass and ran the full
harness. Result: **507 real computed-style regressions** — button text
going the wrong color when active, mode-specific overrides no longer
applying, and more. That's decisive: the overwhelming majority of these
declarations are doing real work (visual-mode overrides, active/selected
state colors), not redundant leftovers. I reverted this experiment too.

**What this means for "fix the 303":** the honest number of `!important`
declarations I can *prove* are safe to remove, at this level of rigor, is
close to what the 10-selector merge already captured incidentally — the
rest would each need to be tested individually (isolate one declaration,
strip just that one, run the full 15-combination harness, keep or
revert), which is hundreds of additional verified rounds for a change
that fixes no bug — the one real defect this pattern caused (the
untappable header button) was already found and fixed in round 1. Doing
that at full rigor is a legitimate project; doing it faster than that
means trusting pattern-matching over verification, which is exactly what
produced the 114-diff and 507-diff near-misses above. I'd rather hand you
a smaller, fully-proven improvement than a large, unproven one.

- **Applied and verified**: 10 duplicate-selector merges, 0 visual diffs
  in the browser-verified regression suite.
- **Measured but not applied**: full `!important` removal (507 real
  regressions — proof of necessity, not a fix).
- `surgimaster.css` is now 85,379 bytes (from 86,718 after round 4), 282
  `!important` declarations (from 303), same computed output on every
  screen in every mode, confirmed by the harness rather than by eye.

If you want the deeper cut — testing each remaining `!important`
individually — I can do that as a dedicated, longer pass using the same
harness; it's mechanical from here, just slow (roughly one verified
round-trip per declaration or small batch).

## Round 6 — the `!important` cleanup, actually finished

Round 5 found that a first-pass approach was too risky and stopped after
proving the danger rather than the fix. That caution paid off: the next
attempt to finish the job surfaced a real bug in my own test harness —
repeatedly navigating one browser page to the same URL was silently
serving a stale cached copy of the CSS, so several rounds of "0 diffs"
were comparing pristine against a cached copy of pristine, not against
what I'd actually changed. I traced this down through multiple false
leads (animation timing, a frozen clock, browser caching) before finding
the actual cause, and I want to be upfront that this cost a lot of back
and forth before landing on the fix — a **fresh browser context for every
single test**, never reusing one page across multiple navigations. That
one change took the harness from "found nothing" to correctly finding
real, reproducible results, confirmed with a control test (a deliberately
injected change was correctly caught) and cross-checked against a manual
CSS-cascade inspection and an isolated minimal HTML reproduction.

Rebuilt the full 282-item bisection under this corrected harness:
**255 of 282 `!important` declarations removed, 27 kept as genuinely
necessary**, verified three independent ways — the bisection's own final
combined-removal check (0 diffs), a completely separate fresh-process
re-verification script (0 diffs), and a full click-through of every tab
with 0 console errors. Also eyeballed before/after screenshots of the
Today and More tabs — no visual change.

The 27 that remain are exactly the declarations you'd expect to need it:
base card/button/nav styling and the study-mode/night-mode theme
overrides that have to always win regardless of specificity. Nothing
arbitrary was kept — each one is in the list because removing it produced
a measured, real, computed-style difference in the browser.

`surgimaster.css` is now 82,829 bytes (down from 88,827 originally) with
27 `!important` declarations (down from 303). Same visual output on every
screen, in every mode, verified rather than assumed.

## Not fixed — flagged for you to decide on (larger, riskier changes)

### A. Heavy CSS redundancy from stacked "vN" patches
`surgimaster.css` has **303 `!important` declarations** in under 1,000
lines. Core selectors are redefined many times over across versioned
blocks rather than edited in place, e.g.:
- `.sm-v17-nav` — 21 separate rule blocks
- `.sm-v19-ribbon` — 10
- `.sm-v16-brand` — 10
- `.sm-v14-progress` — 7

This isn't cosmetic — it's why bug #2 above existed: a decorative rule
added in a later "vN" block silently broke an interactive element defined
earlier. I didn't attempt a full consolidation (high risk of visual
regressions without a human reviewing each merged rule), but recommend
budgeting a dedicated pass to fold each class's history into one block per
selector, oldest additions first, before the `!important` count grows
further.

### B. A possible visual overlap worth a look
In a full-page screenshot of the Today tab, some body text appeared to run
directly behind the sticky nav bar's translucent background. This may be
an artifact of how full-page screenshots render `position:sticky` elements
(they show in natural document flow, not "stuck"), so I'm flagging it as
"worth a manual look on a real phone" rather than a confirmed bug — I
didn't want to over-claim a rendering artifact as a real defect.

## Files changed (attached)
- `visual-v20.js`
- `ui.js` (visual bridge + `validStateJSON` hardening)
- `engine.js` (null-guards in `dueQueue`, `loopQueue`, `failsafe`, `evidenceNeeded`)
- `surgimaster.css`
- `sw.js`
- `index.html`
- `manifest.webmanifest` (new)

## Also worth knowing
`engine.js` opens with **~380 lines of changelog comments** before any code
starts (documenting builds back through v36+). It's genuinely useful
history, but it ships to every user's browser as part of the production
file. Moving it to a `CHANGELOG.md` alongside your other `*.md` docs would
shrink the file users download/parse with zero loss of the history — a
small, safe cleanup whenever you're next in there, not urgent.

Drop these back into your project in place of the originals. No data
formats, localStorage keys, or public globals were changed — this is
purely fixing dead code paths and blocked click targets.

---

## FINAL_QA_REPORT_2026-09-12.md

# SurgiMaster 4.2.0 — Final Objective QA

## Prime objectives
1. Adaptive study engine
2. Safe, useful AI integration
3. Easy usability
4. Stability/reliability
5. Real-world viability

## Implemented
- Bounded next-best-action intelligence
- Confidence calibration and dangerous-error prioritisation
- Topic health and explainable priority signals
- Procedural cognitive rehearsal with critical-step integrity
- AI-ready personalised context with explicit user handoff; scheduler remains authoritative
- State schema v7 and migration path
- Transactional recovery snapshots and defensive backup handling
- Unified release stamping from package.json
- Protected 60-minute Gym block on configured five days and separate 60-minute Miscellaneous Time
- Smart notification subscription plumbing with calendar fallback
- Offline-first service-worker shell and recovery diagnostics

## Automated QA
- `npm test` PASS
- Smoke PASS
- Conservation PASS: 13,729 questions x 3 passes = 41,187 exposures conserved
- Intelligence PASS
- JavaScript syntax checks PASS for engine, intelligence, UI bundle and service worker
- Release version 4.2.0 verified

## AI safety/viability boundary
No API key is embedded or silently transmitted. The app creates personalised prompts/context for an external AI only after explicit user action. The deterministic study scheduler remains authoritative.

## Real-device boundary
Automated/browser-side validation cannot certify every iOS Safari/Home Screen behaviour without physical-device execution. Final release is software-QA complete; physical iPhone/iPad acceptance remains an environment-dependent verification step.

---

## V34_RELEASE_NOTES.md

# Dakshinamurthy V34 — Adaptive Intelligence 2.0

Version 5.0.0.

Implemented: adaptive mastery/retention prioritisation, daily next-best-action, session modes, learning-health progress, AI-ready evidence context, protected-schedule awareness, and weekly Gym goal display.

Explicitly excluded: the planned clinical/surgical intelligence feature. No clinical image engine was added.

V33.6 study data, curriculum and question ledger remain authoritative. V34 decision functions are deterministic and do not invent question content or alter the campaign schedule.

---

## UI_DEBUG_REPORT_V33.6.md

# Dakshinamurthy V33.6 UI Debug Report

## Scope
UI/UX only. No anatomy or clinical-image features added. Adaptive learning, curriculum, scheduling, scoring and stored study state are unchanged.

## Fixes
1. Closed the incomplete V33.4 mobile CSS media block.
2. Added UI-only runtime metadata and primary-navigation accessibility labeling.
3. Added touch-target and disabled-state hardening.
4. Added reduced-motion hardening.
5. Added overflow protection for long clinical/question text.
6. Preserved the V33 UI-only service-worker shell.

## Verification
- Smoke: PASS 4.6.6
- Conservation: PASS — 13,729 questions × 3 passes
- Intelligence: PASS
- JS syntax: PASS
- Browser E2E: not run because Playwright is unavailable in the environment.

---

## FINAL_QA_REPORT_2026-09-14-V33.md

# Dakshinamurthy V33 — Visual Engine QA

## Scope
Topic-aware clinical visual asset architecture layered on the approved Dakshinamurthy V31/V32 visual system.

## Visual upgrades
- Six topic-aware visual pathways: hepatobiliary, colorectal, pancreas, vascular, oncology, general surgery.
- Local SVG clinical assets are preferred for reliable/offline presentation.
- High-resolution remote enhancement is available as a secondary source.
- Art-directed crops, controlled ivory/deep-teal backgrounds, full-screen visual viewer.
- SEE → ORIENT → INTERPRET → DECIDE → RECALL learning visual flow.
- Responsive mobile presentation and reduced-motion support.

## Integrity
- No mutation of study state, scheduling, scoring, storage, or adaptive state by V33.
- Existing curriculum conservation verified.

## Tests
- SMOKE PASS
- CONSERVATION PASS
- INTELLIGENCE PASS
- JavaScript syntax PASS
- UI build PASS

Release: 4.6.0

---

## V35_RELEASE_NOTES.md

# Dakshinamurthy V35 — Final

Version 6.2.0.

**6.1.0 and 6.2.0** raise every hardcoded font size in the app by a
compressive, monotonic curve. Body copy goes 14 -> 20px; the 7-10px captions
that dominated the stylesheet all land at 14px. Headings grow least so nothing
overflows. Three width-constrained components (calendar cells, nav labels,
brand tagline) got a layout answer instead — see CHANGELOG.

The first release in this project's history whose UI was verified by
measuring the rendered page in a real browser rather than by reading the
source. That change of method is the release.

## Headline

- **The bottom navigation was off-screen at every viewport width.** Today and
  Learn sat at negative x coordinates and could not be tapped on a phone.
  Fixed, and now guarded by a geometry test at five viewports.
- **The Practice self-rating buttons were blank** — ivory text on an ivory
  background at 1.03:1. Right / Fragile / Wrong is the input side of the whole
  spaced-repetition loop.
- **The home-screen headline was invisible** at 1.02:1, dark on dark.
- **Night mode did not work.** The attribute flipped; the app stayed bright.
  It is now a genuine dark theme.
- **Every disclosure row was ~18px tall** against a 44px touch minimum.

## Also fixed

Sub-screens now highlight More in the nav; the More button keeps its
`secondary` class across renders; the calendar no longer overflows below
390px; keyboard focus is visible; dead ribbon markup that `render()` destroyed
on first paint has been removed; and `tests/e2e.test.js` no longer silently
skips the visual-mode checks.

36 further WCAG AA contrast failures were measured and fixed. Final state is
0 failures across 3 modes × 5 tabs.

## Not changed

The scheduler, curriculum, SM-2 intervals, adaptive intelligence and stored
study state. The question-conservation invariant — 13,729 questions covered
three times over — is re-verified green.

## New

`tests/ui-geometry.test.js` (`npm run test:ui`): 43 checks covering nav
reachability at five viewports, real-click routing, WCAG AA contrast in three
modes across five tabs, horizontal overflow, console errors and touch
targets. `npm run test:all` runs everything.

Each assertion group was verified by deliberately reintroducing the original
defect and confirming the suite fails. See FINAL_QA_REPORT_2026-09-15-V35.md.

---

## FINAL_QA_REPORT_2026-09-15-V35.md

# Dakshinamurthy V35 — Final QA Report

Version 6.4.0. Date 2026-09-15.

## Scope

UI, rendered geometry, colour and accessibility. The scheduler, curriculum,
SM-2 intervals, adaptive intelligence and stored study state are unchanged.
The question-conservation invariant (13,729 questions × 3 passes) is
re-verified green and was not touched.

## Method — what was different this time

Every previous QA report in this repository recorded browser E2E as **"not
run because Playwright is unavailable in the environment."** Playwright with
headless Chromium 141 was available here, so the browser suites were run for
the first time in the project's history.

`npm test` (smoke, conservation, intelligence) passed, as it always had.
`npm run test:e2e` **crashed on its very first action**, unable to click a
navigation button. That single discrepancy is the origin of this report: the
plain-Node tests and the rendered page disagreed, and the rendered page was
right.

Three purpose-built probes were then run across 5 viewports (375/390/412/768/
1280), 5 tabs and 3 visual modes: a geometry/overflow/touch-target audit, a
gradient-aware contrast audit, and a surface-composition probe.

**Two bugs in the harness itself were found and fixed before trusting any
result.** The first contrast probe ignored gradient backgrounds and produced
roughly 80 false positives. The first attempt at fixing contrast then acted
on an assumption ("dm-ui33 is a light theme") instead of a measurement, and
made several elements worse. Both were caught by re-measuring rather than
re-reasoning. Per LESSONS_LEARNED, no probe result was acted on until the
probe was shown to be measuring the real composited pixel values.

## Defects found and fixed

### Critical

**1. Bottom navigation rendered off-screen at every viewport width.**
Measured button positions at 390px: Today `x = -145..-81`, Learn `x = -78..-13`,
Practice `x = -10..54`. The two primary tabs were not merely awkward to hit,
they were outside the viewport. Playwright refused to click them; a real
finger could not reach them either.

Cause: the base rule `nav{left:50%;transform:translateX(-50%)}` was written
for `position:fixed`, where that pair is correct centring. V33.2 changed the
nav to `position:sticky` with `margin:12px auto 0`, which centres on its own,
but left the transform in place. The two methods stacked and shifted the bar
half its own width (-173px at 390) to the left.

Compounding cause: the V33.6 rule intended to fix this on phones
(`@media(max-width:520px){.sm-v17-nav{position:fixed;left:11px;right:11px}}`)
never applied, because `body.dm-ui33 .sm-v17-nav` outranks a bare
`.sm-v17-nav` on specificity regardless of media query. It had been sitting in
the file looking like a fix for two releases.

Fix: one positioning model at every width — fixed, centred by the
left/transform pair, safe-area aware — plus `#app` bottom padding to reserve
the space the now-fixed bar no longer occupies in flow.

**2. Practice self-rating buttons rendered blank.**
`.chip`, `.pick`, `.segb` measured **1.03:1** — ivory text on an ivory
background. These are the Right / Fragile / Wrong and Fluent / Hesitant /
Froze buttons pressed after every single question, i.e. the entire input side
of the SM-2 loop. dm-ui33 gave them a near-white surface but never set their
ink, so they inherited `--sm-ivory` from the superseded dark theme.
Confirmed present in the shipped V34 build by isolating the cascade against a
pristine unzip; not introduced by this work.

**3. Home-screen headline invisible.**
`"Climb, don't chase."` measured **1.02:1**, dark maroon ink on the dark
maroon hero. Same defect on `"Learn · Practice · Recover"` (1.02:1), the
`.sm-v26-pill` labels (1.44:1) and the hero stat labels (1.43:1).

### Significant

**4. Night mode was dead.** The `data-sm-mode` attribute flipped correctly and
`state.visualMode` persisted, but dm-ui33's `!important` rules kept the light
parchment surface: background stayed `rgb(247,241,227)` and cards stayed
`rgba(255,253,248,.96)` in all three modes. Screenshot hashes differed only
by the highlighted button. For an app used late at night before a surgical
exam, this is a real loss, not a cosmetic one.

**5. Every disclosure row failed the touch minimum.** `<summary>` elements
rendered 16–20px tall against a 44px minimum — roughly a third — and they are
the primary means of opening content on four of the five tabs.

**6. No navigation item highlighted on sub-screens.** `settings`, `plan` and
`ai` have no matching `data-tab`, so the active-state loop matched nothing
and the entire bar went unhighlighted.

**7. `className` rebuild deleted the More button's `secondary` class** on the
first render, permanently.

**8. Calendar grid overflowed horizontally** below ~390px, pulling the whole
page into horizontal scroll.

**9. Dead markup in `index.html`.** The static `.sm-v19-ribbon` brand header
was placed inside `#app`, which `render()` clears on first paint. It never
appeared. Removed.

**10. Keyboard focus was invisible** on the parchment surface.

**11. `tests/e2e.test.js` silently tested nothing** for the visual modes. It
used `if (b) { ... }` on `[data-visual-mode]` at a point in the flow where
those buttons do not exist — they live on the Settings sub-screen, reached
from More. The `if` was always false; the test reported PASS regardless.

### Contrast sweep

36 further WCAG AA failures were measured and fixed across the three modes,
including the v14 journey card, the calendar numerals, the action tiles, the
day-timeline tick labels, and the system-health status words. Final state:
**0 failures across 3 modes × 5 tabs**, measured against composited
backgrounds at each element's real rendered font size.

## Verification

| Suite | Result |
|---|---|
| `tests/smoke.test.js` | PASS — 6.0.0 release, boot order, bundle, persistence |
| `tests/conservation.test.js` | PASS — **13,729 questions × 3 passes intact** |
| `tests/intelligence.test.js` | PASS |
| `tests/e2e.test.js` | PASS — first successful run in project history |
| `tests/ui-geometry.test.js` | PASS — new, 43 checks |

Audit findings: geometry **106 → 4**; contrast **36 → 0**. The 4 remaining
geometry findings are the deliberate `text-overflow: ellipsis` truncation of
a long topic label in a calendar cell (the string already ends in `…`), which
is intended behaviour, not a defect.

## Control tests

Per LESSONS_LEARNED, `tests/ui-geometry.test.js` was verified by deliberately
reintroducing each defect and confirming the suite **fails**. A test never
observed failing is not evidence.

| Reintroduced defect | Result |
|---|---|
| Stacked nav centring (`transform` + `margin:auto`) | FAIL × 5 viewports + FAIL on every real click |
| Ivory ink on `.chip`/`.pick`/`.segb` | FAIL on 4 mode/tab combinations |
| `<summary>` touch-target fix removed | FAIL on all 5 tabs |
| `className` rebuild + sub-screen mapping reverted | FAIL on both nav-state checks |

## Known limitations, unchanged

- Push notifications still require a VAPID key and a server this app does not
  have. The calendar-reminder fallback remains the honest path.
- **No physical iOS device testing.** All verification remains headless
  Chromium. Safe-area insets, PWA install behaviour and Web Push can differ
  on real iOS Safari. The nav now uses `env(safe-area-inset-bottom)`
  correctly, but that specific behaviour is unverified on hardware.
- Roughly 30 of ~170 campaign days still run past the configured bedtime.
  This remains a product decision (more days, earlier topic retirement, or
  reduced scope), not a scheduling bug. Two previous attempts to force-fix it
  were correctly reverted; one silently lost 279 questions.
- `surgimaster.css` still carries its 34 historical visual layers. V35 adds a
  single documented resolution layer rather than deleting them, because
  deleting them cannot be verified safe without a visual-regression baseline
  this project does not yet have. That baseline is the natural next piece of
  work.


---

# Addendum — 6.1.0 through 6.4.0

## 6.1.0 / 6.2.0 — type scale

All 400 hardcoded font sizes raised by a compressive, monotonic curve applied
in two passes. Net from the sizes V34 shipped: 7-10px -> 14px, 12 -> 17px,
14 (body) -> 20px, 20 -> 25.5px, 25 -> 29px. Small text gains most, headings
least, so hierarchy is preserved and nothing overflows.

Three components are width-constrained rather than comfort-constrained and
opt out with a layout answer instead: calendar cells drop the per-cell topic
label below 560px and give the space to the day numeral (9px -> 17px); nav
labels hold at 12.5px so "Progress" does not wrap and change the bar height;
the decorative brand tagline holds at 12.5px, having wrapped to four lines and
pushed real content a third of the way down the screen at full scale.

## 6.3.0 — Syllabus, Log, truncated text

**The Syllabus "Current phase" grid was always empty.** `renderStudy()` used
`ph = phaseNow()`, which returns an exam STYLE ("ini"/"neet"), not a curriculum
phase number. The heading read "Phase neet" (undefined name, fallback fired)
and `topics.filter(t => t.phase === "neet")` matched nothing, so the main entry
point into the syllabus rendered blank. Fixed; grid populates and the heading
reads "1. Upper GI & liver".

Fixing it exposed a second defect: those topic cards had never rendered, so
their colours had never been measured, and they carried dark-surface ink on a
light tile. Fixed in both light and dark modes.

**Phase headings were cut mid-word.** Truncated in JS with a bare
`.slice(0, 26)` and no ellipsis, so they ended as "4. Metabolic response,
wound". The curriculum's own names run to 54 characters. Truncation removed;
rows wrap instead of overflowing.

**The Log pointed at a tab that does not exist** ("on the Log tab"). Log and
Redo were merged into Practice in 4.x. Now points at "Log an MCQ" under
Practice questions.

Also: calendar cell labels 6 -> 12 chars, block topic 20 -> 40, block item
32 -> 64, plan heading 44 -> 80, and calendar month arrows raised from 30px to
the 44px touch minimum.

## 6.4.0 — simplification

**Dead CSS: 579 rules / 648 selectors removed, 183KB -> 134KB (26.9%).**

**Dead JS: 11 unloaded `visual-v*.js` modules removed (76KB).** None was
referenced by index.html or the service-worker shell; the single call into
them sat behind a permanently-false guard.

**Phase vocabulary split** into `examStyleNow()` and `curriculumPhaseNow()`.
Filed as cosmetic cleanup, it exposed a SECOND live instance of the 6.3.0 bug:
`renderViva()` filtered CURRICULUM by exam style, so its topic list was always
empty and "Today's topic" always fell back to CURRICULUM[0] while the copy
claimed it came from the current phase.

**Practice flattened.** Three sibling disclosures with the logging UI rendered
last became: due queue, the log at #revq, one collapsed "More detail". Log
controls moved from 1980px down the page to 709px. Nothing deleted.

### How the CSS deletion was verified

Two methods were tried and the first was rejected on evidence.

*Rejected — full-page pixel diffing.* The first prune appeared to change 23 of
48 states. Before investigating, the same build was captured twice as a
control: **15 of 48 states differed against themselves.** The app renders
time-dependent content, so screenshot hashes cannot prove anything here.

*Rejected — source scanning alone.* It marked `t-amber`, `t-drape`,
`sm-health-ok` and `l0` as dead. All four are built by string concatenation
(`" t-"+tone`) and all four are live.

*Also a real finding — the pruner itself was the culprit.* The browser
reported only 1 of 464 candidate selectors ever matching an element, so the
deletions could not explain the pixel change. The damage came from rebuilding
the file out of regex-parsed chunks. Rewritten to excise byte ranges from the
original string back-to-front, touching nothing else.

*Accepted — computed-style parity on identical DOM.* Hot-swap the stylesheet
`<link>` on an already-rendered page, snapshot `getComputedStyle` for 34
properties on every element, swap back, diff. Same DOM, same instant, no
reload, nothing time-dependent can drift.

| Check | Result |
|---|---|
| Computed-style parity, 48 states | **0 changes** |
| Control: one live nav rule broken | **48/48 states flagged** |
| Candidate selectors matching any element (464 tested in browser) | **1** |
| Removed selectors matching in a transient state (463 re-tested, 250 probes) | **0** |
| Control: transient run reached states the shallow census missed | **yes — 4 new classes incl. `t-rust`, `sm-v10-warn`** |

The transient-state pass closes the coverage gap left at 6.4.0's first
packaging: every interactive hook in the app (`data-lmode`, `data-qopen`,
`data-grade`, `data-procedure`, `data-mock`, `data-note`, pickers, chips,
calendar cells) is clicked in two passes — the second reaching controls that
only exist once a panel is open — and every text input is filled to reach
validation states.

Harness retained as `tests/style-parity.harness.js`.

## Suite status at 6.4.0

| Suite | Result |
|---|---|
| smoke | PASS |
| conservation | PASS — 13,729 questions x 3 intact |
| intelligence | PASS |
| e2e | PASS |
| ui-geometry | PASS — 0 findings, 5 viewports, AA contrast 3 modes x 5 tabs |

## Remaining known limitations

- Still no physical iOS device testing. All verification is headless Chromium.
- ~30 of ~170 campaign days still run past the configured bedtime. Unchanged
  product decision, not a scheduling bug.
- `surgimaster.css` is now 134KB. What remains is live, but it is still
  layered: the V35 resolution layer sits on top of earlier layers rather than
  replacing them. Collapsing those into one flat theme is the next structural
  step, and the style-parity harness is what makes it checkable.

---

## V36_RELEASE_NOTES.md

# Dakshinamurthy v9.1.0 — workflow simplification

## Changes
- Removed Viva as a user-facing module, including its navigation entry, search destination and Coach action.
- Removed Mock exams as a user-facing module and stopped the scheduler from creating mock/mock-review days.
- Taper days are now retrieval-only; no mock sub-mode is scheduled.
- Reorganised primary navigation into five destinations: **Today · Learn · Practice · Progress · More**.
- Merged question logging into Practice with a prominent **Log a question** action.
- Kept Log as an internal route only so existing in-app links still open the correct logging screen.
- Moved infrequent tools (Plan, Coach, Setup) under More.
- Reworked Progress into a compact dashboard with four headline metrics and collapsed detailed evidence.
- Preserved existing study history, MCQ logging, adaptive engine, notes, repairs, backup and FSRS/SM-2-related retrieval logic.

## QA
- JavaScript syntax checks: PASS
- npm test suite: PASS
- Plan validation: 72 special days; no mock/mock-review days generated
- Existing offline-first architecture retained
- Browser E2E/UI tests were not rerun because Playwright is not installed in this package environment.

---

## V15_RELEASE_NOTES.md

# Dakshinamurthy v15.0.0 — Adaptive Engine 2.0

## Purpose
A controlled architectural upgrade: the adaptive engine becomes the main decision layer while Today remains the simple user-facing surface.

## Changes
- Added deterministic Adaptive Engine 2.0 evidence profiling across mastery, recent accuracy, confident errors, due retrieval, repair signals, evidence coverage and exam-yield weighting.
- Added one explainable next-best-action decision: recall, repair, transfer or learn.
- Integrated the v15 evidence director into the existing adaptive Today/session decision as an advisory layer; scheduled campaign anchors remain authoritative.
- Added decision confidence and a stable decision key so the same recommendation can be carried into a session.
- Protects the campaign plan and explicitly creates no catch-up debt.
- No campaign schedule mutation.
- Reuses existing offline evidence; never invents question identities or content.
- Preserves v14.4 Today + Repair + Recovery architecture.
- No Viva, mocks, unnecessary anatomy, new tabs, or gamification.

## Principle
Plan decides the destination. Evidence decides the method. Today presents one useful action.

---

## V15.0.2_RELEASE_NOTES.md

# Dakshinamurthy v15.0.2

## Navigation + UI Debug Release

- Hardened the persistent bottom navigation against overlays and touch interception.
- Replaced the More inline handler with the single central navigation gateway.
- Prevented duplicate rail routing from competing event listeners.
- Removed malformed stray shell markup around the search container.
- Preserved Today/Repair/Recovery and Adaptive Engine 2.0 behaviour.
- Added explicit touch-target and stacking isolation for mobile Safari/PWA use.

## User-case focus

1. Today -> More -> Setup -> back to More.
2. Today -> More -> Learn -> More.
3. More -> Help & feedback -> More.
4. More -> AI tools -> More.
5. Open search -> close search -> More.
6. Rapid repeated taps on More do not create duplicate renders or route drift.
7. Switching Today/Practice/Progress/More preserves a single active destination.

---

## V15.1.0_RELEASE_NOTES.md

# Dakshinamurthy v15.1.0 — Navigation restored

## The headline

**In 15.0.2, six screens were unreachable.** Tapping **More** did nothing at
all: no error, no navigation, a dead tab. Behind it sat Learn, Log, Plan,
Setup, Help & feedback and AI tools.

`build-ui.js` concatenated `ui-simple-v14.part.js` *after* the module that
closes the UI's single `(function(){ … })()`. Everything in it ran at global
scope, where `esc`, `state`, `plan` and `shapeToday` do not exist.
`renderMore()` threw `esc is not defined`, `SMNAV` caught the throw and rolled
the tab back, and the failure was silent.

Module order is corrected, and `build-ui.js` now refuses to build if the
IIFE-closing module is not last.

## What that was hiding

Two features described in earlier release notes had **never once rendered on
the device**. Their only call site was the shadowed `renderToday` inside that
module:

- **Adaptive Engine 2.0** (v15.0.0) — the entire point of the release. "Today
  presents one useful action" was never on Today.
- **The recovery offer**, "Not today", and the 15-minute minimum day (v14.4).

Both are restored as one card on Today, following the 9.0.0 precedent:
orphaned is not dead.

## Also fixed

- **"Start this" / "Resume this" was a dead button.** It carried
  `data-nav="myday"`, which set `tab="today"` and repainted the identical
  screen. It now opens and scrolls to the block it names.
- **No way back from any sub-screen.** One back bar, rendered centrally from a
  `SUBSCREENS` table so a screen cannot be added without it. It is a `<div>`,
  not a `<nav>`: unscoped `nav{position:fixed;bottom:…}` rules in
  surgimaster.css pin any `<nav>` under the tab bar, which is exactly where the
  first version of this bar landed — at y=768, untappable.
- **The bottom navigation was invisible in night mode.** The bar kept its day
  background while the night text colours applied: cream on cream, 2.17:1, and
  the active tab at 1.00:1.
- **The More list was unreadable.** A generic button rule outranked it, so
  "Learn" and "Log an MCQ" rendered near-black on near-black at 1.25:1.
- **The search button sat 6px on top of the More tab.** Now 16px clear.
- **Duplicate `id="smAIHandoffMsg"`** — the second AI card's status line could
  never be found. Status now reports in the card that was tapped.
- **Unhandled clipboard rejections** (help.js ×3, ChatGPT handoff). Safari's
  refusal became a page error and told the user nothing; now caught and
  reported, and Share no longer claims success on an empty clipboard.

## Redundancy removed

- ~100 lines of shadowed duplicate Today / Learn / Practice / Progress markup
  that never executed, plus `renderSimpleQuickLog` and `smSimpleStat`.
- A shadowed `smAIPrompt` / `smAIRender` pair, superseded by profile-aware
  versions declared later in the same scope.
- The `myday` route, which only re-rendered Today, and its duplicate "My Day"
  search entry.
- A malformed `nav{ ; ; ; ; }` rule left by `tools-flatten-css.py`.

## Why nine green suites missed all of this

Every unit test greps strings out of the bundle, and every string was present.
Four suites were also stale in ways that made them test nothing:

| Suite | Was | Now |
|---|---|---|
| `e2e.test.js` | asserted a ten-tab rail retired in v13; failed on check 2, not in `npm test` | routes must paint, sub-screens must open and return **by tapping**, all 181 controls must click without error |
| `ui-geometry.test.js` | reached the mode switch through a rail tab that no longer exists, so all three "modes" were the same one | night mode is genuinely exercised — which is how the invisible navigation was found |
| `resilience.test.js` | driven by `[data-emstate]`, an attribute not present anywhere in the UI | driven by the day-tier buttons; 16/16 |
| `recovery` / `today-intelligence` | read one source module, so they passed while the markup they assert on sat in a function that never ran | read the shipped `ui.js` |

`navigation-contract.test.js` gained two browser-free structural guards:
**scope integrity** (nothing may follow the IIFE close) and **no duplicate
top-level declarations** — the second found the shadowed AI pair immediately.

**Control test, per LESSONS_LEARNED.** The original defect was reintroduced:
the scope guard fails and E2E fails 9 checks. Restored, both pass. A test that
has never been seen to fail is not evidence.

## Verification

Thirteen suites green: nine unit, plus E2E 43/43, UI geometry, resilience 16/16
and search. Zero runtime errors across every screen and every control.

---

## V15.2.0_RELEASE_NOTES.md

# Dakshinamurthy / SurgiMaster — 15.2.0

Four things: redundant elements removed, the progress bars rebuilt, an
intelligent scheduler added, and MCQ logging made reversible.

## 1. Redundant elements removed

| Where | What went | Why |
|---|---|---|
| Today | The second "next action" card (`dm24-next-action`) whenever a current block exists | Two full-width buttons, each naming a *different* next action, competing directly above and below each other. The adaptive evidence is now one line inside the card that owns the button. The separate card still renders when there is no current block, so nothing was lost — recovery and repair offers still appear on a finished or empty day. |
| Today | The standalone `sm-today.svg` illustration | The same SVG was already drawn inside the hero directly below it. The page opened with the identical picture twice. |
| Today | The hero slogan, its duplicate art, and the side panel of aphorisms | A screen of marketing ahead of the one card that says what to do. Reduced to a single line: date and exam countdown. The `.sm-v25-route-main` element itself is **kept** — it is the paint sentinel `resilience.test.js`, `search.test.js` and `fresh-audit.harness.js` all wait on. |
| Today | "Schedule reminders" card, promoted above the action card | Once-a-day setup, not the reason the app was opened. Now a collapsed row under the timeline. |
| Learn | The three Learn / Retrieve / Measure tiles | Decorative restatement of the app's own concept, costing a screen of scroll on every visit. |
| Progress | The illustrated banner explaining what the Progress tab is | On the Progress tab. |
| Log | The ledger explainer paragraph and the "See analysis across every topic" button | The pass badge explains the ledger in situ; the analysis has its own tab one tap away. Both sat between you and the topic list on the screen opened dozens of times a session. |
| Log | `42 logged · 71%` printed as text next to a bar showing the same thing | The bar now carries its own label. |
| Session | The `✦ Gold is reserved for progress and action…` note | Design commentary rendered to the user. |

## 2. Progress bars

**The bug underneath the cosmetics.** The V33 theme layer carried
`body.dm-ui33 .fill{background:var(--ui-teal)!important}` and
`.track{height:7px!important}`. Both beat the inline values `bar()` passed. So
every accuracy bar in the app painted the same teal at the same height — a
topic at 38% and a topic at 94% were visually identical, which defeats the
entire reason for drawing a bar instead of printing a number.

Colour and height now travel as inline custom properties (`--c`, `--h`) that an
`!important` rule can still read, so the theme keeps the shape and the caller
keeps the meaning.

Then the cosmetics: inset track, two-stop gradient in the bar's own colour, a
top sheen, a soft glow, rounded caps, an optional pacing marker (where the plan
expects you to be), an optional label row, and an animated width so a bar
re-rendered after a log climbs instead of jumping. `prefers-reduced-motion` is
honoured. `role="progressbar"` with real `aria-valuenow`. Segment bars
(subtopic share, whole-syllabus topics, the Learn tiles) got matching
treatment. A `@supports` fallback keeps the correct hue on any Safari without
`color-mix` — the gradient is polish, the hue is the information.

The Today completion bar deliberately does **not** use the accuracy palette. A
half-finished day is not a bad day; it stays teal and turns gold on the last
block.

## 3. Intelligent scheduler

`SM.intelligentSchedule(state, opts)` — new. `adaptiveEngineV15` answers "what
is the single best next move?"; it could not answer "I have three hours — in
what order?", which is the question an actual study block poses.

Rules it encodes, all of them already stated principles of this project:

- **Hypercorrection opens the session.** A confident error or a due retrieval
  item takes the first slot, while the evidence is warmest.
- **Interleave.** Consecutive slots never repeat a topic while another eligible
  topic exists.
- **No topic eats the session.** Capped at half the slots when two or more
  topics are eligible.
- **Close with retrieval.** The last slot of a session of three or more is
  closed-notes recall on the highest-risk topic.
- **Breadth is bounded by time.** Three topics inside 90 minutes is tourism;
  one topic per two slots, three maximum.
- **Minutes are conserved by construction.** `slots × slotMinutes + spare`
  always equals the minutes handed in. The remainder is reported as buffer,
  never folded into a block.

It is **pure and advisory**: it reads state, never writes it, never moves a
block, never creates catch-up debt. Surfaced on Today as a collapsed *"Smart
order for the remaining N min"*, restricted to today's own topics — so
phase-lock holds by construction rather than by a check.

## 4. MCQ logging

**Undo.** Logging was the highest-frequency action in the app and the only
irreversible one. A single mis-tap on Right wrote an attempt into the ledger, a
point into the pool score, a calibration sample, and (for Wrong) a miss into
the spaced queue — and since the ledger is what every downstream number is
computed *from*, one fat-fingered tap quietly poisoned accuracy, the danger
list and the repair queue at once, with no way back short of hand-editing a
backup file.

Every commit now snapshots its exact inverse *before* writing. One tap reverses
all five effects, including the subtopic cursor. The snapshot is taken inside
`qlogCommit()`, so it covers every path in: the three-button row, the fragile
reasons, the wrong-answer save, and the two-tap quick log on Today.

Deliberately in-memory only. An undo is a correction made within seconds, not a
tool for revising history days later, and a persisted key here would change the
backup payload shape for no real gain — `backup.test.js` still reports the same
24 persisted keys.

**Session strip.** How many logged today, accuracy, and the current
right-in-a-row run, at the top of Log and under the quick log. Built from
calibration samples rather than the MCQ ledger, because that is the only source
that includes two-tap quick logs (which carry no question number and so create
no ledger entry).

## Tests

`npm test` — 14 groups, all passing, including the new `tests/scheduler.test.js`.

Control tests (per LESSONS_LEARNED — a test never seen to fail is not
evidence). Verified to FAIL by deliberately breaking the code they guard:

- conservation — folding the remainder into the slots: fails, 180 vs 185.
- interleaving — removing the same-topic swap: fails on adjacent slots.

**Honest gap:** the half-session cap assertion has *not* been seen to fail.
Round-robin assignment distributes evenly on its own, so the cap is currently
unreachable — it is a regression net for a future risk-weighted assignment, not
a verified control. It is labelled as such in the test file rather than counted
as passing evidence.

`npm run test:ui` (Playwright geometry/contrast) was **not** run for this
build — the build environment had no network to install Chromium. Worth running
on your machine before trusting the new bar rendering at 390px, since the whole
point of that suite is that paint bugs are invisible to source review.

---
