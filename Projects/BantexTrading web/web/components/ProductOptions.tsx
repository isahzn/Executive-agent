"use client";

import type { ProductOption } from "@/lib/products";

// Renders every option group a product defines (Colour, Size, Model, Pack, …).
// The set is fully data-driven — nothing hard-coded to one option type. Values
// render as selectable pills; the parent tracks selection and validation state.
export default function ProductOptions({
  options,
  selection,
  onSelect,
  attempted,
  missing = [],
}: {
  options: ProductOption[];
  selection: Record<string, string>;
  onSelect: (label: string, value: string) => void;
  attempted: boolean;
  missing?: string[];
}) {
  if (options.length === 0) return null;

  return (
    <div className="pdp-options">
      {options.map((group) => {
        const selected = selection[group.label];
        return (
          <div
            key={group.label}
            className={`pdp-opt-group${missing.includes(group.label) ? " is-missing" : ""}`}
          >
            <span className="pdp-opt-label">{group.label}</span>
            <div className="pdp-opt-values">
              {group.values.map((value) => (
                <button
                  key={value.value}
                  type="button"
                  className={`opt-pill${selected === value.value ? " active" : ""}`}
                  aria-pressed={selected === value.value}
                  onClick={() => onSelect(group.label, value.value)}
                >
                  {value.value}
                </button>
              ))}
            </div>
            {attempted && !selected ? (
              <span className="pdp-opt-error">Please select {group.label}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
