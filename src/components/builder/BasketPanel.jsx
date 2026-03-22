import { T } from "./builderTheme.js";

export default function BasketPanel({ basket, correlations, setCorrelations }) {
  const pairs = [];
  for (let i = 0; i < basket.length; i++)
    for (let j = i + 1; j < basket.length; j++)
      pairs.push([basket[i], basket[j]]);

  const getCorr = (a, b) => correlations[[a, b].sort().join("-")] ?? 0.45;
  const setCorr = (a, b, v) => setCorrelations(prev => ({ ...prev, [[a, b].sort().join("-")]: v }));
  const avgCorr = pairs.length ? pairs.reduce((s, [a, b]) => s + getCorr(a.id, b.id), 0) / pairs.length : 0;

  return (
    <div className="card" style={{ borderColor: `${T.purple}30` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.purple, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 14 }}>Correlation Matrix</div>
      {pairs.length === 0 && <div style={{ fontSize: 12, color: T.textMuted }}>Add at least 2 underlyings to set correlations.</div>}
      {pairs.map(([a, b]) => {
        const corr = getCorr(a.id, b.id);
        const col = corr < 0.3 ? T.danger : corr > 0.65 ? T.success : T.warning;
        return (
          <div key={`${a.id}-${b.id}`} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: T.textMuted }}>{a.label} / {b.label}</span>
              <span className="mono" style={{ fontSize: 12, color: col, fontWeight: 700 }}>ρ = {corr.toFixed(2)}</span>
            </div>
            <input type="range" min={-0.2} max={0.95} step={0.05} value={corr} onChange={e => setCorr(a.id, b.id, parseFloat(e.target.value))} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
              <span style={{ fontSize: 9, color: T.danger }}>Low corr · High coupon · Higher risk</span>
              <span style={{ fontSize: 9, color: T.success }}>High corr · Lower coupon</span>
            </div>
          </div>
        );
      })}
      {pairs.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: T.surface2, borderRadius: 4, marginTop: 4 }}>
          <span style={{ fontSize: 11, color: T.textMuted }}>Avg. correlation</span>
          <span className="mono" style={{ fontSize: 13, color: T.purple, fontWeight: 700 }}>{avgCorr.toFixed(2)}</span>
        </div>
      )}
      {pairs.length > 0 && (
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 10, lineHeight: 1.7, padding: "8px 10px", borderLeft: `2px solid ${T.purple}`, background: `${T.purple}08`, borderRadius: "0 4px 4px 0" }}>
          {avgCorr < 0.35
            ? "⚠️ Low correlation — the worst-of premium is significant. Higher coupon, but substantially higher probability that one component drags down the payoff."
            : avgCorr < 0.6
              ? "Moderate correlation — typical for cross-sector baskets. Coupon premium reflects meaningful dispersion risk."
              : "High correlation — basket behaves close to a single-name product. Limited worst-of premium."}
        </div>
      )}
    </div>
  );
}

// ─── SCENARIO FAN CHART ───────────────────────────────────────────────────────
