import UNDERLYINGS from "../data/underlyings.js";
import { useState } from "react";
import { useTheme } from "../theme/ThemeContext.js";

export default function WorstOfSection() {
  const theme = useTheme();
  const [basket, setBasket] = useState(["nesn", "ubsg", "abbn"]);
  const [correlations, setCorrelations] = useState({ "nesn-ubsg": 0.35, "nesn-abbn": 0.30, "ubsg-abbn": 0.55 });
  const [barrier, setBarrier] = useState(65);
  const [maturity, setMaturity] = useState(2);
  const [scenario, setScenario] = useState("sideways");

  const getCorr = (a, b) => {
    const key = [a, b].sort().join("-");
    return correlations[key] ?? 0.4;
  };
  const setCorr = (a, b, val) => {
    const key = [a, b].sort().join("-");
    setCorrelations(prev => ({ ...prev, [key]: val }));
  };

  const toggleUnderlying = (id) => {
    if (basket.includes(id)) {
      if (basket.length <= 2) return;
      setBasket(prev => prev.filter(x => x !== id));
    } else {
      if (basket.length >= 4) return;
      setBasket(prev => [...prev, id]);
    }
  };

  const pairs = [];
  for (let i = 0; i < basket.length; i++)
    for (let j = i + 1; j < basket.length; j++)
      pairs.push([basket[i], basket[j]]);

  const avgCorr = pairs.length ? pairs.reduce((s, [a, b]) => s + getCorr(a, b), 0) / pairs.length : 0;
  const avgVol = basket.reduce((s, id) => s + (UNDERLYINGS.find(u => u.id === id)?.vol ?? 20), 0) / basket.length;

  // Coupon model: basket effect
  const singleVol = avgVol;
  const basketVolEffect = avgVol * (1 + (1 - avgCorr) * 0.45 * (basket.length - 1) * 0.5);
  const singleCoupon = Math.max(2, singleVol * 0.38 * maturity * 0.5);
  const basketCoupon = Math.max(2, basketVolEffect * 0.38 * maturity * 0.5);
  const couponPremium = basketCoupon - singleCoupon;

  // Fan chart simulation
  const W = 480, H = 220, padL = 48, padR = 16, padT = 16, padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const steps = 24;

  const scenParams = {
    sideways: { drift: 0, vol: 0.2 },
    drawdown: { drift: -0.15, vol: 0.22 },
    bull: { drift: 0.12, vol: 0.15 },
  };
  const { drift, vol: scVol } = scenParams[scenario];
  const dt = maturity / steps;
  const seed = (n) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;
  const nPaths = 60;

  // Generate correlated paths for basket (simplified: Gaussian copula approximation)
  const generatePath = (baseVol, corrAdj, pathIdx) => {
    let s = 100;
    return [s, ...Array.from({ length: steps }, (_, t) => {
      const z = (seed(pathIdx * steps + t + corrAdj * 1000) - 0.5) * 2 * 1.732;
      s = s * Math.exp((drift - 0.5 * baseVol ** 2) * dt + baseVol * Math.sqrt(dt) * z);
      return s;
    })];
  };

  const singlePaths = Array.from({ length: nPaths }, (_, pi) => generatePath(singleVol / 100, 0.5, pi));
  const basketPaths = Array.from({ length: nPaths }, (_, pi) => {
    // Simulate n correlated assets and take worst-of
    const assetPaths = basket.map((id, ai) => generatePath(
      (UNDERLYINGS.find(u => u.id === id)?.vol ?? 20) / 100,
      avgCorr * ai, pi * basket.length + ai
    ));
    return Array.from({ length: steps + 1 }, (_, t) => Math.min(...assetPaths.map(p => p[t])));
  });

  const pctile = (paths, t, p) => {
    const vals = paths.map(path => path[t]).sort((a, b) => a - b);
    return vals[Math.floor(p * vals.length)];
  };

  const singleFinal = singlePaths.map(p => p[steps]);
  const basketFinal = basketPaths.map(p => p[steps]);
  const singleBreachPct = Math.round(singleFinal.filter(v => v < barrier).length / nPaths * 100);
  const basketBreachPct = Math.round(basketFinal.filter(v => v < barrier).length / nPaths * 100);

  const allVals = [...singlePaths.flatMap(p => p), ...basketPaths.flatMap(p => p)];
  const minV = Math.min(...allVals, 40);
  const maxV = Math.max(...allVals, 130);
  const toX = (t) => padL + (t / steps) * innerW;
  const toY = (v) => padT + innerH - ((v - minV) / (maxV - minV)) * innerH;

  const makeBandPath = (paths, pLow, pHigh) => {
    const fwd = Array.from({ length: steps + 1 }, (_, t) => `${t === 0 ? "M" : "L"} ${toX(t)} ${toY(pctile(paths, t, pHigh))}`).join(" ");
    const bwd = Array.from({ length: steps + 1 }, (_, t) => `L ${toX(steps - t)} ${toY(pctile(paths, steps - t, pLow))}`).join(" ");
    return `${fwd} ${bwd} Z`;
  };
  const makeMedianPath = (paths) => Array.from({ length: steps + 1 }, (_, t) => `${t === 0 ? "M" : "L"} ${toX(t)} ${toY(pctile(paths, t, 0.5))}`).join(" ");

  return (
    <div className="fade-in" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div className="section-header">
        <div className="section-icon">🧺</div>
        <div>
          <div className="teal-line" style={{ margin: 0, marginBottom: 4 }} />
          <h2 className="playfair" style={{ fontSize: 24 }}>Worst-of Basket Mechanics</h2>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>The correlation effect — why lower correlation means higher coupon AND higher risk</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, borderColor: `${theme.danger}30`, background: "rgba(248,81,73,0.03)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.8 }}>
            <strong style={{ color: theme.text }}>The weakest link mechanic:</strong> In a worst-of basket, the payoff is determined entirely by the worst-performing component — regardless of how well the others perform. A basket of 4 stocks where 3 rise 20% but 1 falls 50% pays out as if you held only the fallen stock.
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Underlying picker */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
              Basket ({basket.length}/4 selected)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {UNDERLYINGS.map(u => {
                const inBasket = basket.includes(u.id);
                const disabled = !inBasket && basket.length >= 4;
                return (
                  <button key={u.id} onClick={() => toggleUnderlying(u.id)} disabled={disabled}
                    style={{ padding: "7px 10px", borderRadius: 4, textAlign: "left", border: `1px solid ${inBasket ? theme.gold : theme.border}`, background: inBasket ? "rgba(201,168,76,0.1)" : "transparent", color: disabled ? theme.textDim : inBasket ? theme.gold : theme.text, fontSize: 11, cursor: disabled ? "not-allowed" : "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{u.label}</span>
                    <span className="mono" style={{ fontSize: 10, color: theme.textDim }}>{u.vol}% vol</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Correlation sliders */}
          {pairs.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 600, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Pairwise Correlations</div>
              {pairs.map(([a, b]) => {
                const corr = getCorr(a, b);
                const la = UNDERLYINGS.find(u => u.id === a)?.label ?? a;
                const lb = UNDERLYINGS.find(u => u.id === b)?.label ?? b;
                return (
                  <div key={`${a}-${b}`} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: theme.textMuted }}>{la} / {lb}</span>
                      <span className="mono" style={{ fontSize: 12, color: corr < 0.4 ? theme.danger : corr > 0.7 ? theme.success : theme.warning, fontWeight: 600 }}>{corr.toFixed(2)}</span>
                    </div>
                    <input type="range" min={-0.2} max={0.95} step={0.05} value={corr} onChange={e => setCorr(a, b, parseFloat(e.target.value))} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                      <span className="mono" style={{ fontSize: 9, color: theme.danger }}>Low</span>
                      <span className="mono" style={{ fontSize: 9, color: theme.success }}>High</span>
                    </div>
                  </div>
                );
              })}
              <div style={{ padding: "8px 10px", borderRadius: 4, background: `${theme.accent}10`, border: `1px solid ${theme.accent}30` }}>
                <div style={{ fontSize: 10, color: theme.textDim, marginBottom: 2 }}>Average Correlation</div>
                <div className="mono" style={{ fontSize: 16, color: theme.accent, fontWeight: 600 }}>{avgCorr.toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* Product params */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Structure</div>
            {[
              { label: "Barrier Level", val: barrier, set: setBarrier, min: 40, max: 85, step: 5, fmt: v => `${v}%` },
              { label: "Maturity", val: maturity, set: setMaturity, min: 1, max: 3, step: 1, fmt: v => `${v}Y` },
            ].map(ctrl => (
              <div key={ctrl.label} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>{ctrl.label}</span>
                  <span className="mono" style={{ fontSize: 13, color: theme.gold, fontWeight: 500 }}>{ctrl.fmt(ctrl.val)}</span>
                </div>
                <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={ctrl.val} onChange={e => ctrl.set(parseFloat(e.target.value))} />
              </div>
            ))}
          </div>
        </div>

        {/* Charts and analysis */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Coupon comparison */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { label: "Single-Name BRC Coupon", value: `${singleCoupon.toFixed(1)}%`, sub: "Reference (avg vol)", color: theme.accent },
              { label: "Worst-of Basket Coupon", value: `${basketCoupon.toFixed(1)}%`, sub: `${basket.length} stocks, ρ=${avgCorr.toFixed(2)}`, color: theme.gold },
              { label: "Correlation Premium", value: `+${couponPremium.toFixed(1)}%`, sub: "Extra yield from basket", color: theme.warning },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: "14px 16px", borderColor: `${s.color}40`, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: theme.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{s.label}</div>
                <div className="mono" style={{ fontSize: 24, color: s.color, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: theme.textDim, marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Fan chart */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Outcome Distribution — Single vs Worst-of</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[{ id: "sideways", label: "Sideways" }, { id: "drawdown", label: "Drawdown" }, { id: "bull", label: "Bull" }].map(s => (
                  <button key={s.id} onClick={() => setScenario(s.id)}
                    style={{ padding: "4px 10px", fontSize: 10, borderRadius: 3, border: `1px solid ${scenario === s.id ? theme.gold : theme.border}`, background: scenario === s.id ? "rgba(201,168,76,0.1)" : "transparent", color: scenario === s.id ? theme.gold : theme.textMuted, cursor: "pointer" }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
              {[60, 80, 100, 120].map(v => v >= minV && v <= maxV && (
                <g key={v}>
                  <line x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)} stroke={theme.border} strokeWidth="0.5" strokeDasharray={v === 100 ? "none" : "3,4"} />
                  <text x={padL - 5} y={toY(v) + 4} textAnchor="end" fontSize="9" fill={theme.textDim} fontFamily="JetBrains Mono">{v}</text>
                </g>
              ))}
              {/* Barrier */}
              <line x1={padL} y1={toY(barrier)} x2={W - padR} y2={toY(barrier)} stroke={theme.danger} strokeWidth="1.5" strokeDasharray="4,3" strokeOpacity="0.7" />
              <text x={W - padR - 4} y={toY(barrier) - 4} textAnchor="end" fontSize="9" fill={theme.danger} fontFamily="JetBrains Mono">Barrier {barrier}%</text>
              {/* Single bands */}
              <path d={makeBandPath(singlePaths, 0.1, 0.9)} fill={theme.accent} fillOpacity="0.1" />
              <path d={makeMedianPath(singlePaths)} fill="none" stroke={theme.accent} strokeWidth="2" strokeOpacity="0.7" />
              {/* Basket bands */}
              <path d={makeBandPath(basketPaths, 0.1, 0.9)} fill={theme.danger} fillOpacity="0.1" />
              <path d={makeMedianPath(basketPaths)} fill="none" stroke={theme.danger} strokeWidth="2" />
              {/* Axes */}
              <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke={theme.border} />
              <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke={theme.border} />
              {[0, steps / 2, steps].map(t => (
                <text key={t} x={toX(t)} y={H - 4} textAnchor="middle" fontSize="8" fill={theme.textDim} fontFamily="JetBrains Mono">Y{Math.round(t / steps * maturity)}</text>
              ))}
            </svg>
            <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 20, height: 2, background: theme.accent, borderRadius: 1 }} /><span style={{ fontSize: 10, color: theme.textMuted }}>Single-name median</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 20, height: 2, background: theme.danger, borderRadius: 1 }} /><span style={{ fontSize: 10, color: theme.textMuted }}>Worst-of basket median</span></div>
            </div>
          </div>

          {/* Breach comparison */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Single-Name Barrier Breach Prob.", value: `~${singleBreachPct}%`, color: singleBreachPct > 25 ? theme.danger : theme.warning },
              { label: "Worst-of Basket Barrier Breach Prob.", value: `~${basketBreachPct}%`, color: basketBreachPct > 25 ? theme.danger : theme.warning },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: "12px 16px", borderColor: `${s.color}40` }}>
                <div style={{ fontSize: 10, color: theme.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</div>
                <div className="mono" style={{ fontSize: 22, color: s.color, fontWeight: 700 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="insight-box">
            <strong>Key message for clients — </strong>The higher coupon in a worst-of basket is not diversification benefit. It is the premium for accepting that <em>any one</em> of the basket components can determine your entire loss. As correlation decreases, this risk increases — and so does the coupon. The two are inseparable.
          </div>
        </div>
      </div>
    </div>
  );
}


const MODULE_IDS = ["options", "builder", "payoff", "portfolio", "suitability", "lifecycle", "stress", "credit", "glossary", "comparison", "quiz", "volatility", "worstof"];
