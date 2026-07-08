/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Fragment, useState } from "react";
import { FlaskConical, AlertTriangle, ExternalLink, BookOpen, ChevronRight } from "lucide-react";
import { ALCHEMY_CATALOG } from "../lib/alchemyCatalog";
import { AlchemyEntry, GlossaryTerm, RecipeDraft } from "../types";
import DifficultyBadge from "./DifficultyBadge";

interface AlchemyLabProps {
  onLoadStarter: (draft: RecipeDraft) => void;
}

/** Escape a string for safe use inside a RegExp. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Renders plain text, wrapping any whole-word occurrence of a glossary term
 * (case-insensitive) in an `<abbr>` with the definition as its native tooltip.
 */
function GlossaryText({ text, glossary }: { text: string; glossary?: GlossaryTerm[] }) {
  if (!glossary || glossary.length === 0) {
    return <>{text}</>;
  }

  // Longest term first so overlapping terms (e.g. "trace" vs "light trace")
  // don't get partially shadowed by a shorter match.
  const terms = [...glossary].sort((a, b) => b.term.length - a.term.length);
  const pattern = new RegExp(`\\b(${terms.map((t) => escapeRegExp(t.term)).join("|")})\\b`, "gi");

  const parts = text.split(pattern);
  if (parts.length === 1) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, idx) => {
        const match = terms.find((t) => t.term.toLowerCase() === part.toLowerCase());
        if (!match) return <Fragment key={idx}>{part}</Fragment>;
        return (
          <abbr
            key={idx}
            title={match.definition}
            className="underline decoration-dotted decoration-mute-2 underline-offset-2 cursor-help"
          >
            {part}
          </abbr>
        );
      })}
    </>
  );
}

/** A collapsed-by-default disclosure panel matching the app's `<details>` convention. */
function Collapsible({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="border-t border-line pt-4 group">
      <summary className="flex items-center gap-1.5 cursor-pointer list-none">
        <span className="eyebrow text-[9px] text-ink">{label}</span>
        <span className="font-mono text-[9px] text-mute-2 ml-auto group-open:hidden">show</span>
        <span className="font-mono text-[9px] text-mute-2 ml-auto hidden group-open:inline">hide</span>
      </summary>
      <div className="mt-2.5 text-xs text-ink/80 leading-relaxed">{children}</div>
    </details>
  );
}

function EntryRow({
  entry,
  selected,
  onSelect,
}: {
  entry: AlchemyEntry;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left px-3.5 py-3 border-b border-line-2 transition ${
        selected ? "bg-caustic/10 border-l-2 border-l-caustic-dim" : "border-l-2 border-l-transparent hover:bg-paper/60"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`display text-[13px] leading-tight ${selected ? "text-ink" : "text-ink/90"}`}>{entry.title}</span>
        <DifficultyBadge difficulty={entry.difficulty} className="shrink-0" />
      </div>
      <p className="text-[11px] text-mute mt-1 leading-relaxed">{entry.summary}</p>
    </button>
  );
}

export default function AlchemyLab({ onLoadStarter }: AlchemyLabProps) {
  const [selectedId, setSelectedId] = useState(ALCHEMY_CATALOG[0]?.id);

  const recipes = ALCHEMY_CATALOG.filter((e) => e.kind === "recipe");
  const techniques = ALCHEMY_CATALOG.filter((e) => e.kind === "technique");
  const selected = ALCHEMY_CATALOG.find((e) => e.id === selectedId) || ALCHEMY_CATALOG[0];

  if (!selected) {
    return (
      <div className="border border-line bg-surface p-8 text-center text-mute">
        <p className="text-xs">No alchemy entries available.</p>
      </div>
    );
  }

  const byId = (id: string) => ALCHEMY_CATALOG.find((e) => e.id === id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[19rem_1fr] gap-6 items-start">
      {/* Left rail */}
      <div className="border border-line bg-surface lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto scroll-thin">
        <RailGroup title="Recipes" entries={recipes} selectedId={selected.id} onSelect={setSelectedId} />
        <RailGroup title="Techniques" entries={techniques} selectedId={selected.id} onSelect={setSelectedId} />
      </div>

      {/* Detail pane */}
      <div className="border border-line bg-surface p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <span className="eyebrow text-[8.5px] text-mute block mb-1.5">
              {selected.kind === "recipe" ? "Recipe" : "Technique"}
            </span>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="display text-2xl text-ink">{selected.title}</h2>
              <DifficultyBadge difficulty={selected.difficulty} />
            </div>
          </div>
          {selected.kind === "recipe" && (
            <button
              onClick={() => onLoadStarter(selected.starterDraft)}
              className="bg-ink hover:bg-ink-2 text-white px-4 py-2.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide shrink-0"
            >
              <FlaskConical className="w-4 h-4 text-caustic" />
              ▶ Load into Formulator
            </button>
          )}
        </div>

        {/* Overview */}
        <p className="text-sm text-ink/85 leading-relaxed">
          <GlossaryText text={selected.overview} glossary={selected.glossary} />
        </p>

        {/* Steps */}
        <div className="border-t border-line pt-4">
          <span className="eyebrow text-[9px] text-mute block mb-3">Steps</span>
          <ol className="space-y-4">
            {selected.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="font-mono text-[11px] font-semibold text-caustic-dim border border-caustic-dim/40 bg-caustic/10 w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-ink">{step.title}</p>
                  <p className="text-[12px] text-ink/75 leading-relaxed mt-0.5">
                    <GlossaryText text={step.detail} glossary={selected.glossary} />
                  </p>
                  {step.caution && (
                    <p className="flex items-start gap-1.5 text-[11px] text-warn mt-1.5 leading-relaxed border-l-2 border-warn/40 pl-2 py-0.5">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>{step.caution}</span>
                    </p>
                  )}
                  {step.proNote && (
                    <details className="mt-1.5 group">
                      <summary className="flex items-center gap-1 cursor-pointer list-none eyebrow text-[8px] text-mute-2 hover:text-ink">
                        <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
                        Pro note
                      </summary>
                      <p className="text-[11px] text-mute mt-1 pl-4 leading-relaxed">{step.proNote}</p>
                    </details>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Chemistry */}
        {selected.chemistry && <Collapsible label="Chemistry">{selected.chemistry}</Collapsible>}

        {/* Pro tips */}
        {!!selected.proTips?.length && (
          <Collapsible label="Pro tips">
            <ul className="space-y-1.5 list-disc list-inside marker:text-caustic-dim">
              {selected.proTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </Collapsible>
        )}

        {/* Safety */}
        <div className="border-t border-line pt-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-danger" />
            <span className="eyebrow text-[9px] text-danger">Safety</span>
          </div>
          <ul className="space-y-1.5">
            {selected.safety.map((item, idx) => (
              <li
                key={idx}
                className="text-[11px] text-ink/80 leading-relaxed border-l-2 border-danger/40 bg-danger/5 pl-2.5 py-1.5"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Applies to (techniques only) */}
        {selected.kind === "technique" && !!selected.appliesTo?.length && (
          <div className="border-t border-line pt-4">
            <span className="eyebrow text-[9px] text-mute block mb-2">Applies to</span>
            <div className="flex flex-wrap gap-2">
              {selected.appliesTo.map((id) => {
                const target = byId(id);
                if (!target) return null;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedId(id)}
                    className="font-mono text-[10.5px] text-ink border border-line px-2 py-1 hover:border-ink hover:bg-paper/60 transition"
                  >
                    {target.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sources */}
        {!!selected.sources?.length && (
          <div className="border-t border-line pt-4">
            <span className="eyebrow text-[9px] text-mute block mb-2">Sources</span>
            <ul className="space-y-1">
              {selected.sources.map((src, idx) => (
                <li key={idx} className="text-[11px]">
                  {src.url ? (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-mute inline-flex items-center gap-1 hover:text-caustic-dim"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      {src.label}
                    </a>
                  ) : (
                    <span className="text-mute">{src.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Glossary */}
        {!!selected.glossary?.length && (
          <div className="border-t border-line pt-4">
            <div className="flex items-center gap-1.5 mb-2.5">
              <BookOpen className="w-3.5 h-3.5 text-mute" />
              <span className="eyebrow text-[9px] text-mute">Glossary</span>
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {selected.glossary.map((g) => (
                <div key={g.term}>
                  <dt className="font-mono text-[10.5px] font-semibold text-ink">{g.term}</dt>
                  <dd className="text-[11px] text-mute leading-relaxed">{g.definition}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

function RailGroup({
  title,
  entries,
  selectedId,
  onSelect,
}: {
  title: string;
  entries: AlchemyEntry[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <div>
      <div className="eyebrow text-[8.5px] text-mute-2 px-3.5 py-2 bg-paper/60 border-b border-line-2">{title}</div>
      {entries.map((entry) => (
        <EntryRow key={entry.id} entry={entry} selected={entry.id === selectedId} onSelect={() => onSelect(entry.id)} />
      ))}
    </div>
  );
}
