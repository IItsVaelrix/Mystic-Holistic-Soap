/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AdditiveCategory,
  AdditiveDefinition,
  AdditivePhysicalForm,
  AdditiveRole,
  ProcessPhase,
  SafetySourceRef,
  TemperatureRequirement,
} from "../types";

const GENERIC_REFS: SafetySourceRef[] = [
  { label: "PDR additive chemistry compiler V1", confidence: "published_reference" },
];

const SUPPLIER_REF: SafetySourceRef[] = [
  { label: "Supplier SDS/IFRA/usage sheet required", confidence: "supplier_usage_sheet" },
];

type AdditiveInput = {
  category: AdditiveCategory;
  physicalForm: AdditivePhysicalForm;
  roles: AdditiveRole[];
  waterFraction?: number;
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
  pHImpact?: AdditiveDefinition["pHImpact"];
  processPhase?: ProcessPhase;
  temperatureRequirement?: TemperatureRequirement;
  maxUsageRatePpo?: number;
  maxUsagePercentOfOils?: number;
  hazardTags?: string[];
  interactionTags?: string[];
  sourceRefs?: SafetySourceRef[];
  reviewRequired?: boolean;
  cosmeticGradeRequired?: boolean;
  supplierUsageRequired?: boolean;
};

function phaseFromRoles(roles: AdditiveRole[]): ProcessPhase {
  if (roles.includes("wax") || roles.includes("lipid")) return "melted_oils";
  if (roles.includes("fragrance")) return "light_trace";
  if (roles.includes("pigment") || roles.includes("clay_absorbent")) return "light_trace";
  if (roles.includes("alcoholic") || roles.includes("carbonated")) return "frozen_liquid_before_lye";
  if (roles.includes("protein") || roles.includes("sugar")) return "cold_liquid_before_lye";
  if (roles.includes("liquid_soap_only")) return "liquid_soap_dilution";
  return "light_trace";
}

function tempFromPhase(phase: ProcessPhase): TemperatureRequirement {
  if (phase === "frozen_liquid_before_lye") return "frozen";
  if (phase === "cold_liquid_before_lye" || phase === "lye_solution_cooled") return "chilled";
  if (phase === "lye_solution_hot") return "hot";
  if (phase === "melted_oils") return "warm";
  if (phase === "hot_process_after_cook") return "post_cook_cooldown";
  return "room_temp";
}

function defaultPhaseFromProcess(phase: ProcessPhase): AdditiveDefinition["defaultPhase"] {
  if (phase === "lye_solution_hot" || phase === "lye_solution_cooled" || phase === "cold_liquid_before_lye" || phase === "frozen_liquid_before_lye") {
    return "lye_solution";
  }
  if (phase === "melted_oils" || phase === "room_temp_oils") return "oils_before_lye";
  if (phase === "medium_trace") return "medium_trace";
  if (phase === "hot_process_after_cook") return "hot_process_after_cook";
  if (phase === "liquid_soap_dilution") return "liquid_soap_dilution";
  if (phase === "melt_and_pour_base") return "melt_and_pour";
  if (phase === "top_decoration") return "top_decoration";
  return "light_trace";
}

function add(id: string, name: string, input: AdditiveInput): AdditiveDefinition {
  const processPhase = input.processPhase ?? phaseFromRoles(input.roles);
  return {
    id,
    name,
    category: input.category,
    physicalForm: input.physicalForm,
    roles: input.roles,
    waterFraction: input.waterFraction ?? 0,
    waterAvailabilityCoefficient: input.waterAvailabilityCoefficient ?? 1,
    sugarFraction: input.sugarFraction,
    lipidFraction: input.lipidFraction,
    proteinFraction: input.proteinFraction,
    saltFraction: input.saltFraction,
    insolubleSolidsFraction: input.insolubleSolidsFraction,
    sapNaOH: input.sapNaOH,
    sapKOH: input.sapKOH,
    consumesNaOHPerGram: input.consumesNaOHPerGram,
    consumesKOHPerGram: input.consumesKOHPerGram,
    pHImpact: input.pHImpact ?? "neutral",
    defaultPhase: defaultPhaseFromProcess(processPhase),
    processPhase,
    temperatureRequirement: input.temperatureRequirement ?? tempFromPhase(processPhase),
    maxUsageRatePpo: input.maxUsageRatePpo,
    maxUsagePercentOfOils: input.maxUsagePercentOfOils,
    hazardTags: input.hazardTags ?? [],
    interactionTags: input.interactionTags ?? [],
    sourceRefs: input.sourceRefs ?? GENERIC_REFS,
    reviewRequired: input.reviewRequired ?? false,
    cosmeticGradeRequired: input.cosmeticGradeRequired,
    supplierUsageRequired: input.supplierUsageRequired,
  };
}

const lather = (roles: AdditiveRole[], extra: Partial<AdditiveInput> = {}) => ({
  category: "lather_hardness_booster" as const,
  physicalForm: "powder" as const,
  roles,
  ...extra,
});
const milk = (id: string, name: string, water: number, extra: Partial<AdditiveInput> = {}) =>
  add(id, name, { category: "milk_protein", physicalForm: "liquid", roles: ["solvent_contributor", "sugar", "protein", "heat_accelerator"], waterFraction: water, sugarFraction: 0.05, proteinFraction: 0.035, processPhase: "frozen_liquid_before_lye", pHImpact: "neutral", ...extra });

export const ADDITIVE_CATALOG_V2: AdditiveDefinition[] = [
  add("sodium_lactate", "Sodium Lactate (60% liquid)", lather(["salt", "trace_accelerator"], { physicalForm: "liquid", waterFraction: 0.4, saltFraction: 0.6, processPhase: "lye_solution_cooled", maxUsagePercentOfOils: 3, interactionTags: ["hardener"] })),
  add("sodium_chloride", "Table Salt / Sodium Chloride", lather(["salt"], { saltFraction: 1, processPhase: "lye_solution_cooled", maxUsagePercentOfOils: 20, interactionTags: ["hardener", "lather_modifier"] })),
  add("sea_salt", "Sea Salt", lather(["salt", "abrasive"], { saltFraction: 0.95, insolubleSolidsFraction: 1, maxUsagePercentOfOils: 20, interactionTags: ["hardener", "salt_bar"] })),
  add("granulated_sugar", "Granulated Sugar", lather(["sugar", "heat_accelerator"], { sugarFraction: 1, processPhase: "cold_liquid_before_lye", maxUsagePercentOfOils: 5, interactionTags: ["lather_booster"] })),
  add("sugar", "Granulated Sugar", lather(["sugar", "heat_accelerator"], { sugarFraction: 1, processPhase: "cold_liquid_before_lye", maxUsagePercentOfOils: 5, interactionTags: ["lather_booster"] })),
  add("powdered_sugar", "Powdered Sugar", lather(["sugar", "heat_accelerator"], { sugarFraction: 0.97, insolubleSolidsFraction: 0.03, processPhase: "cold_liquid_before_lye", maxUsagePercentOfOils: 5 })),
  add("brown_sugar", "Brown Sugar", lather(["sugar", "heat_accelerator"], { sugarFraction: 0.95, processPhase: "cold_liquid_before_lye", maxUsagePercentOfOils: 5, interactionTags: ["discoloration"] })),
  add("stearic_acid", "Stearic Acid", lather(["acid", "alkali_consumer", "trace_accelerator", "lipid"], { sapNaOH: 0.141, sapKOH: 0.198, lipidFraction: 1, consumesNaOHPerGram: 0.141, consumesKOHPerGram: 0.198, pHImpact: "acidic", processPhase: "melted_oils", maxUsagePercentOfOils: 10 })),
  add("tetrasodium_edta", "Tetrasodium EDTA", lather(["salt", "chelator"], { saltFraction: 1, pHImpact: "buffering", maxUsagePercentOfOils: 0.5, interactionTags: ["chelation"], sourceRefs: SUPPLIER_REF })),
  add("disodium_edta", "Disodium EDTA", lather(["salt", "chelator"], { saltFraction: 1, pHImpact: "buffering", maxUsagePercentOfOils: 0.5, interactionTags: ["chelation"], sourceRefs: SUPPLIER_REF })),
  add("sodium_citrate", "Sodium Citrate", lather(["salt", "chelator"], { saltFraction: 1, pHImpact: "buffering", maxUsagePercentOfOils: 3, interactionTags: ["chelation"] })),
  add("citric_acid", "Citric Acid", lather(["acid", "alkali_consumer", "chelator"], { consumesNaOHPerGram: 0.624, consumesKOHPerGram: 0.875, pHImpact: "acidic", processPhase: "lye_solution_cooled", maxUsagePercentOfOils: 3, hazardTags: ["acid_alkali_exotherm"], interactionTags: ["chelation"] })),
  add("baking_soda", "Baking Soda", lather(["base", "salt", "melt_and_pour_only"], { pHImpact: "basic", saltFraction: 1, processPhase: "melt_and_pour_base", reviewRequired: true, hazardTags: ["mode_mismatch"] })),
  add("borax", "Borax", lather(["base", "salt", "liquid_soap_only"], { pHImpact: "basic", saltFraction: 1, processPhase: "liquid_soap_dilution", reviewRequired: true, hazardTags: ["mode_mismatch"] })),

  milk("fresh_goat_milk", "Fresh Goat Milk", 0.88, { physicalForm: "liquid" }),
  milk("goat_milk_powder", "Goat Milk Powder", 0.04, { physicalForm: "powder", roles: ["protein", "sugar", "water_absorber", "heat_accelerator"], insolubleSolidsFraction: 0.9, processPhase: "cold_liquid_before_lye" }),
  milk("buttermilk_powder", "Buttermilk Powder", 0.04, { physicalForm: "powder", roles: ["acid", "protein", "sugar", "water_absorber", "heat_accelerator"], pHImpact: "acidic", reviewRequired: true }),
  milk("coconut_milk", "Coconut Milk", 0.82, { lipidFraction: 0.18 }),
  milk("coconut_milk_powder", "Coconut Milk Powder", 0.04, { physicalForm: "powder", roles: ["lipid", "protein", "sugar", "water_absorber", "heat_accelerator"], lipidFraction: 0.55, insolubleSolidsFraction: 0.35 }),
  milk("cow_milk", "Cow Milk", 0.88),
  milk("yogurt", "Yogurt", 0.82, { roles: ["solvent_contributor", "acid", "sugar", "protein", "microbial_risk", "heat_accelerator"], pHImpact: "acidic", reviewRequired: true }),
  milk("kefir", "Kefir", 0.86, { roles: ["solvent_contributor", "acid", "sugar", "protein", "microbial_risk", "carbonated", "heat_accelerator"], pHImpact: "acidic", reviewRequired: true }),
  add("tussah_silk", "Tussah Silk Fibers", { category: "milk_protein", physicalForm: "fiber", roles: ["protein"], proteinFraction: 1, insolubleSolidsFraction: 1, processPhase: "lye_solution_hot", temperatureRequirement: "hot", maxUsageRatePpo: 0.2, hazardTags: ["hot_lye_only"] }),
  add("liquid_silk", "Liquid Silk", { category: "milk_protein", physicalForm: "liquid", roles: ["solvent_contributor", "protein"], waterFraction: 0.9, proteinFraction: 0.1, processPhase: "lye_solution_cooled", reviewRequired: true, sourceRefs: SUPPLIER_REF }),
  add("oat_protein", "Oat Protein", { category: "milk_protein", physicalForm: "liquid", roles: ["protein", "solvent_contributor"], waterFraction: 0.85, proteinFraction: 0.1, reviewRequired: true, sourceRefs: SUPPLIER_REF }),
  add("egg_yolks", "Egg Yolks", { category: "milk_protein", physicalForm: "paste", roles: ["lipid", "protein", "heat_accelerator", "microbial_risk"], waterFraction: 0.5, lipidFraction: 0.27, proteinFraction: 0.16, processPhase: "light_trace", temperatureRequirement: "chilled", reviewRequired: true, hazardTags: ["odor", "scramble_risk"] }),

  ...[
    ["kaolin_clay", "Kaolin Clay", "fragrance_anchor"],
    ["clay_kaolin", "Kaolin Clay", "fragrance_anchor"],
    ["bentonite_clay", "Bentonite Clay", "slip"],
    ["french_green_clay", "French Green Clay", "mineral_color"],
    ["rose_clay", "Rose Clay", "mineral_color"],
    ["moroccan_red_clay", "Moroccan Red Clay", "mineral_color"],
    ["rhassoul_clay", "Rhassoul Clay", "mineral_color"],
    ["fullers_earth", "Fuller's Earth", "strong_absorbent"],
    ["purple_brazilian_clay", "Purple Brazilian Clay", "mineral_color"],
  ].map(([id, name, tag]) =>
    add(id, name, { category: "clay_charcoal", physicalForm: "powder", roles: ["clay_absorbent", "pigment", "water_absorber", "trace_accelerator"], insolubleSolidsFraction: 1, processPhase: "light_trace", interactionTags: [tag], maxUsageRatePpo: 2 }),
  ),
  add("activated_charcoal", "Activated Charcoal", { category: "clay_charcoal", physicalForm: "powder", roles: ["pigment", "water_absorber", "fragrance_fixative"], insolubleSolidsFraction: 1, processPhase: "light_trace", interactionTags: ["scent_absorber"], maxUsageRatePpo: 1 }),
  add("dead_sea_mud", "Dead Sea Mud", { category: "clay_charcoal", physicalForm: "paste", roles: ["clay_absorbent", "salt", "solvent_contributor"], waterFraction: 0.45, saltFraction: 0.15, insolubleSolidsFraction: 0.4, processPhase: "light_trace", reviewRequired: true }),

  add("raw_honey", "Raw Honey", { category: "humectant_sweetener", physicalForm: "gel", roles: ["sugar", "humectant", "heat_accelerator"], waterFraction: 0.17, sugarFraction: 0.8, processPhase: "light_trace", temperatureRequirement: "chilled", maxUsageRatePpo: 1, interactionTags: ["honey_multiplier"] }),
  add("glycerin", "Glycerin", { category: "humectant_sweetener", physicalForm: "liquid", roles: ["humectant", "solvent_contributor", "trace_decelerator"], waterFraction: 0.05, processPhase: "light_trace", maxUsagePercentOfOils: 5 }),
  add("sorbitol", "Sorbitol", { category: "humectant_sweetener", physicalForm: "liquid", roles: ["sugar", "humectant"], waterFraction: 0.3, sugarFraction: 0.7, processPhase: "cold_liquid_before_lye", maxUsagePercentOfOils: 5 }),
  add("agave_nectar", "Agave Nectar", { category: "humectant_sweetener", physicalForm: "gel", roles: ["sugar", "humectant", "heat_accelerator"], waterFraction: 0.25, sugarFraction: 0.7, temperatureRequirement: "chilled", maxUsagePercentOfOils: 3 }),
  add("molasses", "Molasses", { category: "humectant_sweetener", physicalForm: "gel", roles: ["sugar", "humectant", "heat_accelerator"], waterFraction: 0.22, sugarFraction: 0.65, temperatureRequirement: "chilled", maxUsagePercentOfOils: 3, interactionTags: ["discoloration"] }),
  add("maple_syrup", "Maple Syrup", { category: "humectant_sweetener", physicalForm: "liquid", roles: ["sugar", "humectant", "heat_accelerator"], waterFraction: 0.33, sugarFraction: 0.66, temperatureRequirement: "chilled", maxUsagePercentOfOils: 3 }),

  ...[
    ["colloidal_oatmeal", "Colloidal Oatmeal", "powder"],
    ["ground_rolled_oats", "Ground Rolled Oats", "powder"],
    ["used_coffee_grounds", "Used Coffee Grounds", "powder"],
    ["poppy_seeds", "Poppy Seeds", "solid"],
    ["ground_pumice", "Ground Pumice", "powder"],
    ["loofah_sponge", "Loofah Sponge", "fiber"],
    ["walnut_shell_powder", "Walnut Shell Powder", "powder"],
    ["apricot_kernel_powder", "Apricot Kernel Powder", "powder"],
    ["jojoba_beads", "Jojoba Beads", "solid"],
    ["strawberry_seeds", "Strawberry Seeds", "solid"],
    ["cranberry_seeds", "Cranberry Seeds", "solid"],
    ["polenta_cornmeal", "Polenta / Cornmeal", "powder"],
    ["wheat_bran", "Wheat Bran", "fiber"],
    ["ground_rice_powder", "Ground Rice Powder", "powder"],
    ["shredded_coconut", "Shredded Coconut", "fiber"],
    ["chia_seeds", "Chia Seeds", "solid"],
  ].map(([id, name, form]) =>
    add(id, name, { category: "exfoliant_grain", physicalForm: form as AdditivePhysicalForm, roles: ["abrasive", "botanical", "water_absorber"], insolubleSolidsFraction: 1, processPhase: "medium_trace", hazardTags: ["scratch_risk"], interactionTags: ["abrasive_load"] }),
  ),

  add("aloe_vera_liquid_gel", "Aloe Vera Liquid/Gel", { category: "botanical_puree", physicalForm: "gel", roles: ["solvent_contributor", "botanical"], waterFraction: 0.96, sugarFraction: 0.01, processPhase: "cold_liquid_before_lye", temperatureRequirement: "chilled" }),
  add("aloe_juice", "Aloe Vera Juice", { category: "botanical_puree", physicalForm: "liquid", roles: ["solvent_contributor", "botanical"], waterFraction: 0.96, sugarFraction: 0.01, processPhase: "cold_liquid_before_lye", temperatureRequirement: "chilled" }),
  add("calendula_petals", "Calendula Petals", { category: "botanical_puree", physicalForm: "fiber", roles: ["botanical", "microbial_risk"], insolubleSolidsFraction: 1, processPhase: "top_decoration", hazardTags: ["browning"] }),
  add("chamomile_flowers", "Chamomile Flowers", { category: "botanical_puree", physicalForm: "fiber", roles: ["botanical", "microbial_risk"], insolubleSolidsFraction: 1, processPhase: "top_decoration", hazardTags: ["browning"] }),
  add("pumpkin_puree", "Pumpkin Puree", { category: "botanical_puree", physicalForm: "puree", roles: ["solvent_contributor", "sugar", "botanical", "microbial_risk", "heat_accelerator"], waterFraction: 0.9, sugarFraction: 0.04, insolubleSolidsFraction: 0.06, temperatureRequirement: "chilled" }),
  add("carrot_juice", "Carrot Juice", { category: "botanical_puree", physicalForm: "liquid", roles: ["solvent_contributor", "sugar", "botanical", "pigment"], waterFraction: 0.9, sugarFraction: 0.05, processPhase: "cold_liquid_before_lye", temperatureRequirement: "chilled" }),
  add("avocado_puree", "Avocado Puree", { category: "botanical_puree", physicalForm: "puree", roles: ["solvent_contributor", "lipid", "botanical", "microbial_risk"], waterFraction: 0.73, lipidFraction: 0.15, insolubleSolidsFraction: 0.12, temperatureRequirement: "chilled" }),
  add("cucumber_puree", "Cucumber Puree", { category: "botanical_puree", physicalForm: "puree", roles: ["solvent_contributor", "botanical", "microbial_risk"], waterFraction: 0.95, insolubleSolidsFraction: 0.04, temperatureRequirement: "chilled" }),
  add("banana_puree", "Banana Puree", { category: "botanical_puree", physicalForm: "puree", roles: ["solvent_contributor", "sugar", "botanical", "microbial_risk", "heat_accelerator"], waterFraction: 0.75, sugarFraction: 0.12, insolubleSolidsFraction: 0.1, temperatureRequirement: "chilled" }),
  ...[
    ["spirulina_powder", "Spirulina Powder"],
    ["turmeric_powder", "Turmeric Powder"],
    ["rosemary_leaves", "Rosemary Leaves"],
    ["peppermint_leaves", "Peppermint Leaves"],
    ["green_tea_extract_powder", "Green Tea Extract/Powder"],
    ["alkanet_root_powder", "Alkanet Root Powder"],
    ["madder_root_powder", "Madder Root Powder"],
    ["indigo_powder", "Indigo Powder"],
    ["annatto_seeds", "Annatto Seeds"],
    ["kelp_seaweed_powder", "Kelp/Seaweed Powder"],
    ["cocoa_powder", "Cocoa Powder"],
    ["paprika", "Paprika"],
  ].map(([id, name]) =>
    add(id, name, { category: "botanical_puree", physicalForm: "powder", roles: ["botanical", "pigment", "microbial_risk"], insolubleSolidsFraction: 1, processPhase: "light_trace", hazardTags: ["discoloration"], reviewRequired: id === "paprika" }),
  ),

  add("beer", "Beer", { category: "beverage", physicalForm: "liquid", roles: ["solvent_contributor", "sugar", "carbonated", "alcoholic", "heat_accelerator"], waterFraction: 0.94, sugarFraction: 0.03, pHImpact: "acidic", processPhase: "frozen_liquid_before_lye", hazardTags: ["eruption"], reviewRequired: true }),
  add("red_wine", "Red Wine", { category: "beverage", physicalForm: "liquid", roles: ["solvent_contributor", "sugar", "alcoholic", "acid", "heat_accelerator"], waterFraction: 0.86, sugarFraction: 0.02, pHImpact: "acidic", processPhase: "frozen_liquid_before_lye", hazardTags: ["alcohol_lye"], reviewRequired: true }),
  add("champagne", "Champagne", { category: "beverage", physicalForm: "liquid", roles: ["solvent_contributor", "sugar", "carbonated", "alcoholic", "acid", "heat_accelerator"], waterFraction: 0.86, sugarFraction: 0.02, pHImpact: "acidic", processPhase: "frozen_liquid_before_lye", hazardTags: ["eruption"], reviewRequired: true }),
  add("coffee", "Coffee", { category: "beverage", physicalForm: "liquid", roles: ["solvent_contributor", "botanical"], waterFraction: 0.98, processPhase: "cold_liquid_before_lye", temperatureRequirement: "chilled", interactionTags: ["color"] }),
  add("apple_cider_vinegar", "Apple Cider Vinegar", { category: "beverage", physicalForm: "liquid", roles: ["solvent_contributor", "acid", "alkali_consumer"], waterFraction: 0.94, pHImpact: "acidic", processPhase: "cold_liquid_before_lye", reviewRequired: true, hazardTags: ["unknown_neutralization"] }),
  add("kombucha", "Kombucha", { category: "beverage", physicalForm: "liquid", roles: ["solvent_contributor", "acid", "carbonated", "microbial_risk"], waterFraction: 0.94, sugarFraction: 0.03, pHImpact: "acidic", processPhase: "frozen_liquid_before_lye", reviewRequired: true, hazardTags: ["unknown_neutralization", "eruption"] }),

  add("mica_powder", "Mica Powder", { category: "colorant_aesthetic", physicalForm: "powder", roles: ["pigment"], insolubleSolidsFraction: 1, processPhase: "light_trace", cosmeticGradeRequired: true, reviewRequired: true, sourceRefs: SUPPLIER_REF }),
  add("titanium_dioxide", "Titanium Dioxide", { category: "colorant_aesthetic", physicalForm: "powder", roles: ["pigment", "water_absorber"], insolubleSolidsFraction: 1, processPhase: "light_trace", cosmeticGradeRequired: true, sourceRefs: SUPPLIER_REF }),
  add("zinc_oxide", "Zinc Oxide", { category: "colorant_aesthetic", physicalForm: "powder", roles: ["pigment", "water_absorber"], insolubleSolidsFraction: 1, processPhase: "light_trace", cosmeticGradeRequired: true, sourceRefs: SUPPLIER_REF }),
  add("ultramarine_blue", "Ultramarine Blue", { category: "colorant_aesthetic", physicalForm: "powder", roles: ["pigment"], insolubleSolidsFraction: 1, processPhase: "light_trace", cosmeticGradeRequired: true, sourceRefs: SUPPLIER_REF }),
  add("oxide_pigments", "Oxide Pigments", { category: "colorant_aesthetic", physicalForm: "powder", roles: ["pigment"], insolubleSolidsFraction: 1, processPhase: "light_trace", cosmeticGradeRequired: true, sourceRefs: SUPPLIER_REF }),
  add("biodegradable_glitter", "Biodegradable Glitter", { category: "colorant_aesthetic", physicalForm: "solid", roles: ["pigment", "abrasive"], insolubleSolidsFraction: 1, processPhase: "top_decoration", cosmeticGradeRequired: true, reviewRequired: true, sourceRefs: SUPPLIER_REF }),
  add("soap_dough", "Soap Dough", { category: "colorant_aesthetic", physicalForm: "paste", roles: ["melt_and_pour_only"], waterFraction: 0.15, insolubleSolidsFraction: 0.85, processPhase: "top_decoration", reviewRequired: true }),
  add("fluorescent_pigments", "Fluorescent Pigments", { category: "colorant_aesthetic", physicalForm: "powder", roles: ["pigment", "unknown_reactive"], insolubleSolidsFraction: 1, processPhase: "light_trace", cosmeticGradeRequired: true, reviewRequired: true, sourceRefs: SUPPLIER_REF }),

  ...[
    ["lavender_essential_oil", "Lavender EO"],
    ["tea_tree_essential_oil", "Tea Tree EO"],
    ["peppermint_essential_oil", "Peppermint EO"],
    ["sweet_orange_essential_oil", "Sweet Orange EO"],
    ["lemongrass_essential_oil", "Lemongrass EO"],
    ["eucalyptus_essential_oil", "Eucalyptus EO"],
    ["patchouli_essential_oil", "Patchouli EO"],
    ["essential_oil", "Essential Oil"],
  ].map(([id, name]) =>
    add(id, name, { category: "scent_fixative_preserver", physicalForm: "oil", roles: ["fragrance", "trace_accelerator"], lipidFraction: 1, processPhase: "light_trace", supplierUsageRequired: true, reviewRequired: true, sourceRefs: SUPPLIER_REF, interactionTags: ["fragrance"] }),
  ),
  add("synthetic_fragrance_oil", "Synthetic Fragrance Oil", { category: "scent_fixative_preserver", physicalForm: "fragrance_blend", roles: ["fragrance", "unknown_reactive"], lipidFraction: 1, processPhase: "light_trace", temperatureRequirement: "supplier_specific", supplierUsageRequired: true, reviewRequired: true, sourceRefs: SUPPLIER_REF, interactionTags: ["fragrance"] }),
  add("fragrance_oil", "Fragrance Oil", { category: "scent_fixative_preserver", physicalForm: "fragrance_blend", roles: ["fragrance", "unknown_reactive"], lipidFraction: 1, processPhase: "light_trace", temperatureRequirement: "supplier_specific", supplierUsageRequired: true, reviewRequired: true, sourceRefs: SUPPLIER_REF, interactionTags: ["fragrance"] }),
  add("arrowroot_powder", "Arrowroot Powder", { category: "scent_fixative_preserver", physicalForm: "powder", roles: ["fragrance_fixative", "water_absorber"], insolubleSolidsFraction: 1, processPhase: "light_trace", interactionTags: ["scent_fixative"] }),
  add("tapioca_pearls_starch", "Tapioca Pearls/Starch", { category: "scent_fixative_preserver", physicalForm: "powder", roles: ["fragrance_fixative", "water_absorber"], insolubleSolidsFraction: 1, processPhase: "light_trace", interactionTags: ["scent_fixative"] }),
  add("vitamin_e_tocopherol", "Vitamin E / Tocopherol", { category: "scent_fixative_preserver", physicalForm: "oil", roles: ["antioxidant", "lipid"], lipidFraction: 1, processPhase: "hot_process_after_cook", temperatureRequirement: "post_cook_cooldown", supplierUsageRequired: true, sourceRefs: SUPPLIER_REF }),
  add("rosemary_oleoresin", "Rosemary Oleoresin / ROE", { category: "scent_fixative_preserver", physicalForm: "extract", roles: ["antioxidant", "lipid"], lipidFraction: 1, processPhase: "hot_process_after_cook", temperatureRequirement: "post_cook_cooldown", supplierUsageRequired: true, sourceRefs: SUPPLIER_REF }),

  add("shea_butter_additive", "Shea Butter", { category: "luxury_superfat_lipid", physicalForm: "oil", roles: ["lipid"], lipidFraction: 1, sapNaOH: 0.128, sapKOH: 0.18, processPhase: "melted_oils" }),
  add("cocoa_butter_additive", "Cocoa Butter", { category: "luxury_superfat_lipid", physicalForm: "oil", roles: ["lipid"], lipidFraction: 1, sapNaOH: 0.137, sapKOH: 0.193, processPhase: "melted_oils" }),
  add("mango_butter", "Mango Butter", { category: "luxury_superfat_lipid", physicalForm: "oil", roles: ["lipid"], lipidFraction: 1, sapNaOH: 0.128, sapKOH: 0.18, processPhase: "melted_oils" }),
  add("beeswax", "Beeswax", { category: "luxury_superfat_lipid", physicalForm: "wax", roles: ["wax", "lipid", "trace_accelerator"], lipidFraction: 1, sapNaOH: 0.069, sapKOH: 0.097, processPhase: "melted_oils", interactionTags: ["false_trace"] }),
  add("jojoba_oil", "Jojoba Oil", { category: "luxury_superfat_lipid", physicalForm: "oil", roles: ["wax", "lipid"], lipidFraction: 1, sapNaOH: 0.069, sapKOH: 0.097, processPhase: "melted_oils" }),
  add("argan_oil", "Argan Oil", { category: "luxury_superfat_lipid", physicalForm: "oil", roles: ["lipid"], lipidFraction: 1, sapNaOH: 0.136, sapKOH: 0.191, processPhase: "melted_oils" }),
  add("rosehip_seed_oil", "Rosehip Seed Oil", { category: "luxury_superfat_lipid", physicalForm: "oil", roles: ["lipid"], lipidFraction: 1, sapNaOH: 0.133, sapKOH: 0.187, processPhase: "melted_oils" }),
  add("avocado_oil_additive", "Avocado Oil", { category: "luxury_superfat_lipid", physicalForm: "oil", roles: ["lipid"], lipidFraction: 1, sapNaOH: 0.133, sapKOH: 0.187, processPhase: "melted_oils" }),
];

export const ADDITIVE_CATALOG_BY_ID: Record<string, AdditiveDefinition> = Object.fromEntries(
  ADDITIVE_CATALOG_V2.map((entry) => [entry.id, entry]),
);
