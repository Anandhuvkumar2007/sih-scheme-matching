interface SliderProps {
  label: string;
  /** Formatted current value shown to the right of the label. */
  displayValue: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  /** Convert the slider value into the displayed unit (e.g. rupees). */
  formatHint?: string;
}

/** Accessible labeled range slider with a live value readout. */
export function Slider({
  label,
  displayValue,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatHint,
}: SliderProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-slate-700" id={`slider-${label}`}>
          {label}
        </label>
        <span className="text-sm font-bold tabular-nums text-brand-700">{displayValue}</span>
      </div>
      <input
        type="range"
        aria-label={label}
        aria-describedby={formatHint ? `hint-${label}` : undefined}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1"
      />
      <div className="mt-1 flex justify-between text-[11px] text-slate-400">
        <span>{min.toLocaleString("en-IN")}</span>
        <span>{max.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}
