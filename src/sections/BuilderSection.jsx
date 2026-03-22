import { useState } from "react";
import { useTheme } from "../theme/ThemeContext.js";
import { GT } from "../components/Tooltip.jsx";
import PayoffChart from "../components/charts/PayoffChart.jsx";
import DecompositionView from "../components/charts/DecompositionView.jsx";

export default function BuilderSection() {
  const theme = useTheme();
  const [product, setProduct] = useState("brc");
  const [params, setParams] = useState({ protection: 90, coupon: 8.5, barrier: 65, participation: 100, maturity: 2 });

  const products = [
    { id: "cpn", label: "Capital Protected Note", short: "CPN" },
    { id: "rc", label: "Reverse Convertible", short: "RC" },
    { id: "brc", label: "Barrier Reverse Convertible", short: "BRC" },
    { id: "autocall", label: "Autocall / Phoenix", short: "ACALL" },
  ];

  const insights = {
    cpn: [
      { trigger: params.protection > 95, text: <span>Near-100% <GT>Capital Protection</GT> leaves very little budget for upside <GT>Participation Rate</GT> — the participation rate will be minimal.</span> },
      { trigger: params.protection < 85, text: <span>Lower <GT>Capital Protection</GT> frees up option budget — <GT>Participation Rate</GT> can be higher, but you're accepting more downside risk at maturity.</span> },
      { trigger: true, text: <span>Capital protection level: {params.protection}%. The issuer buys a <GT>Zero-Coupon Bond</GT> for this amount and uses the rest to purchase <GT>Call Option</GT>s.</span> },
    ],
    rc: [
      { trigger: params.coupon > 12, text: <span><GT>Coupon</GT>s above 12% typically imply either high-<GT>Volatility</GT> underlyings or very short maturities — the <GT>Put Option</GT> being sold is increasingly in-the-money.</span> },
      { trigger: true, text: <span>The {params.coupon.toFixed(1)}% <GT>Coupon</GT> is funded by selling a <GT>Put Option</GT> on the underlying. If the underlying falls at maturity, the client receives shares — <GT>Physical Delivery</GT>.</span> },
    ],
    brc: [
      { trigger: params.barrier > 80, text: <span>A high <GT>Barrier</GT> (&gt;80%) provides limited conditional protection — the probability of <GT>Knock-In</GT> in a drawdown scenario is significant.</span> },
      { trigger: params.barrier < 55, text: <span>A low <GT>Barrier</GT> (&lt;55%) dramatically reduces the probability of breach and allows a higher <GT>Coupon</GT> — but tail exposure is still real.</span> },
      { trigger: true, text: <span>The <GT>Barrier</GT> at {params.barrier}% converts a <GT>Put Option</GT> into a <GT>Down-and-In Put</GT>. This is the core of <GT>Path Dependency</GT>: once breached, full downside applies.</span> },
    ],
    autocall: [
      { trigger: true, text: <span><GT>Autocall</GT> reduces the issuer's duration risk by allowing early redemption — but introduces <GT>Reinvestment Risk</GT> for the client. If called in year 1, you must redeploy at prevailing rates.</span> },
      { trigger: params.coupon > 10, text: <span>A <GT>Coupon</GT> above 10% in an <GT>Autocall</GT> suggests either high underlying <GT>Volatility</GT> or a low autocall trigger — confirm which risk is being compensated.</span> },
    ],
  };

  const activeInsights = (insights[product] || []).filter(i => i.trigger);

  const paramControls = {
    cpn: [
      { key: "protection", label: "Capital Protection", min: 70, max: 100, step: 1, fmt: (v) => `${v}%` },
      { key: "participation", label: "Upside Participation", min: 10, max: 200, step: 5, fmt: (v) => `${v}%` },
      { key: "maturity", label: "Maturity", min: 1, max: 6, step: 1, fmt: (v) => `${v}Y` },
    ],
    rc: [
      { key: "coupon", label: "Coupon (p.a.)", min: 2, max: 20, step: 0.5, fmt: (v) => `${v.toFixed(1)}%` },
      { key: "maturity", label: "Maturity", min: 1, max: 3, step: 1, fmt: (v) => `${v}Y` },
    ],
    brc: [
      { key: "coupon", label: "Coupon (p.a.)", min: 2, max: 20, step: 0.5, fmt: (v) => `${v.toFixed(1)}%` },
      { key: "barrier", label: "Barrier Level", min: 40, max: 85, step: 5, fmt: (v) => `${v}%` },
      { key: "maturity", label: "Maturity", min: 1, max: 3, step: 1, fmt: (v) => `${v}Y` },
    ],
    autocall: [
      { key: "coupon", label: "Coupon (Conditional p.a.)", min: 3, max: 18, step: 0.5, fmt: (v) => `${v.toFixed(1)}%` },
      { key: "barrier", label: "Barrier Level", min: 40, max: 80, step: 5, fmt: (v) => `${v}%` },
      { key: "maturity", label: "Max Maturity", min: 2, max: 5, step: 1, fmt: (v) => `${v}Y` },
    ],
  };

  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="section-header">
        <div className="section-icon">⚙️</div>
        <div>
          <div className="teal-line" style={{ margin: 0, marginBottom: 4 }} />
          <h2 className="playfair" style={{ fontSize: 24 }}>Product Builder</h2>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>Bond + options Lego — build intuition about structure, not pricing</p>
        </div>
      </div>

      {/* Product selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {products.map(p => (
          <button key={p.id} onClick={() => setProduct(p.id)}
            style={{
              padding: "8px 16px", borderRadius: 4, fontSize: 12, fontWeight: 500, letterSpacing: "0.04em",
              border: `1px solid ${product === p.id ? theme.gold : theme.border}`,
              background: product === p.id ? `rgba(201,168,76,0.1)` : "transparent",
              color: product === p.id ? theme.gold : theme.textMuted,
              transition: "all 0.2s",
            }}>
            <span className="mono" style={{ fontSize: 10, marginRight: 6, opacity: 0.7 }}>{p.short}</span>
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Parameters</div>
            {(paramControls[product] || []).map(ctrl => (
              <div key={ctrl.key} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>{ctrl.label}</span>
                  <span className="mono" style={{ fontSize: 13, color: theme.gold, fontWeight: 500 }}>{ctrl.fmt(params[ctrl.key])}</span>
                </div>
                <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step}
                  value={params[ctrl.key]}
                  onChange={e => setParams(p => ({ ...p, [ctrl.key]: parseFloat(e.target.value) }))} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                  <span className="mono" style={{ fontSize: 9, color: theme.textDim }}>{ctrl.fmt(ctrl.min)}</span>
                  <span className="mono" style={{ fontSize: 9, color: theme.textDim }}>{ctrl.fmt(ctrl.max)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Insights */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Learning Cues</div>
            {activeInsights.slice(0, 2).map((ins, i) => (
              <div key={i} className="insight-box" style={{ marginTop: i === 0 ? 0 : 8 }}>
                {ins.text}
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
              Payoff at Maturity
            </div>
            <PayoffChart product={product} params={params} />
          </div>

          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
              Bond + Options Decomposition
            </div>
            <DecompositionView product={product} params={params} />
          </div>
        </div>
      </div>
    </div>
  );
}
