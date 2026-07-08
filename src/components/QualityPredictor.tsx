/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { QualityPrediction, ScoreBand, MetricKey, FattyAcidProfile } from "../types";
import { METRIC_SPECS } from "../lib/soapEngine";

interface QualityPredictorProps {
  prediction: QualityPrediction;
}

const METRIC_ORDER: MetricKey[] = [
  "hardness",
  "conditioning",
  "cleansing",
  "bubblyLather",
  "creamyLather",
  "longevity",
];

// Colour is derived from status + concern, never from the raw value, so an
// in-band reading can never render as a warning.
function tone(band: ScoreBand): { accent: string; chipText: string; chipCls: string } {
  if (band.status === "on-target") {
    return {
      accent: "var(--color-caustic)",
      chipText: "On target",
      chipCls: "text-caustic-dim border-caustic-dim/40 bg-caustic/10",
    };
  }
  if (band.concern) {
    return {
      accent: "var(--color-warn)",
      chipText: band.status === "above" ? "Runs high" : "Runs low",
      chipCls: "text-warn border-warn/40 bg-warn/10",
    };
  }
  // Out of band but benign (e.g. very conditioning)
  return {
    accent: "var(--color-cool)",
    chipText: band.status === "above" ? "Rich" : "Gentle",
    chipCls: "text-cool border-cool/40 bg-cool/10",
  };
}

function Gauge({ metricKey, band }: { metricKey: MetricKey; band: ScoreBand }) {
  const spec = METRIC_SPECS[metricKey];
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const scorePos = clamp(band.score);
  const bandLeft = clamp(band.idealMin);
  const bandRight = clamp(band.idealMax);
  const t = tone(band);

  return (
    <div className="border-t border-line py-4 first:border-t-0">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h4 className="display text-[13px] uppercase tracking-wide text-ink leading-none">
            {spec.label}
          </h4>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-mute mt-1 truncate">
            {spec.drivers}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-2xl font-semibold text-ink leading-none tabular-nums">
            {band.score}
          </span>
          <span
            className={`eyebrow text-[8.5px] px-1.5 py-0.5 border ${t.chipCls}`}
          >
            {t.chipText}
          </span>
        </div>
      </div>

      {/* Calibrated track: the caustic band is the target zone; the tick shows where you land */}
      <div className="relative mt-3 h-6">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-line-2" />
        {/* ideal band */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-[7px]"
          style={{
            left: `${bandLeft}%`,
            width: `${Math.max(0.5, bandRight - bandLeft)}%`,
            background: "color-mix(in oklab, var(--color-caustic) 26%, transparent)",
            borderLeft: "1.5px solid var(--color-caustic)",
            borderRight: "1.5px solid var(--color-caustic)",
          }}
        />
        {/* tick */}
        <div
          className="absolute top-1/2 -translate-y-1/2 tick-in"
          style={{ left: `${scorePos}%` }}
        >
          <div
            className="w-[3px] h-5 -translate-x-1/2"
            style={{ background: t.accent, boxShadow: `0 0 8px ${t.accent}` }}
          />
        </div>
        {/* ideal endpoints labels */}
        <span
          className="absolute -bottom-0.5 font-mono text-[8px] text-mute-2 -translate-x-1/2"
          style={{ left: `${bandLeft}%` }}
        >
          {spec.idealMin}
        </span>
        <span
          className="absolute -bottom-0.5 font-mono text-[8px] text-mute-2 -translate-x-1/2"
          style={{ left: `${bandRight}%` }}
        >
          {spec.idealMax}
        </span>
      </div>

      <p className="text-[11px] text-mute leading-relaxed mt-3">{spec.description}</p>
    </div>
  );
}

// Composition spectrum: saturated vs unsaturated split of the recipe's oils.
const ACID_SEGMENTS: { key: keyof FattyAcidProfile; label: string; group: "sat" | "unsat" }[] = [
  { key: "lauric", label: "Lauric", group: "sat" },
  { key: "myristic", label: "Myristic", group: "sat" },
  { key: "palmitic", label: "Palmitic", group: "sat" },
  { key: "stearic", label: "Stearic", group: "sat" },
  { key: "oleic", label: "Oleic", group: "unsat" },
  { key: "ricinoleic", label: "Ricinoleic", group: "unsat" },
  { key: "linoleic", label: "Linoleic", group: "unsat" },
  { key: "linolenic", label: "Linolenic", group: "unsat" },
];

function Spectrum({ profile }: { profile: FattyAcidProfile }) {
  const satShades = ["#c7f03d", "#a9cf34", "#8bae2b", "#6d8d22"];
  const unsatShades = ["#3d4551", "#4b5563", "#657085", "#8b95a3"];
  let satI = 0;
  let unsatI = 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="eyebrow text-[9px] text-mute">Fatty-acid spectrum</span>
        <span className="font-mono text-[10px] text-mute">
          <span className="text-caustic-dim">{profile.saturated}% sat</span>
          <span className="text-mute-2 mx-1">·</span>
          <span className="text-ink">{profile.unsaturated}% unsat</span>
        </span>
      </div>
      <div className="flex h-3.5 w-full overflow-hidden border border-line bg-line-2">
        {ACID_SEGMENTS.map((seg) => {
          const val = profile[seg.key] as number;
          if (val <= 0) return null;
          const color = seg.group === "sat" ? satShades[satI++ % satShades.length] : unsatShades[unsatI++ % unsatShades.length];
          return (
            <div
              key={seg.key}
              title={`${seg.label} ${val}%`}
              style={{ width: `${val}%`, background: color }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {ACID_SEGMENTS.filter((s) => (profile[s.key] as number) > 0).map((seg) => (
          <span key={seg.key} className="font-mono text-[9px] text-mute">
            <span
              className="inline-block w-2 h-2 mr-1 align-middle"
              style={{ background: seg.group === "sat" ? "var(--color-caustic-dim)" : "#657085" }}
            />
            {seg.label} {profile[seg.key] as number}%
          </span>
        ))}
      </div>
    </div>
  );
}

export default function QualityPredictor({ prediction }: QualityPredictorProps) {
  const trace = prediction.traceSpeedRisk;
  const traceTone = tone(trace);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Gauges */}
      <div className="lg:col-span-8">
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="display text-lg text-ink">Predicted bar character</h3>
          <span className="eyebrow text-[9px] text-mute">Calibrated to ideal bands</span>
        </div>
        <p className="text-xs text-mute mb-2">
          Each reading is placed against its ideal range. A tick inside the lit band is on target.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          {METRIC_ORDER.map((k) => (
            <Gauge key={k} metricKey={k} band={prediction[k]} />
          ))}
        </div>
      </div>

      {/* Side rail: trace-speed + spectrum + insights */}
      <div className="lg:col-span-4 space-y-6">
        <div className="border border-line bg-surface p-5">
          <span className="eyebrow text-[9px] text-mute">Working time</span>
          <div className="flex items-end justify-between mt-2">
            <h4 className="display text-sm text-ink">Trace speed</h4>
            <span className="font-mono text-3xl font-semibold text-ink leading-none tabular-nums">
              {trace.score}
            </span>
          </div>
          <div className="relative mt-3 h-4">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-line-2" />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-[7px]"
              style={{
                left: 0,
                width: `${Math.min(100, trace.idealMax)}%`,
                background: "color-mix(in oklab, var(--color-caustic) 22%, transparent)",
              }}
            />
            <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${Math.min(100, trace.score)}%` }}>
              <div
                className="w-[3px] h-4 -translate-x-1/2"
                style={{ background: traceTone.accent, boxShadow: `0 0 8px ${traceTone.accent}` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-mute leading-relaxed mt-3">
            {METRIC_SPECS.traceSpeedRisk.description}
          </p>
        </div>

        <div className="border border-line bg-surface p-5">
          <Spectrum profile={prediction.fattyAcidProfile} />
        </div>

        {prediction.notes.length > 0 && (
          <div className="border-l-2 border-caustic bg-surface border-y border-r border-line p-5">
            <span className="eyebrow text-[9px] text-mute">Formulation notes</span>
            <ul className="mt-2 space-y-2">
              {prediction.notes.map((note, idx) => (
                <li key={idx} className="text-[11.5px] text-ink/80 leading-relaxed flex gap-2">
                  <span className="text-caustic-dim font-mono mt-px">›</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
