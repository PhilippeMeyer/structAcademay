import { useState } from "react";
import { useTheme } from "../theme/ThemeContext.js";

export default function StressSection() {
  const theme = useTheme();
  const [product, setProduct] = useState("brc");
  const [episode, setEpisode] = useState("gfc");

  const products = [
    { id: "brc", label: "BRC", barrier: 65, coupon: 8.5, strike: 100 },
    { id: "rc", label: "RC", barrier: null, coupon: 9, strike: 100 },
    { id: "cpn", label: "CPN", protection: 90, participation: 100 },
    { id: "autocall", label: "Autocall", barrier: 65, coupon: 10, strike: 100 },
  ];

  const episodes = {
    gfc: {
      label: "2008 Global Financial Crisis",
      period: "Sep 2008 – Mar 2009",
      maxDrawdown: -56,
      path: [100,97,94,88,79,68,61,55,52,58,54,51,57,62,60,56,52,49,46,44,46,50,54,58],
      narrative: "The S&P 500 fell 56% peak-to-trough. Lehman Brothers defaulted in September 2008 — rendering its structured products worthless regardless of payoff. Barriers on most 60–70% BRCs were breached within weeks. Many Autocalls ran to final maturity in severe loss territory.",
      lehman: true,
    },
    covid: {
      label: "COVID-19 Crash",
      period: "Feb – Mar 2020",
      maxDrawdown: -34,
      path: [100,102,104,106,104,100,95,88,78,68,66,68,72,78,84,90,96,100,104,108,112,116,118,120],
      narrative: "A rapid -34% drawdown in 33 days, followed by an equally sharp V-shaped recovery. Many BRCs with 65% barriers were breached intraday in late March 2020. Products that survived without breach recovered fully and often autocalled. Speed of breach — not depth — was the critical factor.",
      lehman: false,
    },
    rates2022: {
      label: "2022 Rate Shock",
      period: "Jan – Dec 2022",
      maxDrawdown: -25,
      path: [100,98,95,92,88,84,80,82,80,78,76,78,80,82,79,77,76,75,74,76,77,78,79,80],
      narrative: "A grinding -25% drawdown across 12 months with no sharp recovery — driven by rate hikes. Capital Protected Notes suffered negative MTM as rates rose. Autocalls that survived multiple observation dates without being called held clients in underperforming positions for the full year.",
      lehman: false,
    },
    dotcom: {
      label: "Dot-com Bust",
      period: "Mar 2000 – Oct 2002",
      maxDrawdown: -49,
      path: [100,102,98,94,89,84,78,72,68,65,62,60,57,55,52,50,53,55,52,50,51,53,54,56],
      narrative: "A slow, grinding -49% over 30 months with multiple false recoveries. Autocalls never triggered as markets consistently stayed below strike. BRC barriers were breached gradually. The slow pace meant clients held losing positions for extended periods, with each quarter bringing new disappointment.",
      lehman: false,
    },
  };

  const ep = episodes[episode];
  const prod = products.find(p => p.id === product);

  // Compute product payoff path
  const computePayoff = (underlyingPath, prod) => {
    let barrierBreached = false;
    return underlyingPath.map((u, i) => {
      if (prod.barrier && u <= prod.barrier) barrierBreached = true;
      if (prod.id === "brc" || prod.id === "rc") {
        if (i === underlyingPath.length - 1) {
          const couponTotal = prod.coupon;
          if (u >= prod.strike) return 100 + couponTotal;
          if (prod.id === "rc") return u + couponTotal;
          if (prod.id === "brc") return barrierBreached ? u + couponTotal : 100 + couponTotal;
        }
        return barrierBreached ? Math.max(u, 60) : Math.min(100 + (i / underlyingPath.length) * prod.coupon, 102);
      }
      if (prod.id === "cpn") {
        const ret = (u - 100) / 100;
        const payoff = Math.max(prod.protection, 100 + Math.max(0, ret) * prod.participation);
        return 90 + (payoff - 90) * 0.7 + i * 0.1; // smooth MTM approximation
      }
      if (prod.id === "autocall") {
        if (!barrierBreached && u >= prod.strike) return 100 + prod.coupon * (i / underlyingPath.length);
        return barrierBreached ? u : Math.min(100 + (i / underlyingPath.length) * prod.coupon * 0.5, 101);
      }
      return 100;
    });
  };

  const payoffPath = computePayoff(ep.path, prod);
  const finalPayoff = payoffPath[payoffPath.length - 1];
  const barrierBreached = prod.barrier && ep.path.some(u => u <= prod.barrier);
  const minUnderlying = Math.min(...ep.path);

  // SVG chart
  const W = 480, H = 220, padL = 48, padR = 16, padT = 16, padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const n = ep.path.length;
  const allVals = [...ep.path, ...payoffPath, 100, prod.barrier || 100];
  const minV = Math.min(...allVals) - 5;
  const maxV = Math.max(...allVals) + 5;
  const toX = (i) => padL + (i / (n - 1)) * innerW;
  const toY = (v) => padT + innerH - ((v - minV) / (maxV - minV)) * innerH;
  const makePath = (arr) => arr.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(v)}`).join(" ");

  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="section-header">
        <div className="section-icon">📉</div>
        <div>
          <div className="teal-line" style={{ margin: 0, marginBottom: 4 }} />
          <h2 className="playfair" style={{ fontSize: 24 }}>Historical Stress Tests</h2>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>Real market episodes — what would have happened to your client</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {products.map(p => (
          <button key={p.id} onClick={() => setProduct(p.id)}
            style={{ padding: "7px 14px", borderRadius: 4, fontSize: 12, fontWeight: 600, border: `1px solid ${product === p.id ? theme.gold : theme.border}`, background: product === p.id ? "rgba(201,168,76,0.1)" : "transparent", color: product === p.id ? theme.gold : theme.textMuted, transition: "all 0.2s" }}>
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
              Underlying vs Product MTM — {ep.label}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
              {/* Grid */}
              {[60, 70, 80, 90, 100, 110].map(v => v >= minV && v <= maxV && (
                <g key={v}>
                  <line x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)} stroke={theme.border} strokeWidth="0.5" strokeDasharray={v === 100 ? "none" : "3,4"} />
                  <text x={padL - 5} y={toY(v) + 4} textAnchor="end" fontSize="9" fill={theme.textDim} fontFamily="JetBrains Mono">{v}</text>
                </g>
              ))}
              {/* Barrier */}
              {prod.barrier && (
                <g>
                  <line x1={padL} y1={toY(prod.barrier)} x2={W - padR} y2={toY(prod.barrier)} stroke={theme.danger} strokeWidth="1.5" strokeDasharray="4,3" strokeOpacity="0.7" />
                  <text x={W - padR - 2} y={toY(prod.barrier) - 4} textAnchor="end" fontSize="9" fill={theme.danger} fontFamily="JetBrains Mono">Barrier {prod.barrier}%</text>
                </g>
              )}
              {/* Underlying path */}
              <path d={makePath(ep.path)} fill="none" stroke={theme.textMuted} strokeWidth="1.5" strokeDasharray="5,3" strokeOpacity="0.6" />
              {/* Product path */}
              <path d={makePath(payoffPath)} fill="none" stroke={theme.gold} strokeWidth="2.5" strokeLinecap="round" />
              {/* Par line */}
              <line x1={padL} y1={toY(100)} x2={W - padR} y2={toY(100)} stroke={theme.textDim} strokeWidth="1" strokeOpacity="0.4" />
              {/* Axes */}
              <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke={theme.border} />
              <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke={theme.border} />
              {/* Time labels */}
              {[0, Math.floor(n / 3), Math.floor(2 * n / 3), n - 1].map(i => (
                <text key={i} x={toX(i)} y={H - 4} textAnchor="middle" fontSize="8" fill={theme.textDim} fontFamily="JetBrains Mono">M{i}</text>
              ))}
            </svg>
            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 20, height: 2, background: theme.gold, borderRadius: 1 }} /><span style={{ fontSize: 10, color: theme.textMuted }}>Product MTM</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 20, height: 2, background: theme.textMuted, opacity: 0.5, borderRadius: 1, borderTop: `2px dashed ${theme.textMuted}` }} /><span style={{ fontSize: 10, color: theme.textMuted }}>Underlying</span></div>
            </div>
          </div>

          {/* Outcome cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[
              { label: "Underlying Max Drawdown", value: `${ep.maxDrawdown}%`, color: theme.danger },
              { label: "Barrier Breached", value: barrierBreached ? "Yes ⛔" : prod.barrier ? "No ✓" : "N/A", color: barrierBreached ? theme.danger : theme.success },
              { label: "Indicative Final Payoff", value: `~${finalPayoff.toFixed(0)}%`, color: finalPayoff >= 100 ? theme.success : finalPayoff >= 85 ? theme.warning : theme.danger },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: "10px 14px", borderColor: `${s.color}40` }}>
                <div style={{ fontSize: 10, color: theme.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</div>
                <div className="mono" style={{ fontSize: 16, color: s.color, fontWeight: 500 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ borderColor: `${theme.gold}30`, background: "rgba(201,168,76,0.02)" }}>
            <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.8 }}>{ep.narrative}</div>
          </div>

          {ep.lehman && (
            <div className="card" style={{ borderColor: `${theme.danger}50`, background: "rgba(248,81,73,0.05)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: theme.danger, marginBottom: 6 }}>⚠ ISSUER DEFAULT — LEHMAN BROTHERS 2008</div>
              <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.8 }}>Lehman Brothers was a major structured product issuer. On 15 September 2008, it filed for bankruptcy. Holders of Lehman-issued structured products received recovery values of 8–28 cents on the dollar — regardless of the product's payoff structure. Capital protection is a contractual obligation of the issuer, not a segregated asset. This is issuer credit risk in practice.</div>
            </div>
          )}
        </div>

        {/* Episode picker */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Historical Episode</div>
          {Object.entries(episodes).map(([id, ep]) => (
            <button key={id} onClick={() => setEpisode(id)}
              style={{ padding: "12px 14px", borderRadius: 4, textAlign: "left", border: `1px solid ${episode === id ? theme.gold : theme.border}`, background: episode === id ? "rgba(201,168,76,0.08)" : theme.surface, transition: "all 0.2s" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: episode === id ? theme.gold : theme.text, marginBottom: 2 }}>{ep.label}</div>
              <div style={{ fontSize: 10, color: theme.textMuted }}>{ep.period}</div>
              <div className="mono" style={{ fontSize: 12, color: theme.danger, marginTop: 4 }}>{ep.maxDrawdown}% max drawdown</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CREDIT RISK SECTION ──────────────────────────────────────────────────────
