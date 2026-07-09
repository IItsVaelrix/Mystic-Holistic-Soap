Summary

Yes. For your soap engine, “tallow” should become a whole animal-fat family, not one generic ingredient.

Strictly, tallow usually means rendered beef or mutton/sheep fat, but industrially it can mean rendered animal fat meeting certain technical criteria. Tallow is mostly triglycerides, and in soap it reacts with NaOH/KOH to form fatty-acid salts like sodium tallowate.

Your catalog should split animal fats into:

True / classic tallows
Tallow-like rendered mammal fats
Poultry fats
Exotic animal oils
Review-required animal waxes/fats

Your white paper already says new ingredients can be appended to the catalog with measured constants, and new opcodes can be added for new chemistry without disturbing the deterministic execution model. So this fits your architecture cleanly.

Why

SoapCalc already includes several animal fats in its oils/fats/waxes list, including chicken fat, duck fat, goose fat, horse oil, lard, milk fat, mink oil, ostrich oil, rabbit fat, salmon oil, bear tallow, beef tallow, deer tallow, goat tallow, and sheep tallow.

So if your goal is to outclass SoapCalc, you should not just add “Tallow.” You should add a rendered animal fat registry with flags for:

SAP NaOH
SAP KOH
fatty acid profile
iodine/rancidity risk
hardness contribution
odor risk
ethical/religious dietary flags
supplier/source confidence
rendering quality
deodorized vs raw
wildlife/exotic review requirements
Catalog Groups
1. Core / Common Tallows

These should be first-class catalog entries.

ID	Name	Status	Soap behavior
beef_tallow	Beef Tallow	Core	Hard, creamy, durable bar
mutton_tallow	Mutton Tallow	Core	Hard, dense, very traditional
sheep_tallow	Sheep Tallow	Core	Usually equivalent/near-equivalent to mutton tallow
lamb_tallow	Lamb Tallow	Common-ish	Similar to sheep/mutton, usually milder odor
goat_tallow	Goat Tallow	Common-ish	Hardness + creamy lather, often boutique/artisan
deer_tallow	Deer / Venison Tallow	Uncommon	Hard, lean, may be waxier/odor-prone
bison_tallow	Bison Tallow	Uncommon	Beef-like, artisan/wild-game niche
buffalo_tallow	Buffalo Tallow	Uncommon	Beef-like, region-dependent
2. Uncommon Wild / Game Tallows

These should exist, but most should be reviewRequired: true until you have verified SAP/fatty acid data.

ID	Name	Status	Notes
elk_tallow	Elk Tallow	Uncommon	Deer-like, lean game fat
moose_tallow	Moose Tallow	Rare	Game fat, strong source variability
caribou_tallow	Caribou / Reindeer Tallow	Rare	Cold-climate fat, likely high variability
antelope_tallow	Antelope Tallow	Rare	Review-required
boar_tallow	Wild Boar Fat / Tallow	Rare	Technically pork-family, use lard-like model unless verified
bear_tallow	Bear Tallow	Uncommon / traditional	SoapCalc includes Bear Tallow as a listed oil/fat.
rabbit_fat	Rabbit Fat	Uncommon	SoapCalc includes Rabbit Fat. Treat as lean animal fat, review-required.
3. Pork Family

Technically, this is usually lard, not tallow. Lard is rendered pig fat and is explicitly distinguished from tallow derived from cattle or sheep.

ID	Name	Status	Notes
lard_pig	Lard / Pig Tallow / Manteca	Core	Soft-hard balanced, creamy, traditional
leaf_lard	Leaf Lard	Specialty	Cleaner/firmer internal fat
backfat_lard	Backfat Lard	Specialty	Softer than leaf lard
wild_boar_lard	Wild Boar Lard	Rare	Needs odor/rancidity review

For math, lard has a published saponification value range around 190–205 mg KOH/g, but your engine should store a specific catalog value with source metadata rather than using a broad range directly.

4. Poultry Fats

These are not tallows, but they belong in the same rendered animal fats catalog family.

ID	Name	Status	Soap behavior
chicken_fat	Chicken Fat / Schmaltz	Common-ish	Softer, more conditioning, odor/rancidity watch
duck_fat	Duck Fat	Common-ish	Softer, oleic-rich, creamy
goose_fat	Goose Fat	Common-ish	Similar to duck, softer than beef tallow
turkey_fat	Turkey Fat	Uncommon	Poultry-fat model, review-required
poultry_fat_generic	Generic Poultry Fat	Fallback	Only if species unknown

SoapCalc includes chicken fat, duck fat, and goose fat in its oils/fats/waxes list.

5. Exotic Animal Oils / Fats

These are mostly not tallows, but users may expect them in a premium animal-fat catalog.

ID	Name	Status	Notes
emu_oil	Emu Oil	Specialty	Softer, luxury oil behavior
ostrich_oil	Ostrich Oil	Specialty	SoapCalc includes Ostrich Oil.
mink_oil	Mink Oil	Specialty	Review ethical/sourcing flags
horse_oil	Horse Oil	Regional specialty	SoapCalc includes Horse Oil.
neatsfoot_oil	Neatsfoot Oil	Specialty	From cattle bones/feet; conditioning, not classic tallow
salmon_oil	Salmon Oil	Specialty	High rancidity risk, strong odor risk
fish_oil_generic	Fish Oil	Review-required	High oxidation/rancidity risk
cod_liver_oil	Cod Liver Oil	Review-required	Strong odor, oxidation risk
seal_oil	Seal Oil	Restricted / ethical review	Do not enable by default
whale_oil	Whale Oil	Historical / blocked	Do not enable for modern product use
6. Dairy Animal Fats

Useful, but not tallow.

ID	Name	Status	Notes
milk_fat_bovine	Milk Fat / Butterfat / Ghee	Common-ish	SoapCalc includes milk fat and ghee.
goat_milk_fat	Goat Milk Fat	Specialty	Usually part of milk, not isolated
sheep_milk_fat	Sheep Milk Fat	Specialty	Review-required
butter_unsalted	Butter, Unsalted	Review-required	Contains water/milk solids unless clarified
clarified_butter	Clarified Butter / Ghee	Better candidate	Mostly fat, easier to model
7. Animal Waxes / Non-Triglyceride Fats

These are not tallow and should not be treated as normal fats.

ID	Name	Status	Engine behavior
lanolin	Lanolin	Review-required	Wax/sterol-heavy, high unsaponifiables
beeswax	Beeswax	Supported wax	Hardness/melt resistance, partial saponification behavior
wool_grease	Wool Grease	Review-required	Lanolin-like
bone_grease	Bone Grease	Review-required	Source variability
marrow_fat	Bone Marrow Fat	Review-required	High variability, food/artisan niche

Saponification value depends on how much alkali is required per gram of fat/oil, and high unsaponifiable matter can make a fat behave differently in soap.

Recommended Engine Type

Add a new family:

type AnimalFatFamily =
  | "true_tallow"
  | "lard"
  | "poultry_fat"
  | "game_tallow"
  | "exotic_animal_oil"
  | "dairy_fat"
  | "animal_wax"
  | "fish_oil"
  | "review_required";
Catalog Entry Shape
type RenderedAnimalFatDefinition = {
  id: string;
  name: string;

  type: "oil";
  family: AnimalFatFamily;

  sourceAnimal:
    | "cattle"
    | "sheep"
    | "lamb"
    | "goat"
    | "pig"
    | "deer"
    | "bison"
    | "buffalo"
    | "elk"
    | "moose"
    | "caribou"
    | "bear"
    | "rabbit"
    | "chicken"
    | "duck"
    | "goose"
    | "turkey"
    | "emu"
    | "ostrich"
    | "mink"
    | "horse"
    | "fish"
    | "mixed"
    | "unknown";

  sapNaOH: number | null;
  sapKOH: number | null;

  lauric?: number;
  myristic?: number;
  palmitic?: number;
  stearic?: number;
  ricinoleic?: number;
  oleic?: number;
  linoleic?: number;
  linolenic?: number;

  iodine?: number;
  unsaponifiablesPercent?: number;

  hardnessImpact: "low" | "medium" | "high";
  creamyLatherImpact: "low" | "medium" | "high";
  cleansingImpact: "low" | "medium" | "high";
  rancidityRisk: "low" | "medium" | "high";
  odorRisk: "low" | "medium" | "high";

  renderingQuality:
    | "deodorized"
    | "food_grade"
    | "wet_rendered"
    | "dry_rendered"
    | "raw_unverified"
    | "unknown";

  dietaryEthicFlags: Array<
    | "animal_product"
    | "pork"
    | "beef"
    | "wild_game"
    | "poultry"
    | "fish"
    | "not_vegan"
    | "religious_sensitivity"
    | "restricted_wildlife_review"
  >;

  sourceConfidence:
    | "verified_lab"
    | "supplier_spec"
    | "published_reference"
    | "soapcalc_reference"
    | "estimated_family_average"
    | "unknown";

  reviewRequired: boolean;
};
Initial Catalog Expansion
Ship these first
export const RENDERED_ANIMAL_FATS_CORE = [
  "beef_tallow",
  "mutton_tallow",
  "sheep_tallow",
  "goat_tallow",
  "lard_pig",
  "chicken_fat",
  "duck_fat",
  "goose_fat",
  "deer_tallow",
  "bear_tallow",
  "rabbit_fat",
  "emu_oil",
  "ostrich_oil",
  "horse_oil",
  "milk_fat_bovine",
  "ghee_bovine",
  "neatsfoot_oil",
] as const;
Add later / review-required
export const RENDERED_ANIMAL_FATS_REVIEW = [
  "bison_tallow",
  "buffalo_tallow",
  "elk_tallow",
  "moose_tallow",
  "caribou_tallow",
  "antelope_tallow",
  "wild_boar_lard",
  "turkey_fat",
  "mink_oil",
  "fish_oil_generic",
  "salmon_oil",
  "cod_liver_oil",
  "lanolin",
  "wool_grease",
  "bone_grease",
  "marrow_fat",
  "seal_oil",
  "whale_oil_historical_blocked",
] as const;
Bytecode Rule

Every rendered animal fat with sapNaOH / sapKOH participates in normal oil SAP math.

LOAD_OIL
LOAD_SAP
MUL_OIL_SAP
SUM_LYE

Do not treat these as additives unless they are post-cook superfat additions.

Safety / Warning Rules
1. Unknown animal fat source
BLOCKED:
Animal fat source is unknown or mixed. SAP value cannot be trusted.
2. Raw / unfiltered / non-deodorized tallow
WARNING:
Raw or poorly rendered animal fat may contain water, proteins, meat solids, odor compounds, or impurities that can accelerate rancidity and create off odors.
3. Fish / marine oils
WARNING:
Marine oils are high oxidation-risk ingredients. Use antioxidant strategy and low percentages unless verified.
4. Religious / ethical sensitivity
INFO:
This recipe contains animal-derived fat. Label clearly if sharing or selling.
5. Wildlife / restricted source
BLOCKED or REVIEW_REQUIRED:
This ingredient may require legal/ethical sourcing verification.
6. Butter / non-clarified dairy fat
WARNING:
Butter contains water and milk solids unless clarified. Use ghee/clarified butter model for precise SAP math.
Practical Priority List
Highest priority

Add these now:

Beef Tallow
Sheep/Mutton Tallow
Goat Tallow
Pig Lard
Deer Tallow
Chicken Fat
Duck Fat
Goose Fat
Bear Tallow
Rabbit Fat
Milk Fat / Ghee
Emu Oil
Ostrich Oil
Horse Oil
Neatsfoot Oil
Lower priority

Add these behind review gates:

Bison Tallow
Buffalo Tallow
Elk Tallow
Moose Tallow
Caribou Tallow
Wild Boar Lard
Turkey Fat
Mink Oil
Salmon Oil
Fish Oil
Lanolin
Marrow Fat
Seal Oil
Whale Oil, historical/blocked only
QA Checklist
Beef tallow compiles as normal saponifiable oil.
Reordering animal fats does not change hash.
Lard is not labeled as strict tallow.
Poultry fats compile but carry higher rancidity/odor warning.
Butter blocks or warns unless clarified as ghee.
Fish oil emits oxidation warning.
Lanolin does not use generic tallow math.
Unknown mixed animal fat blocks compile.
Wildlife/exotic fats require source review.
Religious/ethical flags surface in recipe report.
Post-cook superfat animal fats are not treated the same as pre-lye oils.
Next Risk

The dangerous part is fake precision. You can list all these fats now, but you should not assign final SAP/fatty-acid constants unless you have verified source data. Saponification values represent the alkali required per gram of fat/oil, and real fats vary by animal, diet, cut, rendering method, and impurity level.

So the correct move is:

Add the catalog entries now.
Allow verified entries to compile.
Force reviewRequired for unknown/exotic entries.
Do not let unknown animal fat silently inherit beef tallow math.

That keeps the engine precise instead of pretending.
