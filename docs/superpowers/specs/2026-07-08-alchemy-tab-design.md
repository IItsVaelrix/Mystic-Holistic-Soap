# Alchemy Tab — Design

**Date:** 2026-07-08
**Status:** Approved for planning

## Summary

Add a fourth tab, **Alchemy**, to the Saponification Bench app: a curated,
educational library of soap types and professional techniques. It turns the app
from a calculator into a teaching workshop. Content is **layered for two
audiences** — accessible enough for a first-time soap maker, informative enough
for a professional — and **recipe entries can be loaded directly into the
Formulator** as a ready-to-compile starter draft.

## Goals

- Teach many soap types (shampoo bars, liquid/KOH soap, salt bars, hot process)
  and professional techniques (gel phase, mica swirl, salting out).
- Serve beginners and professionals from the same content via progressive
  disclosure — no dumbing down, no overwhelming.
- Let a user go from reading a tutorial to a pre-filled, engine-valid formula in
  one click ("Load into Formulator").
- Ship read-only content that lives in the repo and is validated by tests.

## Non-goals (v1)

- No user-authored or editable Alchemy content (read-only catalog only).
- No new API endpoints or `data/` persistence — content is compiled into the app.
- No breadth-first coverage; v1 is a focused flagship set (see Content).
- No cross-recipe "guided course"/progression tracking.

## Architecture

### Data model (`src/types.ts` + `src/lib/alchemyCatalog.ts`)

A versioned, hardcoded TypeScript catalog mirroring the existing
`additiveCatalog.ts` / `INGREDIENT_CATALOG` pattern. **The Alchemy type
definitions live in `src/types.ts`** (following the app convention where domain
types like `AdditiveDefinition` and `RecipeDraft` are declared), and
`alchemyCatalog.ts` imports them and holds the data + version constant. One array
holds two entry kinds.

```ts
export type AlchemyKind = "recipe" | "technique";
export type AlchemyDifficulty = "beginner" | "intermediate" | "advanced";

export interface GlossaryTerm {
  term: string;        // e.g. "trace"
  definition: string;  // plain-language definition shown on hover/tap
}

export interface AlchemyStep {
  title: string;
  detail: string;      // plain-language instruction a first-timer can follow
  proNote?: string;    // collapsible: precision/technique detail for pros
  caution?: string;    // inline safety cue, surfaced at the relevant step
}

export interface AlchemyEntryBase {
  id: string;
  kind: AlchemyKind;
  title: string;
  summary: string;              // one-line plain-language hook (list view)
  difficulty: AlchemyDifficulty;
  overview: string;             // "what this is & why it works" — jargon-free, always visible
  steps: AlchemyStep[];         // ordered method
  chemistry?: string;           // collapsible deep-dive: SAP values, gel/crystal structure, dual-lye math
  proTips?: string[];           // collapsible: what separates a pro batch from a passable one
  glossary?: GlossaryTerm[];    // definitions for jargon used in this entry
  safety: string[];             // hazard callouts, in the app's existing safety voice
  sources?: SafetySourceRef[];  // reuse the existing citation type from types.ts
}

export interface AlchemyRecipeEntry extends AlchemyEntryBase {
  kind: "recipe";
  starterDraft: RecipeDraft;    // COMPLETE, engine-valid draft powering the Load button
}

export interface AlchemyTechniqueEntry extends AlchemyEntryBase {
  kind: "technique";
  appliesTo?: string[];         // ids of related recipe entries (cross-links)
}

export type AlchemyEntry = AlchemyRecipeEntry | AlchemyTechniqueEntry;

export const ALCHEMY_CATALOG_VERSION = "1.0.0";
export const ALCHEMY_CATALOG: AlchemyEntry[] = [ /* ... */ ];
```

**Invariant:** every `starterDraft` references only ingredient IDs that exist in
`INGREDIENT_CATALOG`, and every draft is a complete, valid `RecipeDraft`
(name, status, favorite, notes, lyeSettings, oils, liquids, additives). Where a
flagship recipe needs an ingredient not yet in the catalog (e.g. **salt** and
**sodium lactate** for the brine bar; any **KOH-appropriate** items for liquid
soap), that ingredient is added to `INGREDIENT_CATALOG` as part of this work with
correct SAP and fatty-acid data.

### UI (`src/components/AlchemyLab.tsx`)

Master–detail layout matching the existing lab aesthetic (custom Tailwind tokens:
`ink`, `caustic`, `cool`, `warn`, `mute`, `eyebrow`, `display`).

- **Left rail:** entries grouped under **Recipes** and **Techniques** headers.
  Each row shows the title, `summary`, and a difficulty badge, so the whole
  library is scannable by difficulty at a glance.
- **Right pane (selected entry):** renders in beginner-first reading order —
  header (title + difficulty badge) → `overview` → numbered `steps` (showing
  `detail`; `proNote` collapsible per step; `caution` inline) → `safety` →
  `sources`. Collapsible panels for **Chemistry** and **Pro tips**, collapsed by
  default. Technique entries also render **cross-links** to their `appliesTo`
  recipes.
- **Progressive disclosure / glossary:** jargon terms present in an entry's
  `glossary` render with a dotted underline and reveal their definition on
  hover/tap. Beginner never stuck; page never cluttered with parentheticals.
- **Load button:** recipe entries show a **`▶ Load into Formulator`** button in
  the detail header/footer. Technique entries do not.

### Difficulty badges (`DifficultyBadge` component)

A single shared component driven by `entry.difficulty`, using existing color
tokens and the app's uppercase-mono bordered chip style (as in the activity
log's `KIND_COLOR`). Rendered in both the left rail and the detail header.

| Level | Classes | Reads as |
|-------|---------|----------|
| beginner | `text-cool border-cool/40 bg-cool/10` | calm / safe to start |
| intermediate | `text-caustic border-caustic/40 bg-caustic/10` | some skill needed |
| advanced | `text-warn border-warn/40 bg-warn/10` | precision / caution |

Format: tiny uppercase mono chip, e.g. `● BEGINNER`, in the `eyebrow` micro-label
style. One component keeps colors/labels consistent and makes the badge reusable
if difficulty is later added to formulator recipes.

### Tab wiring & Load flow (`src/App.tsx`)

- Add `"alchemy"` to the `Tab` union type.
- Add `{ id: "alchemy", label: "Alchemy", icon: <FlaskConical className="w-4 h-4" /> }`
  to the `tabs` array, positioned right after **Formulate**.
- Add an `activeTab === "alchemy"` render branch that mounts `<AlchemyLab>`,
  passing `onLoadStarter`.
- Add `handleLoadStarter`, a sibling of the existing `handleCreateNewRecipe`:

```ts
const handleLoadStarter = (entry: AlchemyRecipeEntry) => {
  triggerHaptic();
  // structuredClone => a fresh, unsaved draft (no id); edits don't mutate the catalog
  setSelectedRecipe(structuredClone(entry.starterDraft));
  setActiveTab("formulator");
};
```

The user lands in the Formulator with the starter pre-filled, can compile it
immediately, tweak it, and save it like any other draft. No persistence changes,
no new API endpoints. This reuses the exact pattern `handleCreateNewRecipe`
already establishes (build in-memory draft → `setSelectedRecipe` → switch tab).

## Data flow

1. `ALCHEMY_CATALOG` is imported statically by `AlchemyLab` (no fetch).
2. User browses rail → selects an entry → detail pane renders it.
3. For a recipe entry, user clicks **Load into Formulator** → `onLoadStarter(entry)`
   → `App.handleLoadStarter` clones `starterDraft` into `selectedRecipe` and
   switches to the Formulator tab.
4. From there the existing Formulator → `/api/compile` → engine flow is unchanged.

## Content (v1 flagship set)

**Recipes (4), each with a valid `starterDraft`:**
- **Shampoo Bar** (NaOH; higher-cleansing profile with castor for lather).
- **Liquid Soap** (KOH; `alkaliType` KOH, `kohPurityPercent` set).
- **Salt / Brine Bar** (high coconut; salt as an additive).
- **Hot Process** bar.

**Techniques (3), cross-linked via `appliesTo`:**
- **Gel phase** (→ hot process, and bar recipes generally).
- **Mica swirl** (→ bar recipes).
- **Salting out** (→ liquid soap).

Each entry is authored with the layered structure: jargon-free `overview` and
step `detail`, plus `chemistry`, `proNote`, and `proTips` depth for
professionals, plus a `glossary` and `safety` list with `sources` where a claim
warrants a citation (reusing NIOSH/PubChem-style references already in the app).

## Error handling & edge cases

- **Missing ingredient ID in a `starterDraft`** — prevented by the validation
  test (below) and by adding needed ingredients to `INGREDIENT_CATALOG`.
- **Loading over an in-progress draft** — same behavior as today's "New formula"
  button: `setSelectedRecipe` replaces the current selection. Acceptable and
  consistent with existing UX; no extra confirmation in v1.
- **Empty/absent optional sections** — `chemistry`, `proTips`, `glossary`,
  `sources`, `proNote`, `caution` are optional; the UI omits panels when absent.

## Testing

Follow the repo's existing colocated `*.test.ts` pattern (e.g.
`soapEngine.additives.test.ts`). Add `src/lib/alchemyCatalog.test.ts` that:

1. For **every** `kind: "recipe"` entry, runs `starterDraft` through
   `compileRecipeDraft` → `executeSoapBytecode` and asserts it compiles and does
   **not** produce a `blocked` safety warning.
2. Asserts every ingredient ID referenced by any `starterDraft` (oils, liquids,
   additives) exists in `INGREDIENT_CATALOG`.
3. Asserts every entry has required fields and that `technique` entries carry no
   `starterDraft` while `recipe` entries do.
4. Asserts `appliesTo` ids on technique entries resolve to real recipe entries.

This guarantees every **Load** button yields a valid, non-hazardous formula and
that content cannot silently rot as the catalog grows.

## Files touched

| File | Change |
|------|--------|
| `src/types.ts` | Add Alchemy type definitions |
| `src/lib/alchemyCatalog.ts` | New — imports types; catalog data + version + v1 content |
| `src/lib/alchemyCatalog.test.ts` | New — validation tests |
| `src/lib/soapEngine.ts` | Add any missing ingredients to `INGREDIENT_CATALOG` |
| `src/components/AlchemyLab.tsx` | New — master–detail UI |
| `src/components/DifficultyBadge.tsx` | New — shared difficulty chip |
| `src/App.tsx` | Add `alchemy` tab, render branch, `handleLoadStarter` |

## Rollout / future (not v1)

- Grow the catalog with more recipes/techniques (data-only additions).
- Optional: difficulty badges on formulator recipes; a "guided course" ordering;
  linking techniques from the Formulator's results panel.
