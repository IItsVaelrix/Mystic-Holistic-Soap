# Saponification Bench — Bug Report

**Date:** 2026-07-08
**Build:** Saponification Bench 1.0.0 · Catalog 2026.1
**Scope:** Full audit of `soap-making-app-v1/` (engine, server, persistence, UI), all
issues below reproduced, fixed, and verified.

Legend — **Severity:** Critical (breaks the app / unsafe) · Major (core feature wrong) ·
Minor (correctness/UX/security hygiene). **Status:** all Fixed.

---

## Summary table

| ID | Severity | Area | Title | Status |
|----|----------|------|-------|--------|
| BUG-01 | Critical | Dev server | Page constantly refreshes (Vite full-reload loop) | Fixed |
| BUG-02 | Major | Engine / UI | Quality meters flag in-range values as warnings | Fixed |
| BUG-03 | Major | Engine | Lye-concentration control had no effect on water | Fixed |
| BUG-04 | Major | UI | Inventory quantity field jitters/reverts while typing | Fixed |
| BUG-05 | Minor | Engine | Integrity fingerprint depended on ingredient order | Fixed |
| BUG-06 | Minor | Server | Fake XSS/SQL filter blocked legitimate input | Fixed |
| BUG-07 | Minor | Server | Unauthenticated API bound to all network interfaces | Fixed |
| BUG-08 | Minor | Persistence | Activity log truncated its own history on every write | Fixed |
| BUG-09 | Minor | Project | Dead AI dependencies, misleading "AI" label & setup docs | Fixed |
| BUG-10 | Minor | UI | Redundant double-compile on every ingredient edit | Fixed |

---

## BUG-01 — Page constantly refreshes (Vite full-reload loop) · Critical

**Symptom.** On the landing (Formulate) page the app refreshes continuously; the lye
readout, quality gauges, and counts flicker/reset several times a second and the page
is effectively unusable. Appeared to be "the compiler looping" or "inventory never
settling" — both were symptoms, not the cause.

**Reproduce.** `npm run dev` (HMR on), open the landing page, leave it idle. The page
reloads ~2–3×/second. (Hidden when running with `DISABLE_HMR=true`.)

**Root cause.** The Express activity-logging middleware writes `data/activity.json`
after every `/api/compile` (and every CRUD mutation). The `data/` directory sits
inside Vite's watched project root, so each write fired a Vite **full page reload**.
The reload remounted the app, which auto-compiled the loaded recipe on mount, which
POSTed `/api/compile`, which wrote `data/activity.json` again → reload → compile →
write → … an unbounded loop. Measured ~27 compiles and ~15 page reloads in 10 seconds.

**Fix.** Exclude the runtime data directory from Vite's file watcher, in both places
that construct the dev server:
- `vite.config.ts` → `server.watch.ignored = ['**/data/**']`
- `server.ts` `createViteServer({ server: { middlewareMode: true, watch: { ignored: ['**/data/**'] } } })`

**Verification (real wall-clock, HMR on).** Landing page idle for 10 s:
compiles 27 → **1**; `[vite] connecting` (one per reload) ~15 → **1**. Loop gone.

**Note on diagnosis.** This bug was twice mis-verified as fixed because the test
harness masked it: `DISABLE_HMR=true` disables the watcher entirely, and headless
Chrome `--virtual-time-budget` compresses timers so the wall-clock loop didn't
manifest. Reload loops must be verified with a real-time browser run; the reliable
tell is repeated `[vite] connecting…` in the browser console. Any server that writes
into the Vite root at runtime needs the watch exclusion.

---

## BUG-02 — Quality meters flag in-range values as warnings · Major

**Symptom.** Ideal, desirable readings were coloured as cautions. A hardness of 45
(dead-centre of the stated ideal 29–54) rendered amber "HIGH"; high conditioning /
lather / longevity — all *good* — also rendered as elevated/warning.

**Root cause.** The meter colour was derived from a band label whose thresholds did
not match the "ideal" range printed beside it, and the colour logic assumed "high =
bad" for every metric even where higher is better (conditioning, lather, longevity).

**Fix.** Introduced per-metric specs (`METRIC_SPECS` in `soapEngine.ts`) as the single
source of truth: each metric declares its ideal `[min,max]` and whether being *below*
or *above* the band is a genuine concern. `classifyMetric()` returns `on-target` /
`below` / `above` plus a `concern` flag, and the UI colours strictly from that — so a
value inside its ideal band can never read as a warning. The gauges now draw the ideal
band as a lit zone with a tick showing where the value lands.

**Verification.** Standard Balanced Bar: hardness 40, conditioning 54, cleansing 17 —
all reported `on-target` (previously amber).

---

## BUG-03 — Lye-concentration control had no effect on water · Major

**Symptom.** Dragging the "Lye concentration %" slider (or the water:lye ratio)
changed nothing in the readout whenever any liquid row had a weight — i.e. always, for
every seeded recipe. The tool's central purpose (telling you how much water to use)
was defeated.

**Root cause.** The engine computed the water from the concentration/ratio setting and
then immediately discarded it: if any liquid row had a weight, the total solvent was
overwritten by the sum of those row weights, and the reported concentration was
back-derived from that. The setting was inert.

**Fix.** The water setting is now authoritative and computes the total solvent weight;
the liquid rows choose *which* liquid(s) as proportional shares and are scaled so they
sum exactly to that computed weight (`soapEngine.ts`, solvent handling). Concentration
and ratio controls are now live and self-consistent.

**Verification.** Same recipe, concentration 30% → solvent 330.62 g (reported 30%);
40% → solvent 212.54 g (reported 40%).

---

## BUG-04 — Inventory quantity field jitters/reverts while typing · Major

**Symptom.** On the Inventory tab, editing an item's quantity made the number "keep
refreshing" — it jumped/reverted as you typed, fired a network write per keystroke,
and clearing the field wrote `0` to the server.

**Root cause.** The quantity `<input>` was a controlled field bound directly to
server state (`value={item.quantity}`) that called `onUpdateStock` (a PUT) on **every**
keystroke; the re-rendered server-echoed value fought the input, and fast typing raced
out-of-order responses.

**Fix.** New `QuantityCell` component holds the edit in local state and commits once —
on blur or Enter — via `onUpdateStock`; empty/invalid input reverts to the last saved
value (`InventoryManager.tsx`).

**Verification.** Typecheck clean; editing no longer round-trips per keystroke.

---

## BUG-05 — Integrity fingerprint depended on ingredient order · Minor

**Symptom.** The same formula entered in a different oil order produced a different
`recipeHash`, though it compiled to identical output — so the "integrity fingerprint"
did not actually address content.

**Root cause.** The hash was computed over the raw, unsorted ingredient arrays.

**Fix.** Ingredient arrays are sorted by id and zero-weight rows removed before hashing
(`generateFormulationHash` caller in `soapEngine.ts`).

**Verification.** Five oils in normal vs reversed order → identical hash
(`fhash_2026.1_432a2b60`).

---

## BUG-06 — Fake XSS/SQL filter blocked legitimate input · Minor

**Symptom / root cause.** A request middleware substring-matched `<script>`,
`UNION SELECT`, `DROP TABLE` on every request body and returned HTTP 400. There is no
SQL (flat-file JSON) and the body is never rendered as HTML, so it protected nothing
while rejecting legitimate content (a recipe note containing "DROP TABLE" was blocked)
and was trivially bypassed.

**Fix.** Removed the pseudo-security filter entirely.

---

## BUG-07 — Unauthenticated API bound to all interfaces · Minor

**Symptom / root cause.** The server listened on `0.0.0.0` with no authentication,
exposing full read/write CRUD (recipes, inventory, molds) to the whole local network,
while the UI displayed fabricated "ACTIVE ENCRYPTION / SECURE THREAD" badges.

**Fix.** Server binds to `127.0.0.1` by default (override with `HOST` explicitly); all
fabricated security/encryption claims removed from the UI. The stated posture is now
honest: local, single-user, no auth.

---

## BUG-08 — Activity log truncated its own history on every write · Minor

**Symptom / root cause.** The log reader sliced to the last 100 entries, and the writer
persisted that already-sliced list back — so every write permanently destroyed older
history, for a feature whose whole purpose is an audit trail. Writes were also
non-atomic (a crash mid-write could leave an unparseable file).

**Fix.** Full history is preserved on disk and trimmed only when it genuinely exceeds a
500-entry cap; reads return the most recent slice without mutating the file. All JSON
writes are atomic (temp file + rename) (`serverDb.ts`). The fabricated "threat
telemetry" was replaced by a truthful activity log of real compiles/saves/edits.

---

## BUG-09 — Dead AI dependencies, misleading label & setup docs · Minor

**Symptom / root cause.** `@google/genai` and `motion` were declared dependencies but
imported nowhere; the README instructed setting a `GEMINI_API_KEY` that was never read;
the rule-based suggestion panel was labelled an "AI Assistant".

**Fix.** Removed both unused dependencies; rewrote README and `.env.example` to reflect
the offline, no-key reality; renamed the panel to "Formulation advisor (rule-based)".

---

## BUG-10 — Redundant double-compile on every ingredient edit · Minor

**Symptom / root cause.** Compilation was triggered both by a `useEffect` (keyed on the
`recipe.lyeSettings` object) and by a manual `triggerCompile` call inside every edit
handler, so most edits compiled twice; the object-identity dependency was also fragile.

**Fix.** A single debounced effect keyed on a primitive signature of all compile inputs
(`compileKey`) now drives recompilation; the scattered manual calls were removed
(`RecipeBuilder.tsx`).

---

## Files touched

`src/lib/soapEngine.ts`, `src/lib/serverDb.ts`, `server.ts`, `vite.config.ts`,
`src/types.ts`, `src/App.tsx`, `src/components/RecipeBuilder.tsx`,
`src/components/QualityPredictor.tsx`, `src/components/InventoryManager.tsx`,
`src/components/ThreatTelemetry.tsx` (now the activity log), `src/index.css`,
`package.json`, `README.md`, `.env.example`, `index.html`.

**Global verification:** `npm run lint` (`tsc --noEmit`) passes; all three tabs render;
engine outputs and the reload-loop fix confirmed against the running app.
