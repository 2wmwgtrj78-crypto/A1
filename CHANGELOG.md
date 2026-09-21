## 16.7.0 — A real correctness bug in the mistake book, and the AI tutor gets eyes on it (2026-09-21)

- **Serious bug fixed: the fast 2-tap logging path never created a mistake-book
  entry on Wrong.** Miss creation was nested inside `if(qlog.number.trim())`,
  and quick-log always leaves `number` empty by design. Every "Wrong" tap
  through what is almost certainly the most-used logging path in the app was
  silently vanishing — no spaced retrieval, nothing in "Ready to redo",
  nothing. Fixed: a miss is now created on every wrong outcome regardless of
  whether an exact question number was given; only the per-question ledger
  (which needs an identity to mean anything) still requires one. Not covered
  by an automated test — `qlogCommit` is browser-only UI code with no DOM
  harness in this project, unlike the engine logic, which is heavily tested.
  Traced manually; flagged here rather than claimed as verified.
- **Quick-log gets a "Right, but guessed" option.** Previously hardcoded
  `reason:"confident"` on every Right tap, so a guess that landed right
  through the fast path could never be flagged by the guess-focus tracking
  added in 16.6. One more button, not a form — still topic-tap + outcome-tap.
- **The AI tutor gets told about guess-rate and speed**, both of which
  existed in the ledger since 16.6 but were never threaded into what the
  tutor reads. A topic at 72% accuracy that's 60% guesses and one at 72% with
  no guessing call for opposite next moves — teach vs. drill — and averaging
  them into one percentage erased exactly that distinction. Now surfaced both
  in the on-screen "Mistake repair" action and in the copied prompt sent to
  an external AI.
- **Tab bar icons replaced.** The four bottom-nav icons were plain Unicode
  dingbats (a filled circle, a ringed circle, a triangle, an ellipsis) with no
  relation to their tabs and no relation to the stroke-icon language already
  used throughout the app's own cards. Real inline SVG now, same 20x20 /
  currentColor / 1.6–1.8-weight language as everywhere else — in the one
  place looked at on every screen.

## 16.6.0 — Closed the three real gaps, and visual identity done the safe way (2026-09-21)

- **Per-MCQ speed, and its correlation with outcome.** Timing previously
  existed only at the block level. Every log entry now carries `secs` —
  dwell time from opening a topic's log panel to tapping Log it, clamped to
  1s–1800s to drop background-app artefacts. Stated everywhere it's shown as
  dwell-time-on-the-entry, not question-reading time, since the app has no
  way to observe the latter. Progress gets a new "Speed vs. accuracy" card,
  bucketed (<15s / 15–45s / 45s–2m / 2m+), each bucket needing 3+ samples
  before it renders.
- **Global guess-focus.** The per-topic version of this already existed
  (buried inside a topic's own drilldown); now a whole-syllabus scan surfaces
  every topic where 40%+ of correct answers were guesses, sorted worst first,
  on Progress — "passing mostly by guessing" as its own card, not something
  found once you already suspected one specific topic.
- **Countdown, not stopwatch.** The per-block timer now counts down against
  the block's own allotted minutes and flips to a small overtime readout
  past zero, instead of an elapsed count with no reference to how long the
  block is supposed to take. The underlying elapsed time still feeds pace
  tracking unchanged — only the display changed.
- **Phase icons.** Seven small inline-SVG glyphs, one per phase, in the same
  stroke-icon language already used elsewhere in the app (20x20, currentColor,
  abstract rather than literal anatomy) — on Plan's phase list, Progress's
  phase rows, and Today's header. Deliberately NOT photographic or CDN-hosted
  images: this is a single offline HTML file, and this app has hit that wall
  three times before (v25/v26 illustrated heroes, mascot art, all removed) for
  bloating the file or needing a network fetch, the exact failure mode that
  broke this app on iPad in the first place. SVG stays offline-safe and small
  while giving the app a bit more visual identity than plain text-only cards.

## 16.5.0 — Start date moved to tomorrow, for real this time (2026-09-21)

- `DEFAULTS.startISO` 2026-09-20 → 2026-09-22 (Tuesday). Orientation now lands
  on the actual next day rather than a date already in the past; content
  begins Wednesday 23 Sep, soft week runs the same 7 days it always has,
  just two days later. 2026-09-20 added to the explicit migration list so an
  existing install moves too — a start date set by hand is still left alone.
- Campaign length unchanged at 178 content days; finish slides two days,
  28 May → 31 May 2027.
- No other change. This is the one the previous suggestion pointed at:
  stop building, actually start using it.

## 16.4.0 — Progress redesigned; found a real layout bug in the process (2026-09-19)

- **Real bug: `class="g4"` had no CSS rule anywhere in the codebase.** The
  "at a glance" four-stat row (coverage, accuracy, pace, due) had never
  actually been laid out as a grid — it was stacking one card per line, full
  width, since whichever version introduced it. Not a style preference; a
  defect that had been sitting there unnoticed.
- **Rebuilt around one hero number: projected readiness.** `SM.readiness()`
  (a confidence-interval exam-accuracy projection, weighted by exam yield and
  coverage) has existed in the engine since before this app's Progress screen
  existed in its current form, but was never surfaced anywhere live — its only
  caller was the dead `renderProgress()` deleted in 15.5.0. It's the single
  most decision-relevant number this screen can show and had never been shown.
  A range (lo–hi), not a false-precise point estimate, with a visual band
  and a qualifying-cutoff marker.
- **Three supporting stats, not four equal ones.** Raw "overall accuracy" was
  dropped from the at-a-glance row — it's a different number from readiness's
  projected accuracy (unweighted vs. yield-weighted and coverage-discounted)
  and showing both invited exactly the "which number do I trust" confusion
  already flagged. Coverage, pace, and due-items remain — each answers a
  distinct question the hero doesn't.
- **Heat map regrouped by phase**, matching the same seven phases Plan already
  uses, with topic names on hover/tap instead of illegible 3-letter
  abbreviations, and an actual legend for what the colour means — colour
  encoding information with no key explaining it is exactly the thing this
  redesign was supposed to fix.
- **Focus-list trophy emoji replaced with the same accuracy-colour dot used
  everywhere else** (Log, Plan, this screen's own heat map) — one colour
  language across the app instead of a one-off decoration.
- No new palette, typeface, or design language introduced — every colour
  reused is an existing token (`--drape`, `--rust`, `--amber`, `--sky`,
  `--muted`) or the existing `accColour()` scale, so Progress still reads as
  part of the same app rather than a fourth visual identity bolted onto it.

## 16.3.0 — A real decluttering pass, not another feature (2026-09-19)

- **The actual problem this addresses:** after several rounds of "remove
  redundant elements" that only ever cut literal duplicates, Plan had grown
  to 7–9 always-visible cards before "About this plan" was even opened —
  every single visit, whether or not any of it needed attention that day.
  Each addition was individually defensible; the total was not.
- **Plan, default view:** the "make it fit" toggle and its levers now only
  show when the plan doesn't actually fit (`hoistFeas`) — no more permanent
  fix-it panel for nothing that's broken. Once it fits, it moves into the
  disclosure, still one tap away. `allocDonut` (time-left donut) and
  `topicLoadCard` (per-topic hours) moved into the disclosure too — occasional
  reference, not daily-use. `replanCard` no longer prints its full explanatory
  paragraph on every visit; it's a one-line entry point now, with the fuller
  explanation surfacing only once Preview is tapped and there's something
  concrete to explain it against.
- **"Everything is covered" removed outright.** Three numbers already known
  from other cards, restated as reassurance with nothing actionable in it.
- **Log's topic-health line (16.2.0) demoted to only-when-noteworthy.** It
  printed a yield tag and a cold-days figure on all 39 rows, every visit —
  mostly "Standard yield" saying nothing. Now shows only High/Low yield calls
  and cold-days past the same 150-day threshold recencyCard itself treats as
  worth flagging. Silence means nothing unusual; that's deliberate, not a bug.
- This is a correction to a pattern, not a one-off: several past changelog
  entries added a card or a line and called it done. Adding without a matching
  audit of what's now safe to hide is exactly how Plan got to 9 cards in the
  first place.

## 16.2.0 — Fit views merged, third pass gets a Settings toggle, topic health in Log, update banner (2026-09-19)

- **Plan's two "make it fit" cards merged into one panel with a toggle.**
  `fitPlannerCard` (hours-deficit levers) and `fitDateCard` (bedtime overrun →
  the date that removes it) sat far apart — one hoisted, one buried in "About
  this plan" — despite being the same question read two ways. They still
  measure genuinely different things and are not collapsed into one number,
  but now share one "By effort / By date" toggle so the question is asked once.
- **Third pass (`p3MinYield`) gets a standing Settings toggle**, grouped with
  Diagnostic window, Gentle Coach tone and Phase retention under a new
  "Advanced" disclosure — Settings had grown one permanent card per feature;
  these four (five, now) are set once and rarely revisited.
- **Real bug found and fixed while wiring that toggle.** The Fit planner's
  lever chips had no way to know a lever was already active via Settings —
  they'd render as "off" and, if tapped, try to turn ON something already on,
  or Apply would silently leave an unselected-but-active lever with no way to
  revert it. Levers now seed from the live setting (`fitLeverActive()`),
  Apply distinguishes newly-applied from newly-reverted, and every lever
  carries an explicit `off` value so reverting means something concrete.
- **Log rows show topic health inline**, computed once per screen: a yield
  tag (Low / Standard / High) and days-cold against the exam, both previously
  only visible on other tabs. No new screen.
- **A one-time "what changed" banner after an upgrade.** `lastSeenVersion`
  (device-local — see backup.test.js) is pre-stamped to the current version
  for a genuinely fresh install, so the banner only shows on an install that
  actually upgraded, and only once. The note itself (`RELEASE_NOTE` in
  ui-core.part.js) is a one-line, hand-maintained summary — nothing in the
  browser can read CHANGELOG.md at runtime.

## 16.1.0 — Recency card: fixed a negative "cold" gap, and a stale claim (2026-09-19)

- **Real bug found and fixed.** `recencyCard`'s "last touched" scan counted
  ANY block with a topic id, including the phase-retention thread's rotating
  recall block (15.4.0) — correctly, since a retrieval touch is a touch. But
  the scan had no upper bound on the date, and the thread keeps rotating for
  the whole campaign, past the exam. A retention touch scheduled after the
  paper could push "last touched" later than the paper itself, producing a
  NEGATIVE gap (e.g. "−32d cold") — nonsense, since a touch the week after
  the exam cannot help on the exam. Touches are now cut off at the exam date.
  New regression test in `tests/yield-retention.test.js`, control-verified to
  fail against the pre-fix behavior (caught "−32 days" on the default plan).
- **A now-false claim, corrected.** The card's prose said "this is not
  fixable by rearranging... only two things change it" — written before the
  retention thread existed. It contradicted the card's own numbers, which
  already reflected the thread cutting some phase gaps from ~180 days to
  single digits. Copy now states plainly what the thread does and does not
  do (a thin ten-minute touch, not a full review) and links to the Settings
  toggle, on or off, so the claim can't go stale the same way again if the
  setting changes.

## 16.0.0 — File count under GitHub's 100-file cap; phase retention gets a control (2026-09-19)

- **101 files → 66.** The 36 per-version release notes, final QA reports and
  debug audits going back to the first rollout candidate were consolidated,
  verbatim and in build order, into a single `ARCHIVE_HISTORY.md`. Nothing was
  summarized or rewritten — every original file's content is there under its
  original filename as a heading. `LESSONS_LEARNED.md` (the living, actively-
  referenced document) and `CHANGELOG.md` (15.3.0 onward) are untouched.
  `tests/today-intelligence.test.js` read one of the archived files directly
  (`V15_RELEASE_NOTES.md`) to assert a documented guarantee still exists; it
  now reads `ARCHIVE_HISTORY.md`, where the same sentence still lives. A stale
  filename in a `tests/ui-geometry.test.js` comment was corrected. With 66
  files there is room to grow past v16 without approaching the cap again.
- **Phase retention gets a Settings control.** `retentionEvery` (added
  15.4.0 — the closing recall block re-points at a completed phase every N
  content days, at zero added minutes) had no toggle anywhere; it was silent,
  automatic behavior with no way to turn off, which is exactly the pattern
  this project has otherwise avoided (LESSONS_LEARNED: "manual control over
  automation"). Settings now cycles 3 / 5 / 7 / off, same pattern as the
  diagnostic-window toggle. Existing installs default to 3 unchanged, since
  `buildPlan` has always overlaid `DEFAULTS` first.

## 15.5.0 — Redundant elements removed (2026-09-19)

- **`renderProgress()` deleted — 146 lines of dead code.** A full second
  Progress screen (readiness gauge, error-type breakdown, syllabus heat map,
  consistency grid) that was never called from the router. Progress has
  rendered from `renderProgressTab()` since that file existed; this sat next
  to it, duplicating the same heat map and coverage totals in a version
  nothing ever displayed. `SM.readiness()` in engine.js loses its only caller
  as a result — left in place as a public export rather than deleted, since
  an unused *engine* function serving a real purpose is a different thing from
  a duplicate screen.
- **`feasCard`'s static "What actually closes it" lever list removed.** It
  duplicated the Fit planner's own interactive levers, added in 15.4.0, which
  now renders unconditionally on Plan whenever there's a valid exam date.
  `feasCard` keeps the headline deficit numbers and points at the planner.
- **Plan's second full 39-topic listing removed.** Grouped by phase with an
  accuracy dot, it duplicated `topicLoadCard`'s own "every topic, heaviest
  first" list a few cards up on the same screen — same rows, same hours and
  question counts, re-sorted — and duplicated the accuracy dot Log already
  shows per topic, on the one screen that isn't where accuracy is checked.
- The dangling viva migration comment was already cleared in 15.4.0; nothing
  further found this pass.

## 15.4.0 — Fit planner, yield-gated third pass, phase retention, viva gone (2026-09-19)

- **Fit planner (Plan tab).** `feasibility()` could measure the 158 h gap and
  price the levers but not apply them, so the deficit sat there as a fact
  rather than a decision. Levers are now tappable, priced MARGINALLY against
  the current selection (standalone savings overlap and would add up to a
  promise the plan cannot keep), with a live deficit bar and an Apply that
  rewrites prefs and rebuilds. Logged work untouched.
- **Yield-gated third pass (`p3MinYield`, default 0 = off).** The gate is
  per-topic, so `budget()` now sums repeat pace and analysis per topic —
  a global `rep` would price a pass the allocator never schedules and the plan
  would claim to fit on hours it never spends. At yield >= 2 it saves 69 h and
  8 content days, and the dropped pass comes off the lowest-yield topics
  deliberately instead of off whatever the calendar runs out on.
- **Phase retention thread (`retentionEvery`, default 3).** Under strict
  phase-lock Phase 1 goes ~208 days untouched before the paper. Every third
  content day the closing blank-page recall re-points at a CLOSED phase,
  rotating across the back-catalogue: 50 days, 20 topics, zero added minutes —
  the block already existed.
- **`SM.dataAnomalies()`.** Bank-questions-per-lecture outliers by median/MAD
  on the log ratio. A flat "4x the median" flagged eight topics, six of them
  just deep GI banks; log-MAD flags exactly one — the suspected OCR slip, with
  202 h at stake. It reports and never rewrites: the MCQ ledger is keyed by
  question number.
- **Viva.** Removed in an earlier build; the last dangling comment is gone. The
  `delete s.viva` migration line stays deliberately — it strips the key from
  installs saved before the removal — and the new test asserts that is the only
  remaining mention.
- New `tests/yield-retention.test.js`, both control tests verified to fail.

## 15.3.0 — Soft start: orientation Sunday, lighter first week (2026-09-19)

- **Orientation day.** 20 Sep (Sunday) is now a `kind:"orient"` day: set the
  app up, walk the map, log ten questions to seed the evidence, write one
  honest line, take a backup, stop. It is a rest-kind day, so it carries no
  syllabus slots and cannot create debt or displace a question.
- **The ramp is real now.** `rampDays` existed only in `shapeToday`, which
  trimmed the day on screen while `buildPlan` had already allocated a full
  day's slots to it — the difference became arrears, so a deliberately gentle
  first week opened by generating its own backlog. `skeleton()` had
  `soft:false` hardcoded; it now reads `rampDays`, and soft days carry one slot
  instead of two.
- **`slotCap()`.** `level()` and `balance()` push slots onto any day under
  capacity, and a one-slot opening day is the most under-capacity day in the
  campaign — they refilled the soft week to 7-8 h within two passes. Both now
  respect a per-day ceiling: 1 slot on a soft day, 3 otherwise.
- **`rampHours` 3 -> 5.** A 3 h ceiling over a soft week that allocates 2 h 36 m
  to 5 h would have trimmed four of the seven days and banked the difference as
  backlog — re-creating the exact arrears this change removes. At 5 h it binds
  on the heaviest soft day only.
- Campaign moves forward rather than compressing: 174 -> 178 content days,
  finish 22 May -> 28 May 2027, content days after the 25 Apr INI-SS paper
  20 -> 25.
- New `tests/soft-start.test.js`, both control tests verified to fail.

## 15.2.1 — Start postponed to 20 Sep 2026 (2026-09-19)

- `DEFAULTS.startISO` 2026-09-19 -> 2026-09-20, with 2026-09-19 added to the
  explicit migration list so an existing install moves too. A start date set
  deliberately by hand is still left alone.
- 20 Sep is a **Sunday**, the weekly rest day, so the first content day is
  Monday 21 Sep. The rest day was not moved to absorb the postponement.
  Campaign length is unchanged at 174 content days; the finish slides two days,
  22 May -> 24 May 2027, and content days sitting after the 25 Apr INI-SS paper
  go from 20 to 21.

## 15.2.0 — Fewer elements, real progress bars, a scheduler, reversible logging (2026-09-19)

- **Redundancy.** Today no longer renders two competing "next action" cards:
  the adaptive engine's evidence is one line inside the card that owns the
  button, and its own card renders only when no current block exists. Also
  removed: the duplicated Today illustration, the hero slogan and side panel,
  the Learn/Retrieve/Measure tiles, the Progress-tab banner, the Log explainer
  paragraph and the Log's duplicate route to Practice.
- **Progress bars actually carry information again.** `.fill{background:teal
  !important}` in the V33 theme layer had been overriding every colour `bar()`
  passed, so a 38% and a 94% accuracy bar painted identically; `height:7px
  !important` did the same to height. Colour and height now travel as inline
  custom properties the theme reads instead of overwrites. Bars gained an inset
  track, gradient fill, sheen, rounded caps, an optional pacing marker, a label
  row, animated width and `role="progressbar"`.
- **`SM.intelligentSchedule()`** — orders a session rather than naming one move:
  hypercorrection first, interleaved, no topic over half the slots, closed-notes
  recall last, minutes conserved by construction. Pure and advisory; restricted
  to the day's own topics, so phase-lock holds without a check. New
  `tests/scheduler.test.js`, with its control tests and one labelled gap.
- **Logging is reversible.** Every commit snapshots its exact inverse first, so
  one tap undoes the ledger attempt, the pool score, the calibration sample, the
  miss-queue entry and the subtopic cursor together. In-memory only — the backup
  payload is unchanged at 24 persisted keys. A session strip (logged today,
  accuracy, current run) sits above the topic list and under the quick log.

## 15.1.1 — Low day (3 h 15 m) (2026-09-18)

A third day model beside Normal (9 h 15 m) and Empathy (7 h 15 m). Low is for a
day that is not yours — on call, ill, travelling, a family day — so that day
produces a finishable block of real work instead of a 7 h 15 m day abandoned at
minute forty and logged as nothing. Chosen, never triggered.

- Shaped like a ramp day rather than cut by priority: lectures go first, and
  questions keep their analysis by scaling together. Priority-order cutting
  would have kept a full 62-minute analysis block and left almost no questions
  for it to analyse. Verified: 195 minutes of study, exactly.
- Layer is now one table (`LAYERS`) read by the shaper, the Today picker,
  Settings and the forecast. It had been a hand-written boolean in six places,
  which is why a third model was not previously a one-line change.
- **Protected time no longer pays for the study budget.** Lunch, buffers and
  protected blocks were being scaled with everything else — a Low day balanced
  its arithmetic by halving lunch from 60 minutes to 30. They now pass through
  untouched and sit outside the budget, so 3 h 15 m means three and a quarter
  hours of work. This also changes ramp days: a ramp day now carries its full
  break plus 3 h of study, rather than 3 h including the break.
- Switching a partly-done day asks first. Block ticks are keyed by block index,
  so a reshaped day invalidates them; that was silent, which is worst on
  exactly the switch Low exists for.
- Low days are counted, and four or more raises a Coach note with the number:
  each is about six hours less than a Normal day, so the honest answer is
  usually to move the target date or cut scope, not to try harder.

Recall is also now capped at half the day before being scaled, rather than
shielded absolutely. That is a guard against a day shape that has not occurred
yet, not a fix for one that has.

`tests/day-models.test.js` added and wired into `npm test`. Fourteen suites green.

## 15.1.0 — Navigation restored; two features were never rendering (2026-09-17)

### The More tab was dead, and with it six screens

`build-ui.js` concatenated `ui-simple-v14.part.js` after the module that closes
the UI's single IIFE, so `renderMore()` ran at global scope and threw
`esc is not defined`. `SMNAV` caught it and rolled the tab back, so tapping
More did nothing at all. **Learn, Log, Plan, Setup, Help and AI tools were
unreachable.** Build order fixed; the build now refuses to run if the
IIFE-closing module is not last.

Same root cause: "Start this session" threw `shapeToday is not defined`.

### Adaptive Engine 2.0 had never rendered

Its only call site was the shadowed `renderToday` in that module — the v13.2.4
presentation layer, superseded by later same-named declarations and never
executed. The v15 headline feature, the recovery offer and the 15-minute
minimum day were all unreachable while the release notes described them.
Restored to Today, per the 9.0.0 precedent that orphaned is not dead.

### Two contrast failures, invisible until now

- The **bottom navigation disappeared in night mode**: the bar kept its day
  background while night text colours applied. 2.17:1, active tab 1.00:1.
- The **More list** rendered near-black on near-black at 1.25:1.

Neither was measurable before. More never rendered, and `ui-geometry` reached
the mode switch through a rail tab retired in v13 — so all three "modes" it
tested were the same one.

### Dead controls and redundancy

`data-nav="myday"` on Today's primary Start button set `tab="today"` and
repainted the identical screen; it now opens the block it names. Removed: ~100
lines of shadowed duplicate render code, a shadowed `smAIPrompt`/`smAIRender`
pair, `smSimpleStat`, `renderSimpleQuickLog`, the `myday` route and its
duplicate search entry, and a malformed `nav{ ; ; ; ; }` rule. Fixed a
duplicate `smAIHandoffMsg` id, four unhandled clipboard rejections, and a
search button sitting 6px on top of the More tab.

### Tests were passing on strings, not behaviour

`navigation-contract` now asserts scope integrity and rejects duplicate
top-level declarations — the latter found the shadowed AI pair on its first
run. `e2e` was rewritten (it asserted a ten-tab rail from v13 and was never in
`npm test`); `resilience` was driven by an attribute absent from the UI;
`recovery` and `today-intelligence` read one source module rather than the
shipped bundle. All repaired.

**Control test:** reintroducing the original defect fails the scope guard and 9
E2E checks. Thirteen suites green.

## 9.0.0 — Redundancy removed, three orphaned features restored (2026-09-16)

### Dead CSS: 444 rules removed, 151KB -> 112KB (-26.8%)

A live selector census (1,089 selectors tested by `document.querySelector`
across 11 tabs x 3 visual modes x 2 orientations, 534 probes, with every
`<details>` forced open and in-page controls clicked) found **415 selectors
that never match anything**. Overwhelmingly the chrome of removed
navigation: 29 `.navbtn`, 24 `.sm-v17-nav`, plus `.sm-v20-*`, `.sm-v21-*`,
`.sm-v29-*` and `#smRail` left behind by successive redesigns.

Verified by computed-style parity across 66 states: **0 changes**. Control:
breaking one live rule reported 66/66.

**surgimaster.css: 183KB at V34 -> 112KB. Down 39%.**

### Three features were orphaned, not dead — restored

Six JS functions were defined but never called. Deleting all six would have
been wrong: three were working features that had silently lost their call
site during earlier restructures, and were reachable only by reading source.

- **Procedural cognitive rehearsal** (`smProceduralCard`) — 4 real procedures
  in intelligence.js with critical-step scoring, now rendered on **Viva**,
  where rehearsing a sequence under pressure belongs.
- **Smart reminders** (`smNotificationsCard`) — now in **Setup**, with its own
  feature-detection for Notification/PushManager support.
- **System health** (`smSystemHealth`) — six local checks (study-data validity,
  recovery snapshots, IndexedDB, service worker, online, storage headroom),
  now in **Setup**. This is the diagnostic you would want when the app
  misbehaves on a phone, and it was unreachable.

Genuinely dead and removed: `progressPanel`, `smRetentionSignal`,
`smV23Kind`, `smV27ActionIcon`, plus `renderMore()` from 8.1.0.

**The near-miss is the point.** `smProceduralCard` guards on `SM.PROCEDURES`,
and a check with only `engine.js` loaded reported it undefined — so it looked
like self-disabling dead code. Loading `intelligence.js` too showed 4 real
procedures. It was only caught because `tests/intelligence.test.js` asserts
"UI must expose procedural rehearsal" and failed the moment it was deleted.
That test had been passing for as long as the feature was unreachable, because
it checks the string exists in the bundle, not that anything renders it.

### Also

- **Six unlabelled form controls** on Plan and Setup (gym, day start, backup
  day, rest day, campaign start, exam dates) now carry `aria-label`. Each had a
  visible row label but no programmatic association.
- **Landscape chrome cut from 120px to 100px** (31% -> 26% of an 844x390
  screen). Below 500px viewport height the bars drop labels and go icon-only;
  touch targets stay 44px, portrait is unchanged.
- **"Recovery snapshots" no longer reports a false alarm on new installs.** The
  ring only fills from the second save, so a fresh install legitimately has
  none; it now reads "Building" rather than "Check", which would have sent
  someone troubleshooting a working system.

Nine suites green.

