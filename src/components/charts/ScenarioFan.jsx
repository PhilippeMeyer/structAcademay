import { useTheme } from "../../theme/ThemeContext.js";

export default function ScenarioFan({ product, params, scenario }) {
  const theme = useTheme();
  const W = 480, H = 220, padL = 50, padR = 20, padT = 16, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Simulate simple paths based on scenario
  const scenarioParams = {
    sideways: { drift: 0, vol: 0.22 },
    drawdown: { drift: -0.12, vol: 0.18 },
    sharp: { drift: -0.25, vol: 0.35 },
    bull: { drift: 0.15, vol: 0.16 },
  }[scenario] || { drift: 0, vol: 0.2 };

  const maturity = params.maturity || 3;
  const steps = 36; // monthly steps
  const nPaths = 80;
  const dt = maturity / steps;

  const seed = (n) => ((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;

  // Generate paths
  const paths = Array.from({ length: nPaths }, (_, pi) => {
    let s = 100;
    const pts = [s];
    for (let t = 0; t < steps; t++) {
      const z = (seed(pi * steps + t) - 0.5) * 2 * 1.732;
      s = s * Math.exp((scenarioParams.drift - 0.5 * scenarioParams.vol ** 2) * dt + scenarioParams.vol * Math.sqrt(dt) * z);
      pts.push(s);
    }
    return pts;
  });

  // Percentile bands
  const percentile = (arr, p) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(p * sorted.length)];
  };

  const bands = Array.from({ length: steps + 1 }, (_, i) => {
    const vals = paths.map(p => p[i]);
    return { p10: percentile(vals, 0.1), p25: percentile(vals, 0.25), p50: percentile(vals, 0.5), p75: percentile(vals, 0.75), p90: percentile(vals, 0.9) };
  });

  const allVals = bands.flatMap(b => [b.p10, b.p90]);
  const minV = Math.min(...allVals, 50);
  const maxV = Math.max(...allVals, 140);

  const toX = (i) => padL + (i / steps) * innerW;
  const toY = (v) => padT + innerH - ((v - minV) / (maxV - minV)) * innerH;

  const makePath = (key) => bands.map((b, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(b[key])}`).join(" ");
  const makeBand = (kLow, kHigh) => {
    const fwd = bands.map((b, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(b[kHigh])}`).join(" ");
    const bwd = [...bands].reverse().map((b, i) => `L ${toX(bands.length - 1 - i)} ${toY(b[kLow])}`).join(" ");
    return `${fwd} ${bwd} Z`;
  };

  // Compute final payoffs for distribution label
  const finalUnderlying = paths.map(p => p[p.length - 1]);
  const calcPayoff = (u) => {
    const pct = u / 100;
    switch (product) {
      case "cpn": return Math.max(params.protection / 100, 1 + Math.max(0, pct - 1) * params.participation) * 100;
      case "rc": return pct >= 1 ? (1 + params.coupon / 100) * 100 : pct * 100 + params.coupon;
      case "brc": return (pct >= 1 || pct > params.barrier / 100) ? (1 + params.coupon / 100) * 100 : pct * 100 + params.coupon;
      case "autocall": return (pct >= 1 || pct > params.barrier / 100) ? (1 + params.coupon / 100) * 100 : pct * 100;
      default: return 100;
    }
  };
  const payoffs = finalUnderlying.map(calcPayoff);
  const medianPayoff = percentile(payoffs, 0.5).toFixed(0);
  const pctLoss = ((payoffs.filter(p => p < 100).length / payoffs.length) * 100).toFixed(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <defs>
          <clipPath id="fanClip"><rect x={padL} y={padT} width={innerW} height={innerH} /></clipPath>
        </defs>

        {/* Grid */}
        {[60, 80, 100, 120].map(v => {
          if (v < minV || v > maxV) return null;
          const y = toY(v);
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={theme.border} strokeWidth="0.5" strokeDasharray="3,4" />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill={theme.textDim} fontFamily="JetBrains Mono">{v}</text>
            </g>
          );
        })}

        <g clipPath="url(#fanClip)">
          {/* Bands */}
          <path d={makeBand("p10", "p90")} fill={theme.gold} fillOpacity="0.06" />
          <path d={makeBand("p25", "p75")} fill={theme.gold} fillOpacity="0.12" />
          {/* Median */}
          <path d={makePath("p50")} fill="none" stroke={theme.gold} strokeWidth="2" strokeLinecap="round" />
          {/* Strike line */}
          <line x1={padL} y1={toY(100)} x2={W - padR} y2={toY(100)} stroke={theme.textDim} strokeWidth="1" strokeDasharray="3,3" />
        </g>

        {/* Axes */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke={theme.border} />
        <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke={theme.border} />

        {/* Time axis */}
        {[0, 1, 2, 3].filter(y => y <= maturity).map(y => {
          const xi = Math.round((y / maturity) * steps);
          return (
            <text key={y} x={toX(xi)} y={H - 6} textAnchor="middle" fontSize="9" fill={theme.textDim} fontFamily="JetBrains Mono">Y{y}</text>
          );
        })}

        <text x={padL - 4} y={padT - 4} textAnchor="middle" fontSize="9" fill={theme.textDim}>Underlying</text>
      </svg>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 20, height: 3, background: theme.gold, borderRadius: 1 }} />
          <span style={{ fontSize: 11, color: theme.textMuted }}>Median path</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 16, height: 8, background: theme.gold, opacity: 0.3, borderRadius: 1 }} />
          <span style={{ fontSize: 11, color: theme.textMuted }}>25th–75th percentile</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 16, height: 8, background: theme.gold, opacity: 0.12, borderRadius: 1 }} />
          <span style={{ fontSize: 11, color: theme.textMuted }}>10th–90th percentile</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Median product payoff", value: `${medianPayoff}%`, color: theme.gold },
          { label: "Probability of capital loss", value: `~${pctLoss}%`, color: pctLoss > 20 ? theme.danger : theme.success },
          { label: "Scenario", value: { sideways: "Sideways / Volatile", drawdown: "Gradual Drawdown", sharp: "Sharp Reversal", bull: "Bull Market" }[scenario], color: theme.textMuted },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 4 }}>{s.label}</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 500, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PORTFOLIO CHART ──────────────────────────────────────────────────────────
