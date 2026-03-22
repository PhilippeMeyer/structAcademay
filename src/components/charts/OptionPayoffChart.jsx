import { useTheme } from "../../theme/ThemeContext.js";

export default function OptionPayoffChart({ legs, height = 200 }) {
  const theme = useTheme();
  const violet = theme.isDark ? "#A78BFA" : "#7C3AED";
  // Unique ID suffix to avoid SVG defs collisions across multiple chart instances
  const uid = legs.map(l => `${l.type[0]}${l.position[0]}${l.strike}`).join("_");
  const W = 460, H = height, padL = 48, padR = 16, padT = 16, padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const spot = 100; // reference spot

  // Compute combined P&L at each underlying price
  const xs = Array.from({ length: 201 }, (_, i) => i * 1); // 0..200
  const pnls = xs.map(u => {
    return legs.reduce((sum, leg) => {
      const { type, strike, premium, position, barrier } = leg;
      const dir = position === "long" ? 1 : -1;
      let intrinsic = 0;
      if (type === "call") intrinsic = Math.max(0, u - strike);
      else if (type === "put") intrinsic = Math.max(0, strike - u);
      else if (type === "stock") intrinsic = u - strike; // forward-like
      // barrier: if barrier defined and u < barrier (down-and-in), only active if touched
      // For display we show always-active version
      return sum + dir * (intrinsic - premium);
    }, 0);
  });

  const minPnl = Math.min(...pnls, -15);
  const maxPnl = Math.max(...pnls, 15);
  const range = maxPnl - minPnl;

  const toX = (u) => padL + (u / 200) * innerW;
  const toY = (p) => padT + innerH - ((p - minPnl) / range) * innerH;
  const zeroY = toY(0);

  // Split into profit (above zero) and loss (below zero) segments for colouring
  const profitD = [], lossD = [];
  let profitPath = "", lossPath = "";
  xs.forEach((u, i) => {
    const p = pnls[i];
    const x = toX(u), y = toY(p);
    if (i === 0) { profitPath = `M ${x} ${y}`; lossPath = `M ${x} ${y}`; }
    else { profitPath += ` L ${x} ${y}`; lossPath += ` L ${x} ${y}`; }
  });

  // Fill above zero
  const fillProfit = `${profitPath} L ${toX(200)} ${zeroY} L ${toX(0)} ${zeroY} Z`;
  const fillLoss = `${lossPath} L ${toX(200)} ${zeroY} L ${toX(0)} ${zeroY} Z`;

  // Strike lines
  const strikes = [...new Set(legs.map(l => l.strike))];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block" }}>
      <defs>
        <linearGradient id={`profitFill_${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.success} stopOpacity="0.25" />
          <stop offset="100%" stopColor={theme.success} stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id={`lossFill_${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={theme.danger} stopOpacity="0.25" />
          <stop offset="100%" stopColor={theme.danger} stopOpacity="0.02" />
        </linearGradient>
        <clipPath id={`profitClip_${uid}`}>
          <rect x={padL} y={padT} width={innerW} height={Math.max(0, zeroY - padT)} />
        </clipPath>
        <clipPath id={`lossClip_${uid}`}>
          <rect x={padL} y={zeroY} width={innerW} height={Math.max(0, padT + innerH - zeroY)} />
        </clipPath>
      </defs>

      {/* Grid */}
      {[-30, -20, -10, 0, 10, 20, 30].map(v => {
        if (v < minPnl - 2 || v > maxPnl + 2) return null;
        const y = toY(v);
        return (
          <g key={v}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={v === 0 ? theme.textMuted : theme.border} strokeWidth={v === 0 ? 1 : 0.5} strokeDasharray={v === 0 ? "none" : "3,4"} />
            <text x={padL - 5} y={y + 4} textAnchor="end" fontSize="9" fill={v === 0 ? theme.textMuted : theme.textDim} fontFamily="JetBrains Mono">
              {v > 0 ? `+${v}` : v}
            </text>
          </g>
        );
      })}

      {/* Strike verticals */}
      {strikes.map(s => (
        <g key={s}>
          <line x1={toX(s)} y1={padT} x2={toX(s)} y2={padT + innerH} stroke={violet} strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.5" />
          <text x={toX(s)} y={padT + innerH + 18} textAnchor="middle" fontSize="9" fill={violet} fontFamily="JetBrains Mono" opacity="0.8">K={s}</text>
        </g>
      ))}

      {/* Spot line */}
      <line x1={toX(spot)} y1={padT} x2={toX(spot)} y2={padT + innerH} stroke={theme.gold} strokeWidth="1" strokeDasharray="2,3" strokeOpacity="0.4" />
      <text x={toX(spot)} y={padT - 4} textAnchor="middle" fontSize="8" fill={theme.gold} opacity="0.6">Spot</text>

      {/* Fills */}
      <g clipPath={`url(#profitClip_${uid})`}><path d={fillProfit} fill={`url(#profitFill_${uid})`} /></g>
      <g clipPath={`url(#lossClip_${uid})`}><path d={fillLoss} fill={`url(#lossFill_${uid})`} /></g>

      {/* P&L line */}
      <path d={profitPath} fill="none" stroke={theme.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* X axis labels */}
      {[50, 75, 100, 125, 150].map(v => (
        <text key={v} x={toX(v)} y={H - 4} textAnchor="middle" fontSize="8" fill={theme.textDim} fontFamily="JetBrains Mono">{v}</text>
      ))}

      {/* Axes */}
      <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke={theme.border} />
      <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke={theme.border} />

      {/* Labels */}
      <text x={padL - 4} y={padT - 4} textAnchor="end" fontSize="8" fill={theme.textDim}>P&amp;L</text>
      <text x={W - padR} y={H - 4} textAnchor="end" fontSize="8" fill={theme.textDim}>Underlying</text>
    </svg>
  );
}
