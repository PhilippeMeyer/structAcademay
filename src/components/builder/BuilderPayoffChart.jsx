import { T } from "./builderTheme.js";
import { calcPayoff } from "./pricing.js";

export default function PayoffChart({ type, params, color = T.gold }) {
  const W = 420, H = 200, pL = 44, pR = 12, pT = 12, pB = 28;
  const iW = W - pL - pR, iH = H - pT - pB;
  const payoffs = calcPayoff(type, params, {});
  const minP = Math.min(...payoffs, 0), maxP = Math.max(...payoffs, 130);
  const toX = i => pL + (i / 200) * iW;
  const toY = p => pT + iH - ((p - minP) / (maxP - minP)) * iH;
  const pathD = payoffs.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p)}`).join(" ");
  const fillD = `${pathD} L ${toX(200)} ${toY(minP)} L ${toX(0)} ${toY(minP)} Z`;
  const hundredY = toY(100);
  const uid = type;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block" }}>
      <defs>
        <linearGradient id={`pg_${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".22" />
          <stop offset="100%" stopColor={color} stopOpacity=".02" />
        </linearGradient>
      </defs>
      {[0, 50, 75, 100, 125].map(v => {
        if (v < minP || v > maxP) return null;
        const y = toY(v);
        return <g key={v}>
          <line x1={pL} y1={y} x2={W - pR} y2={y} stroke={T.border} strokeWidth=".5" strokeDasharray={v === 100 ? "none" : "3,4"} />
          <text x={pL - 5} y={y + 4} textAnchor="end" fontSize="8" fill={T.textDim} fontFamily="JetBrains Mono">{v}%</text>
        </g>;
      })}
      {(type === "brc" || type === "autocall") && (
        <g>
          <line x1={toX(params.barrier ?? 65)} y1={pT} x2={toX(params.barrier ?? 65)} y2={pT + iH} stroke={T.danger} strokeWidth="1" strokeDasharray="3,3" strokeOpacity=".7" />
          <text x={toX(params.barrier ?? 65) + 3} y={pT + 11} fontSize="8" fill={T.danger} fontFamily="JetBrains Mono" opacity=".8">B</text>
        </g>
      )}
      <line x1={pL} y1={hundredY} x2={W - pR} y2={hundredY} stroke={T.textDim} strokeWidth=".8" strokeOpacity=".4" />
      <path d={fillD} fill={`url(#pg_${uid})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {[0, 50, 100, 150, 200].map(v => (
        <text key={v} x={toX(v)} y={H - 4} textAnchor="middle" fontSize="8" fill={T.textDim} fontFamily="JetBrains Mono">{v}%</text>
      ))}
      <line x1={pL} y1={pT} x2={pL} y2={pT + iH} stroke={T.border} />
      <line x1={pL} y1={pT + iH} x2={W - pR} y2={pT + iH} stroke={T.border} />
    </svg>
  );
}

// ─── UNDERLYING SEARCH + QUOTE ────────────────────────────────────────────────
