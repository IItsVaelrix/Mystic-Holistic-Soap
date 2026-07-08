/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { MoldShape } from "../types";
import NumberField from "./NumberField";

interface MoldCalculatorProps {
  onScaleRecipe: (targetBatchWeight: number) => void;
  currentBatchWeight?: number;
}

export default function MoldCalculator({ onScaleRecipe, currentBatchWeight }: MoldCalculatorProps) {
  // Metric throughout: lengths in cm, volume in ml (1 cm³ = 1 ml), weight in g.
  const [shape, setShape] = useState<MoldShape>(MoldShape.RECTANGULAR);
  const [length, setLength] = useState(25);
  const [width, setWidth] = useState(9);
  const [height, setHeight] = useState(7);
  const [radius, setRadius] = useState(4);
  const [cylinderHeight, setCylinderHeight] = useState(30);
  const [cavities, setCavities] = useState(6);
  const [cavityVolume, setCavityVolume] = useState(100);
  const [customVolume, setCustomVolume] = useState(1000);
  const [fillPercent, setFillPercent] = useState(100);

  const [volumeMl, setVolumeMl] = useState(0);
  const [estBatchWeight, setEstBatchWeight] = useState(0);

  useEffect(() => {
    let volume = 0; // cm³ = ml
    if (shape === MoldShape.RECTANGULAR) {
      volume = length * width * height;
    } else if (shape === MoldShape.CYLINDER) {
      volume = Math.PI * Math.pow(radius, 2) * cylinderHeight;
    } else if (shape === MoldShape.CAVITY) {
      volume = cavities * cavityVolume;
    } else if (shape === MoldShape.CUSTOM) {
      volume = customVolume;
    }
    volume = volume * (fillPercent / 100);
    setVolumeMl(Math.round(volume));
    setEstBatchWeight(Math.round(volume * 0.95)); // ~0.95 g soap batter / ml
  }, [shape, length, width, height, radius, cylinderHeight, cavities, cavityVolume, customVolume, fillPercent]);

  const numInput =
    "w-full border border-line px-2.5 py-2 text-xs font-mono font-semibold bg-surface text-ink focus:outline-none focus:border-ink";
  const fieldLabel = "eyebrow text-[8.5px] text-mute block mb-1";

  return (
    <div className="border border-line bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <h3 className="display text-sm uppercase tracking-wide text-ink">Mold &amp; yield</h3>
          <p className="text-[10px] text-mute mt-0.5">Scale the batch to fill a mold exactly.</p>
        </div>
        <span className="eyebrow text-[8.5px] text-mute">Step 05</span>
      </div>

      <div>
        <label className={fieldLabel}>Geometry</label>
        <select value={shape} onChange={(e) => setShape(e.target.value as MoldShape)} className={numInput + " font-sans"}>
          <option value={MoldShape.RECTANGULAR}>Rectangular loaf / slab</option>
          <option value={MoldShape.CYLINDER}>PVC pipe / cylinder</option>
          <option value={MoldShape.CAVITY}>Multi-cavity silicone</option>
          <option value={MoldShape.CUSTOM}>Custom volume</option>
        </select>
      </div>

      <div className="border border-line bg-paper/40 p-4 space-y-3">
        {shape === MoldShape.RECTANGULAR && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { l: "Length (cm)", v: length, s: setLength },
              { l: "Width (cm)", v: width, s: setWidth },
              { l: "Height (cm)", v: height, s: setHeight },
            ].map((f) => (
              <div key={f.l}>
                <label className={fieldLabel}>{f.l}</label>
                <NumberField value={f.v} onChange={f.s} min={0.1} step="0.1" className={numInput} />
              </div>
            ))}
          </div>
        )}
        {shape === MoldShape.CYLINDER && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabel}>Radius (cm)</label>
              <NumberField value={radius} onChange={setRadius} min={0.1} step="0.1" className={numInput} />
            </div>
            <div>
              <label className={fieldLabel}>Height (cm)</label>
              <NumberField value={cylinderHeight} onChange={setCylinderHeight} min={0.1} step="0.1" className={numInput} />
            </div>
          </div>
        )}
        {shape === MoldShape.CAVITY && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={fieldLabel}>Cavities</label>
              <NumberField value={cavities} onChange={setCavities} min={1} step="1" className={numInput} />
            </div>
            <div>
              <label className={fieldLabel}>Volume / cavity (ml)</label>
              <NumberField value={cavityVolume} onChange={setCavityVolume} min={1} className={numInput} />
            </div>
          </div>
        )}
        {shape === MoldShape.CUSTOM && (
          <div>
            <label className={fieldLabel}>Target volume (ml)</label>
            <NumberField value={customVolume} onChange={setCustomVolume} min={10} className={numInput} />
          </div>
        )}

        <div className="pt-2 border-t border-line">
          <div className="flex justify-between items-center mb-1.5">
            <label className={fieldLabel + " mb-0"}>Fill level</label>
            <span className="font-mono text-xs text-ink">{fillPercent}%</span>
          </div>
          <input type="range" min="50" max="110" step="5" value={fillPercent} onChange={(e) => setFillPercent(Number(e.target.value))} className="w-full accent-ink h-1" />
        </div>
      </div>

      {/* Yield */}
      <div className="grid grid-cols-2 border border-ink-3 bg-ink text-white divide-x divide-line-dk">
        <div className="p-4">
          <span className="eyebrow text-[8px] text-mute-2 block">Mold volume</span>
          <span className="font-mono text-xl font-semibold text-white mt-1 block tabular-nums">
            {volumeMl}<span className="text-xs text-mute-2 ml-1">ml</span>
          </span>
        </div>
        <div className="p-4">
          <span className="eyebrow text-[8px] text-mute-2 block">Target batch</span>
          <span className="font-mono text-xl font-semibold text-caustic mt-1 block tabular-nums">
            {estBatchWeight}<span className="text-xs text-mute-2 ml-1">g</span>
          </span>
        </div>
      </div>

      <button
        onClick={() => onScaleRecipe(estBatchWeight)}
        disabled={estBatchWeight <= 0}
        className="w-full bg-ink hover:bg-ink-2 text-white text-[11px] font-semibold uppercase tracking-wide py-3 flex items-center justify-center gap-1.5 disabled:opacity-50"
      >
        Scale recipe to this mold
        <ChevronRight className="w-4 h-4" />
      </button>
      {currentBatchWeight && currentBatchWeight > 0 ? (
        <p className="font-mono text-[10px] text-mute text-center">current batch: {currentBatchWeight}g</p>
      ) : null}
    </div>
  );
}
