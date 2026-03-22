import { T } from "./builderTheme.js";

export default function ScenarioFanChart({ vol = 20, maturity = 2, scenario = "sideways", barrier = null }) {
  const W = 420, H = 190, pL = 44, pR = 12, pT = 12, pB = 28;
  const iW = W - pL - pR, iH = H - pT - pB;
  const steps = 24, nP = 60, dt = maturity / steps;
  const sp = { sideways: { d: 0, v: .2 }, drawdown: { d: -.14, v: .22 }, bull: { d: .13, v: .15 }, volatile: { d: 0, v: .35 } }[scenario] ?? { d: 0, v: .2 };
  const sv = Math.max(sp.v, vol / 100 * 0.8);
  const seed = n => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;
  const paths = Array.from({ length: nP }, (_, pi) => {
    let s = 100;
    return [s, ...Array.from({ length: steps }, (_, t) => {
      const z = (seed(pi * steps + t) - .5) * 2 * 1.732;
      s = s * Math.exp((sp.d - .5 * sv ** 2) * dt + sv * Math.sqrt(dt) * z);
      return s;
    })];
  });
  const pct = (paths, t, p) => { const v = paths.map(pa => pa[t]).sort((a, b) => a - b); return v[Math.floor(p * v.length)] ?? 100; };
  const allV = paths.flat();
  const minV = Math.min(...allV, barrier ? barrier - 10 : 50);
  const maxV = Math.max(...allV, 130);
  const toX = t => pL + (t / steps) * iW;
  const toY = v => pT + iH - ((v - minV) / (maxV - minV)) * iH;
  const band = (pL2, pH) => {
    const f = Array.from({ length: steps + 1 }, (_, t) => `${t === 0 ? "M" : "L"} ${toX(t)} ${toY(pct(paths, t, pH))}`).join(" ");
    const b = Array.from({ length: steps + 1 }, (_, t) => `L ${toX(steps - t)} ${toY(pct(paths, steps - t, pL2))}`).join(" ");
    return `${f} ${b} Z`;
  };
  const med = Array.from({ length: steps + 1 }, (_, t) => `${t === 0 ? "M" : "L"} ${toX(t)} ${toY(pct(paths, t, .5))}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
      {[60, 80, 100, 120].map(v => v >= minV && v <= maxV && (
        <g key={v}>
          <line x1={pL} y1={toY(v)} x2={W - pR} y2={toY(v)} stroke={T.border} strokeWidth=".5" strokeDasharray={v === 100 ? "none" : "3,4"} />
          <text x={pL - 5} y={toY(v) + 4} textAnchor="end" fontSize="8" fill={T.textDim} fontFamily="JetBrains Mono">{v}</text>
        </g>
      ))}
      {barrier && (
        <g>
          <line x1={pL} y1={toY(barrier)} x2={W - pR} y2={toY(barrier)} stroke={T.danger} strokeWidth="1.5" strokeDasharray="4,3" strokeOpacity=".7" />
          <text x={W - pR - 3} y={toY(barrier) - 4} textAnchor="end" fontSize="8" fill={T.danger} fontFamily="JetBrains Mono">Barrier {barrier}%</text>
        </g>
      )}
      <path d={band(.1, .9)} fill={T.gold} fillOpacity=".07" />
      <path d={band(.25, .75)} fill={T.gold} fillOpacity=".13" />
      <path d={med} fill="none" stroke={T.gold} strokeWidth="2.5" strokeLinecap="round" />
      <line x1={pL} y1={pT} x2={pL} y2={pT + iH} stroke={T.border} />
      <line x1={pL} y1={pT + iH} x2={W - pR} y2={pT + iH} stroke={T.border} />
      {[0, steps / 2, steps].map(t => (
        <text key={t} x={toX(t)} y={H - 4} textAnchor="middle" fontSize="8" fill={T.textDim} fontFamily="JetBrains Mono">Y{Math.round(t / steps * maturity)}</text>
      ))}
    </svg>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
