# Saponification Bench — Technical White Paper

**A deterministic formulation, prediction, and safety engine for cold-process and
liquid soap making.**

Version 1.0.0 · Catalog 2026.1 · This document describes what the system does,
how it computes it, and the guarantees and limits of each subsystem.

---

## 1. Overview

The Saponification Bench turns a soap recipe — a set of oils, a choice of alkali,
a water setting, and additives — into an exact, reproducible manufacturing sheet:
how much lye and water to weigh out, what the finished bar will feel like, and
which chemical hazards apply. It pairs that engine with a materials inventory, a
mold-fill calculator, an inventory-aware advisor, and an honest activity log.

Everything is computed locally by a single deterministic engine
(`src/lib/soapEngine.ts`). There is no external AI service, no telemetry, and no
API key. The same recipe always produces the same numbers and the same integrity
fingerprint, on any machine, in the browser or on the server.

The product is built around three promises:

1. **Exactness.** Lye and water weights are derived from published saponification
   values and standard soapmaking arithmetic, rounded deterministically.
2. **Honesty.** Every quality reading is scored against its documented ideal band;
   every hazard cites a primary source; nothing in the interface claims a
   capability the code does not have.
3. **Reproducibility.** A recipe compiles to a stable bytecode program and a
   content-addressed fingerprint that is independent of ingredient entry order.

---

## 2. System architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React 19 UI (Vite)                                           │
│  Formulate · Inventory · Activity                             │
└───────────────┬───────────────────────────────────────────────┘
                │  fetch  /api/*
┌───────────────▼───────────────────────────────────────────────┐
│  Express server (server.ts)  — binds 127.0.0.1                 │
│  • Activity logging middleware (records real mutations)        │
│  • /api/compile · /api/recommendations                         │
│  • CRUD: /api/recipes · /api/inventory · /api/molds            │
│  • /api/activity                                               │
└───────┬───────────────────────────────────┬───────────────────┘
        │                                     │
┌───────▼─────────────┐          ┌────────────▼──────────────────┐
│  soapEngine.ts       │          │  serverDb.ts                  │
│  (pure, shared)      │          │  JSON files in data/,         │
│  compile → execute   │          │  atomic writes, capped log    │
│  quality · safety    │          └───────────────────────────────┘
│  recommendations     │
└──────────────────────┘
```

The engine is **isomorphic and pure**: it imports no Node or browser APIs, so the
identical code runs on the server (for the authoritative `/api/compile`) and could
run in the browser unchanged. Persistence is deliberately separated into
`serverDb.ts`, which is the only module that touches the filesystem.

**Stack:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Express 4, `tsx` for
running TypeScript directly in development, `esbuild` for the production server
bundle. No runtime AI/animation dependencies.

---

## 3. The formulation engine

### 3.1 A two-stage compiler/VM

Rather than computing lye in one pass, a recipe is **compiled to a small bytecode
program** and then **executed on a virtual machine**. This is not decoration: it
forces a fixed, inspectable order of operations, which is what makes the result
deterministic and auditable. Every run emits a human-readable trace of the exact
opcodes and intermediate values.

**Stage 1 — `compileRecipeDraft(recipe)`** sorts oils and liquids by ingredient id
(guaranteeing order-independence) and emits a program from this instruction set:

| Opcode | Meaning |
|--------|---------|
| `LOAD_OIL` | Load an oil weight into a register |
| `LOAD_SAP` | Resolve the oil's saponification value for the chosen alkali |
| `MUL_OIL_SAP` | Multiply weight × SAP → lye needed for that oil |
| `SUM_LYE` | Accumulate the raw (pre-discount) lye requirement |
| `APPLY_SUPERFAT` | Discount lye by the superfat percentage |
| `APPLY_KOH_PURITY` | Scale KOH up to compensate for flake impurity |
| `CALC_WATER` | Resolve the solvent weight from the active water setting |
| `CALC_QUALITY` | Run the fatty-acid quality prediction |
| `EMIT_RESULT` | Freeze and emit the compiled result |

**Stage 2 — `executeSoapBytecode(opcodes, recipe)`** walks the program with a set
of numeric registers and produces a `CompiledFormulaResult`.

### 3.2 Saponification math

For each oil *i* with mass *mᵢ* grams and saponification value *SAPᵢ* (grams of
alkali per gram of oil, tabulated separately for NaOH and KOH):

```
raw_lye = Σ (mᵢ × SAPᵢ)
```

**Superfat** (a.k.a. lye discount) leaves a chosen fraction of the oils
unsaponified for a milder, more conditioning bar:

```
lye_after_superfat = raw_lye × (1 − superfat% / 100)
```

**KOH purity correction.** Commercial potassium hydroxide is typically ~90% pure;
the rest is inert. To deliver the required *pure* KOH you must weigh out more flake:

```
koh_final = koh_after_superfat × (100 / purity%)
```

All final weights are rounded to two decimals to eliminate floating-point drift
across platforms, so the printed manufacturing sheet is byte-stable.

### 3.3 Water and solvent modeling

The water setting is **authoritative**: it computes the total solvent weight. The
liquid rows then choose *which* liquid(s) fill that weight. Three modes:

- **Lye concentration (%)** — the fraction of the lye solution that is alkali:
  `water = lye / (conc/100) − lye`. This is the pro default; e.g. 33% concentration
  is the classic "full water" strength, 40%+ is a fast-moving discounted batch.
- **Water:lye ratio** — `water = lye × ratio` (e.g. 2:1).
- **Manual** — you enter the exact solvent grams; concentration is derived from it.
- If no setting is given, the engine defaults to 33% concentration.

**Liquid composition.** Each liquid row carries a relative *share*. The engine
scales the shares so the chosen liquids sum exactly to the computed solvent weight.
With one liquid it fills 100% of the solvent; with several, the shares split it.
Because the total is driven by the setting (not by the row weights), the
concentration and ratio controls are always live — changing 30%→40% genuinely
reduces the water, and the derived concentration reported back always matches the
setting.

**Water-equivalent ratios.** Non-water liquids carry less "free water" (goat milk
≈ 0.90, coconut milk ≈ 0.85, beer ≈ 0.94). The engine reports each liquid's
effective water contribution alongside its physical weight so milk and beer batches
can be reasoned about honestly.

### 3.4 Additive chemistry — citric acid neutralization

Some additives react with the alkali and must be compensated for, or the batch
superfats unintentionally. Citric acid is the canonical case: it consumes lye.

```
extra NaOH = citric_acid_g × 0.624
extra KOH  = citric_acid_g × 0.875
```

The engine adds this compensation to the final lye weight and surfaces a warning
explaining why, so the manufacturing sheet already accounts for the reaction.

### 3.5 Outputs

`compile` returns a `CompiledFormulaResult` containing: total oil / liquid / batch
weights; NaOH and KOH weights; solvent weight; derived concentration and water:lye
ratio; per-oil, per-liquid, and per-additive breakdowns; the quality prediction;
the safety report; the integrity fingerprint; and the full opcode trace.

---

## 4. Quality prediction

Soap "feel" is predicted from the recipe's **fatty-acid profile**. Each oil in the
catalog carries the percentage of eight fatty acids — lauric, myristic, palmitic,
stearic, ricinoleic, oleic, linoleic, linolenic. The engine mass-weights these
across all oils to get the recipe-wide profile, then derives six characteristics
plus a working-time metric:

| Metric | Formula (from acid percentages) | Ideal band |
|--------|----------------------------------|-----------|
| **Hardness** | lauric + myristic + palmitic + stearic | 29–54 |
| **Cleansing** | lauric + myristic | 12–22 |
| **Conditioning** | oleic + linoleic + linolenic + ricinoleic | 44–69 |
| **Bubbly lather** | lauric + myristic + ricinoleic | 14–46 |
| **Creamy lather** | palmitic + stearic | 16–48 |
| **Longevity** | palmitic + stearic + 0.1 × hardness | 25–50 |
| **Trace speed** | 0.8 × (palmitic + stearic + lauric + myristic) | 0–55 |

### 4.1 Ideal-band classification

Every reading is classified against **its own** ideal band, and — critically — the
*meaning* of being out of band is metric-specific. Being above the cleansing band is
a real problem (a stripping, drying bar); being above the conditioning band is not
(just a richer bar). Each metric therefore declares whether a *low* or *high*
excursion is a genuine concern:

```
if value in [idealMin, idealMax]     → on-target
else if excursion is a concern       → attention (low / high)
else                                 → benign (gentle / rich)
```

The UI colours strictly from this classification, never from the raw number, so a
value sitting inside its ideal range can never be painted as a warning. The
calibrated gauges make this literal: the ideal band is drawn as a lit zone on the
track and a tick shows where the value lands — on target means the tick sits in the
band.

A short list of plain-language **formulation notes** is also generated for the
common actionable cases (cleansing above band, conditioning below band, very
bubbly, fast trace).

---

## 5. Safety system

Safety is treated as content, not decoration. Rules are evaluated on every compile
and attached to the result with a severity and citations to primary sources
(PubChem, NIOSH, NOAA CAMEO, FDA).

**Severities:** `info` · `warning` · `danger` · `blocked`. A `blocked` result means
the formula is chemically unsound and should not be made as entered.

**Rules implemented:**

- **Caustic alkali (danger)** — NaOH and/or KOH handling: corrosivity, PPE, "add
  lye to water," neutralization on contact.
- **High coconut (warning)** — coconut oil > 30% of oils produces extreme cleansing;
  advises a higher superfat to buffer harshness.
- **Beer eruption (danger)** — lye + carbonated/alcoholic liquid can erupt; must be
  boiled flat, de-alcoholized, and frozen first.
- **Citric acid neutralization (warning)** — explains the lye compensation applied.
- **Sugar / milk scorch (warning)** — natural sugars and lactose overheat and
  discolor; keep temperatures low and chill liquids.
- **Excessive concentration > 45% (blocked)** — NaOH crystallizes out of solution.
- **Too-low concentration < 15% (blocked)** — excess water prevents proper set.
- **Negative superfat (blocked)** — leaves free caustic lye in the finished bar.
- **High superfat > 25% (warning)** — risks a soft bar, rancidity (DOS), poor lather.
- **Zero oil (blocked)** — nothing to saponify.

The overall recipe status (`ready` / `warning` / `blocked`) is the aggregate of all
fired rules and is what the readout badge and the saved recipe record reflect.

---

## 6. Ingredient catalog

A versioned catalog (`CATALOG_VERSION = 2026.1`) ships with the engine so results
are reproducible against a known dataset:

- **8 oils & butters** — olive, coconut, castor, shea, palm, cocoa butter, sweet
  almond, avocado — each with NaOH and KOH SAP values and a full fatty-acid profile.
- **8 liquids** — distilled water, goat milk, coconut milk, cow milk, black tea,
  coffee, beer, aloe vera juice — each with a water-equivalent ratio and sugar /
  acid / heat risk flags and handling guidance.
- **7 additives** — fragrance oil, essential oil, citric acid, sodium lactate, sea
  salt, sugar, kaolin clay — with timing guidance and reactivity flags.

The catalog is a plain data structure; adding an ingredient is a matter of
appending an entry with its measured constants.

---

## 7. Inventory

A materials ledger tracks physical stock independently of recipes:

- Quantity and unit (g, kg, oz, lb, ml, l), editable inline.
- Cost in cents, supplier, lot number, and expiration date for **traceability** —
  useful for anyone selling soap and needing batch records.
- **Low-stock detection** flags mass/volume items under 500 units, surfaced as a
  badge on the Inventory tab.

Inventory feeds the advisor (Section 8), which only suggests ingredients you
actually have on hand.

---

## 8. Formulation advisor

A transparent, **rule-based** advisor (not a machine-learning model) inspects the
compiled quality profile together with the current inventory and proposes concrete
adjustments, each with an expected effect, risk notes, and a confidence score:

- **Hardness below band** → add cocoa butter, shea, or palm (whichever is in stock).
- **Cleansing above band with coconut > 30%** → reduce coconut, substitute
  conditioning oils.
- **Bubbly lather below band** → add castor oil or dissolve sugar (whichever is
  available).

Suggestions never mutate a recipe on their own — each is applied only on explicit
confirmation, after which the recipe recompiles so the effect is visible immediately.

---

## 9. Mold and yield calculator

Scales a batch to fill a mold exactly. Supported geometries: rectangular loaf/slab,
cylinder (PVC pipe), multi-cavity silicone, and a custom target volume. All
measurements are metric — dimensions in centimetres, volume in millilitres, weight
in grams — with an adjustable fill level (50–110%).

```
volume_ml   = geometry_volume × (fill% / 100)      [dimensions in cm; 1 cm³ = 1 ml]
batch_grams = volume_ml × 0.95                      [~0.95 g soap batter / ml]
```

"Scale recipe to this mold" multiplies the oils and additives by
`target / current_batch_weight`; the solvent then recomputes from the water setting,
so the scaled batch preserves the exact same concentration, superfat, and quality
profile at the new size.

---

## 10. Determinism and integrity fingerprint

Every compiled result carries a fingerprint of the form
`fhash_<catalog>_<hash>`. The hash is a compact 32-bit non-cryptographic digest
(Java `String.hashCode` style) over the compiler version, catalog version, lye
settings, and the **sorted, zero-filtered** ingredient lists.

Because the inputs are sorted and empty rows removed before hashing, the fingerprint
is a true content address: the same formula entered in a different order — or with a
redundant 0 g row — yields the **same** fingerprint. Two recipes with the same
fingerprint are guaranteed to compile to the same manufacturing sheet. This makes
the fingerprint suitable for labeling batches, detecting duplicates, and verifying
that a saved recipe still compiles to what it did before.

---

## 11. Data, persistence, and API

State is stored as human-readable JSON under `data/` (`recipes.json`,
`inventory.json`, `molds.json`, `activity.json`), seeded on first run.

- **Atomic writes** — files are written to a temp path and renamed, so a crash
  mid-write cannot leave a truncated, unparseable file.
- **Bounded activity log** — the log preserves full history on disk and is trimmed
  only when it genuinely exceeds its cap (500 events); reads return the most recent
  slice. Writes never silently destroy older entries.

**HTTP API:**

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/compile` | Compile + execute a recipe → result + trace |
| POST | `/api/recommendations` | Advisor suggestions for a compiled result |
| GET/POST/PUT/DELETE | `/api/recipes[/:id]` | Recipe CRUD |
| GET/POST/PUT/DELETE | `/api/inventory[/:id]` | Inventory CRUD |
| GET/POST/PUT/DELETE | `/api/molds[/:id]` | Mold profile CRUD |
| GET | `/api/activity` | The activity log feed |

---

## 12. Activity log

A middleware records **real** mutations after they complete — compiles, advisor
runs, and recipe/inventory/mold creates, updates, and deletes — capturing the HTTP
method, endpoint, resulting status code, a plain-language action ("Compiled
formula", "Saved recipe"), a payload fingerprint, and a category. It is an
operational audit trail, not a security dashboard: it makes no claims about
encryption, intrusion detection, or authentication, because the app implements none
of those.

---

## 13. Security posture

Stated plainly: the server ships **no authentication or authorization**. It binds to
`127.0.0.1` by default precisely so that an unauthenticated read/write API is not
exposed to the network. Binding elsewhere (`HOST=0.0.0.0`) is possible but is an
explicit, documented decision the operator must make. Request bodies are size-capped
(256 KB). There is no database, so there is no SQL surface; ids are used only for
lookups, never to construct filesystem paths.

---

## 14. Design language

The interface is styled as a **precision laboratory instrument**: a cool graphite
readout panel against a light engineering-paper workspace, hairline rules and
square corners rather than rounded cards, a wide engineered display face (Archivo)
for headings, and a monospace face (IBM Plex Mono) for every figure so columns of
data stay aligned. A single signature accent — a caustic lye-lime — marks the live
readout and on-target states; hazard orange and red are reserved strictly for
safety content. Motion is minimal and purposeful: the primary lye weight counts up
on recompile, gauge ticks ease into place, and reduced-motion preferences are
honored.

---

## 15. Limitations and honest caveats

- **Predictions are estimates.** Fatty-acid models approximate real bar behavior;
  cure time, temperature, water discount, and additives all affect the finished
  soap in ways no static model fully captures. Treat readings as guidance.
- **Catalog constants are tabulated averages.** Real oils vary by source and
  season; SAP values and fatty-acid profiles are representative, not per-lot.
- **This is not a substitute for safe practice.** Always run your own numbers,
  wear proper PPE, and follow established lye-handling procedure. The safety rules
  flag common hazards; they are not exhaustive.
- **Single-user, local tool.** Persistence is flat JSON with no concurrency control
  beyond atomic file writes; it is designed for one maker on one machine.

---

## 16. Extensibility

The architecture is intentionally seam-friendly:

- **New ingredients** — append to the catalog with measured constants.
- **New quality metrics** — add a `MetricSpec` (ideal band + concern direction) and
  a formula; the gauges and classification pick it up automatically.
- **New safety rules** — add a rule with severity and sources; it evaluates on
  every compile.
- **New opcodes** — extend the instruction set for new chemistry (e.g. mixed-alkali
  liquid/bar hybrids) without disturbing the deterministic execution model.
- **Alternate storage** — `serverDb.ts` is the only persistence surface; swapping
  JSON files for a database is a localized change.

---

*Saponification Bench computes soap. It does not guess, and it does not pretend.
Every number on the sheet can be traced back through the opcode trace to the oils
you weighed and the constants in the catalog.*
