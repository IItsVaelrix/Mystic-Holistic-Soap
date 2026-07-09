/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AdditiveChemistryReport,
  AdditiveDefinition,
  AdditiveReportNotice,
  AdditiveRole,
  Ingredient,
  AlkaliType,
  SoapOpcode,
  CompiledFormulaResult,
  RecipeDraft,
  QualityPrediction,
  SafetyWarning,
  SafetySeverity,
  RecommendationType,
  IngredientRecommendation,
  InventoryItem,
  ScoreBand,
  MetricKey,
  FattyAcidProfile
} from "../types";
import { ADDITIVE_CATALOG_BY_ID, ADDITIVE_CATALOG_V2 } from "./additiveCatalog";

export const COMPILER_VERSION = "2.0.0";
export const CATALOG_VERSION = "2026.2";

// 1. Versioned Saponification & Characteristic Catalog
export const INGREDIENT_CATALOG: Ingredient[] = [
  // Oils & Butters
  {
    id: "olive_oil",
    name: "Olive Oil",
    type: "oil",
    tags: ["soft_oil", "conditioning"],
    sapNaOH: 0.135,
    sapKOH: 0.190,
    lauric: 0,
    myristic: 0,
    palmitic: 12,
    stearic: 4,
    ricinoleic: 0,
    oleic: 70,
    linoleic: 10,
    linolenic: 1
  },
  {
    id: "coconut_oil",
    name: "Coconut Oil (76 deg)",
    type: "oil",
    tags: ["hard_oil", "bubbly", "cleansing"],
    sapNaOH: 0.191,
    sapKOH: 0.268,
    lauric: 48,
    myristic: 18,
    palmitic: 8,
    stearic: 2,
    ricinoleic: 0,
    oleic: 6,
    linoleic: 2,
    linolenic: 0
  },
  {
    id: "castor_oil",
    name: "Castor Oil",
    type: "oil",
    tags: ["soft_oil", "bubbly", "lather_booster"],
    sapNaOH: 0.128,
    sapKOH: 0.180,
    lauric: 0,
    myristic: 0,
    palmitic: 1,
    stearic: 1,
    ricinoleic: 90,
    oleic: 4,
    linoleic: 4,
    linolenic: 0
  },
  {
    id: "shea_butter",
    name: "Shea Butter",
    type: "oil",
    tags: ["butter", "hard_oil", "conditioning"],
    sapNaOH: 0.128,
    sapKOH: 0.180,
    lauric: 0,
    myristic: 0,
    palmitic: 5,
    stearic: 40,
    ricinoleic: 0,
    oleic: 45,
    linoleic: 5,
    linolenic: 0
  },
  {
    id: "palm_oil",
    name: "Palm Oil",
    type: "oil",
    tags: ["hard_oil", "hardening", "longevity"],
    sapNaOH: 0.141,
    sapKOH: 0.198,
    lauric: 0,
    myristic: 1,
    palmitic: 44,
    stearic: 4,
    ricinoleic: 0,
    oleic: 39,
    linoleic: 10,
    linolenic: 0
  },
  {
    id: "cocoa_butter",
    name: "Cocoa Butter",
    type: "oil",
    tags: ["butter", "hard_oil", "hardening", "longevity"],
    sapNaOH: 0.137,
    sapKOH: 0.193,
    lauric: 0,
    myristic: 0,
    palmitic: 26,
    stearic: 33,
    ricinoleic: 0,
    oleic: 33,
    linoleic: 3,
    linolenic: 0
  },
  {
    id: "sweet_almond_oil",
    name: "Sweet Almond Oil",
    type: "oil",
    tags: ["soft_oil", "conditioning"],
    sapNaOH: 0.136,
    sapKOH: 0.191,
    lauric: 0,
    myristic: 0,
    palmitic: 7,
    stearic: 2,
    ricinoleic: 0,
    oleic: 66,
    linoleic: 22,
    linolenic: 0
  },
  {
    id: "avocado_oil",
    name: "Avocado Oil",
    type: "oil",
    tags: ["soft_oil", "conditioning", "vitamins"],
    sapNaOH: 0.133,
    sapKOH: 0.187,
    lauric: 0,
    myristic: 0,
    palmitic: 12,
    stearic: 2,
    ricinoleic: 0,
    oleic: 70,
    linoleic: 12,
    linolenic: 1
  },

  // Rendered animal fats — first verified slice (see soap-tallows PDR).
  // SAP + fatty-acid values are representative published (SoapCalc-tier) averages;
  // real fats vary by animal, diet, cut, and rendering, hence sourceConfidence.
  {
    id: "beef_tallow",
    name: "Beef Tallow",
    type: "oil",
    tags: ["hard_oil", "hardening", "longevity", "animal_derived", "creamy_lather"],
    sapNaOH: 0.140,
    sapKOH: 0.197,
    lauric: 0,
    myristic: 3,
    palmitic: 26,
    stearic: 20,
    ricinoleic: 0,
    oleic: 43,
    linoleic: 3,
    linolenic: 1,
    family: "true_tallow",
    sourceAnimal: "cattle",
    dietaryEthicFlags: ["animal_product", "beef", "not_vegan"],
    sourceConfidence: "published_reference"
  },
  {
    id: "mutton_tallow",
    name: "Mutton Tallow",
    type: "oil",
    tags: ["hard_oil", "hardening", "longevity", "animal_derived", "creamy_lather"],
    sapNaOH: 0.138,
    sapKOH: 0.194,
    lauric: 0,
    myristic: 6,
    palmitic: 24,
    stearic: 30,
    ricinoleic: 0,
    oleic: 36,
    linoleic: 4,
    linolenic: 0,
    family: "true_tallow",
    sourceAnimal: "sheep",
    dietaryEthicFlags: ["animal_product", "not_vegan"],
    sourceConfidence: "published_reference"
  },
  {
    id: "lard",
    name: "Lard (Pork)",
    type: "oil",
    tags: ["hardening", "conditioning", "animal_derived", "creamy_lather"],
    sapNaOH: 0.138,
    sapKOH: 0.194,
    lauric: 0,
    myristic: 1,
    palmitic: 28,
    stearic: 14,
    ricinoleic: 0,
    oleic: 46,
    linoleic: 10,
    linolenic: 0,
    family: "lard",
    sourceAnimal: "pig",
    dietaryEthicFlags: ["animal_product", "pork", "not_vegan", "religious_sensitivity"],
    sourceConfidence: "published_reference"
  },
  {
    id: "chicken_fat",
    name: "Chicken Fat (Schmaltz)",
    type: "oil",
    tags: ["soft_oil", "conditioning", "animal_derived"],
    sapNaOH: 0.138,
    sapKOH: 0.194,
    lauric: 0,
    myristic: 1,
    palmitic: 22,
    stearic: 6,
    ricinoleic: 0,
    oleic: 43,
    linoleic: 20,
    linolenic: 1,
    family: "poultry_fat",
    sourceAnimal: "chicken",
    dietaryEthicFlags: ["animal_product", "poultry", "not_vegan"],
    sourceConfidence: "published_reference"
  },
  {
    id: "duck_fat",
    name: "Duck Fat",
    type: "oil",
    tags: ["soft_oil", "conditioning", "animal_derived"],
    sapNaOH: 0.135,
    sapKOH: 0.190,
    lauric: 0,
    myristic: 1,
    palmitic: 25,
    stearic: 8,
    ricinoleic: 0,
    oleic: 48,
    linoleic: 13,
    linolenic: 1,
    family: "poultry_fat",
    sourceAnimal: "duck",
    dietaryEthicFlags: ["animal_product", "poultry", "not_vegan"],
    sourceConfidence: "published_reference"
  },
  {
    id: "goose_fat",
    name: "Goose Fat",
    type: "oil",
    tags: ["soft_oil", "conditioning", "animal_derived"],
    sapNaOH: 0.135,
    sapKOH: 0.190,
    lauric: 0,
    myristic: 1,
    palmitic: 21,
    stearic: 6,
    ricinoleic: 0,
    oleic: 54,
    linoleic: 10,
    linolenic: 1,
    family: "poultry_fat",
    sourceAnimal: "goose",
    dietaryEthicFlags: ["animal_product", "poultry", "not_vegan"],
    sourceConfidence: "published_reference"
  },

  // Review-required stubs: registered so the app can list them, but they carry
  // NO verified SAP/fatty-acid data and BLOCK compilation when used, so the
  // engine never guesses their chemistry (see soap-tallows PDR "no fake precision").
  {
    id: "goat_tallow",
    name: "Goat Tallow",
    type: "oil",
    tags: ["animal_derived", "review_required"],
    sapNaOH: 0,
    sapKOH: 0,
    family: "true_tallow",
    sourceAnimal: "goat",
    dietaryEthicFlags: ["animal_product", "not_vegan"],
    sourceConfidence: "unknown",
    reviewRequired: true
  },
  {
    id: "deer_tallow",
    name: "Deer / Venison Tallow",
    type: "oil",
    tags: ["animal_derived", "review_required"],
    sapNaOH: 0,
    sapKOH: 0,
    family: "game_tallow",
    sourceAnimal: "deer",
    dietaryEthicFlags: ["animal_product", "wild_game", "not_vegan"],
    sourceConfidence: "unknown",
    reviewRequired: true
  },
  {
    id: "bear_tallow",
    name: "Bear Tallow",
    type: "oil",
    tags: ["animal_derived", "review_required"],
    sapNaOH: 0,
    sapKOH: 0,
    family: "game_tallow",
    sourceAnimal: "bear",
    dietaryEthicFlags: ["animal_product", "wild_game", "not_vegan", "restricted_wildlife_review"],
    sourceConfidence: "unknown",
    reviewRequired: true
  },
  {
    id: "rabbit_fat",
    name: "Rabbit Fat",
    type: "oil",
    tags: ["animal_derived", "review_required"],
    sapNaOH: 0,
    sapKOH: 0,
    family: "game_tallow",
    sourceAnimal: "rabbit",
    dietaryEthicFlags: ["animal_product", "wild_game", "not_vegan"],
    sourceConfidence: "unknown",
    reviewRequired: true
  },

  // Liquids (Water Alternatives)
  {
    id: "distilled_water",
    name: "Distilled Water",
    type: "liquid",
    tags: ["water", "standard"],
    sapNaOH: 0,
    sapKOH: 0,
    waterEquivalentRatio: 1.0,
    sugarRisk: "none",
    acidRisk: "none",
    heatRisk: "none"
  },
  {
    id: "goat_milk",
    name: "Goat Milk (Fresh)",
    type: "liquid",
    tags: ["milk", "creamy"],
    sapNaOH: 0,
    sapKOH: 0,
    waterEquivalentRatio: 0.90,
    sugarRisk: "medium",
    acidRisk: "none",
    heatRisk: "high",
    defaultHandlingWarning: "Milk contains natural sugars that scorch at high lye temperatures. Freeze milk into slush/ice cubes before slowly adding lye to avoid discoloration and thermal scorching."
  },
  {
    id: "coconut_milk",
    name: "Coconut Milk",
    type: "liquid",
    tags: ["milk", "creamy", "vegan"],
    sapNaOH: 0,
    sapKOH: 0,
    waterEquivalentRatio: 0.85,
    sugarRisk: "medium",
    acidRisk: "none",
    heatRisk: "medium",
    defaultHandlingWarning: "Coconut milk contains sugars and coconut fats that can undergo rapid heating. Chill or freeze before adding lye, and soap at cool temperatures."
  },
  {
    id: "cow_milk",
    name: "Cow Milk (Whole)",
    type: "liquid",
    tags: ["milk", "creamy"],
    sapNaOH: 0,
    sapKOH: 0,
    waterEquivalentRatio: 0.90,
    sugarRisk: "medium",
    acidRisk: "none",
    heatRisk: "high",
    defaultHandlingWarning: "Whole cow milk contains high lactose. Keep temperatures very low (freeze to slush) when mixing with lye to prevent a brown ammonia-smelling scorched mixture."
  },
  {
    id: "black_tea",
    name: "Brewed Black Tea",
    type: "liquid",
    tags: ["tea", "astringent"],
    sapNaOH: 0,
    sapKOH: 0,
    waterEquivalentRatio: 0.98,
    sugarRisk: "none",
    acidRisk: "none",
    heatRisk: "low",
    defaultHandlingWarning: "Natural tea tannins cause the lye solution and finished soap to turn a dark tan/brown color. Ensure tea is completely cold before adding lye."
  },
  {
    id: "coffee",
    name: "Brewed Coffee",
    type: "liquid",
    tags: ["deodorizing", "exfoliating"],
    sapNaOH: 0,
    sapKOH: 0,
    waterEquivalentRatio: 0.98,
    sugarRisk: "none",
    acidRisk: "none",
    heatRisk: "low",
    defaultHandlingWarning: "Coffee neutralizes kitchen odors but discolors soap to deep brown. Chill fully before slowly incorporating lye."
  },
  {
    id: "beer",
    name: "Beer (Stout/Ale)",
    type: "liquid",
    tags: ["lather_booster", "artisan"],
    sapNaOH: 0,
    sapKOH: 0,
    waterEquivalentRatio: 0.94,
    sugarRisk: "high",
    acidRisk: "none",
    heatRisk: "high",
    defaultHandlingWarning: "Beer contains carbon dioxide and alcohol. Mixing directly with lye will cause an explosive eruptive boil ('soap volcano'). You MUST boil the beer or leave it open for 24-48 hours to make it completely flat and de-alcoholize it, then freeze it solid before adding lye."
  },
  {
    id: "aloe_juice",
    name: "Aloe Vera Juice",
    type: "liquid",
    tags: ["soothing"],
    sapNaOH: 0,
    sapKOH: 0,
    waterEquivalentRatio: 0.95,
    sugarRisk: "low",
    acidRisk: "none",
    heatRisk: "low",
    defaultHandlingWarning: "Aloe juice contains polysaccharides which can heat up slightly with lye. Chill before use to preserve active compounds."
  },

  // Additives
  {
    id: "fragrance_oil",
    name: "Fragrance Oil",
    type: "additive",
    tags: ["fragrance"],
    sapNaOH: 0,
    sapKOH: 0,
    timing: "At light trace"
  },
  {
    id: "essential_oil",
    name: "Essential Oil (e.g. Lavender)",
    type: "additive",
    tags: ["fragrance", "essential"],
    sapNaOH: 0,
    sapKOH: 0,
    timing: "At light trace"
  },
  {
    id: "citric_acid",
    name: "Citric Acid (Powder)",
    type: "additive",
    tags: ["reactive", "chelator"],
    sapNaOH: 0,
    sapKOH: 0,
    chemicallyReactive: true,
    timing: "Dissolve in lye water prior to lye addition",
    defaultHandlingWarning: "Citric acid chemically reacts with alkali (NaOH/KOH). Every 1g of citric acid consumes 0.624g of NaOH or 0.875g of KOH. You MUST add extra lye to compensate, otherwise your superfat will increase significantly, risking an oily, soft soap batch."
  },
  {
    id: "sodium_lactate",
    name: "Sodium Lactate (60% liquid)",
    type: "additive",
    tags: ["hardener"],
    sapNaOH: 0,
    sapKOH: 0,
    timing: "Add to cooled lye water before pouring into oils"
  },
  {
    id: "sea_salt",
    name: "Sea Salt",
    type: "additive",
    tags: ["hardener", "exfoliant"],
    sapNaOH: 0,
    sapKOH: 0,
    timing: "Dissolve in hot water before adding lye"
  },
  {
    id: "sugar",
    name: "Granulated Sugar",
    type: "additive",
    tags: ["lather_booster"],
    sapNaOH: 0,
    sapKOH: 0,
    timing: "Dissolve in lye water before lye addition"
  },
  {
    id: "clay_kaolin",
    name: "Kaolin Clay",
    type: "additive",
    tags: ["fixative", "slip"],
    sapNaOH: 0,
    sapKOH: 0,
    timing: "Mix with a small amount of oil first, add at trace"
  }
];

// Reusable chemical safety rules with PubChem / NIOSH / NOAA guidelines
export const CHEMICAL_SAFETY_RULES = [
  {
    id: "naoh-caustic",
    severity: SafetySeverity.DANGER,
    ingredientId: "naoh",
    message: "WARNING: Sodium Hydroxide (NaOH) is an extremely corrosive chemical. Contact causes skin chemical burns and irreversible eye damage. Always wear certified safety goggles, chemical-resistant gloves, and long sleeves. Add lye to water, never water to lye ('The Snow falls on the Lake'). Keep a neutralizing agent or water rinsing source nearby.",
    sourceRefs: [
      { label: "PubChem CID 14798 (Sodium Hydroxide)", url: "https://pubchem.ncbi.nlm.nih.gov/compound/Sodium-hydroxide" },
      { label: "NIOSH Pocket Guide (Sodium Hydroxide)", url: "https://www.cdc.gov/niosh/npg/npgd0565.html" }
    ]
  },
  {
    id: "koh-caustic",
    severity: SafetySeverity.DANGER,
    ingredientId: "koh",
    message: "WARNING: Potassium Hydroxide (KOH) is a caustic, high-hazard alkali. Reactions produce high heat rapidly. Rinsing surfaces and skin with massive clean water flows is critical if contact occurs. Never inhale lye steam.",
    sourceRefs: [
      { label: "PubChem CID 14797 (Potassium Hydroxide)", url: "https://pubchem.ncbi.nlm.nih.gov/compound/Potassium-hydroxide" },
      { label: "NOAA CAMEO Chemicals (Potassium Hydroxide)", url: "https://cameochemicals.noaa.gov/chemical/4311" }
    ]
  },
  {
    id: "citric-acid-neutralization",
    severity: SafetySeverity.WARNING,
    ingredientId: "citric_acid",
    message: "Citric acid reacts with NaOH/KOH. Ensure you calculate extra lye weights (0.624g extra NaOH per 1g of Citric Acid, or 0.875g KOH per 1g Citric Acid) to prevent massive unintended superfatting and soft bars.",
    sourceRefs: [
      { label: "Soap Saponification Chemistry & Acid Neutralization", url: "https://pubchem.ncbi.nlm.nih.gov/compound/Citric-acid" }
    ]
  },
  {
    id: "high-coconut-harshness",
    severity: SafetySeverity.WARNING,
    ingredientId: "coconut_oil",
    message: "Coconut Oil makes up more than 30% of total oil weight. This creates extreme cleansing values, which can strip skin oils and cause heavy dryness unless the superfat is set significantly higher (e.g. 15-20% superfat) to buffer the harshness.",
    sourceRefs: [
      { label: "Cosmetic Ingredient Safety - Coconut Acids", url: "https://www.fda.gov/cosmetics" }
    ]
  },
  {
    id: "beer-volcano-hazard",
    severity: SafetySeverity.DANGER,
    ingredientId: "beer",
    message: "BEER ERUPTIVE HAZARD: Mixing lye with beer containing alcohol or CO2 creates an instantaneous volcanic eruption. You MUST fully de-carbonate (make completely flat) and boil off alcohol, then freeze the liquid into ice blocks before blending with lye.",
    sourceRefs: [
      { label: "CAMEO Reactivity: Alkali with Flammable/Volatile liquids", url: "https://cameochemicals.noaa.gov" }
    ]
  }
];

// Per-metric ideal bands and semantics — the single source of truth shared by
// the calculation and the UI, so the displayed "ideal" range can never
// contradict how a value is classified or coloured.
//   concernBelow: below the band is a real problem (e.g. bar too soft)
//   concernAbove: above the band is a real problem (e.g. strips skin)
// A benign out-of-band side (e.g. very conditioning) reads as informational,
// never as a warning.
export interface MetricSpec {
  key: MetricKey;
  label: string;
  drivers: string;
  idealMin: number;
  idealMax: number;
  concernBelow: boolean;
  concernAbove: boolean;
  description: string;
}

export const METRIC_SPECS: Record<MetricKey, MetricSpec> = {
  hardness: {
    key: "hardness",
    label: "Hardness",
    drivers: "Lauric · Myristic · Palmitic · Stearic",
    idealMin: 29,
    idealMax: 54,
    concernBelow: true,
    concernAbove: true,
    description: "Bar rigidity from saturated fats. Too low stays soft and sticky; too high turns brittle and can crack.",
  },
  cleansing: {
    key: "cleansing",
    label: "Cleansing",
    drivers: "Lauric · Myristic",
    idealMin: 12,
    idealMax: 22,
    concernBelow: false,
    concernAbove: true,
    description: "How aggressively the bar strips oils. Above the band it can leave skin tight and dry; below it just reads as gentle.",
  },
  conditioning: {
    key: "conditioning",
    label: "Conditioning",
    drivers: "Oleic · Linoleic · Linolenic · Ricinoleic",
    idealMin: 44,
    idealMax: 69,
    concernBelow: true,
    concernAbove: false,
    description: "Skin-softening unsaturated fats. Below the band feels harsh; above it is simply richer (and slightly softer).",
  },
  bubblyLather: {
    key: "bubblyLather",
    label: "Bubbly lather",
    drivers: "Lauric · Myristic · Ricinoleic",
    idealMin: 14,
    idealMax: 46,
    concernBelow: true,
    concernAbove: false,
    description: "Big, fluffy, fast bubbles. Below the band the bar foams poorly; a high value is welcome.",
  },
  creamyLather: {
    key: "creamyLather",
    label: "Creamy lather",
    drivers: "Palmitic · Stearic",
    idealMin: 16,
    idealMax: 48,
    concernBelow: true,
    concernAbove: false,
    description: "Dense, lotion-like micro-foam. Below the band the lather feels thin; higher is creamier.",
  },
  longevity: {
    key: "longevity",
    label: "Longevity",
    drivers: "Palmitic · Stearic + hardness",
    idealMin: 25,
    idealMax: 50,
    concernBelow: true,
    concernAbove: false,
    description: "How well the bar resists dissolving in a wet shower. Below the band it melts away fast; higher lasts longer.",
  },
  traceSpeedRisk: {
    key: "traceSpeedRisk",
    label: "Trace speed",
    drivers: "Saturated fats · butters · sugars",
    idealMin: 0,
    idealMax: 55,
    concernBelow: false,
    concernAbove: true,
    description: "How quickly the batter thickens while blending. Above the band it sets fast — hard to swirl and easy to seize.",
  },
};

// Classify a raw value against its metric spec.
export function classifyMetric(rawScore: number, spec: MetricSpec): ScoreBand {
  let status: ScoreBand["status"] = "on-target";
  let concern = false;
  if (rawScore < spec.idealMin) {
    status = "below";
    concern = spec.concernBelow;
  } else if (rawScore > spec.idealMax) {
    status = "above";
    concern = spec.concernAbove;
  }
  return {
    score: Math.round(rawScore),
    status,
    concern,
    idealMin: spec.idealMin,
    idealMax: spec.idealMax,
  };
}

// 2. Deterministic Checksum/Hash Generator (replaces crypto dependency to be cross-platform browser/Node)
export function generateFormulationHash(input: any): string {
  const str = JSON.stringify(input);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  const positiveHash = Math.abs(hash).toString(16).padStart(8, "0");
  return `fhash_${CATALOG_VERSION}_${positiveHash}`;
}

const CHEMICALLY_ACTIVE_FOR_UNKNOWN: AdditiveRole[] = [
  "acid",
  "base",
  "alcoholic",
  "carbonated",
  "unknown_reactive",
  "fragrance",
  "pigment",
  "microbial_risk",
];

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function getAdditiveDefinition(additiveId: string): AdditiveDefinition | undefined {
  return ADDITIVE_CATALOG_BY_ID[additiveId];
}

function hasRole(def: AdditiveDefinition, role: AdditiveRole): boolean {
  return def.roles.includes(role);
}

function notice(
  id: string,
  severity: SafetySeverity,
  additiveIds: string[],
  message: string,
  defs: AdditiveDefinition[] = [],
): AdditiveReportNotice {
  const sourceRefs = defs.flatMap((def) => def.sourceRefs);
  return {
    id,
    severity,
    additiveIds: [...additiveIds].sort(),
    message,
    sourceRefs: sourceRefs.length > 0 ? sourceRefs : [{ label: "PDR additive chemistry compiler V1" }],
  };
}

function requiredPreparedStates(def: AdditiveDefinition) {
  const states = new Set<NonNullable<RecipeDraft["additives"][number]["preparedStates"]>[number]>();
  if (hasRole(def, "carbonated")) states.add("decarbonated");
  if (hasRole(def, "alcoholic")) states.add("de_alcoholized");
  if (def.temperatureRequirement === "frozen") states.add("frozen");
  if (def.temperatureRequirement === "chilled") states.add("chilled");
  if (hasRole(def, "pigment") || hasRole(def, "clay_absorbent") || hasRole(def, "fragrance_fixative")) states.add("dispersed_in_oil");
  if (hasRole(def, "acid") || hasRole(def, "salt") || hasRole(def, "sugar") || hasRole(def, "chelator")) states.add("dissolved_in_water");
  if (def.supplierUsageRequired) states.add("supplier_verified");
  return [...states].sort();
}

function evaluateAdditiveSynergies(
  active: { ingredientId: string; weightGrams: number; def: AdditiveDefinition }[],
  recipe: RecipeDraft,
  totalOilWeight: number,
  lyeConcentration: number,
  requiredSolvent: number,
): AdditiveReportNotice[] {
  const byId = new Map(active.map((item) => [item.ingredientId, item]));
  const byRole = (role: AdditiveRole) => active.filter((item) => hasRole(item.def, role));
  const results: AdditiveReportNotice[] = [];
  const push = (id: string, severity: SafetySeverity, additiveIds: string[], message: string) => {
    if (!results.some((item) => item.id === id)) {
      results.push(notice(id, severity, additiveIds, message, additiveIds.map((additiveId) => byId.get(additiveId)?.def).filter(Boolean) as AdditiveDefinition[]));
    }
  };

  if (byRole("sugar").length > 0 && recipe.oils.some((oil) => oil.ingredientId === "castor_oil" && oil.weightGrams > 0)) {
    push("sugar-castor-lather", SafetySeverity.INFO, byRole("sugar").map((item) => item.ingredientId), "Sugar plus castor oil can increase larger, more stable bubbles; keep the sugar heat load visible.");
  }
  if (byId.has("raw_honey") && active.some((item) => item.def.category === "milk_protein")) {
    push("honey-milk-creamy-heat", SafetySeverity.DANGER, ["raw_honey", ...active.filter((item) => item.def.category === "milk_protein").map((item) => item.ingredientId)], "Honey plus milk can boost creamy lather, but the combined sugar/protein load sharply raises scorch and overheating risk.");
  }
  if (byRole("clay_absorbent").length > 0 && byRole("fragrance").length > 0) {
    push("clay-fragrance-fixation", SafetySeverity.WARNING, [...byRole("clay_absorbent"), ...byRole("fragrance")].map((item) => item.ingredientId), "Clay can anchor scent, but it also thickens batter and may accelerate trace.");
  }
  if (active.some((item) => ["arrowroot_powder", "tapioca_pearls_starch"].includes(item.ingredientId)) && byRole("fragrance").length > 0) {
    push("starch-fragrance-fixation", SafetySeverity.WARNING, active.filter((item) => ["arrowroot_powder", "tapioca_pearls_starch"].includes(item.ingredientId) || hasRole(item.def, "fragrance")).map((item) => item.ingredientId), "Arrowroot or tapioca can absorb fragrance and help fixation, but must be dispersed to avoid clumps.");
  }
  if (byId.has("sodium_lactate") && recipe.oils.some((oil) => {
    const ing = INGREDIENT_CATALOG.find((candidate) => candidate.id === oil.ingredientId);
    return oil.weightGrams > 0 && ing?.tags.includes("hard_oil");
  })) {
    push("sodium-lactate-hard-oils", SafetySeverity.WARNING, ["sodium_lactate"], "Sodium lactate plus hard oils speeds unmolding and bar hardness; high doses can feel brittle.");
  }
  if (byRole("salt").length > 0 && recipe.oils.some((oil) => oil.ingredientId === "coconut_oil" && oil.weightGrams > 0)) {
    push("salt-coconut-hardness", SafetySeverity.INFO, byRole("salt").map((item) => item.ingredientId), "Salt plus coconut oil supports salt-bar hardness; lather can drop if coconut oil is not high enough.");
  }
  if (byId.has("citric_acid") && (byId.has("sodium_citrate") || byId.has("tetrasodium_edta") || byId.has("disodium_edta"))) {
    push("citric-citrate-edta-chelation", SafetySeverity.INFO, ["citric_acid", "sodium_citrate", "tetrasodium_edta", "disodium_edta"].filter((id) => byId.has(id)), "Citric acid with citrate or EDTA increases hard-water chelation; acid alkali compensation remains mandatory.");
  }
  if (byId.has("stearic_acid") && recipe.lyeSettings.alkaliType === AlkaliType.KOH) {
    push("stearic-koh-shaving-soap", SafetySeverity.WARNING, ["stearic_acid"], "Stearic acid with KOH can build shaving-soap thickness quickly and may seize if temperatures fall.");
  }
  if (active.some((item) => item.def.category === "milk_protein") && lyeConcentration >= 35) {
    push("milk-high-lye-concentration", SafetySeverity.DANGER, active.filter((item) => item.def.category === "milk_protein").map((item) => item.ingredientId), "Milk/protein additives at high lye concentration increase scorch, ammonia odor, and overheating risk.");
  }
  if (active.some((item) => item.def.category === "botanical_puree" && hasRole(item.def, "solvent_contributor")) && requiredSolvent / Math.max(totalOilWeight, 1) > 0.35) {
    push("fresh-puree-high-water", SafetySeverity.WARNING, active.filter((item) => item.def.category === "botanical_puree").map((item) => item.ingredientId), "Fresh purees with high water make a softer bar and increase spoilage, odor, and discoloration risk.");
  }
  if (byRole("botanical").length > 0) {
    push("botanical-high-ph-discoloration", SafetySeverity.INFO, byRole("botanical").map((item) => item.ingredientId), "Botanicals in high-pH soap often brown, fade, or discolor during cure.");
  }
  if (byId.has("activated_charcoal") && byRole("fragrance").length > 0) {
    push("charcoal-fragrance-absorption", SafetySeverity.WARNING, ["activated_charcoal", ...byRole("fragrance").map((item) => item.ingredientId)], "Activated charcoal can absorb scent materials, reducing fragrance strength.");
  }
  if (byId.has("beeswax") && requiredSolvent / Math.max(totalOilWeight, 1) < 0.28) {
    push("beeswax-low-water-false-trace", SafetySeverity.WARNING, ["beeswax"], "Beeswax plus low water can harden travel bars, but false trace and overheating risk rise.");
  }

  return results.sort((a, b) => a.id.localeCompare(b.id));
}

function buildAdditiveChemistryReport(
  recipe: RecipeDraft,
  requiredSolventGrams: number,
  totalOilWeight: number,
  lyeConcentration: number,
): AdditiveChemistryReport {
  const active = [...recipe.additives]
    .filter((item) => item.weightGrams > 0)
    .sort((a, b) => a.ingredientId.localeCompare(b.ingredientId))
    .map((item) => ({ ...item, def: getAdditiveDefinition(item.ingredientId) }))
    .filter((item): item is RecipeDraft["additives"][number] & { def: AdditiveDefinition } => Boolean(item.def));

  const ledger = active.map((item) => ({
    additiveId: item.ingredientId,
    name: item.def.name,
    grams: round2(item.weightGrams),
    roles: item.def.roles,
    source: "additive" as const,
  }));

  const alkaliDetails = active
    .map((item) => ({
      additiveId: item.ingredientId,
      name: item.def.name,
      naohGrams: round2(item.weightGrams * (item.def.consumesNaOHPerGram ?? 0)),
      kohGrams: round2(item.weightGrams * (item.def.consumesKOHPerGram ?? 0)),
    }))
    .filter((item) => item.naohGrams > 0 || item.kohGrams > 0);

  const lipidDetails = active
    .filter((item) => (item.def.sapNaOH || item.def.sapKOH) && item.def.processPhase !== "hot_process_after_cook")
    .map((item) => ({
      additiveId: item.ingredientId,
      name: item.def.name,
      grams: round2(item.weightGrams * (item.def.lipidFraction ?? 1)),
      naohGrams: round2(item.weightGrams * (item.def.sapNaOH ?? 0) * (1 - recipe.lyeSettings.superfatPercent / 100)),
      kohGrams: round2(item.weightGrams * (item.def.sapKOH ?? 0) * (1 - recipe.lyeSettings.superfatPercent / 100)),
    }));

  const freeWater = active.reduce((sum, item) => sum + item.weightGrams * item.def.waterFraction * (item.def.waterAvailabilityCoefficient ?? 1), 0);
  const insolubleSolids = active.reduce((sum, item) => sum + item.weightGrams * (item.def.insolubleSolidsFraction ?? 0), 0);
  const abrasiveSolids = active.reduce((sum, item) => sum + (hasRole(item.def, "abrasive") ? item.weightGrams * (item.def.insolubleSolidsFraction ?? 1) : 0), 0);
  const sugar = active.reduce((sum, item) => sum + item.weightGrams * (item.def.sugarFraction ?? 0), 0);
  const protein = active.reduce((sum, item) => sum + item.weightGrams * (item.def.proteinFraction ?? 0), 0);
  const salt = active.reduce((sum, item) => sum + item.weightGrams * (item.def.saltFraction ?? 0), 0);
  const chelator = active.reduce((sum, item) => sum + (hasRole(item.def, "chelator") ? item.weightGrams : 0), 0);

  const requiredAddedWater = Math.max(0, requiredSolventGrams - freeWater);
  const excessFreeWater = Math.max(0, freeWater - requiredSolventGrams);
  const sugarPct = totalOilWeight > 0 ? (sugar / totalOilWeight) * 100 : 0;
  const proteinPct = totalOilWeight > 0 ? (protein / totalOilWeight) * 100 : 0;
  const solidsPct = totalOilWeight > 0 ? (insolubleSolids / totalOilWeight) * 100 : 0;
  const abrasivePct = totalOilWeight > 0 ? (abrasiveSolids / totalOilWeight) * 100 : 0;

  const heatRiskScore = round2(sugarPct * 2 + proteinPct * 1.5 + (lyeConcentration >= 35 ? 12 : 0) + (active.some((item) => item.ingredientId === "raw_honey") ? 8 : 0));

  const fragrancePigmentReview = active
    .filter((item) => hasRole(item.def, "fragrance") || hasRole(item.def, "pigment") || item.def.reviewRequired || item.def.cosmeticGradeRequired || item.def.supplierUsageRequired)
    .map((item) => ({
      additiveId: item.ingredientId,
      name: item.def.name,
      reviewRequired: item.def.reviewRequired || Boolean(item.def.supplierUsageRequired && !item.supplierUsageVerified) || Boolean(item.def.cosmeticGradeRequired && !item.cosmeticGradeVerified),
      reason: item.def.supplierUsageRequired
        ? "Supplier usage, skin-safety, acceleration, and discoloration metadata must be verified."
        : item.def.cosmeticGradeRequired
          ? "Cosmetic-grade and skin-safe pigment documentation must be verified."
          : "Catalog marks this additive for review before ready status.",
    }))
    .sort((a, b) => a.additiveId.localeCompare(b.additiveId));

  const handlingRequirements = active.map((item) => {
    const preparedStates = requiredPreparedStates(item.def);
    const actualStates = item.preparedStates ?? [];
    const missingPreparedStates = preparedStates.filter((state) => !actualStates.includes(state));
    return {
      additiveId: item.ingredientId,
      name: item.def.name,
      processPhase: item.processPhase ?? item.def.processPhase,
      temperatureRequirement: item.def.temperatureRequirement,
      preparedStates,
      missingPreparedStates,
      message: `${item.def.name}: ${item.def.temperatureRequirement} handling at ${item.processPhase ?? item.def.processPhase}.`,
    };
  }).sort((a, b) => a.additiveId.localeCompare(b.additiveId));

  const hazards: AdditiveReportNotice[] = [];
  for (const item of active) {
    if (hasRole(item.def, "acid")) {
      const known = (item.def.consumesNaOHPerGram ?? 0) > 0 || (item.def.consumesKOHPerGram ?? 0) > 0;
      hazards.push(notice(
        known ? `${item.ingredientId}-acid-alkali-warning` : `${item.ingredientId}-acid-neutralization-blocked`,
        known ? SafetySeverity.WARNING : SafetySeverity.BLOCKED,
        [item.ingredientId],
        known
          ? `${item.def.name} is acidic; the compiler adds configured alkali compensation and flags exothermic neutralization handling.`
          : `${item.def.name} is acidic but has no neutralization coefficient. Compile cannot treat it as a simple liquid or inert additive.`,
        [item.def],
      ));
    }
    if ((hasRole(item.def, "carbonated") || hasRole(item.def, "alcoholic")) && handlingRequirements.find((req) => req.additiveId === item.ingredientId)?.missingPreparedStates.length) {
      hazards.push(notice(`${item.ingredientId}-prepared-state-blocked`, SafetySeverity.BLOCKED, [item.ingredientId], `${item.def.name} must be prepared before lye contact: de-carbonated/de-alcoholized and cold or frozen as applicable.`, [item.def]));
    }
    if (item.def.supplierUsageRequired && !item.supplierUsageVerified) {
      hazards.push(notice(`${item.ingredientId}-missing-supplier-limit`, SafetySeverity.BLOCKED, [item.ingredientId], `${item.def.name} lacks verified supplier usage, skin-safe, acceleration, and discoloration metadata.`, [item.def]));
    }
    if (item.def.cosmeticGradeRequired && !item.cosmeticGradeVerified) {
      hazards.push(notice(`${item.ingredientId}-cosmetic-grade-blocked`, SafetySeverity.BLOCKED, [item.ingredientId], `${item.def.name} must be verified cosmetic grade and skin safe before body-soap readiness.`, [item.def]));
    }
    if (hasRole(item.def, "melt_and_pour_only")) {
      hazards.push(notice(`${item.ingredientId}-melt-pour-mode-warning`, SafetySeverity.WARNING, [item.ingredientId], `${item.def.name} is marked melt-and-pour/specialty-use only for this catalog model.`, [item.def]));
    }
    if (hasRole(item.def, "liquid_soap_only") && recipe.lyeSettings.alkaliType !== AlkaliType.KOH) {
      hazards.push(notice(`${item.ingredientId}-liquid-soap-mode-warning`, SafetySeverity.WARNING, [item.ingredientId], `${item.def.name} is marked liquid-soap specialty use, not default cold-process bar chemistry.`, [item.def]));
    }
  }
  if (excessFreeWater > 0) {
    hazards.push(notice("additive-free-water-overage", excessFreeWater / Math.max(totalOilWeight, 1) > 0.1 ? SafetySeverity.BLOCKED : SafetySeverity.WARNING, active.map((item) => item.ingredientId), `Additives contribute ${round2(excessFreeWater)}g more free water than the solvent target.`, active.map((item) => item.def)));
  }
  if (solidsPct > 8) {
    hazards.push(notice("high-solids-load-danger", SafetySeverity.DANGER, active.filter((item) => (item.def.insolubleSolidsFraction ?? 0) > 0).map((item) => item.ingredientId), `Insoluble solids are ${round2(solidsPct)}% of oils; batter may seize, drag, or cure crumbly.`, active.map((item) => item.def)));
  } else if (solidsPct > 3) {
    hazards.push(notice("high-solids-load-warning", SafetySeverity.WARNING, active.filter((item) => (item.def.insolubleSolidsFraction ?? 0) > 0).map((item) => item.ingredientId), `Insoluble solids are ${round2(solidsPct)}% of oils; expect faster thickening.`, active.map((item) => item.def)));
  }
  if (abrasivePct > 2) {
    hazards.push(notice("abrasive-load-scratch-risk", SafetySeverity.WARNING, active.filter((item) => hasRole(item.def, "abrasive")).map((item) => item.ingredientId), `Abrasive load is ${round2(abrasivePct)}% of oils; scratch risk rises.`, active.map((item) => item.def)));
  }
  if (heatRiskScore >= 18) {
    hazards.push(notice("sugar-protein-heat-danger", SafetySeverity.DANGER, active.filter((item) => hasRole(item.def, "sugar") || hasRole(item.def, "protein")).map((item) => item.ingredientId), `Sugar/protein heat score is ${heatRiskScore}; use chilled/frozen liquids and lower starting temperatures.`, active.map((item) => item.def)));
  } else if (heatRiskScore >= 8) {
    hazards.push(notice("sugar-protein-heat-warning", SafetySeverity.WARNING, active.filter((item) => hasRole(item.def, "sugar") || hasRole(item.def, "protein")).map((item) => item.ingredientId), `Sugar/protein heat score is ${heatRiskScore}; watch scorch and acceleration.`, active.map((item) => item.def)));
  }
  if (recipe.lyeSettings.alkaliType === AlkaliType.NaOH || recipe.lyeSettings.alkaliType === AlkaliType.MIXED) {
    hazards.push(notice("alkali-aluminum-zinc-warning", SafetySeverity.WARNING, [], "Keep NaOH/KOH away from aluminum or zinc tools and metallic pigments unless supplier documentation confirms compatibility; caustic alkali can generate flammable hydrogen gas with those metals."));
  }

  const synergies = evaluateAdditiveSynergies(active, recipe, totalOilWeight, lyeConcentration, requiredSolventGrams);
  const knownInteractionIds = new Set(synergies.flatMap((item) => [item.additiveIds.sort().join("+")]));
  const unknownInteractions: AdditiveReportNotice[] = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      const key = [a.ingredientId, b.ingredientId].sort().join("+");
      const needsRule = [...a.def.roles, ...b.def.roles].some((role) => CHEMICALLY_ACTIVE_FOR_UNKNOWN.includes(role));
      if (needsRule && !knownInteractionIds.has(key)) {
        const severe = [...a.def.roles, ...b.def.roles].some((role) => role === "unknown_reactive");
        unknownInteractions.push(notice(`unknown-interaction-${key}`, severe ? SafetySeverity.BLOCKED : SafetySeverity.WARNING, [a.ingredientId, b.ingredientId], `${a.def.name} and ${b.def.name} have chemically active roles but no specific interaction rule; review before treating this recipe as ready.`, [a.def, b.def]));
      }
    }
  }

  return {
    ledger,
    solventImpact: {
      requiredSolventGrams: round2(requiredSolventGrams),
      freeWaterGrams: round2(freeWater),
      requiredAddedWaterGrams: round2(requiredAddedWater),
      excessFreeWaterGrams: round2(excessFreeWater),
    },
    alkaliCompensation: {
      naohGrams: round2(alkaliDetails.reduce((sum, item) => sum + item.naohGrams, 0)),
      kohGrams: round2(alkaliDetails.reduce((sum, item) => sum + item.kohGrams, 0)),
      details: alkaliDetails,
    },
    lipidContribution: {
      oilEquivalentGrams: round2(lipidDetails.reduce((sum, item) => sum + item.grams, 0)),
      naohGrams: round2(lipidDetails.reduce((sum, item) => sum + item.naohGrams, 0)),
      kohGrams: round2(lipidDetails.reduce((sum, item) => sum + item.kohGrams, 0)),
      details: lipidDetails,
    },
    solidsLoad: {
      insolubleSolidsGrams: round2(insolubleSolids),
      percentOfOils: round2(solidsPct),
      abrasivePercentOfOils: round2(abrasivePct),
    },
    sugarProteinHeatRisk: {
      sugarGrams: round2(sugar),
      proteinGrams: round2(protein),
      sugarPercentOfOils: round2(sugarPct),
      proteinPercentOfOils: round2(proteinPct),
      heatRiskScore,
    },
    saltChelation: {
      saltGrams: round2(salt),
      saltPercentOfOils: round2(totalOilWeight > 0 ? (salt / totalOilWeight) * 100 : 0),
      chelatorGrams: round2(chelator),
      notes: [
        salt > 0 ? "Salt-class additives can harden bars and alter lather depending on dose." : "",
        chelator > 0 ? "Chelators support hard-water performance and reduce soap scum." : "",
      ].filter(Boolean),
    },
    fragrancePigmentReview,
    synergies,
    hazards: hazards.sort((a, b) => a.id.localeCompare(b.id)),
    unknownInteractions: unknownInteractions.sort((a, b) => a.id.localeCompare(b.id)),
    handlingRequirements,
  };
}

// 3. Bytecode Compiler Formulation Pipeline
export function compileRecipeDraft(recipe: RecipeDraft): { opcodes: SoapOpcode[]; trace: string[] } {
  const trace: string[] = [];
  const opcodes: SoapOpcode[] = [];

  trace.push(`Initializing Compilation with compiler v${COMPILER_VERSION}`);
  trace.push(`Loaded Catalog version ${CATALOG_VERSION}`);

  // Sort oils and ingredients by ID to guarantee exact determinism
  const sortedOils = [...recipe.oils].sort((a, b) => a.ingredientId.localeCompare(b.ingredientId));
  const sortedLiquids = [...recipe.liquids].sort((a, b) => a.ingredientId.localeCompare(b.ingredientId));
  const sortedAdditives = [...recipe.additives].sort((a, b) => a.ingredientId.localeCompare(b.ingredientId));

  trace.push(`Sorted ${sortedOils.length} oils, ${sortedLiquids.length} liquids, and ${sortedAdditives.length} additives for deterministic evaluation`);

  // Load Oils
  for (const oil of sortedOils) {
    if (oil.weightGrams <= 0) continue;
    opcodes.push({ op: "LOAD_OIL", ingredientId: oil.ingredientId, grams: oil.weightGrams });
    trace.push(`OPCODE: LOAD_OIL - ID: ${oil.ingredientId}, Weight: ${oil.weightGrams}g`);
  }

  // Determine Alkali
  const alkali = recipe.lyeSettings.alkaliType === AlkaliType.KOH ? "KOH" : "NaOH";
  trace.push(`Target Saponification agent: ${alkali}`);

  // Saponification computation opcodes
  for (const oil of sortedOils) {
    if (oil.weightGrams <= 0) continue;
    opcodes.push({ op: "LOAD_SAP", ingredientId: oil.ingredientId, alkali });
    opcodes.push({ op: "MUL_OIL_SAP", target: oil.ingredientId });
  }

  opcodes.push({ op: "SUM_LYE" });
  trace.push("OPCODE: SUM_LYE - Saponifying all oils");

  // Apply Superfat
  opcodes.push({ op: "APPLY_SUPERFAT", percent: recipe.lyeSettings.superfatPercent });
  trace.push(`OPCODE: APPLY_SUPERFAT - Discounting alkali by ${recipe.lyeSettings.superfatPercent}%`);

  const activeAdditives = sortedAdditives.filter((additive) => additive.weightGrams > 0);
  for (const additive of activeAdditives) {
    const def = getAdditiveDefinition(additive.ingredientId);
    opcodes.push({ op: "LOAD_ADDITIVE", additiveId: additive.ingredientId, grams: additive.weightGrams });
    opcodes.push({ op: "CLASSIFY_ADDITIVE", additiveId: additive.ingredientId });
    trace.push(`OPCODE: LOAD_ADDITIVE - ID: ${additive.ingredientId}, Weight: ${additive.weightGrams}g`);
    trace.push(`OPCODE: CLASSIFY_ADDITIVE - ${additive.ingredientId}${def ? ` roles=${def.roles.join(",")}` : " unknown"}`);
    opcodes.push({ op: "APPLY_ALKALI_COMPENSATION", additiveId: additive.ingredientId });
    opcodes.push({ op: "APPLY_SOLVENT_CONTRIBUTION", additiveId: additive.ingredientId });
    opcodes.push({ op: "APPLY_LIPID_CONTRIBUTION", additiveId: additive.ingredientId });
    opcodes.push({ op: "APPLY_SALT_EFFECT", additiveId: additive.ingredientId });
    opcodes.push({ op: "APPLY_SUGAR_EFFECT", additiveId: additive.ingredientId });
    opcodes.push({ op: "APPLY_SOLIDS_LOAD", additiveId: additive.ingredientId });
    opcodes.push({ op: "APPLY_CHELATOR_EFFECT", additiveId: additive.ingredientId });
    opcodes.push({ op: "APPLY_FRAGRANCE_EFFECT", additiveId: additive.ingredientId });
    opcodes.push({ op: "EVAL_TEMPERATURE_REQUIREMENT", additiveId: additive.ingredientId });
  }
  if (activeAdditives.length > 1) {
    const additiveIds = activeAdditives.map((additive) => additive.ingredientId);
    opcodes.push({ op: "EVAL_ADDITIVE_SYNERGY", additiveIds });
    opcodes.push({ op: "EVAL_ADDITIVE_HAZARD", additiveIds });
    trace.push(`OPCODE: EVAL_ADDITIVE_SYNERGY/EVAL_ADDITIVE_HAZARD - ${additiveIds.join(", ")}`);
  }
  opcodes.push({ op: "EMIT_ADDITIVE_REPORT" });
  trace.push("OPCODE: EMIT_ADDITIVE_REPORT - Additive chemistry ledger staged before solvent math");

  // KOH Purity Adjustment if KOH
  if (recipe.lyeSettings.alkaliType === AlkaliType.KOH) {
    const purity = recipe.lyeSettings.kohPurityPercent || 90;
    opcodes.push({ op: "APPLY_KOH_PURITY", purityPercent: purity });
    trace.push(`OPCODE: APPLY_KOH_PURITY - Scaling KOH weight by ${purity}% purity factor`);
  }

  // Calculate Water Opcode
  opcodes.push({
    op: "CALC_WATER",
    lyeConcentration: recipe.lyeSettings.lyeConcentrationPercent,
    waterToLyeRatio: recipe.lyeSettings.waterToLyeRatio,
    manualWater: recipe.lyeSettings.manualWaterGrams
  });
  trace.push(`OPCODE: CALC_WATER - Resolving liquid volume using active configuration`);

  // Predict quality
  opcodes.push({ op: "CALC_QUALITY" });
  trace.push("OPCODE: CALC_QUALITY - Running fatty acid quality prediction simulation");

  opcodes.push({ op: "EMIT_RESULT" });
  trace.push("OPCODE: EMIT_RESULT - Saponification Compilation complete. Emitting locked result AST.");

  return { opcodes, trace };
}

// 4. Virtual Machine Saponification Executer
export function executeSoapBytecode(
  opcodes: SoapOpcode[],
  recipe: RecipeDraft
): CompiledFormulaResult {
  const compilerTrace: string[] = [];
  compilerTrace.push("SoapVM: Initializing virtual machine execution registers");

  let totalOilWeight = 0;
  let rawRequiredLye = 0; // accumulated un-discounted lye
  let calculatedLyeNaOH = 0;
  let calculatedLyeKOH = 0;
  let waterWeight = 0;
  let superfatMultiplier = 1;

  const oilWeights: Record<string, number> = {};
  const sapOils: Record<string, number> = {};
  const additiveWeights: Record<string, number> = {};
  const appliedCompensation = new Set<string>();
  const appliedLipidContribution = new Set<string>();

  // Quality calculation parameters
  let sumLauric = 0;
  let sumMyristic = 0;
  let sumPalmitic = 0;
  let sumStearic = 0;
  let sumRicinoleic = 0;
  let sumOleic = 0;
  let sumLinoleic = 0;
  let sumLinolenic = 0;

  for (const opcode of opcodes) {
    switch (opcode.op) {
      case "LOAD_OIL": {
        oilWeights[opcode.ingredientId] = opcode.grams;
        totalOilWeight += opcode.grams;
        compilerTrace.push(`Register LOAD_OIL: ${opcode.ingredientId} -> ${opcode.grams}g`);
        break;
      }
      case "LOAD_SAP": {
        const ing = INGREDIENT_CATALOG.find((i) => i.id === opcode.ingredientId);
        if (ing) {
          sapOils[opcode.ingredientId] = opcode.alkali === "NaOH" ? ing.sapNaOH : ing.sapKOH;
          compilerTrace.push(`Register LOAD_SAP: ${opcode.ingredientId} [${opcode.alkali}] -> ${sapOils[opcode.ingredientId]}`);
          
          // Accumulate fatty acids proportional to oil weight for quality predictions later
          const weight = oilWeights[opcode.ingredientId] || 0;
          sumLauric += (ing.lauric || 0) * weight;
          sumMyristic += (ing.myristic || 0) * weight;
          sumPalmitic += (ing.palmitic || 0) * weight;
          sumStearic += (ing.stearic || 0) * weight;
          sumRicinoleic += (ing.ricinoleic || 0) * weight;
          sumOleic += (ing.oleic || 0) * weight;
          sumLinoleic += (ing.linoleic || 0) * weight;
          sumLinolenic += (ing.linolenic || 0) * weight;
        }
        break;
      }
      case "MUL_OIL_SAP": {
        const weight = oilWeights[opcode.target] || 0;
        const sapVal = sapOils[opcode.target] || 0;
        const lyeForThisOil = weight * sapVal;
        rawRequiredLye += lyeForThisOil;
        compilerTrace.push(`Compute MUL_OIL_SAP: ${opcode.target} (${weight}g * ${sapVal}) -> ${lyeForThisOil.toFixed(4)}g Lye`);
        break;
      }
      case "SUM_LYE": {
        compilerTrace.push(`Accumulated un-discounted lye requirement: ${rawRequiredLye.toFixed(4)}g`);
        if (recipe.lyeSettings.alkaliType === AlkaliType.KOH) {
          calculatedLyeKOH = rawRequiredLye;
        } else {
          calculatedLyeNaOH = rawRequiredLye;
        }
        break;
      }
      case "APPLY_SUPERFAT": {
        const discount = 1 - opcode.percent / 100;
        superfatMultiplier = discount;
        calculatedLyeNaOH *= discount;
        calculatedLyeKOH *= discount;
        compilerTrace.push(`Apply SUPERFAT DISCOUNT: Multiplier ${discount} (New NaOH: ${calculatedLyeNaOH.toFixed(4)}g, KOH: ${calculatedLyeKOH.toFixed(4)}g)`);
        break;
      }
      case "LOAD_ADDITIVE": {
        additiveWeights[opcode.additiveId] = opcode.grams;
        const def = getAdditiveDefinition(opcode.additiveId);
        compilerTrace.push(`Register LOAD_ADDITIVE: ${opcode.additiveId} -> ${opcode.grams}g${def ? ` (${def.name})` : " (unknown definition)"}`);
        break;
      }
      case "CLASSIFY_ADDITIVE": {
        const def = getAdditiveDefinition(opcode.additiveId);
        compilerTrace.push(`Classify ADDITIVE: ${opcode.additiveId} -> ${def ? def.roles.join(", ") : "unknown_reactive"}`);
        break;
      }
      case "APPLY_ALKALI_COMPENSATION": {
        if (appliedCompensation.has(opcode.additiveId)) break;
        appliedCompensation.add(opcode.additiveId);
        const def = getAdditiveDefinition(opcode.additiveId);
        const grams = additiveWeights[opcode.additiveId] || 0;
        if (def && grams > 0) {
          const extraNaOH = grams * (def.consumesNaOHPerGram ?? 0);
          const extraKOH = grams * (def.consumesKOHPerGram ?? 0);
          calculatedLyeNaOH += extraNaOH;
          calculatedLyeKOH += extraKOH;
          if (extraNaOH || extraKOH) {
            compilerTrace.push(`Apply ADDITIVE ALKALI COMPENSATION: ${def.name} -> +${extraNaOH.toFixed(4)}g NaOH / +${extraKOH.toFixed(4)}g KOH`);
          }
        }
        break;
      }
      case "APPLY_LIPID_CONTRIBUTION": {
        if (appliedLipidContribution.has(opcode.additiveId)) break;
        appliedLipidContribution.add(opcode.additiveId);
        const def = getAdditiveDefinition(opcode.additiveId);
        const grams = additiveWeights[opcode.additiveId] || 0;
        if (def && grams > 0 && def.processPhase !== "hot_process_after_cook" && (def.sapNaOH || def.sapKOH)) {
          const oilEquivalent = grams * (def.lipidFraction ?? 1);
          totalOilWeight += oilEquivalent;
          const extraNaOH = grams * (def.sapNaOH ?? 0) * superfatMultiplier;
          const extraKOH = grams * (def.sapKOH ?? 0) * superfatMultiplier;
          calculatedLyeNaOH += extraNaOH;
          calculatedLyeKOH += extraKOH;
          compilerTrace.push(`Apply ADDITIVE LIPID SAP: ${def.name} -> ${oilEquivalent.toFixed(2)}g oil-equivalent, +${extraNaOH.toFixed(4)}g NaOH / +${extraKOH.toFixed(4)}g KOH after superfat`);
        }
        break;
      }
      case "APPLY_SOLVENT_CONTRIBUTION":
      case "APPLY_SALT_EFFECT":
      case "APPLY_SUGAR_EFFECT":
      case "APPLY_SOLIDS_LOAD":
      case "APPLY_CHELATOR_EFFECT":
      case "APPLY_FRAGRANCE_EFFECT":
      case "EVAL_TEMPERATURE_REQUIREMENT": {
        const def = getAdditiveDefinition(opcode.additiveId);
        if (def) compilerTrace.push(`Stage ${opcode.op}: ${def.name}`);
        break;
      }
      case "EVAL_ADDITIVE_SYNERGY":
      case "EVAL_ADDITIVE_HAZARD": {
        compilerTrace.push(`Stage ${opcode.op}: ${opcode.additiveIds.slice().sort().join(", ")}`);
        break;
      }
      case "EMIT_ADDITIVE_REPORT": {
        compilerTrace.push("Stage EMIT_ADDITIVE_REPORT: additive report will be emitted after solvent register resolves");
        break;
      }
      case "APPLY_KOH_PURITY": {
        const purityFactor = 100 / opcode.purityPercent;
        calculatedLyeKOH *= purityFactor;
        compilerTrace.push(`Apply KOH PURITY: Factor ${purityFactor.toFixed(4)} (New KOH: ${calculatedLyeKOH.toFixed(4)}g)`);
        break;
      }
      case "CALC_WATER": {
        const activeLye = recipe.lyeSettings.alkaliType === AlkaliType.KOH ? calculatedLyeKOH : calculatedLyeNaOH;
        
        if (opcode.manualWater && opcode.manualWater > 0) {
          waterWeight = opcode.manualWater;
          compilerTrace.push(`Apply WATER: Manual Override selected -> ${waterWeight}g`);
        } else if (opcode.waterToLyeRatio && opcode.waterToLyeRatio > 0) {
          waterWeight = activeLye * opcode.waterToLyeRatio;
          compilerTrace.push(`Compute WATER: Lye-to-Water Ratio of ${opcode.waterToLyeRatio}:1 -> ${waterWeight.toFixed(4)}g`);
        } else if (opcode.lyeConcentration && opcode.lyeConcentration > 0) {
          // water = (lye / concentration) - lye
          const fraction = opcode.lyeConcentration / 100;
          waterWeight = (activeLye / fraction) - activeLye;
          compilerTrace.push(`Compute WATER: Concentration ${opcode.lyeConcentration}% -> (${activeLye.toFixed(4)} / ${fraction}) - ${activeLye.toFixed(4)} -> ${waterWeight.toFixed(4)}g`);
        } else {
          // Default default concentration is 33%
          const fraction = 0.33;
          waterWeight = (activeLye / fraction) - activeLye;
          compilerTrace.push(`Compute WATER: Defaulted to 33% Lye concentration -> ${waterWeight.toFixed(4)}g`);
        }
        break;
      }
    }
  }

  const preliminaryLyeWeight = recipe.lyeSettings.alkaliType === AlkaliType.KOH ? calculatedLyeKOH : calculatedLyeNaOH;
  const preliminaryLyeConcentration = waterWeight > 0
    ? Math.round((preliminaryLyeWeight / (preliminaryLyeWeight + waterWeight)) * 10000) / 100
    : 0;
  const additiveChemistryReport = buildAdditiveChemistryReport(recipe, waterWeight, totalOilWeight, preliminaryLyeConcentration);
  const effectiveSolventWeight = additiveChemistryReport.solventImpact.requiredAddedWaterGrams + additiveChemistryReport.solventImpact.freeWaterGrams;

  // Handle rounding to 2 decimals to prevent floating point variations
  const finalNaOH = round2(calculatedLyeNaOH);
  const finalKOH = round2(calculatedLyeKOH);
  const finalWater = round2(additiveChemistryReport.solventImpact.requiredAddedWaterGrams);
  const finalTotalOils = round2(totalOilWeight);

  // Saturated vs Unsaturated fatty acid sums
  const pctLauric = totalOilWeight > 0 ? (sumLauric / totalOilWeight) : 0;
  const pctMyristic = totalOilWeight > 0 ? (sumMyristic / totalOilWeight) : 0;
  const pctPalmitic = totalOilWeight > 0 ? (sumPalmitic / totalOilWeight) : 0;
  const pctStearic = totalOilWeight > 0 ? (sumStearic / totalOilWeight) : 0;
  const pctRicinoleic = totalOilWeight > 0 ? (sumRicinoleic / totalOilWeight) : 0;
  const pctOleic = totalOilWeight > 0 ? (sumOleic / totalOilWeight) : 0;
  const pctLinoleic = totalOilWeight > 0 ? (sumLinoleic / totalOilWeight) : 0;
  const pctLinolenic = totalOilWeight > 0 ? (sumLinolenic / totalOilWeight) : 0;

  // Quality Prediction calculations based on soap formulation rules:
  // Hardness = Lauric + Myristic + Palmitic + Stearic
  const hardnessVal = pctLauric + pctMyristic + pctPalmitic + pctStearic;
  // Cleansing = Lauric + Myristic
  const cleansingVal = pctLauric + pctMyristic;
  // Conditioning = Oleic + Linoleic + Linolenic + Ricinoleic
  const conditioningVal = pctOleic + pctLinoleic + pctLinolenic + pctRicinoleic;
  // Bubbly = Lauric + Myristic + Ricinoleic
  const bubblyVal = pctLauric + pctMyristic + pctRicinoleic;
  // Creamy = Palmitic + Stearic
  const creamyVal = pctPalmitic + pctStearic;
  // Longevity = Palmitic + Stearic + Hardness factors
  const longevityVal = pctPalmitic + pctStearic + (hardnessVal * 0.1);

  // Speed Risk (saturated fats, high speed trace)
  const traceSpeedVal = (pctPalmitic + pctStearic + pctLauric + pctMyristic) * 0.8;

  const fattyAcidProfile: FattyAcidProfile = {
    lauric: Math.round(pctLauric * 10) / 10,
    myristic: Math.round(pctMyristic * 10) / 10,
    palmitic: Math.round(pctPalmitic * 10) / 10,
    stearic: Math.round(pctStearic * 10) / 10,
    ricinoleic: Math.round(pctRicinoleic * 10) / 10,
    oleic: Math.round(pctOleic * 10) / 10,
    linoleic: Math.round(pctLinoleic * 10) / 10,
    linolenic: Math.round(pctLinolenic * 10) / 10,
    saturated: Math.round((pctLauric + pctMyristic + pctPalmitic + pctStearic) * 10) / 10,
    unsaturated: Math.round((pctOleic + pctLinoleic + pctLinolenic + pctRicinoleic) * 10) / 10,
  };

  const qualityPrediction: QualityPrediction = {
    hardness: classifyMetric(hardnessVal, METRIC_SPECS.hardness),
    cleansing: classifyMetric(cleansingVal, METRIC_SPECS.cleansing),
    conditioning: classifyMetric(conditioningVal, METRIC_SPECS.conditioning),
    bubblyLather: classifyMetric(bubblyVal, METRIC_SPECS.bubblyLather),
    creamyLather: classifyMetric(creamyVal, METRIC_SPECS.creamyLather),
    longevity: classifyMetric(longevityVal, METRIC_SPECS.longevity),
    traceSpeedRisk: classifyMetric(traceSpeedVal, METRIC_SPECS.traceSpeedRisk),
    fattyAcidProfile,
    notes: []
  };

  // Add notes based on properties
  if (cleansingVal > METRIC_SPECS.cleansing.idealMax) {
    qualityPrediction.notes.push("Cleansing runs above the ideal band. This bar may feel drying on normal skin — raise the superfat or add more olive/conditioning oils.");
  }
  if (conditioningVal < METRIC_SPECS.conditioning.idealMin) {
    qualityPrediction.notes.push("Conditioning sits below the ideal band. The bar is solid but less moisturising — fold in soft oils like avocado or sweet almond.");
  }
  if (bubblyVal >= 30) {
    qualityPrediction.notes.push("Expect big, fluffy bubbles and strong immediate foam from the coconut and castor content.");
  }
  if (traceSpeedVal > METRIC_SPECS.traceSpeedRisk.idealMax) {
    qualityPrediction.notes.push("Trace will move fast: heavy saturated butter/palm/coconut content thickens batter quickly. Work briskly and keep temperatures cool.");
  }

  // Liquid handling — the water setting (concentration / ratio / manual) is
  // authoritative and computes the total solvent weight (`finalWater`). The
  // liquid rows choose WHICH liquid(s) and in what proportion; we scale them so
  // the solvent adds up to the computed target. This keeps the concentration /
  // ratio controls live instead of being silently overridden by row weights.
  const totalLiquidWeight = finalWater;
  const rawLiquidSum = recipe.liquids.reduce((acc, l) => acc + Math.max(0, l.weightGrams), 0);
  const liquidScale = rawLiquidSum > 0 ? finalWater / rawLiquidSum : 0;

  const liquidBreakdown = recipe.liquids
    .filter((l) => l.weightGrams > 0)
    .map((liq) => {
      const ing = INGREDIENT_CATALOG.find((i) => i.id === liq.ingredientId);
      const equiv = ing?.waterEquivalentRatio ?? 1.0;
      const effectiveWeight = Math.round(liq.weightGrams * liquidScale * 100) / 100;
      return {
        ingredientId: liq.ingredientId,
        name: ing?.name || "Liquid",
        weight: effectiveWeight,
        actualLiquidValue: Math.round(effectiveWeight * equiv * 100) / 100
      };
    });

  const calculatedLyeWeight = recipe.lyeSettings.alkaliType === AlkaliType.KOH ? finalKOH : finalNaOH;
  const calculatedLyeConcentrationPercent = effectiveSolventWeight > 0 
    ? Math.round((calculatedLyeWeight / (calculatedLyeWeight + effectiveSolventWeight)) * 10000) / 100
    : 0;
  const calculatedWaterToLyeRatio = calculatedLyeWeight > 0 
    ? Math.round((effectiveSolventWeight / calculatedLyeWeight) * 100) / 100
    : 0;

  const additiveBreakdown = recipe.additives
    .filter((a) => a.weightGrams > 0)
    .map((add) => {
      const ing = INGREDIENT_CATALOG.find((i) => i.id === add.ingredientId);
      const def = getAdditiveDefinition(add.ingredientId);
      return {
        ingredientId: add.ingredientId,
        name: def?.name || ing?.name || "Additive",
        weight: add.weightGrams
      };
    });

  const finalLyeNaOH = finalNaOH;
  const finalLyeKOH = finalKOH;
  const additiveMass = additiveBreakdown.reduce((sum, item) => sum + item.weight, 0);

  const finalTotalBatchWeight = round2(finalTotalOils + totalLiquidWeight + additiveMass + (recipe.lyeSettings.alkaliType === AlkaliType.KOH ? finalLyeKOH : finalLyeNaOH));

  // Oil breakdown percentages
  const oilBreakdown = recipe.oils
    .filter((o) => o.weightGrams > 0)
    .map((oil) => {
      const ing = INGREDIENT_CATALOG.find((i) => i.id === oil.ingredientId);
      return {
        ingredientId: oil.ingredientId,
        name: ing?.name || "Oil",
        weight: oil.weightGrams,
        percent: finalTotalOils > 0 ? Math.round((oil.weightGrams / finalTotalOils) * 1000) / 10 : 0
      };
    });

  // Calculate safety warnings & block validation rules
  const warnings: SafetyWarning[] = [];
  let status: RecipeDraft["status"] = "ready";

  // Check static/dynamic rules
  // Rule 1: NaOH Danger
  if (recipe.lyeSettings.alkaliType === AlkaliType.NaOH || recipe.lyeSettings.alkaliType === AlkaliType.MIXED) {
    const naohRule = CHEMICAL_SAFETY_RULES.find((r) => r.id === "naoh-caustic");
    if (naohRule) {
      warnings.push({
        id: naohRule.id,
        severity: SafetySeverity.DANGER,
        message: naohRule.message,
        sourceRefs: naohRule.sourceRefs
      });
    }
  }

  // Rule 2: KOH Danger
  if (recipe.lyeSettings.alkaliType === AlkaliType.KOH || recipe.lyeSettings.alkaliType === AlkaliType.MIXED) {
    const kohRule = CHEMICAL_SAFETY_RULES.find((r) => r.id === "koh-caustic");
    if (kohRule) {
      warnings.push({
        id: kohRule.id,
        severity: SafetySeverity.DANGER,
        message: kohRule.message,
        sourceRefs: kohRule.sourceRefs
      });
    }
  }

  // Rule 3: Coconut Harshness
  const coconutOil = recipe.oils.find((o) => o.ingredientId === "coconut_oil");
  if (coconutOil && finalTotalOils > 0 && (coconutOil.weightGrams / finalTotalOils) > 0.3) {
    const harshRule = CHEMICAL_SAFETY_RULES.find((r) => r.id === "high-coconut-harshness");
    if (harshRule) {
      warnings.push({
        id: harshRule.id,
        severity: SafetySeverity.WARNING,
        message: harshRule.message,
        sourceRefs: harshRule.sourceRefs
      });
    }
  }

  // Rule 4: Beer Volcano Danger
  const hasBeer = recipe.liquids.some((l) => l.ingredientId === "beer" && l.weightGrams > 0);
  if (hasBeer) {
    const beerRule = CHEMICAL_SAFETY_RULES.find((r) => r.id === "beer-volcano-hazard");
    if (beerRule) {
      warnings.push({
        id: beerRule.id,
        severity: SafetySeverity.DANGER,
        message: beerRule.message,
        sourceRefs: beerRule.sourceRefs
      });
    }
  }

  // Rule 5: Citric Acid Saponification Deficit Warning
  if (additiveChemistryReport.alkaliCompensation.details.some((item) => item.additiveId === "citric_acid")) {
    const citricRule = CHEMICAL_SAFETY_RULES.find((r) => r.id === "citric-acid-neutralization");
    if (citricRule) {
      warnings.push({
        id: citricRule.id,
        severity: SafetySeverity.WARNING,
        message: citricRule.message,
        sourceRefs: citricRule.sourceRefs
      });
    }
  }

  // Rule 6: Animal-fat provenance — review gate + labeling advisory (soap-tallows PDR)
  const usedOilIngredients = recipe.oils
    .filter((o) => o.weightGrams > 0)
    .map((o) => INGREDIENT_CATALOG.find((i) => i.id === o.ingredientId))
    .filter((i): i is Ingredient => Boolean(i));

  for (const ing of usedOilIngredients) {
    if (ing.reviewRequired) {
      warnings.push({
        id: `oil-review-required-${ing.id}`,
        severity: SafetySeverity.BLOCKED,
        message: `${ing.name} is review-required: it has no verified saponification/fatty-acid data in the catalog yet. Add measured constants with a source before compiling a recipe that uses it — the engine will not guess its SAP value.`,
        sourceRefs: []
      });
    }
  }

  const animalOils = usedOilIngredients.filter((i) => (i.dietaryEthicFlags || []).includes("animal_product"));
  if (animalOils.length > 0) {
    const religious = animalOils.some((i) => (i.dietaryEthicFlags || []).includes("religious_sensitivity"));
    warnings.push({
      id: "animal-derived-fat-labeling",
      severity: SafetySeverity.INFO,
      message: `This recipe contains animal-derived fat (${animalOils.map((i) => i.name).join(", ")}). It is not vegan; label clearly if sharing or selling${religious ? ", and note it may carry a religious dietary sensitivity (e.g. pork)" : ""}.`,
      sourceRefs: []
    });
  }

  const additiveNotices = [
    ...additiveChemistryReport.hazards,
    ...additiveChemistryReport.unknownInteractions,
  ];
  for (const reportNotice of additiveNotices) {
    warnings.push({
      id: `additive-${reportNotice.id}`,
      severity: reportNotice.severity,
      message: reportNotice.message,
      sourceRefs: reportNotice.sourceRefs
    });
  }

  // Water replacements & sugars scorch warning
  const sugarLiquids = recipe.liquids.filter((l) => {
    const ing = INGREDIENT_CATALOG.find((i) => i.id === l.ingredientId);
    return l.weightGrams > 0 && ing?.sugarRisk && ing.sugarRisk !== "none";
  });
  if (sugarLiquids.length > 0) {
    warnings.push({
      id: "sugars-heating-warning",
      severity: SafetySeverity.WARNING,
      message: `SCORCHING & HEAT RISK: Sourced liquids contain natural lactose or sugars (${sugarLiquids.map(l => INGREDIENT_CATALOG.find(i => i.id === l.ingredientId)?.name).join(", ")}). This speeds up reaction heating and causes scorched amber discoloration. Keep recipe temperatures cool and chill liquids fully.`,
      sourceRefs: [{ label: "FDA Cosmetic Soap Guidelines", url: "https://www.fda.gov/cosmetics" }]
    });
  }

  // Extreme lye concentrations blocking validators
  if (calculatedLyeConcentrationPercent > 45) {
    warnings.push({
      id: "excessive-concentration-blocked",
      severity: SafetySeverity.BLOCKED,
      message: `CRITICAL BLOCK: Lye concentration is too high (${calculatedLyeConcentrationPercent.toFixed(1)}%). Saturated sodium hydroxide solutions freeze-crystallize out of water at concentrations above 40-45%, which makes standard soap making impossible. Lower the concentration parameter.`,
      sourceRefs: [{ label: "PubChem Liquid Saturation Levels", url: "https://pubchem.ncbi.nlm.nih.gov" }]
    });
    status = "blocked";
  }

  if (calculatedLyeConcentrationPercent < 15) {
    warnings.push({
      id: "too-low-concentration-blocked",
      severity: SafetySeverity.BLOCKED,
      message: `CRITICAL BLOCK: Lye concentration is too low (${calculatedLyeConcentrationPercent.toFixed(1)}%). The excessive water volume prevents saponification, causes extreme warping, soft mush, and prevents unmolding. Increase lye concentration (standard range is 25-33%).`,
      sourceRefs: [{ label: "NIOSH Physical Saponification", url: "https://www.cdc.gov/niosh" }]
    });
    status = "blocked";
  }

  // Superfat boundaries
  if (recipe.lyeSettings.superfatPercent < 0) {
    warnings.push({
      id: "negative-superfat-blocked",
      severity: SafetySeverity.BLOCKED,
      message: "CRITICAL BLOCK: Negative superfat specified. This forces excess caustic unreacted lye to remain in the finished bars, causing severe skin burns.",
      sourceRefs: [{ label: "NIOSH Caustic Sinks Guidelines", url: "https://www.cdc.gov/niosh" }]
    });
    status = "blocked";
  } else if (recipe.lyeSettings.superfatPercent > 25) {
    warnings.push({
      id: "excessive-superfat-warning",
      severity: SafetySeverity.WARNING,
      message: `High Superfat Warning (${recipe.lyeSettings.superfatPercent}%): Soap will contain massive unreacted free fatty acids. It might fail to harden, spoil rapidly (dreaded orange spots), or lather poorly.`,
      sourceRefs: [{ label: "Saponification Preservation Guidelines", url: "https://pubchem.ncbi.nlm.nih.gov" }]
    });
    if (status !== "blocked") status = "warning";
  }

  if (finalTotalOils <= 0) {
    warnings.push({
      id: "zero-oil-blocked",
      severity: SafetySeverity.BLOCKED,
      message: "CRITICAL BLOCK: Total Oil weight must be greater than 0.",
      sourceRefs: []
    });
    status = "blocked";
  }

  // Determine safety status
  if (warnings.some((w) => w.severity === SafetySeverity.BLOCKED)) {
    status = "blocked";
  } else if (warnings.some((w) => w.severity === SafetySeverity.DANGER)) {
    status = "warning";
  } else if (warnings.some((w) => w.severity === SafetySeverity.WARNING)) {
    status = "warning";
  }

  // Hash the formulation independent of ingredient entry order, so the same
  // recipe always yields the same integrity fingerprint.
  const byId = (a: { ingredientId: string }, b: { ingredientId: string }) =>
    a.ingredientId.localeCompare(b.ingredientId);
  const recipeHash = generateFormulationHash({
    compilerVersion: COMPILER_VERSION,
    catalogVersion: CATALOG_VERSION,
    recipeDraft: {
      lyeSettings: recipe.lyeSettings,
      oils: [...recipe.oils].filter((o) => o.weightGrams > 0).sort(byId),
      liquids: [...recipe.liquids].filter((l) => l.weightGrams > 0).sort(byId),
      additives: [...recipe.additives].filter((a) => a.weightGrams > 0).sort(byId)
    }
  });

  return {
    recipeHash,
    compilerVersion: COMPILER_VERSION,
    catalogVersion: CATALOG_VERSION,
    totalOilWeight: finalTotalOils,
    totalLiquidWeight: Math.round(totalLiquidWeight * 100) / 100,
    totalBatchWeight: finalTotalBatchWeight,
    lyeNaOHWeight: finalLyeNaOH,
    lyeKOHWeight: finalLyeKOH,
    waterWeight: finalWater,
    calculatedLyeConcentrationPercent,
    calculatedWaterToLyeRatio,
    oilBreakdown,
    liquidBreakdown,
    additiveBreakdown,
    additiveChemistryReport,
    qualityPrediction,
    safetyReport: {
      status,
      warnings
    },
    compilerTrace
  };
}

// 5. Opt-In Recommendation Engine
export function generateRecommendations(
  result: CompiledFormulaResult,
  inventory: InventoryItem[]
): IngredientRecommendation[] {
  const recommendations: IngredientRecommendation[] = [];

  const hardness = result.qualityPrediction.hardness.score;
  const cleansing = result.qualityPrediction.cleansing.score;
  const conditioning = result.qualityPrediction.conditioning.score;
  const bubbly = result.qualityPrediction.bubblyLather.score;

  // Recommendation 1: Hardness too low
  if (hardness < 29) {
    // Check if cocoa butter or shea butter is in inventory
    const hasCocoa = inventory.some((i) => i.ingredientId === "cocoa_butter" && i.quantity > 50);
    const hasShea = inventory.some((i) => i.ingredientId === "shea_butter" && i.quantity > 50);
    const hasPalm = inventory.some((i) => i.ingredientId === "palm_oil" && i.quantity > 50);

    if (hasCocoa) {
      recommendations.push({
        id: "rec-hardness-cocoa",
        ingredientId: "cocoa_butter",
        recommendationType: RecommendationType.ADD,
        reason: `Your recipe hardness is low (${hardness}/100). You have Cocoa Butter in your inventory. Adding 10-15% Cocoa Butter will boost hardness, solidify bar structure faster, and improve longevity.`,
        expectedEffect: ["Increase Hardness", "Increase Longevity"],
        riskNotes: ["Speeds up trace slightly"],
        confidence: 0.95,
        requiresUserConfirmation: true
      });
    } else if (hasShea) {
      recommendations.push({
        id: "rec-hardness-shea",
        ingredientId: "shea_butter",
        recommendationType: RecommendationType.ADD,
        reason: `Your hardness index is low (${hardness}/100). Incorporating Shea Butter (available in stock) improves solidity and conditioning.`,
        expectedEffect: ["Boost Hardness", "Improve skin conditioning"],
        riskNotes: ["Increases trace speeds slightly"],
        confidence: 0.85,
        requiresUserConfirmation: true
      });
    } else if (hasPalm) {
      recommendations.push({
        id: "rec-hardness-palm",
        ingredientId: "palm_oil",
        recommendationType: RecommendationType.ADD,
        reason: "Boost hardness index and bar longevity by incorporating 15% Palm Oil from your available stock.",
        expectedEffect: ["Boost solidity", "Extend bar lifespan in shower"],
        riskNotes: ["Speeds trace"],
        confidence: 0.80,
        requiresUserConfirmation: true
      });
    }
  }

  // Recommendation 2: Cleansing is extreme (harsh)
  if (cleansing > 22) {
    const oliveInRecipe = result.oilBreakdown.find((o) => o.ingredientId === "olive_oil");
    const coconutInRecipe = result.oilBreakdown.find((o) => o.ingredientId === "coconut_oil");
    
    if (coconutInRecipe && coconutInRecipe.percent > 30) {
      recommendations.push({
        id: "rec-harsh-reduce-coconut",
        ingredientId: "coconut_oil",
        recommendationType: RecommendationType.REDUCE,
        reason: `Extreme cleansing value (${cleansing}/100) due to high Coconut Oil weight (${coconutInRecipe.percent}%). This can strip skin oils. Reducing Coconut Oil to 15-20% and substituting with Olive Oil or Shea Butter will create a far milder, highly balanced cosmetic soap.`,
        expectedEffect: ["Improve mildness", "Increase skin hydration"],
        riskNotes: ["Reduces bubbly lather foam slightly", "Slows down saponification trace speeds"],
        confidence: 0.90,
        requiresUserConfirmation: true
      });
    }
  }

  // Recommendation 3: Bubbly lather is too low
  if (bubbly < 14) {
    const hasCastor = inventory.some((i) => i.ingredientId === "castor_oil" && i.quantity > 50);
    const hasSugar = inventory.some((i) => i.ingredientId === "sugar" && i.quantity > 20);

    if (hasCastor) {
      recommendations.push({
        id: "rec-lather-castor",
        ingredientId: "castor_oil",
        recommendationType: RecommendationType.ADD,
        reason: "Your bubbly lather index is low. Adding 5% Castor Oil (available in stock) acts as a highly effective bubble stabilizer, expanding fluffiness and foam duration.",
        expectedEffect: ["Expand lather bubbles", "Provide creaminess"],
        riskNotes: ["Castor can make bar stickier if added above 8-10%"],
        confidence: 0.95,
        requiresUserConfirmation: true
      });
    } else if (hasSugar) {
      recommendations.push({
        id: "rec-lather-sugar",
        ingredientId: "sugar",
        recommendationType: RecommendationType.ADD,
        reason: "Bubbly lather is low. Dissolving 1-2 teaspoons of Granulated Sugar in your water before adding lye acts as an excellent, natural, low-cost lather booster.",
        expectedEffect: ["Increase lather bubble size"],
        riskNotes: ["Accelerates heating. Keep batch cool to prevent scorched discoloring"],
        confidence: 0.85,
        requiresUserConfirmation: true
      });
    }
  }

  return recommendations;
}
