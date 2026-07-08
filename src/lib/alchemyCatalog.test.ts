/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from "node:assert/strict";
import { SafetySeverity } from "../types";
import { ALCHEMY_CATALOG } from "./alchemyCatalog";
import { compileRecipeDraft, executeSoapBytecode, INGREDIENT_CATALOG } from "./soapEngine";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];
const KINDS = ["recipe", "technique"];

assert.ok(ALCHEMY_CATALOG.length > 0, "ALCHEMY_CATALOG must not be empty");

const seenIds = new Set<string>();

for (const entry of ALCHEMY_CATALOG) {
  assert.ok(typeof entry.id === "string" && entry.id.length > 0, `entry has empty id: ${JSON.stringify(entry)}`);
  assert.ok(typeof entry.title === "string" && entry.title.length > 0, `${entry.id}: title must be non-empty`);
  assert.ok(typeof entry.summary === "string" && entry.summary.length > 0, `${entry.id}: summary must be non-empty`);
  assert.ok(typeof entry.overview === "string" && entry.overview.length > 0, `${entry.id}: overview must be non-empty`);
  assert.ok(DIFFICULTIES.includes(entry.difficulty), `${entry.id}: difficulty "${entry.difficulty}" is not one of ${DIFFICULTIES.join(", ")}`);
  assert.ok(KINDS.includes(entry.kind), `${entry.id}: kind "${entry.kind}" is not one of ${KINDS.join(", ")}`);
  assert.ok(Array.isArray(entry.steps) && entry.steps.length > 0, `${entry.id}: steps must be a non-empty array`);
  assert.ok(Array.isArray(entry.safety), `${entry.id}: safety must be an array`);

  assert.ok(!seenIds.has(entry.id), `duplicate entry id: ${entry.id}`);
  seenIds.add(entry.id);

  if (entry.kind === "recipe") {
    assert.ok(entry.starterDraft, `${entry.id}: recipe entries must have a starterDraft`);
  } else {
    assert.ok(!("starterDraft" in entry), `${entry.id}: technique entries must not have a starterDraft`);
  }
}

const recipeIds = new Set(
  ALCHEMY_CATALOG.filter((entry) => entry.kind === "recipe").map((entry) => entry.id),
);

for (const entry of ALCHEMY_CATALOG) {
  if (entry.kind !== "recipe") continue;

  const { opcodes } = compileRecipeDraft(entry.starterDraft);
  const result = executeSoapBytecode(opcodes, entry.starterDraft);

  assert.ok(
    !result.safetyReport.warnings.some((warning) => warning.severity === SafetySeverity.BLOCKED),
    `${entry.id}: starterDraft compiled with a BLOCKED safety warning: ${JSON.stringify(
      result.safetyReport.warnings.filter((warning) => warning.severity === SafetySeverity.BLOCKED),
    )}`,
  );

  const ingredientIds = [
    ...entry.starterDraft.oils.map((item) => item.ingredientId),
    ...entry.starterDraft.liquids.map((item) => item.ingredientId),
    ...entry.starterDraft.additives.map((item) => item.ingredientId),
  ];
  for (const ingredientId of ingredientIds) {
    assert.ok(
      INGREDIENT_CATALOG.some((ingredient) => ingredient.id === ingredientId),
      `${entry.id}: ingredientId "${ingredientId}" is not present in INGREDIENT_CATALOG`,
    );
  }
}

for (const entry of ALCHEMY_CATALOG) {
  if (entry.kind !== "technique") continue;
  for (const relatedId of entry.appliesTo ?? []) {
    assert.ok(
      recipeIds.has(relatedId),
      `${entry.id}: appliesTo id "${relatedId}" does not match any recipe entry id`,
    );
  }
}

console.log("alchemy catalog validation passed");
