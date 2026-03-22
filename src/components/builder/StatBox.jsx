import { T } from "./builderTheme.js";

export default function StatBox({ label, value, sub, color = T.gold, large = false }) {
  return (
    <div className="card" style={{ padding: "12px 14px", borderColor: `${color}35` }}>
      <div style={{ fontSize: 10, color: T.textDim, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>{label}</div>
      <div className="mono" style={{ fontSize: large ? 28 : 20, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
