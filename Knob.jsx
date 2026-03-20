import { useState, useRef, useCallback } from "react";

const START_ANGLE = 225;
const SWEEP = 270;

function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

export function Knob({
  label,
  value,
  min = 0,
  max = 100,
  onChange,
  color = "#5b8cf5",
  size = 50,
  displayFn,
  sensitivity = 200,
}) {
  const [val, setVal] = useState(value);
  const drag = useRef(null);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const handleEnd = r - 2;

  const update = useCallback(
    (v) => {
      const clamped = Math.min(Math.max(v, min), max);
      setVal(clamped);
      onChange?.(clamped);
    },
    [min, max, onChange],
  );

  const t = (val - min) / (max - min);
  const angle = START_ANGLE + t * SWEEP;
  const [x2, y2] = polar(cx, cy, handleEnd, angle);

  const displayValue = displayFn ? displayFn(val) : Math.round(val);

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <p className="text-sm">{label}</p>

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        tabIndex={0}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(val)}
        aria-orientation="vertical"
        className="block touch-none cursor-grab outline-none"
        onPointerDown={(e) => {
          e.preventDefault();
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { startY: e.clientY, startVal: val };
          e.currentTarget.style.cursor = "ns-resize";
          document.body.style.cursor = "ns-resize";
        }}
        onPointerMove={(e) => {
          if (!drag.current || e.buttons === 0) return;
          const dt = -(e.clientY - drag.current.startY) / sensitivity;
          update(drag.current.startVal + dt * (max - min));
        }}
        onPointerUp={(e) => {
          drag.current = null;
          e.currentTarget.style.cursor = "grab";
          document.body.style.cursor = "";
        }}
        onPointerCancel={(e) => {
          drag.current = null;
          e.currentTarget.style.cursor = "grab";
          document.body.style.cursor = "";
        }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={color}
          stroke="#000"
          strokeWidth={2}
        />
        <line
          x1={cx}
          y1={cy}
          x2={x2}
          y2={y2}
          stroke="#000"
          strokeWidth={3}
          strokeLinecap="square"
        />
      </svg>

      <p className="text-xs text-gray-500">{displayValue}</p>
    </div>
  );
}
