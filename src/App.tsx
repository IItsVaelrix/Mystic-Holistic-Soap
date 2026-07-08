/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { FlaskConical, Package, Plus, Trash2, Copy, Heart, Layers, ScrollText } from "lucide-react";
import { RecipeDraft, InventoryItem, AlkaliType } from "./types";
import RecipeBuilder from "./components/RecipeBuilder";
import InventoryManager from "./components/InventoryManager";
import ActivityLog from "./components/ActivityLog";
import AlchemyLab from "./components/AlchemyLab";

type Tab = "formulator" | "alchemy" | "inventory" | "activity";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("formulator");
  const [recipes, setRecipes] = useState<RecipeDraft[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDraft | null>(null);
  const [lowStockCount, setLowStockCount] = useState(0);

  const countLowStock = (inv: InventoryItem[]) =>
    inv.filter((i) => i.quantity < 500 && (i.unit === "g" || i.unit === "ml")).length;

  const fetchData = async () => {
    try {
      const recRes = await fetch("/api/recipes");
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecipes(recData);
        if (recData.length > 0 && !selectedRecipe) setSelectedRecipe(recData[0]);
      }
      const invRes = await fetch("/api/inventory");
      if (invRes.ok) {
        const invData = await invRes.json();
        setInventory(invData);
        setLowStockCount(countLowStock(invData));
      }
    } catch (err) {
      console.error("Failed to load workshop data", err);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && window.navigator?.vibrate) window.navigator.vibrate(8);
  };

  const handleSelectRecipe = (recipe: RecipeDraft) => {
    triggerHaptic();
    setSelectedRecipe(recipe);
    setActiveTab("formulator");
  };

  const handleCreateNewRecipe = () => {
    triggerHaptic();
    const newRecipe: RecipeDraft = {
      name: "New formula",
      status: "draft",
      favorite: false,
      notes: "",
      lyeSettings: { alkaliType: AlkaliType.NaOH, superfatPercent: 5, lyeConcentrationPercent: 30 },
      oils: [
        { ingredientId: "olive_oil", weightGrams: 300 },
        { ingredientId: "coconut_oil", weightGrams: 200 },
      ],
      liquids: [{ ingredientId: "distilled_water", weightGrams: 1 }],
      additives: [],
    };
    setSelectedRecipe(newRecipe);
    setActiveTab("formulator");
  };

  const handleLoadStarter = (draft: RecipeDraft) => {
    triggerHaptic();
    // clone so edits in the Formulator never mutate the shared catalog object
    setSelectedRecipe(structuredClone(draft));
    setActiveTab("formulator");
  };

  const handleDuplicateRecipe = async (recipeToDuplicate: RecipeDraft) => {
    triggerHaptic();
    const duplicated: RecipeDraft = { ...recipeToDuplicate, name: `${recipeToDuplicate.name} (copy)`, favorite: false };
    delete duplicated.id;
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(duplicated),
      });
      if (res.ok) {
        const saved = await res.json();
        setRecipes([...recipes, saved]);
        setSelectedRecipe(saved);
      }
    } catch (err) {
      console.error("Duplicate failed", err);
    }
  };

  const handleDeleteRecipe = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    if (!confirm("Delete this recipe permanently?")) return;
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (res.ok) {
        const filtered = recipes.filter((r) => r.id !== id);
        setRecipes(filtered);
        if (selectedRecipe?.id === id) setSelectedRecipe(filtered[0] || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRecipe = async (updated: RecipeDraft) => {
    try {
      if (updated.id) {
        const res = await fetch(`/api/recipes/${updated.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        if (res.ok) {
          const saved = await res.json();
          setRecipes(recipes.map((r) => (r.id === saved.id ? saved : r)));
          setSelectedRecipe(saved);
        }
      } else {
        const res = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        if (res.ok) {
          const saved = await res.json();
          setRecipes([...recipes, saved]);
          setSelectedRecipe(saved);
        }
      }
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleCompileRecipe = async (draft: RecipeDraft) => {
    const res = await fetch("/api/compile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (res.ok) return await res.json();
    throw new Error("Compile request failed");
  };

  const handleAddStock = async (item: Omit<InventoryItem, "id">) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const saved = await res.json();
        const updatedInv = [...inventory, saved];
        setInventory(updatedInv);
        setLowStockCount(countLowStock(updatedInv));
      }
    } catch (err) {
      console.error("Add stock failed", err);
    }
  };

  const handleUpdateStock = async (id: string, quantity: number) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        const saved = await res.json();
        const updatedInv = inventory.map((i) => (i.id === id ? saved : i));
        setInventory(updatedInv);
        setLowStockCount(countLowStock(updatedInv));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStock = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (res.ok) {
        const updatedInv = inventory.filter((i) => i.id !== id);
        setInventory(updatedInv);
        setLowStockCount(countLowStock(updatedInv));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "formulator", label: "Formulate", icon: <Layers className="w-4 h-4" /> },
    { id: "alchemy", label: "Alchemy", icon: <FlaskConical className="w-4 h-4" /> },
    { id: "inventory", label: "Inventory", icon: <Package className="w-4 h-4" />, badge: lowStockCount || undefined },
    { id: "activity", label: "Activity", icon: <ScrollText className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      {/* Header */}
      <header className="bg-ink text-white instrument-grid border-b border-line-dk">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 border border-caustic/40 flex items-center justify-center bg-ink-2">
              <FlaskConical className="w-5 h-5 text-caustic" />
            </div>
            <div>
              <h1 className="display text-base tracking-tight text-white leading-none">
                SAPONIFICATION BENCH
              </h1>
              <p className="eyebrow text-[8.5px] text-mute-2 mt-1.5">
                Cold-process formulation &amp; safety engine
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-mute-2">
            <span className="w-1.5 h-1.5 bg-caustic" />
            <span>catalog 2026.1</span>
            <span className="text-line-dk">/</span>
            <span>compiler v1.0.0</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-surface border-b border-line px-6">
        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                triggerHaptic();
                setActiveTab(t.id);
              }}
              className={`relative flex items-center gap-2 px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wide transition -mb-px border-b-2 ${
                activeTab === t.id ? "text-ink border-caustic" : "text-mute border-transparent hover:text-ink"
              }`}
            >
              {t.icon}
              {t.label}
              {t.badge ? (
                <span className="ml-0.5 font-mono text-[9px] text-warn bg-warn/10 border border-warn/30 px-1">{t.badge}</span>
              ) : null}
            </button>
          ))}
        </div>
      </nav>

      {/* Body */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === "formulator" ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Recipe index */}
            <aside className="w-72 border-r border-line bg-surface hidden md:flex flex-col">
              <div className="px-4 py-3.5 border-b border-line flex items-center justify-between">
                <span className="eyebrow text-[9px] text-mute">Saved formulas</span>
                <button
                  onClick={handleCreateNewRecipe}
                  className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink hover:text-caustic-dim"
                >
                  <Plus className="w-3.5 h-3.5" /> New
                </button>
              </div>
              <div className="flex-1 overflow-y-auto scroll-thin-dark p-2.5 space-y-2">
                {recipes.length === 0 ? (
                  <p className="text-xs text-mute text-center py-8">No formulas yet.</p>
                ) : (
                  recipes.map((rec) => {
                    const isSelected = selectedRecipe?.id === rec.id;
                    return (
                      <div
                        key={rec.id}
                        onClick={() => rec.id && handleSelectRecipe(rec)}
                        className={`group relative p-3 border cursor-pointer transition ${
                          isSelected ? "border-ink bg-paper" : "border-line hover:border-mute-2 bg-surface"
                        }`}
                      >
                        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-caustic" />}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-ink truncate pr-1">{rec.name}</h4>
                          {rec.favorite && <Heart className="w-3 h-3 fill-danger text-danger shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-2 font-mono text-[9px] text-mute">
                          <span className="uppercase text-ink/70 border border-line px-1">{rec.lyeSettings.alkaliType}</span>
                          <span>SF {rec.lyeSettings.superfatPercent}%</span>
                          <span>{rec.lyeSettings.lyeConcentrationPercent || 30}%</span>
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition flex gap-1">
                          <button
                            title="Duplicate"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateRecipe(rec);
                            }}
                            className="p-1 text-mute-2 hover:text-ink"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {rec.id && (
                            <button title="Delete" onClick={(e) => handleDeleteRecipe(rec.id!, e)} className="p-1 text-mute-2 hover:text-danger">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="px-4 py-3 border-t border-line font-mono text-[9px] text-mute space-y-1.5">
                <div className="flex justify-between">
                  <span className="uppercase tracking-wider">Recipes</span>
                  <span className="text-ink font-semibold">{recipes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="uppercase tracking-wider">Inventory items</span>
                  <span className="text-ink font-semibold">{inventory.length}</span>
                </div>
              </div>
            </aside>

            <div className="flex-1 overflow-y-auto scroll-thin-dark bench-grid p-6">
              {selectedRecipe ? (
                <RecipeBuilder
                  recipe={selectedRecipe}
                  inventory={inventory}
                  onSaveRecipe={handleSaveRecipe}
                  onCompile={handleCompileRecipe}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-mute">
                  <FlaskConical className="w-10 h-10 text-line" />
                  <p className="text-sm">No formula loaded. Start a new one.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "alchemy" ? (
          <div className="flex-1 overflow-y-auto scroll-thin-dark bench-grid p-6">
            <AlchemyLab onLoadStarter={handleLoadStarter} />
          </div>
        ) : activeTab === "inventory" ? (
          <div className="flex-1 overflow-y-auto scroll-thin-dark bench-grid p-6">
            <InventoryManager inventory={inventory} onAddStock={handleAddStock} onUpdateStock={handleUpdateStock} onDeleteStock={handleDeleteStock} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scroll-thin-dark bench-grid p-6">
            <ActivityLog />
          </div>
        )}
      </main>
    </div>
  );
}
