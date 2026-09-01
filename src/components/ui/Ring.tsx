import { useEffect, useState } from "react";

interface RingProps {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  label?: string;
  color?: string;
}

/** Animated circular progress ring (used for the match score). */
export function Ring({ value, size = 120, stroke = 10, label = "%", color = "#2b4ae3" }: RingProps) {
  const [progress, setProgress] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Animate from 0 to the target value on mount.
    const raf = requestAnimationFrame(() => setProgress(Math.max(0, Math.min(100, value))));
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-slate-800" style={{ color }}>
          {Math.round(progress)}
          {label}
        </span>
        {progress >= 90 && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Excellent</span>
        )}
      </div>
    </div>
  );
}
