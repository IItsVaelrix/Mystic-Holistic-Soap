/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum AlkaliType {
  NaOH = "NaOH",
  KOH = "KOH",
  MIXED = "mixed"
}

export enum MoldShape {
  RECTANGULAR = "rectangular",
  CYLINDER = "cylinder",
  CAVITY = "cavity",
  CUSTOM = "custom"
}

export enum SafetySeverity {
  INFO = "info",
  WARNING = "warning",
  DANGER = "danger",
  BLOCKED = "blocked"
}

export enum RecommendationType {
  ADD = "add",
  REDUCE = "reduce",
  SUBSTITUTE = "substitute",
  AVOID = "avoid",
  BUY = "buy",
  ADJUST_PROCESS = "adjust_process"
}

export type AdditiveRole =
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

export type AdditiveCategory =
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

export type AdditivePhysicalForm =
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

export type AdditiveDefaultPhase =
  | "lye_solution"
  | "oils_before_lye"
  | "light_trace"
  | "medium_trace"
  | "hot_process_after_cook"
  | "cool_down"
  | "melt_and_pour"
  | "liquid_soap_dilution"
  | "top_decoration";

export type TemperatureRequirement =
  | "frozen"
  | "chilled"
  | "room_temp"
  | "warm"
  | "hot"
  | "post_cook_cooldown"
  | "supplier_specific";

export type ProcessPhase =
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

export type PreparedState =
  | "raw"
  | "chilled"
  | "frozen"
  | "boiled_flat"
  | "decarbonated"
  | "de_alcoholized"
  | "dispersed_in_oil"
  | "dissolved_in_water"
  | "supplier_verified";

export type SourceConfidence =
  | "measured"
  | "supplier_sds"
  | "supplier_usage_sheet"
  | "published_reference"
  | "community_average"
  | "unknown";

export interface SafetySourceRef {
  label: string;
  url?: string;
  confidence?: SourceConfidence;
}

export interface AdditiveDefinition {
  id: string;
  name: string;
  category: AdditiveCategory;
  physicalForm: AdditivePhysicalForm;
  roles: AdditiveRole[];
  waterFraction: number;
  waterAvailabilityCoefficient?: number;
  sugarFraction?: number;
  lipidFraction?: number;
  proteinFraction?: number;
  saltFraction?: number;
  insolubleSolidsFraction?: number;
  sapNaOH?: number;
  sapKOH?: number;
  consumesNaOHPerGram?: number;
  consumesKOHPerGram?: number;
  pHImpact?: "acidic" | "basic" | "neutral" | "buffering" | "unknown";
  defaultPhase: AdditiveDefaultPhase;
  processPhase: ProcessPhase;
  temperatureRequirement: TemperatureRequirement;
  minSafeTempC?: number;
  maxSafeTempC?: number;
  defaultUsageRatePpo?: number;
  maxUsageRatePpo?: number;
  defaultUsagePercentOfOils?: number;
  maxUsagePercentOfOils?: number;
  hazardTags: string[];
  interactionTags: string[];
  sourceRefs: SafetySourceRef[];
  reviewRequired: boolean;
  cosmeticGradeRequired?: boolean;
  supplierUsageRequired?: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  type: "oil" | "liquid" | "additive";
  tags: string[];
  sapNaOH: number; // Saponification value for NaOH (g NaOH per g oil)
  sapKOH: number;  // Saponification value for KOH (g KOH per g oil)
  
  // Fatty acid profile (for oils, adds up to ~100)
  lauric?: number;
  myristic?: number;
  palmitic?: number;
  stearic?: number;
  ricinoleic?: number;
  oleic?: number;
  linoleic?: number;
  linolenic?: number;

  // Liquid characteristics
  waterEquivalentRatio?: number; // how much of it counts as water (e.g., milk is 0.9, distilled water is 1.0)
  sugarRisk?: "none" | "low" | "medium" | "high";
  acidRisk?: "none" | "low" | "medium" | "high";
  heatRisk?: "none" | "low" | "medium" | "high";
  defaultHandlingWarning?: string;
  
  // Additive characteristics
  timing?: string; // e.g., "At trace", "Mix with lye", "Add to oils"
  chemicallyReactive?: boolean;
}

export interface RecipeOilItem {
  ingredientId: string;
  weightGrams: number;
}

export interface RecipeLiquidItem {
  ingredientId: string;
  weightGrams: number;
}

export interface RecipeAdditiveItem {
  ingredientId: string;
  weightGrams: number;
  processPhase?: ProcessPhase;
  preparedStates?: PreparedState[];
  supplierUsageVerified?: boolean;
  cosmeticGradeVerified?: boolean;
  maxUsagePercentOfOils?: number;
}

export interface LyeSettings {
  alkaliType: AlkaliType;
  superfatPercent: number;    // e.g. 5 for 5% superfat / lye discount
  lyeConcentrationPercent?: number; // e.g. 33 for 33% lye concentration
  waterToLyeRatio?: number;         // e.g. 2 for 2:1 water-to-lye
  manualWaterGrams?: number;        // manual override
  kohPurityPercent?: number;        // e.g. 90 for 90% pure KOH (usually 90%)
  naohRatio?: number;               // for mixed alkali (e.g. 0.8 for 80/20)
}

export interface MoldProfile {
  id: string;
  name: string;
  shape: MoldShape;
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    radius?: number;
    cavities?: number;
    cavityVolumeMl?: number;
    customVolumeMl?: number;
  };
  unit: "cm"; // metric only — lengths in cm, volumes in ml
  fillPercent: number; // e.g., 100
  estimatedBatchWeightGrams: number;
}

export interface RecipeDraft {
  id?: string;
  name: string;
  status: "draft" | "compiled" | "warning" | "blocked" | "ready" | "archived";
  favorite: boolean;
  notes?: string;
  lyeSettings: LyeSettings;
  oils: RecipeOilItem[];
  liquids: RecipeLiquidItem[];
  additives: RecipeAdditiveItem[];
  moldProfile?: MoldProfile;
  createdAt?: string;
  updatedAt?: string;
}

// Bytecode opcodes for our chemistry formulation Virtual Machine
export type SoapOpcode =
  | { op: "LOAD_OIL"; ingredientId: string; grams: number }
  | { op: "LOAD_SAP"; ingredientId: string; alkali: "NaOH" | "KOH" }
  | { op: "MUL_OIL_SAP"; target: string }
  | { op: "SUM_LYE" }
  | { op: "APPLY_SUPERFAT"; percent: number }
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
  | { op: "EMIT_ADDITIVE_REPORT" }
  | { op: "APPLY_KOH_PURITY"; purityPercent: number }
  | { op: "CALC_WATER"; lyeConcentration?: number; waterToLyeRatio?: number; manualWater?: number }
  | { op: "CALC_QUALITY" }
  | { op: "EMIT_RESULT" };

// A metric reading, classified against its own ideal band.
// `status` says where the value sits; `concern` says whether that position
// is actually a problem for THIS metric (being above ideal is fine for
// conditioning but a real issue for cleansing). The UI colours from these two
// fields, so an in-band value can never render as a warning.
export interface ScoreBand {
  score: number;                          // 0-100
  status: "below" | "on-target" | "above";
  concern: boolean;                       // true when this position warrants attention
  idealMin: number;
  idealMax: number;
}

export type MetricKey =
  | "hardness"
  | "cleansing"
  | "conditioning"
  | "bubblyLather"
  | "creamyLather"
  | "longevity"
  | "traceSpeedRisk";

export interface QualityPrediction {
  hardness: ScoreBand;      // Saturated fatty acids (Lauric, Myristic, Palmitic, Stearic)
  cleansing: ScoreBand;     // Lauric, Myristic
  conditioning: ScoreBand;  // Oleic, Linoleic, Linolenic, Ricinoleic
  bubblyLather: ScoreBand;  // Lauric, Myristic, Ricinoleic (castor)
  creamyLather: ScoreBand;  // Palmitic, Stearic
  longevity: ScoreBand;     // Palmitic, Stearic (helps longevity) + hardness
  traceSpeedRisk: ScoreBand;// Saturated fats/butters trace faster, certain additives too
  fattyAcidProfile: FattyAcidProfile;
  notes: string[];
}

// Recipe-wide fatty-acid makeup, weighted by oil mass (percent of total oils).
export interface FattyAcidProfile {
  lauric: number;
  myristic: number;
  palmitic: number;
  stearic: number;
  ricinoleic: number;
  oleic: number;
  linoleic: number;
  linolenic: number;
  saturated: number;    // lauric + myristic + palmitic + stearic
  unsaturated: number;  // oleic + linoleic + linolenic + ricinoleic
}

export interface SafetyWarning {
  id: string;
  severity: SafetySeverity;
  message: string;
  sourceRefs: { label: string; url?: string }[];
}

export interface AdditiveLedgerEntry {
  additiveId: string;
  name: string;
  grams: number;
  roles: AdditiveRole[];
  source: "additive" | "liquid";
}

export interface AdditiveReportNotice {
  id: string;
  severity: SafetySeverity;
  additiveIds: string[];
  message: string;
  sourceRefs: SafetySourceRef[];
}

export interface AdditiveHandlingRequirement {
  additiveId: string;
  name: string;
  processPhase: ProcessPhase;
  temperatureRequirement: TemperatureRequirement;
  preparedStates: PreparedState[];
  missingPreparedStates: PreparedState[];
  message: string;
}

export interface AdditiveReviewItem {
  additiveId: string;
  name: string;
  reviewRequired: boolean;
  reason: string;
}

export interface AdditiveChemistryReport {
  ledger: AdditiveLedgerEntry[];
  solventImpact: {
    requiredSolventGrams: number;
    freeWaterGrams: number;
    requiredAddedWaterGrams: number;
    excessFreeWaterGrams: number;
  };
  alkaliCompensation: {
    naohGrams: number;
    kohGrams: number;
    details: { additiveId: string; name: string; naohGrams: number; kohGrams: number }[];
  };
  lipidContribution: {
    oilEquivalentGrams: number;
    naohGrams: number;
    kohGrams: number;
    details: { additiveId: string; name: string; grams: number; naohGrams: number; kohGrams: number }[];
  };
  solidsLoad: {
    insolubleSolidsGrams: number;
    percentOfOils: number;
    abrasivePercentOfOils: number;
  };
  sugarProteinHeatRisk: {
    sugarGrams: number;
    proteinGrams: number;
    sugarPercentOfOils: number;
    proteinPercentOfOils: number;
    heatRiskScore: number;
  };
  saltChelation: {
    saltGrams: number;
    saltPercentOfOils: number;
    chelatorGrams: number;
    notes: string[];
  };
  fragrancePigmentReview: AdditiveReviewItem[];
  synergies: AdditiveReportNotice[];
  hazards: AdditiveReportNotice[];
  unknownInteractions: AdditiveReportNotice[];
  handlingRequirements: AdditiveHandlingRequirement[];
}

export interface CompiledFormulaResult {
  id?: string;
  recipeId?: string;
  recipeHash: string;
  compilerVersion: string;
  catalogVersion: string;
  
  // Exact compiled weights
  totalOilWeight: number;
  totalLiquidWeight: number;
  totalBatchWeight: number;
  
  lyeNaOHWeight: number;
  lyeKOHWeight: number;
  waterWeight: number;
  
  calculatedLyeConcentrationPercent: number;
  calculatedWaterToLyeRatio: number;
  
  oilBreakdown: { ingredientId: string; name: string; weight: number; percent: number }[];
  liquidBreakdown: { ingredientId: string; name: string; weight: number; actualLiquidValue: number }[];
  additiveBreakdown: { ingredientId: string; name: string; weight: number }[];
  additiveChemistryReport: AdditiveChemistryReport;
  
  qualityPrediction: QualityPrediction;
  safetyReport: {
    status: RecipeDraft["status"];
    warnings: SafetyWarning[];
  };
  compilerTrace: string[]; // Logs of calculation execution
}

export interface InventoryItem {
  id: string;
  ingredientId: string;
  displayName: string;
  quantity: number;
  unit: "g" | "kg" | "oz" | "lb" | "ml" | "l";
  costCents?: number;
  expirationDate?: string;
  supplier?: string;
  lotNumber?: string;
}

export interface IngredientRecommendation {
  id: string;
  ingredientId: string;
  recommendationType: RecommendationType;
  reason: string;
  expectedEffect: string[];
  riskNotes: string[];
  confidence: number;
  requiresUserConfirmation: boolean;
}

// ── Alchemy (tutorial library) ────────────────────────────────────────────
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
  caution?: string;    // inline safety cue for this step
}

export interface AlchemyEntryBase {
  id: string;
  kind: AlchemyKind;
  title: string;
  summary: string;              // one-line plain-language hook (list view)
  difficulty: AlchemyDifficulty;
  overview: string;             // jargon-free "what & why", always visible
  steps: AlchemyStep[];
  chemistry?: string;           // collapsible deep-dive for professionals
  proTips?: string[];           // collapsible advanced pointers
  glossary?: GlossaryTerm[];    // definitions for jargon used in this entry
  safety: string[];             // hazard callouts
  sources?: SafetySourceRef[];  // reuse existing citation type
}

export interface AlchemyRecipeEntry extends AlchemyEntryBase {
  kind: "recipe";
  starterDraft: RecipeDraft;    // complete, engine-valid draft (powers "Load into Formulator")
}

export interface AlchemyTechniqueEntry extends AlchemyEntryBase {
  kind: "technique";
  appliesTo?: string[];         // ids of related recipe entries
}

export type AlchemyEntry = AlchemyRecipeEntry | AlchemyTechniqueEntry;

// Honest server-side activity log — records real API events (compiles, saves,
// deletes) so the workshop has an auditable trail. No fabricated "threats".
export interface ActivityEvent {
  id: string;
  timestamp: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  action: string;        // plain-language summary, e.g. "Compiled formula"
  status: number;        // HTTP status code
  fingerprint: string;   // deterministic (non-crypto) fingerprint of the payload
  kind: "compile" | "recipe" | "inventory" | "mold" | "advisor" | "other";
}
