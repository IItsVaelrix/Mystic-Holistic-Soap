/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from "node:assert/strict";
import { AlkaliType, RecipeDraft, SafetySeverity } from "../types";
import { compileRecipeDraft, executeSoapBytecode, INGREDIENT_CATALOG } from "./soapEngine";

function compile(oils: { ingredientId: string; weightGrams: number }[]) {
  const recipe: RecipeDraft = {
    name: "tallow test",
    status: "draft",
    favorite: false,
    lyeSettings: { alkaliType: AlkaliType.NaOH, superfatPercent: 5, lyeConcentrationPercent: 33 },
    oils,
    liquids: [{ ingredientId: "distilled_water", weightGrams: 1 }],
    additives: [],
  };
  const { opcodes } = compileRecipeDraft(recipe);
  return executeSoapBytecode(opcodes, recipe);
}

const VERIFIED = ["beef_tallow", "mutton_tallow", "lard", "chicken_fat", "duck_fat", "goose_fat"];
const REVIEW = ["goat_tallow", "deer_tallow", "bear_tallow", "rabbit_fat"];

const byId = (id: string) => INGREDIENT_CATALOG.find((i) => i.id === id);

// --- Catalog integrity -------------------------------------------------------
for (const id of VERIFIED) {
  const ing = byId(id);
  assert.ok(ing, `verified fat ${id} must exist in INGREDIENT_CATALOG`);
  assert.equal(ing!.type, "oil", `${id} must be type "oil"`);
  assert.ok(ing!.sapNaOH > 0 && ing!.sapKOH > 0, `${id} must have real SAP values`);
  assert.ok(!ing!.reviewRequired, `${id} must not be reviewRequired`);
  assert.ok((ing!.dietaryEthicFlags || []).includes("animal_product"), `${id} must flag animal_product`);
}

for (const id of REVIEW) {
  const ing = byId(id);
  assert.ok(ing, `review stub ${id} must exist`);
  assert.equal(ing!.reviewRequired, true, `${id} must be reviewRequired`);
  assert.equal(ing!.sapNaOH, 0, `${id} must carry no verified SAP value`);
}

// --- Verified fat compiles as a normal saponifiable oil ----------------------
{
  const r = compile([
    { ingredientId: "beef_tallow", weightGrams: 400 },
    { ingredientId: "coconut_oil", weightGrams: 100 },
  ]);
  assert.ok(r.lyeNaOHWeight > 0, "beef tallow recipe must compute lye");
  assert.notEqual(r.safetyReport.status, "blocked", "beef tallow recipe must not be blocked");
  assert.ok(
    !r.safetyReport.warnings.some((w) => w.severity === SafetySeverity.BLOCKED),
    "beef tallow recipe must have no BLOCKED warning",
  );
}

// --- Animal-derived labeling advisory (INFO) ---------------------------------
{
  const r = compile([{ ingredientId: "beef_tallow", weightGrams: 500 }]);
  const info = r.safetyReport.warnings.find((w) => w.id === "animal-derived-fat-labeling");
  assert.ok(info, "beef tallow must raise the animal-derived labeling advisory");
  assert.equal(info!.severity, SafetySeverity.INFO, "labeling advisory must be INFO, not blocking");
}

// --- Pork (lard) surfaces religious sensitivity in the advisory --------------
{
  const r = compile([{ ingredientId: "lard", weightGrams: 500 }]);
  const info = r.safetyReport.warnings.find((w) => w.id === "animal-derived-fat-labeling");
  assert.ok(info, "lard must raise the labeling advisory");
  assert.match(info!.message, /religious/i, "lard advisory must mention religious sensitivity");
}

// --- Review-required fat BLOCKS compilation ----------------------------------
{
  const r = compile([
    { ingredientId: "goat_tallow", weightGrams: 300 },
    { ingredientId: "coconut_oil", weightGrams: 100 },
  ]);
  const blocked = r.safetyReport.warnings.find((w) => w.id === "oil-review-required-goat_tallow");
  assert.ok(blocked, "goat_tallow must emit a review-required warning");
  assert.equal(blocked!.severity, SafetySeverity.BLOCKED, "review-required must be BLOCKED severity");
  assert.equal(r.safetyReport.status, "blocked", "recipe using a review-required fat must be blocked");
}

// --- Verified fats do NOT trigger the review gate ----------------------------
{
  const r = compile([{ ingredientId: "duck_fat", weightGrams: 500 }]);
  assert.ok(
    !r.safetyReport.warnings.some((w) => w.id.startsWith("oil-review-required-")),
    "verified duck_fat must not trip the review gate",
  );
}

console.log("soap engine tallow / animal-fat assertions passed");
