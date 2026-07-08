/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { RecipeDraft, InventoryItem, MoldProfile, ActivityEvent, AlkaliType, MoldShape } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");

const RECIPES_FILE = path.join(DATA_DIR, "recipes.json");
const INVENTORY_FILE = path.join(DATA_DIR, "inventory.json");
const MOLDS_FILE = path.join(DATA_DIR, "molds.json");
const ACTIVITY_FILE = path.join(DATA_DIR, "activity.json");

// Keep a bounded but generous history so the audit trail survives writes.
const ACTIVITY_CAP = 500;

// Write JSON atomically (temp file + rename) so a crash mid-write can't leave a
// truncated, unparseable data file.
function writeJson(file: string, value: unknown) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file);
}

// Ensure data directory and files exist
function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Seed default recipes
  if (!fs.existsSync(RECIPES_FILE)) {
    const defaultRecipes: RecipeDraft[] = [
      {
        id: "recipe_balanced_bar",
        name: "Standard Balanced Bar Soap",
        status: "ready",
        favorite: true,
        notes: "A perfect everyday soap recipe with excellent hardness, bubbly lather, and high conditioning. Great for beginners!",
        lyeSettings: {
          alkaliType: AlkaliType.NaOH,
          superfatPercent: 5,
          lyeConcentrationPercent: 30
        },
        oils: [
          { ingredientId: "olive_oil", weightGrams: 400 },
          { ingredientId: "coconut_oil", weightGrams: 250 },
          { ingredientId: "palm_oil", weightGrams: 200 },
          { ingredientId: "castor_oil", weightGrams: 50 },
          { ingredientId: "shea_butter", weightGrams: 100 }
        ],
        liquids: [
          { ingredientId: "distilled_water", weightGrams: 350 }
        ],
        additives: [
          { ingredientId: "essential_oil", weightGrams: 25 },
          { ingredientId: "sodium_lactate", weightGrams: 15 }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "recipe_creamy_goat",
        name: "Deep Creamy Goat Milk Soap",
        status: "ready",
        favorite: false,
        notes: "High-fat luxuriously creamy soap. Uses fresh goat milk as a 100% water alternative. Make sure to freeze the goat milk to slush before mixing with lye!",
        lyeSettings: {
          alkaliType: AlkaliType.NaOH,
          superfatPercent: 6,
          lyeConcentrationPercent: 33
        },
        oils: [
          { ingredientId: "olive_oil", weightGrams: 500 },
          { ingredientId: "coconut_oil", weightGrams: 200 },
          { ingredientId: "shea_butter", weightGrams: 150 },
          { ingredientId: "avocado_oil", weightGrams: 100 },
          { ingredientId: "cocoa_butter", weightGrams: 50 }
        ],
        liquids: [
          { ingredientId: "goat_milk", weightGrams: 300 }
        ],
        additives: [
          { ingredientId: "fragrance_oil", weightGrams: 30 }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "recipe_flat_beer",
        name: "Stout Beer & Clay Artisan Soap",
        status: "ready",
        favorite: false,
        notes: "Artisanal bar with incredible lather and silkiness. Uses boiled/flat frozen stout beer instead of water, and incorporates Kaolin Clay at trace.",
        lyeSettings: {
          alkaliType: AlkaliType.NaOH,
          superfatPercent: 5,
          lyeConcentrationPercent: 30
        },
        oils: [
          { ingredientId: "olive_oil", weightGrams: 350 },
          { ingredientId: "coconut_oil", weightGrams: 250 },
          { ingredientId: "castor_oil", weightGrams: 100 },
          { ingredientId: "shea_butter", weightGrams: 200 },
          { ingredientId: "palm_oil", weightGrams: 100 }
        ],
        liquids: [
          { ingredientId: "beer", weightGrams: 330 }
        ],
        additives: [
          { ingredientId: "clay_kaolin", weightGrams: 15 },
          { ingredientId: "essential_oil", weightGrams: 20 }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(RECIPES_FILE, JSON.stringify(defaultRecipes, null, 2));
  }

  // Seed default inventory items
  if (!fs.existsSync(INVENTORY_FILE)) {
    const defaultInventory: InventoryItem[] = [
      { id: "inv_olive", ingredientId: "olive_oil", displayName: "Organic Extra Virgin Olive Oil", quantity: 3000, unit: "g", costCents: 2400, expirationDate: "2027-12-01", supplier: "Brambley Sourcing", lotNumber: "EVO-89241" },
      { id: "inv_coconut", ingredientId: "coconut_oil", displayName: "Coconut Oil (76 deg)", quantity: 2500, unit: "g", costCents: 1850, expirationDate: "2027-06-15", supplier: "Wholesale Soap Co.", lotNumber: "COC-7622" },
      { id: "inv_castor", ingredientId: "castor_oil", displayName: "Castor Oil (Cold Pressed)", quantity: 1000, unit: "g", costCents: 1200, expirationDate: "2028-02-28", supplier: "Essential Organics", lotNumber: "CST-0045" },
      { id: "inv_shea", ingredientId: "shea_butter", displayName: "Unrefined Shea Butter", quantity: 1200, unit: "g", costCents: 1600, expirationDate: "2027-10-10", supplier: "FairTrade Shea Group", lotNumber: "SHB-331A" },
      { id: "inv_palm", ingredientId: "palm_oil", displayName: "RSPO Sustainable Palm Oil", quantity: 1500, unit: "g", costCents: 1100, expirationDate: "2027-08-30", supplier: "EcoOils", lotNumber: "PLM-8822" },
      { id: "inv_cocoa", ingredientId: "cocoa_butter", displayName: "Natural Cocoa Butter Wafers", quantity: 800, unit: "g", costCents: 1500, expirationDate: "2028-04-12", supplier: "Wholesale Soap Co.", lotNumber: "COB-109" },
      { id: "inv_almond", ingredientId: "sweet_almond_oil", displayName: "Pure Sweet Almond Oil", quantity: 1000, unit: "g", costCents: 1350, expirationDate: "2027-05-18", supplier: "Essential Organics", lotNumber: "ALM-9912" },
      { id: "inv_avocado", ingredientId: "avocado_oil", displayName: "Avocado Oil (Refined)", quantity: 1000, unit: "g", costCents: 1450, expirationDate: "2027-11-20", supplier: "Brambley Sourcing", lotNumber: "AVO-4412" },
      { id: "inv_water", ingredientId: "distilled_water", displayName: "Gallon Distilled Water", quantity: 4000, unit: "g", costCents: 150, expirationDate: "2029-01-01", supplier: "Local Sourcing", lotNumber: "H2O-DIS" },
      { id: "inv_goat", ingredientId: "goat_milk", displayName: "Fresh Local Goat Milk", quantity: 1500, unit: "g", costCents: 600, expirationDate: "2026-08-15", supplier: "Dairy Farms", lotNumber: "MILK-GOAT" },
      { id: "inv_beer", ingredientId: "beer", displayName: "Oatmeal Stout Flat Beer", quantity: 1200, unit: "g", costCents: 500, expirationDate: "2026-11-01", supplier: "Local Brewery", lotNumber: "BEER-STOUT" },
      { id: "inv_citric", ingredientId: "citric_acid", displayName: "Citric Acid Anhydrous Powder", quantity: 500, unit: "g", costCents: 650, expirationDate: "2029-05-01", supplier: "Wholesale Soap Co.", lotNumber: "CIT-884" },
      { id: "inv_lactate", ingredientId: "sodium_lactate", displayName: "Sodium Lactate 60% USP", quantity: 400, unit: "g", costCents: 750, expirationDate: "2028-09-12", supplier: "Wholesale Soap Co.", lotNumber: "LAC-601" }
    ];
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(defaultInventory, null, 2));
  }

  // Seed default molds
  if (!fs.existsSync(MOLDS_FILE)) {
    const defaultMolds: MoldProfile[] = [
      {
        id: "mold_silicone_loaf",
        name: "Standard Silicone Loaf Mold",
        shape: MoldShape.RECTANGULAR,
        dimensions: { length: 25, width: 9, height: 7 },
        unit: "cm",
        fillPercent: 100,
        estimatedBatchWeightGrams: 1500
      },
      {
        id: "mold_pvc_cylinder",
        name: "Artisan PVC Cylinder Mold",
        shape: MoldShape.CYLINDER,
        dimensions: { radius: 4, height: 30 },
        unit: "cm",
        fillPercent: 95,
        estimatedBatchWeightGrams: 1250
      },
      {
        id: "mold_cavities",
        name: "6-Cavity Hexagon Silicone Mold",
        shape: MoldShape.CAVITY,
        dimensions: { cavities: 6, cavityVolumeMl: 100 },
        unit: "cm",
        fillPercent: 100,
        estimatedBatchWeightGrams: 550
      }
    ];
    fs.writeFileSync(MOLDS_FILE, JSON.stringify(defaultMolds, null, 2));
  }

  // Seed an empty activity log — real events are appended as the app is used.
  if (!fs.existsSync(ACTIVITY_FILE)) {
    writeJson(ACTIVITY_FILE, [] as ActivityEvent[]);
  }
}

// Ensure database files are loaded on system boot
ensureDataFiles();

function readJson<T>(file: string): T[] {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return [];
  }
}

export const ServerDb = {
  // Recipes
  getRecipes(): RecipeDraft[] {
    return readJson<RecipeDraft>(RECIPES_FILE);
  },
  saveRecipes(recipes: RecipeDraft[]) {
    writeJson(RECIPES_FILE, recipes);
  },

  // Inventory
  getInventory(): InventoryItem[] {
    return readJson<InventoryItem>(INVENTORY_FILE);
  },
  saveInventory(inventory: InventoryItem[]) {
    writeJson(INVENTORY_FILE, inventory);
  },

  // Molds
  getMolds(): MoldProfile[] {
    return readJson<MoldProfile>(MOLDS_FILE);
  },
  saveMolds(molds: MoldProfile[]) {
    writeJson(MOLDS_FILE, molds);
  },

  // Activity log — read returns newest-last; the full history is preserved on
  // disk (trimmed only when it exceeds the cap), so writes never silently
  // destroy older entries the way a read-time slice would.
  getActivity(limit = 100): ActivityEvent[] {
    const all = readJson<ActivityEvent>(ACTIVITY_FILE);
    return all.slice(-limit);
  },
  addActivity(event: Omit<ActivityEvent, "id" | "timestamp">) {
    const all = readJson<ActivityEvent>(ACTIVITY_FILE);
    all.push({
      ...event,
      id: "evt_" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString()
    });
    // Trim oldest only when genuinely over the cap.
    const trimmed = all.length > ACTIVITY_CAP ? all.slice(-ACTIVITY_CAP) : all;
    writeJson(ACTIVITY_FILE, trimmed);
  }
};
