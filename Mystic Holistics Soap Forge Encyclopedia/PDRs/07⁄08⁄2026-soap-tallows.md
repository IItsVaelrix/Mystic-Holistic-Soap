PDR: Rendered Animal Fat Registry V1 (Tallows)
For Saponification Bench / Soap Engine

Summary

Add rendered animal fats to the ingredient engine as first-class saponifiable
oils, starting with a small, verified slice and a review-gated registry for
everything not yet backed by measured data.

Tallow is not one ingredient. It is a whole family of rendered animal fats
(beef, mutton, lard, poultry, game, dairy, marine, waxes) that behave like plant
oils chemically — triglycerides that saponify with NaOH/KOH into fatty-acid
salts — but differ sharply in hardness, lather, rancidity risk, provenance, and
dietary/ethical labeling.

This PDR expands the catalog to model them honestly, and refuses to model them
when the data is not there.

Core rule:

No animal fat may enter the lye math with an unverified SAP value.

If the engine has measured constants, the fat compiles like any other oil.
If it does not, the fat is registered but BLOCKS compilation until data is added.
No fat silently inherits beef-tallow numbers. No fake precision.

1. Classification

Area	Classification	Risk
Ingredient schema extension	Structural / Data	Low
Verified animal-fat entries	Structural / Data	Medium
Review-required registry	Safety / Data integrity	Medium
Review gate (block rule)	Safety-critical	High
Provenance / labeling advisory	Product / Safety UX	Low
Fatty-acid precision	Data credibility	High

2. Current System Context

The engine already models oils with a single `Ingredient` shape carrying
`sapNaOH`, `sapKOH`, and a fatty-acid profile (lauric … linolenic), executed
through the deterministic bytecode pipeline (LOAD_OIL → LOAD_SAP → MUL_OIL_SAP →
SUM_LYE) with a stable formulation hash.

The safety system already uses severities: info · warning · danger · blocked,
and derives recipe status from the highest severity present.

Rendered animal fats are triglycerides, so they need no new math and no new
opcodes. They fit the existing oil model directly.

3. Hard Truth / Scope Boundary

The tempting move is to list forty animal fats and assign each a SAP value and
fatty-acid profile from memory. That is fake precision. Real fats vary by animal,
diet, cut, rendering method, and impurity level; an invented constant is worse
than an absent one because it compiles into a lye weight a person will trust.

Two boundaries follow:

- Extend, do not fork. Animal fats are `Ingredient`s with extra optional
  metadata — NOT a parallel `RenderedAnimalFatDefinition` registry. One type, one
  engine, one hash. A second registry would drift out of sync with the SAP math
  it claims to feed.
- Verified-or-gated. Only fats with defensible published data compile. Everything
  else is registered as `reviewRequired` and blocks until measured constants
  (with a source) are added.

4. Goals

4.1 Primary Goals

- Model rendered animal fats as normal saponifiable oils in the existing engine.
- Ship a verified V1 slice that compiles correctly today.
- Register the rest without letting it fabricate chemistry.
- Surface provenance: what animal, what confidence, what dietary/ethical flags.
- Block, not guess, when SAP data is unverified.

5. Non-Goals (V1)

- No new bytecode opcodes (animal fats reuse oil SAP math).
- No iodine/rancidity numeric model yet (advisory only; future).
- No post-cook superfat-addition modeling for animal fats (future).
- No exotic/marine/wax/dairy families enabled yet (registered as future scope).
- No UI redesign; entries flow through the existing ingredient list and report.

6. Animal Fat Taxonomy

Modeled as the optional `family` tag on the ingredient:

true_tallow	Rendered ruminant fat (beef, mutton, sheep, goat) — hard, creamy
lard	Rendered pig fat — balanced hard/soft, creamy; distinct from tallow
poultry_fat	Chicken/duck/goose fat — softer, oleic/linoleic-rich, conditioning
game_tallow	Deer/bear/rabbit and other wild game — variable, review-required
(future)	dairy_fat, exotic_animal_oil, fish_oil, animal_wax — see §12

7. Ingredient Schema Extension (as built)

The `Ingredient` interface gained five optional fields (plant oils unaffected):

  family?: string;              // taxonomy above
  sourceAnimal?: string;        // "cattle" | "sheep" | "pig" | "chicken" | …
  dietaryEthicFlags?: string[]; // "animal_product" | "pork" | "not_vegan" | …
  sourceConfidence?:            // provenance tier (see §11)
    "verified_lab" | "supplier_spec" | "published_reference"
    | "estimated_family_average" | "unknown";
  reviewRequired?: boolean;     // true => BLOCKS compilation until data added

8. Catalog — V1

8.1 Verified (compile as normal oils)

sourceConfidence = "published_reference" (representative published/SoapCalc-tier
averages; a fat varies by source, so these are honestly labeled, not "lab").

id	name	SAP NaOH	SAP KOH	fatty acids (myr/palm/stear/oleic/lino/linolenic)
beef_tallow	Beef Tallow	0.140	0.197	3 / 26 / 20 / 43 / 3 / 1
mutton_tallow	Mutton Tallow	0.138	0.194	6 / 24 / 30 / 36 / 4 / 0
sheep_tallow	Sheep Tallow	0.138	0.194	6 / 24 / 30 / 36 / 4 / 0
lard	Lard (Pork)	0.138	0.194	1 / 28 / 14 / 46 / 10 / 0
chicken_fat	Chicken Fat	0.138	0.194	1 / 22 / 6 / 43 / 20 / 1
duck_fat	Duck Fat	0.135	0.190	1 / 25 / 8 / 48 / 13 / 1
goose_fat	Goose Fat	0.135	0.190	1 / 21 / 6 / 54 / 10 / 1

Behavior notes: high stearic/palmitic (tallows, mutton especially) → hard,
long-lasting bars with creamy lather and fast trace; high oleic/linoleic
(poultry) → softer, more conditioning, higher oxidation/rancidity watch.

8.2 Review-required registry (registered, BLOCK on use)

reviewRequired = true, no SAP data, sourceConfidence = "unknown". The FULL
taxonomy is registered (34 entries) so the app can list and plan them, but each
blocks compilation until measured constants are added. By family:

family	entries
true_tallow	goat, lamb, bison, buffalo
game_tallow	deer, bear*, rabbit, elk, moose, caribou, antelope
lard	leaf_lard, backfat_lard, wild_boar_lard*
poultry_fat	turkey
exotic_animal_oil	emu, ostrich, mink*, horse, neatsfoot
dairy_fat	milk_fat/butterfat, ghee, goat_milk_fat, sheep_milk_fat, butter (short-chain FAs outside the 8-slot model)
fish_oil	salmon, cod_liver, fish (generic), seal*, whale* (high oxidation / restricted)
animal_wax	lanolin, wool_grease, bone_grease, marrow_fat (high unsaponifiables — not normal fat math)

* carries restricted_wildlife_review and/or pork religious-sensitivity flags.
Beeswax is intentionally left to the additive system, not duplicated here.

9. Chemistry / Bytecode

Every verified animal fat participates in the existing, unchanged oil pipeline:

  LOAD_OIL
  LOAD_SAP
  MUL_OIL_SAP
  SUM_LYE

No new opcodes. Fatty-acid percentages feed the existing hardness / cleansing /
conditioning / lather / longevity / trace metrics. A review-required fat carries
SAP 0, so it contributes no lye — and is blocked before any result is trusted.

10. Safety / Advisory Rules (as built)

Rule: reviewRequired oil in a recipe
  BLOCKED — "<name> is review-required: no verified SAP/fatty-acid data yet.
  Add measured constants with a source before compiling. The engine will not
  guess its SAP value." → recipe status becomes blocked.

Rule: any animal-derived fat in a recipe
  INFO — "This recipe contains animal-derived fat (<names>). It is not vegan;
  label clearly if sharing or selling." Pork additionally notes a religious
  dietary sensitivity.

Both are additive to the existing rule set (caustic, high-coconut, beer, citric,
etc.); severity ordering already promotes BLOCKED to recipe status.

11. Provenance / sourceConfidence tiers

verified_lab > supplier_spec > published_reference > estimated_family_average >
unknown. V1 verified fats are `published_reference` (honest: not lab-measured).
Upgrading a fat to `verified_lab` with real constants is a data-only change.

12. Registry status (implemented as review-gated)

The full taxonomy from the source notes is now registered (see §8.2), each entry
blocking until measured data is added. What remains genuinely future work is the
*modelling*, not the registration:
- Dairy fats need short-chain fatty-acid slots (butyric/caproic/caprylic/capric)
  before their SAP/quality math is trustworthy; until then they block.
- Animal waxes (lanolin, wool grease) need an unsaponifiables / partial-
  saponification model; they must NOT use normal fat math, so they block.
- Marine oils need an oxidation/rancidity model and low-% guidance.
- Promoting any review-gated fat to compiling is a data-only change: add verified
  SAP + fatty-acid constants with a source and clear reviewRequired.

13. Acceptance / QA (covered by soapEngine.tallows.test.ts)

- Beef tallow compiles as a normal saponifiable oil; recipe not blocked.
- Each verified fat: type "oil", SAP > 0, not reviewRequired, flags animal_product.
- Each review stub: reviewRequired true, SAP 0.
- Review-required fat (goat_tallow) emits a BLOCKED warning; status = blocked.
- Animal-derived fat emits the INFO labeling advisory; pork mentions religion.
- Lard is registered as lard, not strict tallow.
- Verified fats do not trip the review gate.

14. Risk

The one real risk is fake precision. V1 mitigates it by shipping only
defensible published values (labeled as such) and gating everything else behind
`reviewRequired` so no unverified fat silently inherits another fat's chemistry.

—
Source notes: see `07⁄08⁄2026-soap-tallows.source-notes.md` (the original
family survey this PDR was distilled from).
