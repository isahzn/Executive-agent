"use client";

// Minimal quantity stepper. Wraps at min/max so zero/negative can never be set.
export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 999,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const decrease = () => {
    if (value > min) onChange(value - 1);
  };
  const increase = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="qty">
      <button
        type="button"
        className="qty-btn"
        onClick={decrease}
        aria-label="Decrease quantity"
        disabled={value <= min}
      >
        −
      </button>
      <span className="qty-value" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="qty-btn"
        onClick={increase}
        aria-label="Increase quantity"
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}
