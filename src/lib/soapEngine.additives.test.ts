/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from "node:assert/strict";
import { AlkaliType, RecipeDraft, SafetySeverity } from "../types";
import { compileRecipeDraft, executeSoapBytecode } from "./soapEngine";

function compile(recipe: RecipeDraft) {
  const { opcodes } = compileRecipeDraft(recipe);
  return executeSoapBytecode(opcodes, recipe);
}

const baseRecipe: RecipeDraft = {
  name: "Additive chemistry red test",
  status: "draft",
  favorite: false,
  lyeSettings: { alkaliType: AlkaliType.NaOH, superfatPercent: 5, lyeConcentrationPercent: 33 },
  oils: [
    { ingredientId: "olive_oil", weightGrams: 300 },
    { ingredientId: "coconut_oil", weightGrams: 200 },
    { ingredientId: "castor_oil", weightGrams: 50 },
  ],
  liquids: [{ ingredientId: "distilled_water", weightGrams: 1 }],
  additives: [
    { ingredientId: "citric_acid", weightGrams: 10 },
    { ingredientId: "raw_honey", weightGrams: 20 },
    { ingredientId: "kaolin_clay", weightGrams: 15 },
    { ingredientId: "synthetic_fragrance_oil", weightGrams: 18 },
  ],
};

const compiled = compile(baseRecipe);

assert.equal(compiled.additiveChemistryReport.alkaliCompensation.naohGrams, 6.24);
assert.equal(compiled.additiveChemistryReport.solventImpact.freeWaterGrams, 3.4);
assert.equal(compiled.additiveChemistryReport.solidsLoad.insolubleSolidsGrams, 15);
assert.ok(compiled.additiveChemistryReport.sugarProteinHeatRisk.sugarPercentOfOils > 2);
assert.ok(compiled.additiveChemistryReport.fragrancePigmentReview.some((item) => item.reviewRequired));
assert.ok(compiled.additiveChemistryReport.synergies.some((item) => item.id === "clay-fragrance-fixation"));
assert.ok(compiled.additiveChemistryReport.hazards.some((item) => item.id.endsWith("missing-supplier-limit")));
assert.ok(compiled.additiveChemistryReport.handlingRequirements.some((item) => item.temperatureRequirement === "room_temp"));
assert.ok(compiled.safetyReport.warnings.some((warning) => warning.severity === SafetySeverity.BLOCKED));

const reordered = compile({
  ...baseRecipe,
  additives: [...baseRecipe.additives].reverse(),
});

assert.equal(reordered.recipeHash, compiled.recipeHash);
assert.deepEqual(
  reordered.additiveChemistryReport.synergies.map((item) => item.id),
  compiled.additiveChemistryReport.synergies.map((item) => item.id),
);

const withZeroGram = compile({
  ...baseRecipe,
  additives: [...baseRecipe.additives, { ingredientId: "apple_cider_vinegar", weightGrams: 0 }],
});

assert.equal(withZeroGram.recipeHash, compiled.recipeHash);

console.log("soapEngine additive chemistry assertions passed");
