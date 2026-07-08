/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AlchemyDifficulty } from "../types";

const DIFFICULTY_COLOR: Record<AlchemyDifficulty, string> = {
  beginner: "text-cool border-cool/40 bg-cool/10",
  intermediate: "text-caustic border-caustic/40 bg-caustic/10",
  advanced: "text-warn border-warn/40 bg-warn/40"
};

export default function DifficultyBadge({ difficulty, className }: { difficulty: AlchemyDifficulty; className?: string }) {
  const colorClass = DIFFICULTY_COLOR[difficulty];

  return (
    <span className={`inline-flex items-center gap-1 eyebrow text-[8.5px] uppercase tracking-widest px-1.5 py-0.5 border ${colorClass} ${className || ""}`}>
      ● {difficulty}
    </span>
  );
}
