import { useState } from "react";
import { useTheme } from "../theme/ThemeContext.js";
import PortfolioChart from "../components/charts/PortfolioChart.jsx";

export default function PortfolioSection() {
  const theme = useTheme();
  const [profile, setProfile] = useState("balanced");
  const [product, setProduct] = useState("brc");
  const [spAlloc, setSpAlloc] = useState(10);

  const profiles = [
    { id: "conservative", label: "Conservative Income", mu: "4%", sigma: "6%", icon: "🛡️" },
    { id: "balanced", label: "Balanced", mu: "7%", sigma: "11%", icon: "⚖️" },
    { id: "growth", label: "Growth / Equity-Heavy", mu: "10%", sigma: "17%", icon: "🚀" },
  ];

  const products = [
    { id: "cpn", label: "Capital Protected Note" }, { id: "rc", label: "Reverse Convertible" },
    { id: "brc", label: "Barrier Rev. Conv." }, { id: "autocall", label: "Autocall" },
  ];

  const messages = {
    conservative_cpn: "A CPN in a conservative portfolio provides additional upside without threatening capital — but the participation cap means returns lag in bull markets. Suitable if client wants market exposure with capital certainty.",
    conservative_brc: "A BRC introduces conditional equity exposure into a conservative portfolio. Even at 5–10% allocation, a barrier breach on a single BRC can materially impact the portfolio. Review downside scenarios carefully.",
    balanced_brc: "In a balanced portfolio, a BRC at 10–15% can enhance yield without significantly altering the overall risk profile — if barriers are set conservatively. Monitor concentration if multiple BRCs reference the same underlying.",
    balanced_autocall: "An Autocall may improve Sharpe in sideways markets. Reinvestment risk is the primary concern: if called early in a rising rate environment, reinvesting at equivalent terms may be difficult.",
    growth_cpn: "A CPN is a yield drag in a growth portfolio. If the client needs equity exposure, direct equity or equity funds are more efficient. CPNs are not equity substitutes.",
    growth_rc: "A short-maturity RC can enhance portfolio yield, but adds downside correlation: if equities fall, the RC converts to equity at exactly the wrong time.",
  };

  const key = `${profile}_${product}`;
  const message = messages[key] || `A ${products.find(p => p.id === product)?.label} at ${spAlloc}% in a ${profiles.find(p => p.id === profile)?.label} portfolio. Review the return distribution carefully — overlap with your existing equity risk is key.`;

  const spProps = {
    cpn: { yield: "low", risk: "low", liquidity: "low", complexity: "medium" },
    rc: { yield: "high", risk: "medium-high", liquidity: "low", complexity: "medium" },
    brc: { yield: "high", risk: "high", liquidity: "low", complexity: "high" },
    autocall: { yield: "medium-high", risk: "medium", liquidity: "low", complexity: "high" },
  }[product];

  const colorMap = { low: theme.success, medium: theme.warning, high: theme.danger, "medium-high": theme.danger, "medium-low": theme.success };

  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="section-header">
        <div className="section-icon">📊</div>
        <div>
          <div className="teal-line" style={{ margin: 0, marginBottom: 4 }} />
          <h2 className="playfair" style={{ fontSize: 24 }}>Portfolio Context</h2>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>Does this make sense for this client?</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Profile */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Reference Portfolio</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {profiles.map(p => (
                <button key={p.id} onClick={() => setProfile(p.id)}
                  style={{ padding: "10px 12px", borderRadius: 4, textAlign: "left", border: `1px solid ${profile === p.id ? theme.gold : theme.border}`, background: profile === p.id ? `rgba(201,168,76,0.08)` : "transparent", transition: "all 0.2s" }}>
                  <span style={{ marginRight: 8 }}>{p.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: profile === p.id ? theme.gold : theme.text }}>{p.label}</span>
                  <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2, paddingLeft: 24 }}>μ ≈ {p.mu} · σ ≈ {p.sigma}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Product + Allocation */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Structured Product Sleeve</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
              {products.map(p => (
                <button key={p.id} onClick={() => setProduct(p.id)}
                  style={{ padding: "7px 10px", borderRadius: 4, textAlign: "left", border: `1px solid ${product === p.id ? theme.gold : theme.border}`, background: product === p.id ? `rgba(201,168,76,0.08)` : "transparent", transition: "all 0.2s", fontSize: 12, color: product === p.id ? theme.gold : theme.textMuted }}>
                  {p.label}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: theme.textMuted }}>Allocation</span>
              <span className="mono" style={{ fontSize: 14, color: theme.gold, fontWeight: 500 }}>{spAlloc}%</span>
            </div>
            <input type="range" min={0} max={30} step={1} value={spAlloc} onChange={e => setSpAlloc(+e.target.value)} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
              <span className="mono" style={{ fontSize: 9, color: theme.textDim }}>0%</span>
              <span className="mono" style={{ fontSize: 9, color: theme.textDim }}>30%</span>
            </div>
          </div>

          {/* Risk props */}
          {spProps && (
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 600, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Product Properties</div>
              {Object.entries(spProps).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: theme.textMuted, textTransform: "capitalize" }}>{k}</span>
                  <span className="pill" style={{ background: `${colorMap[v]}18`, color: colorMap[v], fontSize: 10 }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart + commentary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
              Annual Return Distribution — Base vs With Structured Product
            </div>
            <PortfolioChart profile={profile} spAlloc={spAlloc} product={product} />
          </div>

          <div className="card" style={{ borderColor: `${theme.gold}30`, background: `rgba(201,168,76,0.02)` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.gold, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Portfolio Assessment</div>
            <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.8 }}>{message}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="card" style={{ borderColor: `${theme.warning}40` }}>
              <div style={{ fontSize: 11, color: theme.warning, fontWeight: 600, marginBottom: 6 }}>YIELD IS COMPENSATION</div>
              <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.7 }}>Above-cash yield in a structured product is never "free income." It is the premium received for selling optionality. Ask: what risk is the client taking that the market is paying them for?</div>
            </div>
            <div className="card" style={{ borderColor: `${theme.accent}40` }}>
              <div style={{ fontSize: 11, color: theme.accent, fontWeight: 600, marginBottom: 6 }}>LIQUIDITY ABSENT</div>
              <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.7 }}>Structured products are designed to be held to maturity. Secondary market liquidity depends entirely on the issuer. Do not use structured products to meet potential short-term liquidity needs.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
