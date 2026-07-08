/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { InventoryItem } from "../types";
import { INGREDIENT_CATALOG } from "../lib/soapEngine";
import NumberField from "./NumberField";

/**
 * Editable quantity cell. Edits are held locally and committed once — on blur or
 * Enter — so typing never round-trips to the server per keystroke (which made the
 * amount "refresh"/jump as the controlled value fought the input). Empty or
 * invalid input reverts to the last saved value.
 */
function QuantityCell({ item, onCommit }: { item: InventoryItem; onCommit: (id: string, quantity: number) => void }) {
  const [val, setVal] = useState(String(item.quantity));

  // Re-sync when the saved value changes (e.g. after a commit or external edit).
  useEffect(() => {
    setVal(String(item.quantity));
  }, [item.quantity]);

  const commit = () => {
    const n = Number(val);
    if (!Number.isFinite(n) || n < 0) {
      setVal(String(item.quantity)); // revert invalid/empty input
      return;
    }
    if (n !== item.quantity) onCommit(item.id, n);
  };

  return (
    <input
      type="number"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className="w-16 text-center border border-line px-1 py-1 font-mono text-xs text-ink focus:outline-none focus:border-ink"
    />
  );
}

interface InventoryManagerProps {
  inventory: InventoryItem[];
  onAddStock: (item: Omit<InventoryItem, "id">) => Promise<void>;
  onUpdateStock: (id: string, quantity: number) => Promise<void>;
  onDeleteStock: (id: string) => Promise<void>;
}

export default function InventoryManager({ inventory, onAddStock, onUpdateStock, onDeleteStock }: InventoryManagerProps) {
  const [selectedIngredientId, setSelectedIngredientId] = useState(INGREDIENT_CATALOG[0].id);
  const [quantity, setQuantity] = useState(1000);
  const [unit, setUnit] = useState<InventoryItem["unit"]>("g");
  const [costCents, setCostCents] = useState(1200);
  const [expirationDate, setExpirationDate] = useState("2027-12-31");
  const [supplier, setSupplier] = useState("Wholesale Soap Co.");
  const [lotNumber, setLotNumber] = useState("LOT-" + Math.floor(1000 + Math.random() * 9000));
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ing = INGREDIENT_CATALOG.find((i) => i.id === selectedIngredientId);
      await onAddStock({ ingredientId: selectedIngredientId, displayName: ing?.name || "Ingredient", quantity, unit, costCents, expirationDate, supplier, lotNumber });
      setLotNumber("LOT-" + Math.floor(1000 + Math.random() * 9000));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fieldLabel = "eyebrow text-[8.5px] text-mute block mb-1";
  const input = "w-full border border-line px-2.5 py-2 text-xs font-mono font-medium bg-surface text-ink focus:outline-none focus:border-ink";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Add form */}
      <div className="lg:col-span-1 border border-line bg-surface p-5 h-fit">
        <div className="border-b border-line pb-3 mb-4">
          <h3 className="display text-sm uppercase tracking-wide text-ink">Add stock</h3>
          <p className="text-[10px] text-mute mt-0.5">Register a physical material lot.</p>
        </div>
        <form onSubmit={handleAdd} className="space-y-3.5">
          <div>
            <label className={fieldLabel}>Material</label>
            <select value={selectedIngredientId} onChange={(e) => setSelectedIngredientId(e.target.value)} className={input + " font-sans"}>
              {INGREDIENT_CATALOG.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} · {ing.type}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabel}>Quantity</label>
              <NumberField value={quantity} onChange={setQuantity} min={0} className={input} />
            </div>
            <div>
              <label className={fieldLabel}>Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value as InventoryItem["unit"])} className={input}>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="oz">oz</option>
                <option value="lb">lb</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabel}>Cost (cents)</label>
              <NumberField value={costCents} onChange={setCostCents} min={0} className={input} />
              <span className="font-mono text-[9px] text-mute-2 mt-0.5 block">= ${(costCents / 100).toFixed(2)}</span>
            </div>
            <div>
              <label className={fieldLabel}>Lot number</label>
              <input type="text" required value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} className={input} />
            </div>
          </div>
          <div>
            <label className={fieldLabel}>Supplier</label>
            <input type="text" required value={supplier} onChange={(e) => setSupplier(e.target.value)} className={input + " font-sans"} />
          </div>
          <div>
            <label className={fieldLabel}>Expiration</label>
            <input type="date" required value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className={input} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-ink hover:bg-ink-2 text-white text-[11px] font-semibold uppercase tracking-wide py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-60">
            <Plus className="w-3.5 h-3.5" /> Add to inventory
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="lg:col-span-2 border border-line bg-surface p-5">
        <div className="flex items-center justify-between border-b border-line pb-3 mb-1">
          <div>
            <h3 className="display text-sm uppercase tracking-wide text-ink">Materials on hand</h3>
            <p className="text-[10px] text-mute mt-0.5">Editable quantities with lot traceability.</p>
          </div>
          <span className="font-mono text-[10px] text-ink border border-line px-2 py-0.5">{inventory.length} items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="eyebrow text-[8px] text-mute-2 border-b border-line">
                <th className="py-2.5 pr-2 font-semibold">Material</th>
                <th className="py-2.5 px-2 font-semibold">Quantity</th>
                <th className="py-2.5 px-2 font-semibold hidden sm:table-cell">Lot</th>
                <th className="py-2.5 px-2 font-semibold hidden md:table-cell">Exp / supplier</th>
                <th className="py-2.5 pl-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-mute text-xs">No stock recorded yet.</td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const isLow = item.quantity < 500 && (item.unit === "g" || item.unit === "ml");
                  const type = INGREDIENT_CATALOG.find((c) => c.id === item.ingredientId)?.type || "additive";
                  return (
                    <tr key={item.id} className="border-b border-line-2 align-top">
                      <td className="py-3 pr-2">
                        <p className="text-[13px] font-medium text-ink">{item.displayName}</p>
                        <span className="eyebrow text-[8px] text-mute-2">{type}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1.5">
                          <QuantityCell item={item} onCommit={onUpdateStock} />
                          <span className="font-mono text-[10px] text-mute">{item.unit}</span>
                        </div>
                        {isLow && (
                          <span className="inline-flex items-center gap-0.5 mt-1 font-mono text-[8.5px] uppercase text-warn border border-warn/30 bg-warn/10 px-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> low
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell">
                        <p className="font-mono text-[11px] text-ink">{item.lotNumber || "—"}</p>
                        <p className="font-mono text-[8.5px] text-mute-2">{item.id.substring(0, 10)}</p>
                      </td>
                      <td className="py-3 px-2 hidden md:table-cell font-mono text-[10px] text-mute">
                        <p className="text-ink/80">{item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : "no exp"}</p>
                        <p>{item.supplier || "unknown"}</p>
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <button onClick={() => onDeleteStock(item.id)} className="text-mute-2 hover:text-danger p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
