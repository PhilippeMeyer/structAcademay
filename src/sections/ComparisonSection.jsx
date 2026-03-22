import { useState } from "react";
import { useTheme } from "../theme/ThemeContext.js";

export default function ComparisonSection() {
  const theme = useTheme();
  const [highlight, setHighlight] = useState(null);

  const dimensions = [
    { key: "capital_at_risk", label: "Capital at Risk", values: { cpn: { v: "Limited / None", c: "success" }, rc: { v: "Full (below strike)", c: "danger" }, brc: { v: "Conditional", c: "warning" }, autocall: { v: "Conditional", c: "warning" } } },
    { key: "yield_source", label: "Yield / Income Source", values: { cpn: { v: "Option budget (cost)", c: "neutral" }, rc: { v: "Short put premium", c: "neutral" }, brc: { v: "Short DI put premium", c: "neutral" }, autocall: { v: "Short put + call sold", c: "neutral" } } },
    { key: "path_dependent", label: "Path Dependent", values: { cpn: { v: "No", c: "success" }, rc: { v: "No", c: "success" }, brc: { v: "Yes ⚠", c: "danger" }, autocall: { v: "Yes ⚠", c: "danger" } } },
    { key: "liquidity", label: "Liquidity", values: { cpn: { v: "Issuer bid only", c: "warning" }, rc: { v: "Issuer bid only", c: "warning" }, brc: { v: "Issuer bid only", c: "warning" }, autocall: { v: "Issuer bid only", c: "warning" } } },
    { key: "early_redemption", label: "Early Redemption", values: { cpn: { v: "Issuer option only", c: "neutral" }, rc: { v: "Issuer option only", c: "neutral" }, brc: { v: "Issuer option only", c: "neutral" }, autocall: { v: "Automatic on trigger", c: "accent" } } },
    { key: "typical_client", label: "Typical Client Profile", values: { cpn: { v: "Capital-preservation, low risk tolerance", c: "neutral" }, rc: { v: "Yield-seeking, equity-comfortable", c: "neutral" }, brc: { v: "Yield-seeking, some equity tolerance", c: "neutral" }, autocall: { v: "Income-seeking, medium risk", c: "neutral" } } },
    { key: "market_view", label: "Implicit Market View", values: { cpn: { v: "Cautiously bullish", c: "neutral" }, rc: { v: "Neutral to mildly bullish", c: "neutral" }, brc: { v: "Neutral, no large drawdown", c: "neutral" }, autocall: { v: "Rangebound / mildly bullish", c: "neutral" } } },
    { key: "main_risk", label: "Primary Risk", values: { cpn: { v: "Issuer credit / low participation", c: "warning" }, rc: { v: "Equity downside from strike", c: "danger" }, brc: { v: "Barrier breach + equity tail", c: "danger" }, autocall: { v: "Barrier breach + reinvestment", c: "danger" } } },
    { key: "complexity", label: "Client Explanation Difficulty", values: { cpn: { v: "Low", c: "success" }, rc: { v: "Medium", c: "warning" }, brc: { v: "High", c: "danger" }, autocall: { v: "High", c: "danger" } } },
    { key: "rate_sensitivity", label: "Rate Sensitivity at Inception", values: { cpn: { v: "High (ZCB cost)", c: "danger" }, rc: { v: "Moderate", c: "warning" }, brc: { v: "Moderate", c: "warning" }, autocall: { v: "Moderate", c: "warning" } } },
    { key: "vol_sensitivity", label: "Vol Sensitivity", values: { cpn: { v: "Positive (higher vol → more participation budget)", c: "success" }, rc: { v: "Positive (higher vol → higher coupon)", c: "success" }, brc: { v: "Positive (higher vol → higher coupon)", c: "success" }, autocall: { v: "Positive (higher vol → higher coupon)", c: "success" } } },
    { key: "issuer_credit", label: "Issuer Credit Exposure", values: { cpn: { v: "Full notional", c: "danger" }, rc: { v: "Full notional", c: "danger" }, brc: { v: "Full notional", c: "danger" }, autocall: { v: "Full notional", c: "danger" } } },
  ];

  const products = [
    { id: "cpn", label: "Capital Protected Note", short: "CPN", color: theme.accent },
    { id: "rc", label: "Reverse Convertible", short: "RC", color: theme.warning },
    { id: "brc", label: "Barrier Rev. Conv.", short: "BRC", color: theme.danger },
    { id: "autocall", label: "Autocall / Phoenix", short: "ACALL", color: "#A78BFA" },
  ];

  const cellColors = { success: theme.success, danger: theme.danger, warning: theme.warning, neutral: theme.textMuted, accent: theme.accent };

  return (
    <div className="fade-in" style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div className="section-header">
        <div className="section-icon">📋</div>
        <div>
          <div className="teal-line" style={{ margin: 0, marginBottom: 4 }} />
          <h2 className="playfair" style={{ fontSize: 24 }}>Product Comparison</h2>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>Side-by-side across 12 dimensions — hover a row to focus</p>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
          <thead>
            <tr>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: theme.textDim, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: `1px solid ${theme.border}`, background: theme.surface }}>
                Dimension
              </th>
              {products.map(p => (
                <th key={p.id} style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, color: p.color, fontWeight: 600, borderBottom: `1px solid ${theme.border}`, background: theme.surface, minWidth: 160 }}>
                  <div className="mono" style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>{p.short}</div>
                  {p.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dimensions.map((d, i) => (
              <tr key={d.key}
                onMouseEnter={() => setHighlight(d.key)}
                onMouseLeave={() => setHighlight(null)}
                style={{ background: highlight === d.key ? `rgba(201,168,76,0.05)` : i % 2 === 0 ? theme.surface : theme.bg, transition: "background 0.15s" }}>
                <td style={{ padding: "11px 16px", fontSize: 12, fontWeight: 500, color: theme.text, borderBottom: `1px solid ${theme.border}`, whiteSpace: "nowrap" }}>{d.label}</td>
                {products.map(p => {
                  const val = d.values[p.id];
                  return (
                    <td key={p.id} style={{ padding: "11px 16px", textAlign: "center", borderBottom: `1px solid ${theme.border}` }}>
                      <span style={{ fontSize: 11, color: cellColors[val.c] || theme.textMuted, lineHeight: 1.4, display: "inline-block" }}>{val.v}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="insight-box" style={{ marginTop: 20 }}>
        <strong>All four products share one universal risk — </strong>issuer credit. Regardless of payoff structure, all standard structured notes are unsecured issuer obligations. This row should always be part of any client discussion on structured products.
      </div>
    </div>
  );
}

// ─── PROGRESS TRACKER ─────────────────────────────────────────────────────────
// ─── QUIZ SECTION ─────────────────────────────────────────────────────────────
