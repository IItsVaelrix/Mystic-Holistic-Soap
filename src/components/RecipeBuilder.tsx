/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Lightbulb,
  Terminal,
  Save,
  RefreshCw,
  Heart,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import {
  RecipeDraft,
  AlkaliType,
  CompiledFormulaResult,
  InventoryItem,
  IngredientRecommendation,
  SafetySeverity,
} from "../types";
import { INGREDIENT_CATALOG } from "../lib/soapEngine";
import { ADDITIVE_CATALOG_V2, ADDITIVE_CATALOG_BY_ID } from "../lib/additiveCatalog";
import QualityPredictor from "./QualityPredictor";
import MoldCalculator from "./MoldCalculator";
import NumberField from "./NumberField";

interface RecipeBuilderProps {
  recipe: RecipeDraft;
  inventory: InventoryItem[];
  onSaveRecipe: (recipe: RecipeDraft) => Promise<void>;
  onCompile: (recipe: RecipeDraft) => Promise<{ result: CompiledFormulaResult; trace: string[] }>;
}

const ADDITIVE_OPTIONS = ADDITIVE_CATALOG_V2
  .filter((item) => !["clay_kaolin"].includes(item.id))
  .map((item) => ({ id: item.id, label: `${item.name} · ${item.category.replaceAll("_", " ")}` }));

function additiveDisplayName(ingredientId: string): string {
  return ADDITIVE_CATALOG_BY_ID[ingredientId]?.name || INGREDIENT_CATALOG.find((i) => i.id === ingredientId)?.name || "Additive";
}

/** Smoothly count a number up when it changes — restrained, respects reduced motion. */
function useCountUp(target: number, deps: any[]) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const from = value;
    const start = performance.now();
    const dur = 380;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return value;
}

export default function RecipeBuilder({
  recipe: initialRecipe,
  inventory,
  onSaveRecipe,
  onCompile,
}: RecipeBuilderProps) {
  const [recipe, setRecipe] = useState<RecipeDraft>({ ...initialRecipe });
  const [compiled, setCompiled] = useState<CompiledFormulaResult | null>(null);
  const [compilerTrace, setCompilerTrace] = useState<string[]>([]);
  const [compiling, setCompiling] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showAdvisor, setShowAdvisor] = useState(true);
  const [recommendations, setRecommendations] = useState<IngredientRecommendation[]>([]);

  const [selectedOilId, setSelectedOilId] = useState(INGREDIENT_CATALOG.filter((i) => i.type === "oil")[0].id);
  const [selectedLiquidId, setSelectedLiquidId] = useState(INGREDIENT_CATALOG.filter((i) => i.type === "liquid")[0].id);
  const [selectedAdditiveId, setSelectedAdditiveId] = useState(ADDITIVE_OPTIONS[0].id);

  const [addOilGrams, setAddOilGrams] = useState<number>(200);
  const [addAdditiveGrams, setAddAdditiveGrams] = useState<number>(15);

  const initialMode: "concentration" | "ratio" | "manual" =
    initialRecipe.lyeSettings.manualWaterGrams ? "manual" : initialRecipe.lyeSettings.waterToLyeRatio ? "ratio" : "concentration";
  const [waterMode, setWaterMode] = useState<"concentration" | "ratio" | "manual">(initialMode);

  useEffect(() => {
    setRecipe({ ...initialRecipe });
    setCompiled(null);
    setRecommendations([]);
    setCompilerTrace([]);
    setWaterMode(initialRecipe.lyeSettings.manualWaterGrams ? "manual" : initialRecipe.lyeSettings.waterToLyeRatio ? "ratio" : "concentration");
  }, [initialRecipe]);

  const triggerCompile = async (currentRecipe: RecipeDraft) => {
    setCompiling(true);
    try {
      const { result, trace } = await onCompile(currentRecipe);
      setCompiled(result);
      setCompilerTrace(trace);
      if (showAdvisor) {
        const recRes = await fetch("/api/recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ result, inventory }),
        });
        if (recRes.ok) setRecommendations(await recRes.json());
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      console.error("Compile error", err);
    } finally {
      setCompiling(false);
    }
  };

  // Single source of recompilation: a primitive signature of everything the
  // compile depends on. Using a string (not the lyeSettings object) means an
  // unchanged recipe never re-triggers — the compile only runs when the recipe
  // content actually changes. Debounced so typing a weight compiles once.
  const compileKey = JSON.stringify({
    lye: recipe.lyeSettings,
    oils: recipe.oils,
    liquids: recipe.liquids,
    additives: recipe.additives,
  });

  useEffect(() => {
    if (recipe.oils.length === 0) {
      setCompiled(null);
      return;
    }
    const id = setTimeout(() => triggerCompile(recipe), 180);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compileKey, showAdvisor]);

  const handleFieldChange = (field: keyof RecipeDraft, value: any) => {
    setRecipe({ ...recipe, [field]: value });
  };

  const handleLyeSettingsChange = (field: keyof typeof recipe.lyeSettings, value: any) => {
    setRecipe({ ...recipe, lyeSettings: { ...recipe.lyeSettings, [field]: value } });
  };

  const switchWaterMode = (mode: "concentration" | "ratio" | "manual") => {
    setWaterMode(mode);
    const ls = { ...recipe.lyeSettings };
    ls.lyeConcentrationPercent = mode === "concentration" ? ls.lyeConcentrationPercent || 30 : undefined;
    ls.waterToLyeRatio = mode === "ratio" ? ls.waterToLyeRatio || 2.3 : undefined;
    ls.manualWaterGrams = mode === "manual" ? ls.manualWaterGrams || compiled?.totalLiquidWeight || 250 : undefined;
    setRecipe({ ...recipe, lyeSettings: ls });
  };

  const handleAddOil = () => {
    const existing = recipe.oils.find((o) => o.ingredientId === selectedOilId);
    let newOils = [...recipe.oils];
    if (existing) newOils = newOils.map((o) => (o.ingredientId === selectedOilId ? { ...o, weightGrams: o.weightGrams + addOilGrams } : o));
    else newOils.push({ ingredientId: selectedOilId, weightGrams: addOilGrams });
    const updated = { ...recipe, oils: newOils };
    setRecipe(updated);
  };

  const handleAddLiquid = () => {
    const existing = recipe.liquids.find((l) => l.ingredientId === selectedLiquidId);
    let newLiquids = [...recipe.liquids];
    if (existing) newLiquids = newLiquids.map((l) => (l.ingredientId === selectedLiquidId ? { ...l, weightGrams: l.weightGrams + 1 } : l));
    else newLiquids.push({ ingredientId: selectedLiquidId, weightGrams: 1 });
    const updated = { ...recipe, liquids: newLiquids };
    setRecipe(updated);
  };

  const handleAddAdditive = () => {
    const existing = recipe.additives.find((a) => a.ingredientId === selectedAdditiveId);
    let newAdditives = [...recipe.additives];
    if (existing) newAdditives = newAdditives.map((a) => (a.ingredientId === selectedAdditiveId ? { ...a, weightGrams: a.weightGrams + addAdditiveGrams } : a));
    else newAdditives.push({ ingredientId: selectedAdditiveId, weightGrams: addAdditiveGrams });
    const updated = { ...recipe, additives: newAdditives };
    setRecipe(updated);
  };

  // Note: rows are NOT dropped when a weight hits 0 — that would delete the row
  // out from under the cursor while editing. Removal is only via the trash button.
  const updateOilWeight = (ingredientId: string, grams: number) => {
    const updatedOils = recipe.oils.map((o) => (o.ingredientId === ingredientId ? { ...o, weightGrams: Math.max(0, grams) } : o));
    setRecipe({ ...recipe, oils: updatedOils });
  };

  const updateLiquidShare = (ingredientId: string, parts: number) => {
    const updatedLiquids = recipe.liquids.map((l) => (l.ingredientId === ingredientId ? { ...l, weightGrams: Math.max(0, parts) } : l));
    setRecipe({ ...recipe, liquids: updatedLiquids });
  };

  const updateAdditiveWeight = (ingredientId: string, grams: number) => {
    const updatedAdditives = recipe.additives.map((a) => (a.ingredientId === ingredientId ? { ...a, weightGrams: Math.max(0, grams) } : a));
    setRecipe({ ...recipe, additives: updatedAdditives });
  };

  const removeOil = (ingredientId: string) => {
    const updated = { ...recipe, oils: recipe.oils.filter((o) => o.ingredientId !== ingredientId) };
    setRecipe(updated);
  };
  const removeLiquid = (ingredientId: string) => {
    const updated = { ...recipe, liquids: recipe.liquids.filter((l) => l.ingredientId !== ingredientId) };
    setRecipe(updated);
  };
  const removeAdditive = (ingredientId: string) => {
    const updated = { ...recipe, additives: recipe.additives.filter((a) => a.ingredientId !== ingredientId) };
    setRecipe(updated);
  };

  const handleScaleToTarget = (targetWeight: number) => {
    if (!compiled || compiled.totalBatchWeight <= 0) return;
    const factor = targetWeight / compiled.totalBatchWeight;
    const scale = (arr: { ingredientId: string; weightGrams: number }[]) =>
      arr.map((x) => ({ ...x, weightGrams: Math.round(x.weightGrams * factor * 10) / 10 }));
    const updated = {
      ...recipe,
      oils: scale(recipe.oils),
      additives: scale(recipe.additives),
    };
    // Liquid rows are proportional shares, so they don't scale with batch weight.
    setRecipe(updated);
  };

  const applyAdvisorSuggestion = (suggestion: IngredientRecommendation) => {
    if (suggestion.recommendationType === "add") {
      const ingType = INGREDIENT_CATALOG.find((i) => i.id === suggestion.ingredientId)?.type;
      let updated = { ...recipe };
      if (ingType === "oil") {
        const hasIt = recipe.oils.find((o) => o.ingredientId === suggestion.ingredientId);
        updated.oils = hasIt
          ? recipe.oils.map((o) => (o.ingredientId === suggestion.ingredientId ? { ...o, weightGrams: o.weightGrams + 50 } : o))
          : [...recipe.oils, { ingredientId: suggestion.ingredientId, weightGrams: 50 }];
      } else if (ingType === "liquid") {
        updated.liquids = [...recipe.liquids, { ingredientId: suggestion.ingredientId, weightGrams: 1 }];
      } else if (ingType === "additive") {
        updated.additives = [...recipe.additives, { ingredientId: suggestion.ingredientId, weightGrams: 10 }];
      }
      setRecipe(updated);
    } else if (suggestion.recommendationType === "reduce") {
      const updated = {
        ...recipe,
        oils: recipe.oils.map((o) => (o.ingredientId === suggestion.ingredientId ? { ...o, weightGrams: Math.max(10, o.weightGrams - 50) } : o)),
      };
      setRecipe(updated);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveRecipe({ ...recipe, status: compiled?.safetyReport.status || "draft" });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const totalOilWeight = recipe.oils.reduce((sum, o) => sum + o.weightGrams, 0);
  const isKOH = recipe.lyeSettings.alkaliType === AlkaliType.KOH;
  const lyeValue = compiled ? (isKOH ? compiled.lyeKOHWeight : compiled.lyeNaOHWeight) : 0;
  const animatedLye = useCountUp(lyeValue, [lyeValue]);

  const status = compiled?.safetyReport.status;
  const statusCls =
    status === "ready"
      ? "text-caustic border-caustic/50 bg-caustic/10"
      : status === "blocked"
      ? "text-danger border-danger/50 bg-danger/10"
      : status
      ? "text-warn border-warn/50 bg-warn/10"
      : "text-mute-2 border-line-dk bg-white/5";

  // Effective solvent grams per liquid (post-scaling), for display next to shares
  const liquidEffective: Record<string, number> = {};
  compiled?.liquidBreakdown.forEach((l) => (liquidEffective[l.ingredientId] = l.weight));

  const inputCls = "w-full border border-line bg-surface px-2.5 py-2 text-xs font-mono font-medium text-ink focus:outline-none focus:border-ink";
  const sectionCls = "border border-line bg-surface";

  return (
    <div className="space-y-6">
      {/* Name + actions */}
      <div className={`${sectionCls} p-5`}>
        <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-end">
          <div className="flex-1 min-w-0">
            <label className="eyebrow text-[9px] text-mute block mb-1.5">Recipe name</label>
            <input
              type="text"
              value={recipe.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className="w-full display text-xl text-ink bg-transparent border-b border-line focus:border-ink pb-1 outline-none"
              placeholder="Name this formula…"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handleFieldChange("favorite", !recipe.favorite)}
              className={`px-3 py-2 border flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide transition ${
                recipe.favorite ? "border-danger/40 text-danger bg-danger/5" : "border-line text-mute hover:text-ink hover:border-ink"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${recipe.favorite ? "fill-danger" : ""}`} />
              {recipe.favorite ? "Saved" : "Favorite"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-ink hover:bg-ink-2 text-white text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1.5 disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving…" : "Save recipe"}
            </button>
          </div>
        </div>
        <div className="mt-4">
          <label className="eyebrow text-[9px] text-mute block mb-1.5">Batch notes</label>
          <textarea
            value={recipe.notes || ""}
            onChange={(e) => handleFieldChange("notes", e.target.value)}
            rows={2}
            className="w-full border border-line px-3 py-2.5 text-xs text-ink/80 bg-paper/40 focus:outline-none focus:border-ink leading-relaxed"
            placeholder="Colorants, fragrance, mold lining, cure conditions…"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Worksheet */}
        <div className="lg:col-span-7 space-y-5">
          {/* Lye + water */}
          <div className={`${sectionCls} p-5 space-y-5`}>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="display text-sm uppercase tracking-wide text-ink">Lye &amp; water</h3>
              <span className="eyebrow text-[8.5px] text-mute">Step 01</span>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="eyebrow text-[9px] text-mute block mb-1.5">Alkali</label>
                <div className="flex border border-line">
                  {[
                    { t: AlkaliType.NaOH, l: "NaOH", s: "Solid bar" },
                    { t: AlkaliType.KOH, l: "KOH", s: "Liquid soap" },
                  ].map((a) => (
                    <button
                      key={a.t}
                      onClick={() => handleLyeSettingsChange("alkaliType", a.t)}
                      className={`flex-1 py-2 text-center transition ${
                        recipe.lyeSettings.alkaliType === a.t ? "bg-ink text-white" : "bg-surface text-mute hover:text-ink"
                      }`}
                    >
                      <span className="block font-mono text-xs font-semibold">{a.l}</span>
                      <span className="block text-[8.5px] uppercase tracking-wider opacity-70">{a.s}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <label className="eyebrow text-[9px] text-mute">Superfat</label>
                  <span className="font-mono text-xs font-semibold text-ink">{recipe.lyeSettings.superfatPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={recipe.lyeSettings.superfatPercent}
                  onChange={(e) => handleLyeSettingsChange("superfatPercent", Number(e.target.value))}
                  className="w-full accent-ink h-1 mt-3"
                />
                <p className="text-[10px] text-mute mt-1">Fat left unsaponified for a milder bar.</p>
              </div>
            </div>

            {isKOH && (
              <div className="border border-line bg-paper/40 p-3 grid grid-cols-2 gap-4 items-center">
                <div>
                  <span className="eyebrow text-[9px] text-ink">KOH purity</span>
                  <p className="text-[10px] text-mute mt-0.5">Flake KOH is usually ~90% pure. Corrected automatically.</p>
                </div>
                <select
                  value={recipe.lyeSettings.kohPurityPercent || 90}
                  onChange={(e) => handleLyeSettingsChange("kohPurityPercent", Number(e.target.value))}
                  className="font-mono text-xs font-semibold border border-line px-2 py-1.5 bg-surface text-ink focus:outline-none focus:border-ink"
                >
                  <option value={90}>90% — standard flakes</option>
                  <option value={95}>95% — high purity</option>
                  <option value={100}>100% — reagent</option>
                </select>
              </div>
            )}

            {/* Water mode */}
            <div className="pt-1">
              <div className="flex justify-between items-center mb-2.5">
                <label className="eyebrow text-[9px] text-mute">Water setting</label>
                <div className="flex border border-line">
                  {[
                    { k: "concentration", l: "Concentration" },
                    { k: "ratio", l: "Water:Lye" },
                    { k: "manual", l: "Manual" },
                  ].map((m) => (
                    <button
                      key={m.k}
                      onClick={() => switchWaterMode(m.k as any)}
                      className={`px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider transition ${
                        waterMode === m.k ? "bg-ink text-white" : "bg-surface text-mute hover:text-ink"
                      }`}
                    >
                      {m.l}
                    </button>
                  ))}
                </div>
              </div>

              {waterMode === "concentration" && (
                <div className="border border-line bg-paper/40 p-3.5">
                  <div className="flex justify-between text-xs font-semibold text-ink mb-2">
                    <span>Lye concentration</span>
                    <span className="font-mono">{recipe.lyeSettings.lyeConcentrationPercent || 30}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="45"
                    step="1"
                    value={recipe.lyeSettings.lyeConcentrationPercent || 30}
                    onChange={(e) => handleLyeSettingsChange("lyeConcentrationPercent", Number(e.target.value))}
                    className="w-full accent-ink h-1.5"
                  />
                  <div className="flex justify-between font-mono text-[8.5px] uppercase tracking-wider text-mute-2 pt-1.5">
                    <span>Soft 15–20</span>
                    <span>Standard 25–33</span>
                    <span>Fast 38–45</span>
                  </div>
                </div>
              )}

              {waterMode === "ratio" && (
                <div className="border border-line bg-paper/40 p-3.5">
                  <div className="flex justify-between text-xs font-semibold text-ink mb-2">
                    <span>Water to lye ratio</span>
                    <span className="font-mono">{(recipe.lyeSettings.waterToLyeRatio || 2.3).toFixed(2)} : 1</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="4.0"
                    step="0.1"
                    value={recipe.lyeSettings.waterToLyeRatio || 2.3}
                    onChange={(e) => handleLyeSettingsChange("waterToLyeRatio", Number(e.target.value))}
                    className="w-full accent-ink h-1.5"
                  />
                  <div className="flex justify-between font-mono text-[8.5px] uppercase tracking-wider text-mute-2 pt-1.5">
                    <span>Dense 1.5:1</span>
                    <span>Standard 2.3:1</span>
                    <span>Wet 3.5:1</span>
                  </div>
                </div>
              )}

              {waterMode === "manual" && (
                <div className="border border-line bg-paper/40 p-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-ink">Total solvent weight</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={recipe.lyeSettings.manualWaterGrams || 0}
                        onChange={(e) => handleLyeSettingsChange("manualWaterGrams", Math.max(0, Number(e.target.value)))}
                        className="w-24 border border-line bg-surface px-2 py-1.5 text-xs font-mono font-semibold text-center text-ink focus:outline-none focus:border-ink"
                      />
                      <span className="font-mono text-xs text-mute">g</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-mute mt-2">You set the exact solvent weight; concentration is derived from it.</p>
                </div>
              )}
            </div>
          </div>

          {/* Oils */}
          <div className={`${sectionCls} p-5 space-y-3`}>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="display text-sm uppercase tracking-wide text-ink">Oils &amp; butters</h3>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-ink">{totalOilWeight}g total</span>
                <span className="eyebrow text-[8.5px] text-mute">Step 02</span>
              </div>
            </div>

            {recipe.oils.length === 0 ? (
              <p className="text-xs text-mute py-3 text-center">No oils yet. Add at least one to compile.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="eyebrow text-[8.5px] text-mute-2 border-b border-line">
                    <th className="py-2 font-semibold">Oil</th>
                    <th className="py-2 text-center w-24 font-semibold">Grams</th>
                    <th className="py-2 text-center w-16 font-semibold">%</th>
                    <th className="py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {recipe.oils.map((o) => {
                    const item = INGREDIENT_CATALOG.find((i) => i.id === o.ingredientId);
                    const pct = totalOilWeight > 0 ? ((o.weightGrams / totalOilWeight) * 100).toFixed(1) : "0";
                    return (
                      <tr key={o.ingredientId} className="border-b border-line-2">
                        <td className="py-2.5 text-[13px] font-medium text-ink">{item?.name}</td>
                        <td className="py-2.5 text-center">
                          <NumberField
                            value={o.weightGrams}
                            onChange={(n) => updateOilWeight(o.ingredientId, n)}
                            min={0}
                            className="w-20 border border-line px-1.5 py-1 text-center font-mono text-xs text-ink focus:outline-none focus:border-ink"
                          />
                        </td>
                        <td className="py-2.5 text-center font-mono text-xs text-mute">{pct}</td>
                        <td className="py-2.5 text-right">
                          <button onClick={() => removeOil(o.ingredientId)} className="text-mute-2 hover:text-danger p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <AddRow
              options={INGREDIENT_CATALOG.filter((i) => i.type === "oil").map((o) => ({ id: o.id, label: `${o.name} · SAP ${o.sapNaOH}` }))}
              value={selectedOilId}
              onChange={setSelectedOilId}
              amount={addOilGrams}
              onAmount={setAddOilGrams}
              amountLabel="g"
              onAdd={handleAddOil}
            />
          </div>

          {/* Liquids */}
          <div className={`${sectionCls} p-5 space-y-3`}>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="display text-sm uppercase tracking-wide text-ink">Liquid</h3>
                <p className="text-[10px] text-mute mt-0.5">Chooses which solvent; the water setting sets the amount.</p>
              </div>
              <span className="eyebrow text-[8.5px] text-mute">Step 03</span>
            </div>

            {recipe.liquids.length === 0 ? (
              <p className="text-xs text-mute py-3 text-center">No liquid selected — plain distilled water is assumed.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="eyebrow text-[8.5px] text-mute-2 border-b border-line">
                    <th className="py-2 font-semibold">Liquid</th>
                    <th className="py-2 text-center w-20 font-semibold">Share</th>
                    <th className="py-2 text-center w-24 font-semibold">Weight</th>
                    <th className="py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {recipe.liquids.map((l) => {
                    const item = INGREDIENT_CATALOG.find((i) => i.id === l.ingredientId);
                    const totalParts = recipe.liquids.reduce((s, x) => s + x.weightGrams, 0);
                    const sharePct = totalParts > 0 ? Math.round((l.weightGrams / totalParts) * 100) : 0;
                    const eff = liquidEffective[l.ingredientId];
                    return (
                      <tr key={l.ingredientId} className="border-b border-line-2 align-top">
                        <td className="py-2.5">
                          <span className="text-[13px] font-medium text-ink">{item?.name}</span>
                          {item?.defaultHandlingWarning && (
                            <span className="flex gap-1.5 text-[10px] text-warn mt-1 leading-relaxed border-l-2 border-warn/40 pl-2 py-0.5">
                              {item.defaultHandlingWarning}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-center">
                          <NumberField
                            value={l.weightGrams}
                            onChange={(n) => updateLiquidShare(l.ingredientId, n)}
                            min={0}
                            className="w-16 border border-line px-1.5 py-1 text-center font-mono text-xs text-ink focus:outline-none focus:border-ink"
                          />
                          <span className="block font-mono text-[9px] text-mute-2 mt-0.5">{sharePct}%</span>
                        </td>
                        <td className="py-2.5 text-center font-mono text-xs text-ink">
                          {eff != null ? `${eff}g` : "—"}
                        </td>
                        <td className="py-2.5 text-right">
                          <button onClick={() => removeLiquid(l.ingredientId)} className="text-mute-2 hover:text-danger p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <AddRow
              options={INGREDIENT_CATALOG.filter((i) => i.type === "liquid").map((l) => ({ id: l.id, label: l.name }))}
              value={selectedLiquidId}
              onChange={setSelectedLiquidId}
              onAdd={handleAddLiquid}
              addOnly
            />
          </div>

          {/* Additives */}
          <div className={`${sectionCls} p-5 space-y-3`}>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="display text-sm uppercase tracking-wide text-ink">Additives</h3>
              <span className="eyebrow text-[8.5px] text-mute">Step 04</span>
            </div>

            {recipe.additives.length === 0 ? (
              <p className="text-xs text-mute py-3 text-center">No additives or fragrance.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="eyebrow text-[8.5px] text-mute-2 border-b border-line">
                    <th className="py-2 font-semibold">Additive</th>
                    <th className="py-2 text-center w-24 font-semibold">Grams</th>
                    <th className="py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {recipe.additives.map((a) => {
                    const item = ADDITIVE_CATALOG_BY_ID[a.ingredientId];
                    const legacyItem = INGREDIENT_CATALOG.find((i) => i.id === a.ingredientId);
                    return (
                      <tr key={a.ingredientId} className="border-b border-line-2 align-top">
                        <td className="py-2.5">
                          <span className="text-[13px] font-medium text-ink">{item?.name || legacyItem?.name}</span>
                          {item ? (
                            <span className="block font-mono text-[9px] uppercase tracking-wider text-mute mt-0.5">
                              {item.roles.slice(0, 4).join(" / ")} · {item.temperatureRequirement}
                            </span>
                          ) : legacyItem?.timing ? (
                            <span className="block font-mono text-[9px] uppercase tracking-wider text-mute mt-0.5">Add: {legacyItem.timing}</span>
                          ) : null}
                          {item?.reviewRequired && (
                            <span className="block text-[10px] text-warn mt-1 leading-relaxed border-l-2 border-warn/40 pl-2 py-0.5">
                              Review required before ready status.
                            </span>
                          )}
                          {legacyItem?.defaultHandlingWarning && (
                            <span className="flex gap-1.5 text-[10px] text-warn mt-1 leading-relaxed border-l-2 border-warn/40 pl-2 py-0.5">
                              {legacyItem.defaultHandlingWarning}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-center">
                          <NumberField
                            value={a.weightGrams}
                            onChange={(n) => updateAdditiveWeight(a.ingredientId, n)}
                            min={0}
                            className="w-20 border border-line px-1.5 py-1 text-center font-mono text-xs text-ink focus:outline-none focus:border-ink"
                          />
                        </td>
                        <td className="py-2.5 text-right">
                          <button onClick={() => removeAdditive(a.ingredientId)} className="text-mute-2 hover:text-danger p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            <AddRow
              options={ADDITIVE_OPTIONS}
              value={selectedAdditiveId}
              onChange={setSelectedAdditiveId}
              amount={addAdditiveGrams}
              onAmount={setAddAdditiveGrams}
              amountLabel="g"
              onAdd={handleAddAdditive}
            />
          </div>

          <MoldCalculator onScaleRecipe={handleScaleToTarget} currentBatchWeight={compiled?.totalBatchWeight} />
        </div>

        {/* Instrument readout */}
        <div className="lg:col-span-5">
          <div className="bg-ink text-white instrument-grid border border-ink-3 sticky top-4">
            <div className="scanline flex items-center justify-between px-5 py-4 border-b border-line-dk">
              <div>
                <h4 className="display text-[13px] uppercase tracking-widest text-white">Readout</h4>
                <p className="eyebrow text-[8px] text-mute-2 mt-1">Deterministic saponification</p>
              </div>
              <span className={`eyebrow text-[8.5px] px-2 py-1 border ${statusCls}`}>
                {status || "idle"}
              </span>
            </div>

            {compiling && !compiled ? (
              <div className="py-16 flex flex-col items-center gap-3 text-mute-2">
                <RefreshCw className="w-5 h-5 animate-spin text-caustic" />
                <p className="eyebrow text-[9px]">Compiling…</p>
              </div>
            ) : compiled ? (
              <div className="p-5 space-y-5">
                {/* Primary lye */}
                <div className="border border-ink-3 bg-ink-2 p-5 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-caustic" />
                  <span className="eyebrow text-[8.5px] text-caustic-dim">
                    {recipe.lyeSettings.alkaliType} required
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-mono text-5xl font-semibold text-caustic caustic-glow tabular-nums leading-none">
                      {animatedLye.toFixed(1)}
                    </span>
                    <span className="font-mono text-lg text-mute-2">g</span>
                  </div>
                  <p className="font-mono text-[10px] text-mute-2 mt-2">at {recipe.lyeSettings.superfatPercent}% superfat</p>
                </div>

                {/* Solvent + totals */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-ink-3 bg-ink-2 p-4">
                    <span className="eyebrow text-[8px] text-mute-2">Solvent</span>
                    <p className="font-mono text-2xl font-semibold text-white mt-1 tabular-nums">{compiled.totalLiquidWeight}<span className="text-sm text-mute-2 ml-0.5">g</span></p>
                    <p className="font-mono text-[9px] text-mute-2 mt-1">{compiled.calculatedLyeConcentrationPercent}% · {compiled.calculatedWaterToLyeRatio}:1</p>
                  </div>
                  <div className="border border-ink-3 bg-ink-2 p-4">
                    <span className="eyebrow text-[8px] text-mute-2">Batch total</span>
                    <p className="font-mono text-2xl font-semibold text-white mt-1 tabular-nums">{compiled.totalBatchWeight}<span className="text-sm text-mute-2 ml-0.5">g</span></p>
                    <p className="font-mono text-[9px] text-mute-2 mt-1">{compiled.totalOilWeight}g oils</p>
                  </div>
                </div>

                {/* Fingerprint */}
                <div className="flex justify-between items-center border border-ink-3 px-3 py-2">
                  <span className="eyebrow text-[8px] text-mute-2">Fingerprint</span>
                  <span className="font-mono text-[10px] text-caustic-dim">{compiled.recipeHash}</span>
                </div>

                {/* Safety */}
                {compiled.safetyReport.warnings.length > 0 && (
                  <div className="space-y-2.5 border-t border-line-dk pt-4">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-warn" />
                      <span className="eyebrow text-[9px] text-white">Safety checks</span>
                    </div>
                    {compiled.safetyReport.warnings.map((warn) => {
                      const danger = warn.severity === SafetySeverity.DANGER || warn.severity === SafetySeverity.BLOCKED;
                      return (
                        <div
                          key={warn.id}
                          className={`border-l-2 pl-3 py-1.5 ${danger ? "border-danger" : "border-warn"}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={`eyebrow text-[8px] ${danger ? "text-danger" : "text-warn"}`}>{warn.severity}</span>
                          </div>
                          <p className="text-[11px] text-white/80 leading-relaxed font-sans">{warn.message}</p>
                          {warn.sourceRefs?.length > 0 && (
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                              {warn.sourceRefs.map((ref, i) => (
                                <a key={i} href={ref.url} target="_blank" rel="noreferrer" className="font-mono text-[9px] text-mute-2 hover:text-caustic-dim inline-flex items-center gap-0.5">
                                  {ref.label}
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <AdditiveChemistryPanel result={compiled} />

                {/* Advisor */}
                <div className="border-t border-line-dk pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-caustic" />
                      <span className="eyebrow text-[9px] text-white">Formulation advisor</span>
                    </div>
                    <label className="flex items-center gap-1.5 eyebrow text-[8.5px] text-mute-2 cursor-pointer">
                      <input type="checkbox" checked={showAdvisor} onChange={(e) => setShowAdvisor(e.target.checked)} className="accent-caustic" />
                      On
                    </label>
                  </div>
                  <p className="text-[9.5px] text-mute-2 -mt-1">Rule-based suggestions from your recipe and inventory.</p>

                  {showAdvisor && recommendations.length > 0 ? (
                    <div className="space-y-2.5">
                      {recommendations.map((rec) => (
                        <div key={rec.id} className="border border-ink-3 bg-ink-2 p-3 space-y-2">
                          <p className="text-[11.5px] text-white/85 leading-relaxed font-sans">{rec.reason}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {rec.expectedEffect.map((eff, i) => (
                              <span key={i} className="font-mono text-[8.5px] text-caustic-dim border border-caustic-dim/30 px-1.5 py-0.5">+ {eff}</span>
                            ))}
                          </div>
                          <button
                            onClick={() => applyAdvisorSuggestion(rec)}
                            className="w-full bg-caustic text-ink font-semibold uppercase tracking-wide text-[9.5px] py-1.5 hover:bg-caustic-dim transition"
                          >
                            Apply suggestion
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : showAdvisor ? (
                    <p className="text-[11px] text-mute-2 italic">No adjustments suggested — this profile sits inside its ideal bands.</p>
                  ) : null}
                </div>

                {/* Trace */}
                <details className="border-t border-line-dk pt-4 group">
                  <summary className="flex items-center gap-1.5 cursor-pointer list-none">
                    <Terminal className="w-3.5 h-3.5 text-caustic" />
                    <span className="eyebrow text-[9px] text-white">Compiler trace</span>
                    <span className="font-mono text-[9px] text-mute-2 ml-auto group-open:hidden">show</span>
                    <span className="font-mono text-[9px] text-mute-2 ml-auto hidden group-open:inline">hide</span>
                  </summary>
                  <div className="mt-2 border border-ink-3 bg-black/40 p-3 max-h-40 overflow-y-auto scroll-thin font-mono text-[9.5px] leading-relaxed text-caustic-dim/90">
                    {compilerTrace.map((line, idx) => (
                      <p key={idx} className="whitespace-pre-wrap">› {line}</p>
                    ))}
                  </div>
                </details>
              </div>
            ) : (
              <div className="py-16 px-5 text-center text-mute-2">
                <p className="text-xs">Add oils to run the saponification compile.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quality */}
      {compiled && (
        <div className={`${sectionCls} p-6`}>
          <QualityPredictor prediction={compiled.qualityPrediction} />
        </div>
      )}
    </div>
  );
}

function AdditiveChemistryPanel({ result }: { result: CompiledFormulaResult }) {
  const report = result.additiveChemistryReport;
  if (!report.ledger.length) {
    return (
      <div className="border-t border-line-dk pt-4">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-caustic" />
          <span className="eyebrow text-[9px] text-white">Additive chemistry</span>
        </div>
        <p className="text-[11px] text-mute-2 mt-2">No additive ledger entries in this compile.</p>
      </div>
    );
  }

  const criticalNotices = [...report.hazards, ...report.unknownInteractions]
    .filter((item) => item.severity === SafetySeverity.BLOCKED || item.severity === SafetySeverity.DANGER)
    .slice(0, 4);
  const regularNotices = [...report.synergies, ...report.hazards, ...report.unknownInteractions]
    .filter((item) => item.severity !== SafetySeverity.BLOCKED && item.severity !== SafetySeverity.DANGER)
    .slice(0, 5);

  return (
    <div className="border-t border-line-dk pt-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-caustic" />
          <span className="eyebrow text-[9px] text-white">Additive chemistry</span>
        </div>
        <span className="font-mono text-[9px] text-mute-2">{report.ledger.length} actors</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ReadoutStat label="free water" value={`${report.solventImpact.freeWaterGrams}g`} sub={`added ${report.solventImpact.requiredAddedWaterGrams}g`} />
        <ReadoutStat label="alkali comp" value={`+${report.alkaliCompensation.naohGrams || report.alkaliCompensation.kohGrams}g`} sub={result.lyeKOHWeight > 0 ? "KOH" : "NaOH"} />
        <ReadoutStat label="solids" value={`${report.solidsLoad.percentOfOils}%`} sub={`${report.solidsLoad.insolubleSolidsGrams}g`} />
        <ReadoutStat label="heat score" value={`${report.sugarProteinHeatRisk.heatRiskScore}`} sub={`${report.sugarProteinHeatRisk.sugarPercentOfOils}% sugar`} />
        <ReadoutStat label="salt load" value={`${report.saltChelation.saltPercentOfOils}%`} sub={`${report.saltChelation.chelatorGrams}g chelator`} />
        <ReadoutStat label="review flags" value={`${report.fragrancePigmentReview.filter((item) => item.reviewRequired).length}`} sub="supplier/safety" />
      </div>

      {report.ledger.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {report.ledger.slice(0, 8).map((item) => (
            <span key={item.additiveId} className="font-mono text-[8.5px] text-caustic-dim border border-caustic-dim/30 px-1.5 py-0.5">
              {item.name}: {item.grams}g
            </span>
          ))}
        </div>
      )}

      {criticalNotices.length > 0 && (
        <div className="space-y-1.5">
          {criticalNotices.map((item) => (
            <p key={item.id} className="border-l-2 border-danger pl-2 text-[10.5px] text-white/85 leading-relaxed">
              <span className="eyebrow text-[8px] text-danger mr-1">{item.severity}</span>
              {item.message}
            </p>
          ))}
        </div>
      )}

      {regularNotices.length > 0 && (
        <details className="group">
          <summary className="list-none cursor-pointer flex items-center justify-between text-[10px] text-mute-2">
            <span>Synergies, warnings, and unknowns</span>
            <span className="font-mono group-open:hidden">show</span>
            <span className="font-mono hidden group-open:inline">hide</span>
          </summary>
          <div className="mt-2 space-y-1.5">
            {regularNotices.map((item) => (
              <p key={item.id} className="text-[10.5px] text-white/75 leading-relaxed">
                <span className="font-mono text-caustic-dim">{item.id}</span> · {item.message}
              </p>
            ))}
          </div>
        </details>
      )}

      <details className="group">
        <summary className="list-none cursor-pointer flex items-center justify-between text-[10px] text-mute-2">
          <span>Required handling temperatures</span>
          <span className="font-mono group-open:hidden">show</span>
          <span className="font-mono hidden group-open:inline">hide</span>
        </summary>
        <div className="mt-2 space-y-1.5">
          {report.handlingRequirements.slice(0, 8).map((item) => (
            <p key={item.additiveId} className="text-[10.5px] text-white/75 leading-relaxed">
              <span className="font-mono text-caustic-dim">{additiveDisplayName(item.additiveId)}</span> · {item.temperatureRequirement} · {item.processPhase}
              {item.missingPreparedStates.length > 0 ? ` · missing ${item.missingPreparedStates.join(", ")}` : ""}
            </p>
          ))}
        </div>
      </details>
    </div>
  );
}

function ReadoutStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-ink-3 bg-ink-2 p-2.5 min-w-0">
      <span className="eyebrow text-[7.5px] text-mute-2">{label}</span>
      <p className="font-mono text-sm font-semibold text-white mt-0.5 truncate">{value}</p>
      <p className="font-mono text-[8.5px] text-mute-2 truncate">{sub}</p>
    </div>
  );
}

/** Reusable "select ingredient + amount + add" row. */
function AddRow({
  options,
  value,
  onChange,
  amount,
  onAmount,
  amountLabel,
  onAdd,
  addOnly,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  amount?: number;
  onAmount?: (n: number) => void;
  amountLabel?: string;
  onAdd: () => void;
  addOnly?: boolean;
}) {
  return (
    <div className="flex gap-2 pt-2 border-t border-line">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border border-line px-2.5 py-2 text-xs font-medium bg-surface text-ink focus:outline-none focus:border-ink"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      {!addOnly && (
        <div className="relative w-24">
          <NumberField
            value={amount ?? 0}
            onChange={(n) => onAmount?.(n)}
            min={0}
            className="w-full border border-line px-2 py-2 text-xs font-mono font-semibold text-center bg-surface text-ink focus:outline-none focus:border-ink"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-mute-2 pointer-events-none">{amountLabel}</span>
        </div>
      )}
      <button onClick={onAdd} className="bg-ink hover:bg-ink-2 text-white px-3 py-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide">
        <Plus className="w-3.5 h-3.5" />
        Add
      </button>
    </div>
  );
}
