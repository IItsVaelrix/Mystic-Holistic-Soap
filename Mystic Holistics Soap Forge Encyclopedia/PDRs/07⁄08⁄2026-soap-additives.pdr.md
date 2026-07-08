PDR: Additive Chemistry Compiler V1
For Saponification Bench / Soap Engine
Summary

Add a full Additive Chemistry Compiler Layer to the soap system.

The goal is to stop treating additives as decoration and start treating them as chemical participants: some add water, some consume alkali, some accelerate heat, some bind metals, some absorb fragrance, some alter hardness, some increase microbial/spoilage risk, and some should block compilation unless the engine has enough data.

Your current system is already built around a deterministic local engine where the same recipe produces the same numbers and integrity fingerprint. It also already uses a compiler/VM model to force a fixed, inspectable order of operations.

This PDR expands that model so additives become bytecode-readable formulation actors.

Core rule:

No additive may be chemically invisible.

If the engine knows what the additive does, it models it.
If the engine does not know, it warns or blocks.
No silent “probably fine” sludge.

1. Classification
Area	Classification	Risk
Additive catalog expansion	Structural / Data	Medium
Additive math engine	Behavioral / Chemistry	High
Bytecode opcodes	Architectural	High
Synergy detection	Behavioral / Advisory	Medium
Hazard detection	Safety-critical	High
Temperature/phase handling	Behavioral / Process Safety	High
UI reporting	Product / Safety UX	Medium
2. Current System Context

The existing white paper says the current catalog only includes:

8 oils/butters
8 liquids
7 additives

That is a good seed, but it is not enough for the additive universe you listed.

The current safety system already uses severities:

info · warning · danger · blocked

and includes rules for caustic alkali, high coconut, beer eruption, citric acid neutralization, sugar/milk scorch, concentration limits, superfat limits, and zero-oil blocking.

This PDR preserves that safety posture and extends it.

3. Hard Truth / Scope Boundary

The user request says:

“Do not skip any type of chemical interactions of any kind.”

For production safety, the engine must interpret that as:

Do not silently skip any interaction inside the declared additive taxonomy.

No app can guarantee every possible chemical interaction across every supplier formulation, contaminated material, essential oil constituent, synthetic fragrance blend, botanical impurity, pigment impurity, or user-substituted ingredient.

So the system must implement this policy:

Known interaction → calculate or warn.
Unknown but chemically active interaction → warning or block.
Unknown inert interaction → info note.
Missing source data → reviewRequired.

This is how the engine remains honest instead of pretending to be an omniscient soap oracle wearing lab goggles.

4. Goals
4.1 Primary Goals
Add every listed additive into a structured catalog.
Classify each additive by chemical behavior, not just category.
Make additive effects bytecode-readable.
Account for water, dilution, oil, wax, acid, salt, sugar, protein, clay, fragrance, pigment, and antioxidant effects.
Detect synergistic effects between ingredients.
Detect hazardous combinations.
Represent correct handling temperature:
frozen
chilled
room temperature
warm oils
hot lye solution
post-cook
cool-down
Block or warn on unsupported combinations.
Preserve deterministic compile results.
5. Non-Goals

This system does not certify a soap as legally safe to sell.

It does not replace SDS review, supplier IFRA documentation, cosmetic regulatory review, or real-world lye safety training.

It does not assume all fragrance oils, micas, pigments, botanicals, or powders are skin-safe unless the catalog entry says so.

6. Additive Taxonomy V2

Every additive must be classified by behavioral roles.

An additive can have multiple roles.

type AdditiveRole =
  | "alkali_consumer"
  | "acid"
  | "base"
  | "salt"
  | "chelator"
  | "sugar"
  | "humectant"
  | "protein"
  | "lipid"
  | "wax"
  | "solvent_contributor"
  | "water_reducer"
  | "water_absorber"
  | "fragrance"
  | "fragrance_fixative"
  | "pigment"
  | "abrasive"
  | "botanical"
  | "clay_absorbent"
  | "antioxidant"
  | "preservative_like"
  | "microbial_risk"
  | "carbonated"
  | "alcoholic"
  | "heat_accelerator"
  | "trace_accelerator"
  | "trace_decelerator"
  | "melt_and_pour_only"
  | "liquid_soap_only"
  | "unknown_reactive";
7. Additive Definition Schema
New type
type AdditiveDefinition = {
  id: string;
  name: string;

  category:
    | "lather_hardness_booster"
    | "milk_protein"
    | "clay_charcoal"
    | "humectant_sweetener"
    | "exfoliant_grain"
    | "botanical_puree"
    | "beverage"
    | "colorant_aesthetic"
    | "scent_fixative_preserver"
    | "luxury_superfat_lipid";

  physicalForm:
    | "powder"
    | "liquid"
    | "gel"
    | "paste"
    | "solid"
    | "fiber"
    | "oil"
    | "wax"
    | "puree"
    | "extract"
    | "fragrance_blend";

  roles: AdditiveRole[];

  // Composition model
  waterFraction: number;        // 0.0 - 1.0
  sugarFraction?: number;       // 0.0 - 1.0
  lipidFraction?: number;       // 0.0 - 1.0
  proteinFraction?: number;     // 0.0 - 1.0
  saltFraction?: number;        // 0.0 - 1.0
  insolubleSolidsFraction?: number;

  // Chemistry model
  sapNaOH?: number;
  sapKOH?: number;
  consumesNaOHPerGram?: number;
  consumesKOHPerGram?: number;
  pHImpact?: "acidic" | "basic" | "neutral" | "buffering" | "unknown";

  // Process model
  defaultPhase:
    | "lye_solution"
    | "oils_before_lye"
    | "light_trace"
    | "medium_trace"
    | "hot_process_after_cook"
    | "cool_down"
    | "melt_and_pour"
    | "liquid_soap_dilution"
    | "top_decoration";

  temperatureRequirement:
    | "frozen"
    | "chilled"
    | "room_temp"
    | "warm"
    | "hot"
    | "post_cook_cooldown"
    | "supplier_specific";

  minSafeTempC?: number;
  maxSafeTempC?: number;

  // Usage
  defaultUsageRatePpo?: number; // per pound oils
  maxUsageRatePpo?: number;
  defaultUsagePercentOfOils?: number;
  maxUsagePercentOfOils?: number;

  // Safety
  hazardTags: string[];
  interactionTags: string[];
  sourceRefs: SafetySourceRef[];
  reviewRequired: boolean;
};
8. Mathematical Model
8.1 Canonical additive mass

All additive math must normalize to grams.

additiveMassG = convertToGrams(userInput.amount, userInput.unit)
8.2 Water / dilution contribution

Some ingredients are physically liquids or gels. They must contribute to the solvent ledger.

freeWaterG = additiveMassG * waterFraction * waterAvailabilityCoefficient

Examples:

Additive	Water behavior
Aloe liquid/gel	Adds solvent water
Yogurt	Adds water + sugars + proteins
Kefir	Adds water + acids + proteins
Honey	Adds small water + high sugars
Beer/wine/champagne	Adds water + alcohol/carbonation risk unless prepared
Pumpkin/banana/avocado/cucumber purees	Add water + sugars/solids
Rule
If additive contributes free water, it must affect dilution.

No additive with waterFraction > 0 may be ignored by solvent math.

8.3 Solvent equation

The water setting remains authoritative, as the white paper states: water mode computes the total solvent weight, and liquid rows fill that weight.

New additive-aware solvent math:

requiredSolventG = computeSolventFromLyeSettings(adjustedLyeG)

additiveFreeWaterG = sum(additives.map(a => a.massG * a.waterFraction * a.waterAvailabilityCoefficient))

requiredAddedWaterG = max(0, requiredSolventG - additiveFreeWaterG)

excessFreeWaterG = max(0, additiveFreeWaterG - requiredSolventG)

If excessFreeWaterG > 0, emit:

dilution_overage_warning

If overage is extreme, block.

8.4 Alkali consumption

Acids consume lye and must be compensated.

Current white paper already models citric acid:

extra NaOH = citric_acid_g × 0.624
extra KOH  = citric_acid_g × 0.875

Generalized model:

extraNaOHG = additiveMassG * consumesNaOHPerGram
extraKOHG = additiveMassG * consumesKOHPerGram

Final lye must be:

adjustedLyeG =
  lyeAfterSuperfatG
  + additiveAlkaliCompensationG

Then water calculation must run after additive compensation.

Correct order:

LOAD_OILS
LOAD_SAP
SUM_LYE
APPLY_SUPERFAT
LOAD_ADDITIVES
APPLY_ALKALI_COMPENSATION
APPLY_KOH_PURITY
CALC_SOLVENT
APPLY_SOLVENT_CONTRIBUTIONS
EVAL_INTERACTIONS
CALC_QUALITY
EMIT_RESULT
8.5 Lipid / wax contribution

Luxury butters and waxes are not normal inert additives.

These should be treated as formula oils when added before or during saponification:

Shea Butter
Cocoa Butter
Mango Butter
Beeswax
Jojoba Oil
Argan Oil
Rosehip Seed Oil
Avocado Oil
Egg yolk lipids, if modeled

Rule:

If sapNaOH or sapKOH exists and phase is before/post-lye contact, include in saponifiable ledger.

Do not let users add 10% shea butter as an “additive” without affecting lye unless the process mode is explicitly post-cook superfat.

8.6 Insoluble solids load

Clays, charcoal, pigments, exfoliants, powders, botanicals, and starches add solids.

insolubleSolidsG = additiveMassG * insolubleSolidsFraction
solidsLoadPercent = insolubleSolidsG / totalOilWeightG * 100

Warnings:

Condition	Warning
solidsLoad > soft threshold	May thicken batter
solidsLoad > hard threshold	May cause crumbly/draggy bar
high clay + low water	Batter may seize
high exfoliant	Scratch risk
8.7 Sugar heat model

Sugars increase lather but also increase thermal/scorch risk.

sugarLoadG = sum(additiveMassG * sugarFraction)
sugarPercentOfOils = sugarLoadG / totalOilWeightG * 100

Risk modifiers:

heatRisk =
  sugarLoad
  + milkProteinRisk
  + lyeConcentrationRisk
  + startingTempRisk
  + honeyMultiplier

Sugar/humectant additives include:

Granulated Sugar
Powdered Sugar
Brown Sugar
Raw Honey
Agave Nectar
Molasses
Maple Syrup
Sorbitol
Glycerin
Beer
Wine
Champagne
Kombucha
Banana Puree
Pumpkin Puree
Yogurt
Kefir
Milks

If sugar load is high and lye concentration is high, warn or block depending on thresholds.

8.8 Salt / ionic strength model

Salts increase hardness, alter solubility, and can accelerate trace or reduce lather depending on dose.

Salt-like additives:

Sodium Lactate
Sodium Chloride
Sodium Citrate
Borax
Baking Soda
Tetrasodium EDTA
Disodium EDTA
Dead Sea Mud / mineral salts
Seaweed / kelp minerals
saltLoadG = sum(additiveMassG * saltFraction)
saltPercentOfOils = saltLoadG / totalOilWeightG * 100

Effects:

Salt class	Effect
sodium lactate	hardening / unmold boost
sodium chloride	hardening, may suppress lather at high levels
sodium citrate	chelation / hard-water performance
EDTA salts	chelation / scum reduction
borax	liquid soap pH/lather stabilizer, not default CP bar additive
baking soda	melt-and-pour/fizz/odor support, not default CP chemistry
9. Bytecode Additions

The current engine already has an opcode instruction set.

Add these opcodes.

type AdditiveOpcode =
  | { op: "LOAD_ADDITIVE"; additiveId: string; grams: number }
  | { op: "CLASSIFY_ADDITIVE"; additiveId: string }
  | { op: "APPLY_ALKALI_COMPENSATION"; additiveId: string }
  | { op: "APPLY_SOLVENT_CONTRIBUTION"; additiveId: string }
  | { op: "APPLY_LIPID_CONTRIBUTION"; additiveId: string }
  | { op: "APPLY_SALT_EFFECT"; additiveId: string }
  | { op: "APPLY_SUGAR_EFFECT"; additiveId: string }
  | { op: "APPLY_SOLIDS_LOAD"; additiveId: string }
  | { op: "APPLY_CHELATOR_EFFECT"; additiveId: string }
  | { op: "APPLY_FRAGRANCE_EFFECT"; additiveId: string }
  | { op: "EVAL_ADDITIVE_SYNERGY"; additiveIds: string[] }
  | { op: "EVAL_ADDITIVE_HAZARD"; additiveIds: string[] }
  | { op: "EVAL_TEMPERATURE_REQUIREMENT"; additiveId: string }
  | { op: "EMIT_ADDITIVE_REPORT" };
10. Compiler Pipeline
OLD
RecipeDraft
  ↓
compile oils/liquids/additives loosely
  ↓
execute
  ↓
warnings
NEW
RecipeDraft
  ↓
normalizeRecipeDraft
  ↓
normalizeAdditives
  ↓
validateAdditiveCoverage
  ↓
compileBaseFormula
  ↓
compileAdditiveBytecode
  ↓
executeChemistryVM
  ↓
evaluateSynergyMatrix
  ↓
evaluateHazardMatrix
  ↓
emitManufacturingSheet
11. Synergy Engine
11.1 Purpose

The synergy engine discovers additive interactions that improve or degrade recipe performance.

It should not use black-box AI.

It should be deterministic and rule-based.

type SynergyRule = {
  id: string;
  selector: AdditiveSelector;
  effect:
    | "boost_lather"
    | "boost_hardness"
    | "boost_scent_retention"
    | "boost_conditioning"
    | "increase_trace_speed"
    | "increase_heat"
    | "increase_dilution"
    | "increase_scrub_intensity"
    | "increase_discoloration"
    | "increase_spoilage_risk";

  scoreDelta: Partial<QualityPredictionDelta>;
  severity?: SafetySeverity;
  message: string;
  sourceRefs: SafetySourceRef[];
};
11.2 Required synergy examples
Combination	Effect	Risk
Sugar + Castor Oil	Larger, more stable bubbles	Heat risk if sugar high
Honey + Milk	Creamy lather + sugar lather boost	High scorch/overheat risk
Clay + Fragrance Oil	Better scent anchoring	Trace thickening
Arrowroot/Tapioca + Fragrance	Scent absorption/fixation	Clumping if poorly dispersed
Sodium Lactate + Hard Oils	Faster unmold/harder bar	Brittle if overused
Salt + Coconut Oil	Salt bar hardness	Lather suppression unless coconut high
Citric Acid + Sodium Citrate/EDTA	Chelation/scum reduction	Alkali compensation required
Stearic Acid + KOH	Shaving soap thickness	Rapid thickening/seizing
Milks + High Lye Concentration	Creaminess/lather	Scorch/ammonia odor risk
Fresh Purees + High Water	Conditioning/visuals	Soft bar/spoilage risk
Botanicals + High pH	Visual appeal	Browning/discoloration
Charcoal + Essential Oil	Visual + scent	Absorption may reduce scent strength
Beeswax + Low Water	Hard travel bar	False trace / overheating risk
12. Hazard Engine
12.1 Core safety model

Sodium hydroxide must remain a high-priority hazard. NOAA CAMEO lists sodium hydroxide as corrosive to metals and tissue, notes that dissolution in water can release enough heat to cause steaming/spattering, and states it reacts rapidly and exothermically with acids. It also warns that caustic material can attack aluminum and zinc with flammable hydrogen gas evolution.

NIOSH guidance also emphasizes preventing skin and eye contact, eyewash availability, quick-drench access, and immediate irrigation/flush response for exposure.

12.2 Hazard rules
type HazardRule = {
  id: string;
  severity: "info" | "warning" | "danger" | "blocked";
  selectors: HazardSelector[];
  condition: HazardCondition;
  message: string;
  requiredUserAction?: string;
  blockUntilConfirmed?: boolean;
  sourceRefs: SafetySourceRef[];
};
12.3 Mandatory hazard families
Acid + alkali

Triggered by:

Citric Acid
Apple Cider Vinegar
Kombucha
Yogurt
Kefir
Buttermilk Powder
Acidic fruit purees
Red Wine / Champagne
Any additive tagged acid

Action:

Calculate alkali consumption if coefficients are known.
Warn if acid behavior is known but coefficient is missing.
Block if acid amount is significant and neutralization model is missing.
Alcohol/carbonation + lye

Triggered by:

Beer
Champagne
Red Wine
Kombucha
Any carbonated beverage
Any alcoholic liquid

Action:

Require prepared state:
- boiled/decarbonated
- alcohol removed where relevant
- chilled/frozen if used as solvent

If not confirmed:

danger or blocked
Sugars/proteins + high heat

Triggered by:

Milks
Honey
Sugars
Syrups
Yogurt
Kefir
Banana
Pumpkin
Beer/wine/champagne
Egg yolks

Action:

If sugar/protein load high and lye concentration high:
  warning/danger: scorch, overheating, discoloration, odor risk.

Temperature requirement:

chilled or frozen
High solids + low water

Triggered by:

Clays
Charcoal
Oatmeal
Pumice
Walnut shell
Rice powder
Cornmeal
Botanicals
Pigments
Titanium dioxide
Zinc oxide

Action:

Warn: batter thickening, drag, crumbly bar, seizing risk.
Fragrance / essential oil risk

Triggered by:

Lavender EO
Tea Tree EO
Peppermint EO
Sweet Orange EO
Lemongrass EO
Eucalyptus EO
Patchouli EO
Synthetic Fragrance Oils

Action:

Require supplier-safe usage rate.
Require skin-safe/cosmetic grade flag.
Track acceleration/discoloration/allergen notes.
Block if unknown fragrance blend lacks usage limit.
Metal-reactive safety

Triggered by:

NaOH/KOH in recipe
metal powders
aluminum/zinc tools/containers warning
unknown metallic pigment

Action:

Warn/block aluminum or zinc contact due hydrogen gas risk.

NOAA CAMEO specifically notes sodium hydroxide can attack aluminum and zinc with flammable hydrogen gas evolution.

13. Temperature / Phase Model

Every additive must have a required or preferred handling phase.

type ProcessPhase =
  | "frozen_liquid_before_lye"
  | "cold_liquid_before_lye"
  | "lye_solution_hot"
  | "lye_solution_cooled"
  | "melted_oils"
  | "room_temp_oils"
  | "light_trace"
  | "medium_trace"
  | "hot_process_after_cook"
  | "liquid_soap_dilution"
  | "melt_and_pour_base"
  | "top_decoration";
Phase table
Additive family	Recommended phase
Milks	frozen/chilled liquid before lye
Beer/wine/champagne	boiled flat, alcohol reduced, chilled/frozen
Aloe/cucumber/carrot juice	chilled liquid replacement
Tussah silk	hot lye solution only
Liquid silk	cooled lye or trace depending supplier
Clays/charcoal	dispersed in oil or water before trace
Exfoliants	light/medium trace
Micas/pigments	dispersed in oil/glycerin, then trace
Essential oils/fragrance	light trace or post-cook cool-down
Sodium lactate	cooled lye water
Sugar	dissolved in water before lye, chilled if high
Honey/syrups	diluted and cooled, usually light trace or liquid split
Stearic acid	melted into oils
Beeswax	fully melted into oils
EDTA/citrate	dissolved in water/lye phase based on form
Borax	liquid soap dilution/neutralization phase
Botanicals	trace/top decoration unless infused oil
Fresh purees	chilled, water-accounted, usually oils/trace
14. Additive Coverage Matrix
14.1 Lather & hardness boosters
Additive	Model role
Sodium Lactate	salt, hardener, unmold accelerator
Table Salt / Sodium Chloride	salt, hardener, lather modifier
Granulated Sugar	sugar, lather booster, heat accelerator
Powdered Sugar	sugar, fast dissolving, heat accelerator
Brown Sugar	sugar, color contributor, heat accelerator
Stearic Acid	fatty acid, thickener, trace accelerator
Tetrasodium EDTA	chelator, hard-water support
Disodium EDTA	chelator, rancidity/discoloration support
Sodium Citrate	chelator, hard-water support
Citric Acid	acid, chelator precursor, alkali consumer
Baking Soda	base/buffer, melt-and-pour/liquid specialty
Borax	buffer, liquid-soap stabilizer, special-use only
14.2 Milks & proteins
Additive	Model role
Fresh Goat Milk	solvent, sugar, protein, heat risk
Goat Milk Powder	protein/sugar solids, water absorber
Buttermilk Powder	acid/protein/sugar, heat risk
Coconut Milk	solvent, lipid, sugar, heat risk
Coconut Milk Powder	lipid/protein/sugar solids
Cow Milk	solvent, lactose/protein, heat risk
Yogurt	solvent, acid, protein, sugar, microbial risk
Kefir	solvent, acid, protein, microbial risk
Tussah Silk Fibers	protein fiber, lye-solution dissolved
Liquid Silk	amino acid/protein liquid
Oat Protein	hydrolyzed protein, conditioning
Egg Yolks	lipid/protein, heat/scramble/odor risk
14.3 Clays & charcoal
Additive	Model role
Kaolin Clay	clay absorbent, fragrance anchor
Bentonite Clay	clay absorbent, slip enhancer
Activated Charcoal	adsorbent, pigment, scent absorber
French Green Clay	clay, pigment, absorbent
Rose Clay	clay, pigment, gentle absorbent
Moroccan Red Clay	clay, pigment, absorbent
Rhassoul Clay	clay, mineral solids
Dead Sea Mud	mineral solids, water contributor if wet
Fuller’s Earth	strong absorbent
Purple Brazilian Clay	pigment clay
14.4 Humectants & sweeteners
Additive	Model role
Raw Honey	sugar, humectant, heat accelerator
Glycerin	humectant, solvent-like, softening risk
Sorbitol	sugar alcohol, humectant, clarity support
Agave Nectar	sugar syrup, humectant
Molasses	sugar, color, scent, heat risk
Maple Syrup	sugar, humectant, heat risk
14.5 Exfoliants & grains

All of these must be modeled as insoluble solids / abrasive load:

Colloidal Oatmeal
Ground Rolled Oats
Used Coffee Grounds
Poppy Seeds
Ground Pumice
Loofah Sponge
Walnut Shell Powder
Apricot Kernel Powder
Jojoba Beads
Strawberry Seeds
Cranberry Seeds
Polenta / Cornmeal
Wheat Bran
Ground Rice Powder
Shredded Coconut
Chia Seeds

Special handling:

If abrasiveLoadPercent exceeds threshold:
  warn scratch risk.
If particle is sharp/hard:
  raise exfoliation severity.
If botanical/grain contains organic matter:
  raise spoilage/discoloration risk.
14.6 Botanicals, herbs & purees
Additive	Model role
Aloe Vera Liquid/Gel	solvent, soothing botanical
Calendula Petals	botanical visual, low browning risk
Chamomile Flowers	botanical/infusion
Pumpkin Puree	solvent, sugar, solids, color
Carrot Juice	solvent, sugar, color
Avocado Puree	solvent, lipid, solids
Cucumber Puree	solvent, botanical
Banana Puree	sugar, solvent, solids, heat risk
Spirulina Powder	pigment, botanical, discoloration risk
Turmeric Powder	pigment, botanical, staining risk
Rosemary Leaves	botanical, abrasive if ground
Peppermint Leaves	botanical, visual
Green Tea Extract/Powder	botanical, pigment/discoloration
Alkanet Root Powder	botanical pigment
Madder Root Powder	botanical pigment
Indigo Powder	botanical pigment
Annatto Seeds	oil-infusion pigment
Kelp/Seaweed Powder	mineral/botanical, odor risk
Cocoa Powder	pigment, botanical solids
Paprika	pigment, botanical, irritation/staining risk
14.7 Beverages
Additive	Model role
Beer	solvent, sugar, carbonated/alcoholic hazard
Red Wine	solvent, alcohol/acid, color, sugar
Champagne	solvent, carbonation/alcohol hazard
Coffee	solvent, color, odor masking
Apple Cider Vinegar	acid, solvent, alkali consumer
Kombucha	acid, solvent, carbonation/microbial risk
14.8 Colorants & aesthetics
Additive	Model role
Mica Powder	pigment, cosmetic-grade required
Titanium Dioxide	pigment, whitening, solids load
Zinc Oxide	pigment, whitening, solids load
Ultramarine Blue	pigment, cosmetic-grade required
Oxide Pigments	pigment, stable mineral color
Biodegradable Glitter	decorative solid, cosmetic-grade required
Soap Dough	finished soap decoration, non-formula mass
Fluorescent Pigments	pigment, cosmetic-grade required, review required
14.9 Scents, fixatives & preservers
Additive	Model role
Lavender EO	essential oil fragrance
Tea Tree EO	essential oil fragrance
Peppermint EO	essential oil fragrance, cooling sensation
Sweet Orange EO	essential oil fragrance, citrus top note
Lemongrass EO	essential oil fragrance
Eucalyptus EO	essential oil fragrance
Patchouli EO	essential oil fragrance, base note
Synthetic Fragrance Oils	supplier-specific fragrance blend
Arrowroot Powder	starch, fixative/absorber
Tapioca Pearls/Starch	starch, fixative/absorber
Vitamin E / Tocopherol	antioxidant
Rosemary Oleoresin / ROE	antioxidant
14.10 Luxury superfatting butters & waxes

These must usually enter the oil ledger, not merely the additive ledger:

Shea Butter
Cocoa Butter
Mango Butter
Beeswax
Jojoba Oil
Argan Oil
Rosehip Seed Oil
Avocado Oil

Rule:

If the ingredient can saponify and is present before the soap is finished, it participates in SAP math.
15. Unknown Interaction Policy
Required behavior

For every additive pair:

for each additiveA in additives:
  for each additiveB in additives:
    evaluateInteraction(additiveA, additiveB)

If either additive has:

roles.includes("acid")
roles.includes("base")
roles.includes("alcoholic")
roles.includes("carbonated")
roles.includes("unknown_reactive")
roles.includes("fragrance")
roles.includes("pigment")
roles.includes("microbial_risk")

and no interaction rule exists:

Emit unknown_interaction_warning

If the missing interaction involves acid/base, alcohol/carbonation, or unknown pigment/fragrance safety:

Block or require explicit review.
16. Safety Warning Examples
Acidic additive warning
Apple Cider Vinegar is acidic and can consume alkali. This recipe cannot treat vinegar as a simple liquid replacement unless an acid neutralization coefficient is configured. Compile blocked until neutralization is modeled or the additive is moved to an advisory-only note.
Liquid dilution warning
Yogurt contributes 42.0g free water equivalent. Required solvent is 120.0g. Added distilled water has been reduced to 78.0g. Derived lye concentration remains stable.
Excess free-water warning
Fresh puree contributes more free water than the recipe's solvent target. This will dilute the batch, slow unmolding, and may increase spoilage/discoloration risk.
Sugar heat warning
Honey + milk + 38% lye concentration creates high thermal acceleration risk. Use chilled/frozen liquids, split liquid method, and lower starting temperatures.
Fragrance safety warning
Synthetic fragrance oil lacks supplier usage limit and acceleration/discoloration metadata. Recipe can compile for math, but cannot be marked ready.
Pigment safety warning
Fluorescent pigment is not marked cosmetic-grade/skin-safe. Compile blocked for body soap use.
17. Data Migration Plan
Phase 1: Additive Registry V2

Create:

ADDITIVE_CATALOG_V2

Each entry must include:

ID
display name
category
physical form
roles
water fraction
sugar fraction
lipid fraction
insoluble solids fraction
pH impact
temperature requirement
phase requirement
max usage
source refs
review status

Risk reduced:

Prevents additives from behaving like inert labels.

Phase 2: Bytecode Support

Add additive opcodes after APPLY_SUPERFAT and before CALC_WATER.

Risk reduced:

Prevents late additive corrections from corrupting lye concentration and solvent math.

Phase 3: Interaction Matrix

Build deterministic pairwise interaction evaluation.

evaluateAdditiveInteractions(recipe): InteractionReport

Risk reduced:

Prevents hazardous combinations from being skipped.

Phase 4: Temperature/Phase Engine

Add:

processPhase
temperatureRequirement
preparedState

Examples:

type PreparedState =
  | "raw"
  | "chilled"
  | "frozen"
  | "boiled_flat"
  | "decarbonated"
  | "de_alcoholized"
  | "dispersed_in_oil"
  | "dissolved_in_water"
  | "supplier_verified";

Risk reduced:

Prevents beer, milk, silk, stearic acid, pigments, and fragrances from being added in unsafe or wrong phases.

Phase 5: UI Additive Report

Add an additive report panel:

Additive Chemistry Report
  ├─ Solvent impact
  ├─ Alkali compensation
  ├─ Solids load
  ├─ Sugar/protein heat risk
  ├─ Salt/chelation effect
  ├─ Fragrance/pigment review
  ├─ Synergies detected
  ├─ Hazards detected
  └─ Required handling temperatures

Risk reduced:

Users see why the compiler made a decision.

18. QA Checklist
Determinism
Same additive list in different order produces same hash.
Zero-gram additives do not affect hash.
Additive warnings are stable across runs.
Synergy ordering is stable.
Unknown interaction warnings are stable.
Chemistry math
Citric acid adds correct NaOH/KOH compensation.
Apple cider vinegar blocks unless neutralization model exists.
Kombucha blocks or warns as acid/carbonated/microbial.
Yogurt contributes water, sugar, acid, and protein risk.
Honey contributes sugar heat risk.
Aloe contributes solvent water.
Clay increases solids load.
Shea/cocoa/mango/beeswax enter oil ledger, not inert additives.
Stearic acid affects SAP/trace/thickening.
Sodium lactate affects hardness/unmolding, not lye.
EDTA/citrate affect chelation score, not SAP.
Safety
NaOH + acid emits exothermic neutralization warning.
NaOH + aluminum/zinc contact warning exists.
Beer/champagne requires decarbonated/de-alcoholized prepared state.
Milk/honey/sugar at high concentration emits scorch warning.
Unknown fluorescent pigment blocks body-soap readiness.
Fragrance without supplier usage metadata blocks ready status.
Borax in cold-process bar soap emits special-use warning.
Baking soda in cold-process bar soap emits mode mismatch warning.
Temperature
Milk defaults to chilled/frozen.
Beer defaults to boiled flat + frozen/chilled.
Tussah silk requires hot lye solution.
Essential oils default to light trace or post-cook cooldown.
Stearic acid and beeswax require melted oils.
Clays/pigments require dispersion.
19. Next Risks
1. Supplier-specific fragrance data

Fragrance oils are black boxes. The engine must support supplier metadata:

accelerationRisk
discolorationRisk
maxUsagePercent
vanillinContent
ifraCertificateUrl
skinSafe

Without that, synthetic fragrance oils should be reviewRequired.

2. Fresh botanicals and microbial risk

Cold-process soap is high pH, but fresh purees and organic matter still create spoilage, discoloration, odor, and texture risks. The engine should track microbialRisk and organicLoad.

3. “Superfatting at trace” myth

The engine should warn that in cold process soap, adding luxury oils at trace does not guarantee those exact oils remain unsaponified. If users want true controlled superfat, they need hot process/post-cook mode.

4. Catalog source quality

Some additives can be modeled generically. Others need supplier-specific values.

Use this source confidence model:

type SourceConfidence =
  | "measured"
  | "supplier_sds"
  | "supplier_usage_sheet"
  | "published_reference"
  | "community_average"
  | "unknown";

Unknown source confidence should never produce silent “ready” status for chemically active additives.

Final Architecture Decision

Additives must compile as chemistry, not decoration.

The new invariant:

Every additive either contributes mass, water, alkali demand, solids, heat, scent behavior, color behavior, process constraints, safety warnings, or an explicit unknown-interaction warning.

That is how you outclass classic soap calculators.

SoapCalc tells users the numbers.

This system can tell users:

What changed?
Why did it change?
What got safer?
What got riskier?
What must be cold, hot, dissolved, dispersed, or blocked?

That is the difference between a calculator and a bench engine.