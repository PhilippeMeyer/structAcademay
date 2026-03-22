import { useTheme } from "../../theme/ThemeContext.js";

export default function PayoffChart({ product, params }) {
  const theme = useTheme();
  const W = 480, H = 240, padL = 48, padR = 16, padT = 16, padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const points = [];
  const underlyingRange = Array.from({ length: 101 }, (_, i) => i); // 0..100%

  const calcPayoff = (u) => {
    const pct = u / 100; // underlying as fraction of initial
    switch (product) {
      case "cpn": {
        const prot = params.protection / 100;
        const up = Math.max(0, pct - 1) * params.participation;
        return Math.max(prot, 1 + up) * 100;
      }
      case "rc": {
        if (pct >= 1) return (1 + params.coupon / 100) * 100;
        return pct * 100 + params.coupon;
      }
      case "brc": {
        const barrier = params.barrier / 100;
        if (pct >= 1) return (1 + params.coupon / 100) * 100;
        if (pct > barrier) return (1 + params.coupon / 100) * 100;
        return pct * 100 + params.coupon;
      }
      case "autocall": {
        // Show payoff if not called — final outcome
        const barrier = params.barrier / 100;
        if (pct >= 1) return (1 + params.coupon / 100) * 100;
        if (pct > barrier) return (1 + params.coupon / 100) * 100;
        return pct * 100;
      }
      default: return 100;
    }
  };

  const payoffs = underlyingRange.map(calcPayoff);
  const minPayoff = Math.min(...payoffs, 0);
  const maxPayoff = Math.max(...payoffs, 130);

  const toX = (u) => padL + (u / 100) * innerW;
  const toY = (p) => padT + innerH - ((p - minPayoff) / (maxPayoff - minPayoff)) * innerH;

  const breakeven = 100;
  const beX = toX(breakeven);
  const zeroY = toY(0);
  const hundredY = toY(100);

  const pathD = payoffs.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p)}`).join(" ");

  // Fill area
  const fillD = `${pathD} L ${toX(100)} ${toY(minPayoff)} L ${toX(0)} ${toY(minPayoff)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block" }}>
      <defs>
        <linearGradient id="payoffGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.gold} stopOpacity="0.25" />
          <stop offset="100%" stopColor={theme.gold} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={theme.goldDim} />
          <stop offset="50%" stopColor={theme.gold} />
          <stop offset="100%" stopColor={theme.goldLight} />
        </linearGradient>
      </defs>

      {/* Grid */}
      {[0, 25, 50, 75, 100, 125].map(v => {
        if (v < minPayoff || v > maxPayoff) return null;
        const y = toY(v);
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={theme.border} strokeWidth="0.5" strokeDasharray={v === 100 ? "none" : "3,4"} />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill={v === 100 ? theme.textMuted : theme.textDim} fontFamily="JetBrains Mono">
              {v}%
            </text>
          </g>
        );
      })}

      {/* Underlying axis labels */}
      {[0, 50, 100].map(v => (
        <text key={v} x={toX(v)} y={H - 6} textAnchor="middle" fontSize="9" fill={theme.textDim} fontFamily="JetBrains Mono">
          {v}%
        </text>
      ))}

      {/* Reference line at 100% payoff */}
      <line x1={padL} y1={hundredY} x2={W - padR} y2={hundredY} stroke={theme.textDim} strokeWidth="1" strokeDasharray="2,3" />

      {/* Fill */}
      <path d={fillD} fill="url(#payoffGrad)" />

      {/* Payoff line */}
      <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 1000, strokeDashoffset: 0, animation: "drawLine 1.2s ease forwards" }} />

      {/* Barrier indicator for BRC */}
      {(product === "brc" || product === "autocall") && (
        <g>
          <line x1={toX(params.barrier)} y1={padT} x2={toX(params.barrier)} y2={padT + innerH} stroke={theme.danger} strokeWidth="1" strokeDasharray="4,3" strokeOpacity="0.7" />
          <text x={toX(params.barrier) + 4} y={padT + 12} fontSize="9" fill={theme.danger} fontFamily="JetBrains Mono" opacity="0.8">
            Barrier
          </text>
        </g>
      )}

      {/* Axes */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke={theme.border} strokeWidth="1" />
      <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke={theme.border} strokeWidth="1" />

      {/* Axis labels */}
      <text x={padL - 4} y={padT - 4} textAnchor="middle" fontSize="9" fill={theme.textDim}>Payoff</text>
      <text x={W - padR} y={padT + innerH + 28} textAnchor="end" fontSize="9" fill={theme.textDim}>Underlying at Maturity</text>
    </svg>
  );
}

// ─── BOND + OPTIONS DECOMPOSITION ─────────────────────────────────────────────
