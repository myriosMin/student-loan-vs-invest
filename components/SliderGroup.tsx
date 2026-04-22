'use client';

interface SliderGroupProps {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (val: number) => void;
  noMargin?: boolean;
  investSlider?: boolean;
}

export default function SliderGroup({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
  noMargin,
  investSlider,
}: SliderGroupProps) {
  return (
    <div className="slider-group" style={noMargin ? { marginBottom: 0 } : undefined}>
      <div className="slider-label">
        <span>{label}</span>
        <span className="val">{value}</span>
      </div>
      <input
        type="range"
        className={investSlider ? 'invest-slider' : undefined}
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
