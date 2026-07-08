/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { compileRecipeDraft, executeSoapBytecode, generateRecommendations, generateFormulationHash } from "./src/lib/soapEngine";
import { ServerDb } from "./src/lib/serverDb";
import { RecipeDraft, InventoryItem, MoldProfile, ActivityEvent } from "./src/types";

import dotenv from "dotenv";
dotenv.config();

// Map a request to a plain-language activity record. Returns null for requests
// we don't want to log (reads, and the activity feed polling itself).
function describeActivity(
  method: string,
  endpoint: string,
  status: number,
  body: unknown
): Omit<ActivityEvent, "id" | "timestamp"> | null {
  const base = endpoint.split("?")[0];
  const fingerprint = generateFormulationHash(body ?? {}).replace(/^fhash_[^_]+_/, "fp_");
  const m = method as ActivityEvent["method"];

  if (base === "/api/compile" && method === "POST") {
    return { method: m, endpoint: base, status, fingerprint, kind: "compile", action: "Compiled formula" };
  }
  if (base === "/api/recommendations" && method === "POST") {
    return { method: m, endpoint: base, status, fingerprint, kind: "advisor", action: "Ran formulation advisor" };
  }
  if (base.startsWith("/api/recipes")) {
    if (method === "POST") return { method: m, endpoint: base, status, fingerprint, kind: "recipe", action: "Created recipe" };
    if (method === "PUT") return { method: m, endpoint: base, status, fingerprint, kind: "recipe", action: "Saved recipe" };
    if (method === "DELETE") return { method: m, endpoint: base, status, fingerprint, kind: "recipe", action: "Deleted recipe" };
  }
  if (base.startsWith("/api/inventory")) {
    if (method === "POST") return { method: m, endpoint: base, status, fingerprint, kind: "inventory", action: "Added stock" };
    if (method === "PUT") return { method: m, endpoint: base, status, fingerprint, kind: "inventory", action: "Updated stock" };
    if (method === "DELETE") return { method: m, endpoint: base, status, fingerprint, kind: "inventory", action: "Removed stock" };
  }
  if (base.startsWith("/api/molds")) {
    if (method === "POST") return { method: m, endpoint: base, status, fingerprint, kind: "mold", action: "Added mold" };
    if (method === "PUT") return { method: m, endpoint: base, status, fingerprint, kind: "mold", action: "Updated mold" };
    if (method === "DELETE") return { method: m, endpoint: base, status, fingerprint, kind: "mold", action: "Removed mold" };
  }
  return null;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  // Bind to localhost by default. This tool ships no authentication, so it must
  // not expose an open read/write API to the whole network. Set HOST=0.0.0.0
  // deliberately if you understand the exposure.
  const HOST = process.env.HOST || "127.0.0.1";

  app.use(express.json({ limit: "256kb" }));
  app.use(express.urlencoded({ extended: true }));

  // Honest activity logging: record real mutations after they complete.
  app.use((req, res, next) => {
    res.on("finish", () => {
      if (!req.originalUrl.startsWith("/api/")) return;
      const entry = describeActivity(req.method, req.originalUrl, res.statusCode, req.body);
      if (entry) {
        try {
          ServerDb.addActivity(entry);
        } catch {
          /* logging must never break a request */
        }
      }
    });
    next();
  });

  // ==================== API ENDPOINTS ====================

  // Activity feed
  app.get("/api/activity", (_req: Request, res: Response) => {
    res.json(ServerDb.getActivity());
  });

  // Deterministic formulation compiler endpoint
  app.post("/api/compile", (req: Request, res: Response) => {
    try {
      const recipe = req.body as RecipeDraft;
      if (!recipe || !recipe.lyeSettings || !recipe.oils) {
        return res.status(400).json({ error: "Invalid recipe draft format" });
      }
      const { opcodes, trace } = compileRecipeDraft(recipe);
      const result = executeSoapBytecode(opcodes, recipe);
      res.json({ result, trace });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Compilation failed during formulation execution" });
    }
  });

  // Recipes API CRUD
  app.get("/api/recipes", (_req: Request, res: Response) => {
    res.json(ServerDb.getRecipes());
  });

  app.post("/api/recipes", (req: Request, res: Response) => {
    const recipes = ServerDb.getRecipes();
    const newRecipe = req.body as RecipeDraft;
    newRecipe.id = "recipe_" + Math.random().toString(36).substring(2, 9);
    newRecipe.createdAt = new Date().toISOString();
    newRecipe.updatedAt = new Date().toISOString();
    recipes.push(newRecipe);
    ServerDb.saveRecipes(recipes);
    res.json(newRecipe);
  });

  app.put("/api/recipes/:id", (req: Request, res: Response) => {
    const recipes = ServerDb.getRecipes();
    const index = recipes.findIndex((r) => r.id === req.params.id);
    if (index !== -1) {
      const updated = { ...recipes[index], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
      recipes[index] = updated;
      ServerDb.saveRecipes(recipes);
      res.json(updated);
    } else {
      res.status(404).json({ error: "Recipe not found" });
    }
  });

  app.delete("/api/recipes/:id", (req: Request, res: Response) => {
    const recipes = ServerDb.getRecipes();
    ServerDb.saveRecipes(recipes.filter((r) => r.id !== req.params.id));
    res.json({ success: true });
  });

  // Inventory API CRUD
  app.get("/api/inventory", (_req: Request, res: Response) => {
    res.json(ServerDb.getInventory());
  });

  app.post("/api/inventory", (req: Request, res: Response) => {
    const inventory = ServerDb.getInventory();
    const item = req.body as InventoryItem;
    item.id = "inv_" + Math.random().toString(36).substring(2, 9);
    inventory.push(item);
    ServerDb.saveInventory(inventory);
    res.json(item);
  });

  app.put("/api/inventory/:id", (req: Request, res: Response) => {
    const inventory = ServerDb.getInventory();
    const index = inventory.findIndex((i) => i.id === req.params.id);
    if (index !== -1) {
      const updated = { ...inventory[index], ...req.body, id: req.params.id };
      inventory[index] = updated;
      ServerDb.saveInventory(inventory);
      res.json(updated);
    } else {
      res.status(404).json({ error: "Inventory item not found" });
    }
  });

  app.delete("/api/inventory/:id", (req: Request, res: Response) => {
    const inventory = ServerDb.getInventory();
    ServerDb.saveInventory(inventory.filter((i) => i.id !== req.params.id));
    res.json({ success: true });
  });

  // Molds API CRUD
  app.get("/api/molds", (_req: Request, res: Response) => {
    res.json(ServerDb.getMolds());
  });

  app.post("/api/molds", (req: Request, res: Response) => {
    const molds = ServerDb.getMolds();
    const mold = req.body as MoldProfile;
    mold.id = "mold_" + Math.random().toString(36).substring(2, 9);
    molds.push(mold);
    ServerDb.saveMolds(molds);
    res.json(mold);
  });

  app.put("/api/molds/:id", (req: Request, res: Response) => {
    const molds = ServerDb.getMolds();
    const index = molds.findIndex((m) => m.id === req.params.id);
    if (index !== -1) {
      const updated = { ...molds[index], ...req.body, id: req.params.id };
      molds[index] = updated;
      ServerDb.saveMolds(molds);
      res.json(updated);
    } else {
      res.status(404).json({ error: "Mold profile not found" });
    }
  });

  app.delete("/api/molds/:id", (req: Request, res: Response) => {
    const molds = ServerDb.getMolds();
    ServerDb.saveMolds(molds.filter((m) => m.id !== req.params.id));
    res.json({ success: true });
  });

  // Recommendation engine endpoint
  app.post("/api/recommendations", (req: Request, res: Response) => {
    try {
      const { result, inventory } = req.body;
      if (!result || !inventory) {
        return res.status(400).json({ error: "Missing result or inventory" });
      }
      res.json(generateRecommendations(result, inventory));
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to generate recommendations" });
    }
  });

  // ==================== FRONTEND SERVER MOUNT ====================

  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite middleware.");
    const vite = await createViteServer({
      // Ignore the runtime data/ directory. The activity-log and CRUD writes land
      // there on every request; if Vite watched it, each write would trigger a
      // full page reload, which would re-compile and write again — an infinite loop.
      server: { middlewareMode: true, watch: { ignored: ["**/data/**"] } },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Saponification Bench] Formulation server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal: failed to start the Saponification Bench server:", err);
});
