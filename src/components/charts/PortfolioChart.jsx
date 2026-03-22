import { useTheme } from "../../theme/ThemeContext.js";

export default function PortfolioChart({ profile, spAlloc, product }) {
  const theme = useTheme();
  const W = 480, H = 200, padL = 48, padR = 16, padT = 16, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const bins = 50;

  // Simplified return distributions
  const profileParams = {
    conservative: { mu: 0.04, sigma: 0.06 },
    balanced: { mu: 0.07, sigma: 0.11 },
    growth: { mu: 0.10, sigma: 0.17 },
  }[profile];

  const spParams = {
    cpn: { mu: 0.05, sigma: 0.03 },
    rc: { mu: 0.09, sigma: 0.13 },
    brc: { mu: 0.10, sigma: 0.16 },
    autocall: { mu: 0.08, sigma: 0.12 },
  }[product] || { mu: 0.07, sigma: 0.10 };

  const N = 10000;
  const seed2 = (n) => ((Math.sin(n * 311.7 + 127.1) * 43758.5453) % 1 + 1) % 1;

  const baseReturns = Array.from({ length: N }, (_, i) => {
    const u1 = seed2(i * 2), u2 = seed2(i * 2 + 1);
    const z = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
    return profileParams.mu + profileParams.sigma * z;
  });

  const spWeight = spAlloc / 100;
  const baseWeight = 1 - spWeight;

  const blendedReturns = baseReturns.map((r, i) => {
    const u1 = seed2(i * 2 + N), u2 = seed2(i * 2 + 1 + N);
    const z = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
    const spRet = spParams.mu + spParams.sigma * z;
    return baseWeight * r + spWeight * spRet;
  });

  // Build histograms
  const minR = -0.5, maxR = 0.5;
  const binWidth = (maxR - minR) / bins;

  const hist = (returns) => {
    const counts = Array(bins).fill(0);
    returns.forEach(r => {
      const b = Math.floor((r - minR) / binWidth);
      if (b >= 0 && b < bins) counts[b]++;
    });
    return counts;
  };

  const baseHist = hist(baseReturns);
  const blendHist = hist(blendedReturns);
  const maxCount = Math.max(...baseHist, ...blendHist);

  const toX = (b) => padL + (b / bins) * innerW;
  const toY = (c) => padT + innerH - (c / maxCount) * innerH;
  const barW = innerW / bins - 0.5;

  const xToR = (b) => (minR + (b / bins) * (maxR - minR)) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        {/* Grid */}
        <line x1={padL} y1={toY(0)} x2={W - padR} y2={toY(0)} stroke={theme.border} strokeWidth="0.5" />

        {/* Zero return line */}
        <line x1={toX(bins / 2)} y1={padT} x2={toX(bins / 2)} y2={padT + innerH} stroke={theme.textDim} strokeWidth="1" strokeDasharray="3,3" />
        <text x={toX(bins / 2)} y={padT - 4} textAnchor="middle" fontSize="8" fill={theme.textDim}>0%</text>

        {/* Base histogram */}
        {baseHist.map((c, b) => (
          <rect key={b} x={toX(b)} y={toY(c)} width={barW} height={Math.max(0, toY(0) - toY(c))}
            fill={theme.accent} opacity="0.3" />
        ))}

        {/* Blended histogram */}
        {blendHist.map((c, b) => (
          <rect key={b} x={toX(b)} y={toY(c)} width={barW} height={Math.max(0, toY(0) - toY(c))}
            fill={theme.gold} opacity="0.45" />
        ))}

        {/* Axes */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke={theme.border} />
        <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke={theme.border} />

        {[-30, -15, 0, 15, 30].map(r => {
          const b = Math.round(((r / 100 - minR) / binWidth));
          if (b < 0 || b > bins) return null;
          return (
            <text key={r} x={toX(b)} y={H - 6} textAnchor="middle" fontSize="8" fill={theme.textDim} fontFamily="JetBrains Mono">{r}%</text>
          );
        })}
      </svg>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 16, height: 8, background: theme.accent, opacity: 0.5, borderRadius: 1 }} />
          <span style={{ fontSize: 11, color: theme.textMuted }}>Base portfolio</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 16, height: 8, background: theme.gold, opacity: 0.6, borderRadius: 1 }} />
          <span style={{ fontSize: 11, color: theme.textMuted }}>With structured product ({spAlloc}% sleeve)</span>
        </div>
      </div>
    </div>
  );
}

// ─── SECTIONS ─────────────────────────────────────────────────────────────────
