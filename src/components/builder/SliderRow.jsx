import { T } from "./builderTheme.js";
import Spinner from "./Spinner.jsx";

export default function SliderRow({ label, val, set, min, max, step, fmt, color = T.gold }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
        <span style={{ fontSize: 11, color: T.textMuted }}>{label}</span>
        <span className="mono" style={{ fontSize: 12, color, fontWeight: 600 }}>{fmt(val)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val} onChange={e => set(parseFloat(e.target.value))} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span className="mono" style={{ fontSize: 9, color: T.textDim }}>{fmt(min)}</span>
        <span className="mono" style={{ fontSize: 9, color: T.textDim }}>{fmt(max)}</span>
      </div>
    </div>
  );
}

// ─── PAYOFF CHART ─────────────────────────────────────────────────────────────
