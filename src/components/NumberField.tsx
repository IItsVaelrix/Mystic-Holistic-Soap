/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";

interface NumberFieldProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number | string;
  className?: string;
  placeholder?: string;
  /** Clamp to min/max only on blur, so intermediate typed values pass through. */
  clampOnBlur?: boolean;
}

/**
 * A typable numeric input. Edits are held as raw text while focused, so you can
 * clear the field, type a partial number, or delete digits without the value
 * snapping to 0, being clamped mid-keystroke, or (in a list) deleting its row.
 * Parseable values are committed live; an empty/invalid field reverts on blur.
 */
export default function NumberField({
  value,
  onChange,
  min,
  max,
  step,
  className,
  placeholder,
  clampOnBlur = true,
}: NumberFieldProps) {
  const [text, setText] = useState<string>(String(value));
  const focused = useRef(false);

  // Adopt external changes only when the user isn't actively editing.
  useEffect(() => {
    if (!focused.current) setText(String(value));
  }, [value]);

  const clamp = (n: number) => {
    let v = n;
    if (min != null) v = Math.max(min, v);
    if (max != null) v = Math.min(max, v);
    return v;
  };

  return (
    <input
      type="number"
      inputMode="decimal"
      value={text}
      step={step}
      min={min}
      max={max}
      placeholder={placeholder}
      className={className}
      onFocus={() => {
        focused.current = true;
      }}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        // Allow intermediate states without committing (empty, lone sign/point).
        if (raw === "" || raw === "-" || raw === "." || raw === "-.") return;
        const n = Number(raw);
        if (Number.isFinite(n)) onChange(n);
      }}
      onBlur={() => {
        focused.current = false;
        const n = Number(text);
        if (text === "" || !Number.isFinite(n)) {
          setText(String(value)); // revert empty/invalid input
          return;
        }
        const v = clampOnBlur ? clamp(n) : n;
        setText(String(v));
        if (v !== value) onChange(v);
      }}
    />
  );
}
