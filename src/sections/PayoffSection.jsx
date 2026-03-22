import { useState } from "react";
import { useTheme } from "../theme/ThemeContext.js";
import ScenarioFan from "../components/charts/ScenarioFan.jsx";

export default function PayoffSection() {
  const theme = useTheme();
  const [product, setProduct] = useState("brc");
  const [scenario, setScenario] = useState("sideways");
  const [params] = useState({ protection: 90, coupon: 8.5, barrier: 65, participation: 100, maturity: 2 });

  const products = [
    { id: "cpn", label: "CPN" }, { id: "rc", label: "RC" }, { id: "brc", label: "BRC" }, { id: "autocall", label: "Autocall" },
  ];
  const scenarios = [
    { id: "sideways", label: "Sideways & Volatile", desc: "Low drift, high vol — the 'grinding' market" },
    { id: "drawdown", label: "Gradual Drawdown", desc: "Moderate negative drift, controlled vol" },
    { id: "sharp", label: "Sharp Drawdown + Recovery", desc: "High vol, significantly negative drift" },
    { id: "bull", label: "Bull Market", desc: "Positive drift, low to moderate vol" },
  ];

  const narratives = {
    sideways: { heading: "Sideways markets favour most structured products — but deceptively.", body: "High volatility without direction means barriers get tested. The BRC coupon looks attractive, but path dependency matters: even if the underlying ends near par, a mid-life breach may have already triggered full downside exposure." },
    drawdown: { heading: "A gradual drawdown is the stress scenario for yield products.", body: "Unlike a sharp crash, a gradual decline gives the client false comfort. Barriers are breached slowly. For Reverse Convertibles and BRCs, the coupon received does not compensate for the equity replacement at depressed levels." },
    sharp: { heading: "Sharp moves make path-dependent products unpredictable.", body: "A sharp drop that recovers does not 'undo' a barrier breach. This is the key mis-selling risk: clients focus on the terminal price, not on whether the barrier was touched intraday. Always explain: 'If the barrier is hit, the product behaves like a long equity position — not a bond.'" },
    bull: { heading: "Bull markets expose the opportunity cost of capital protection.", body: "Capital Protected Notes cap participation. In a strong bull market, the client may significantly underperform a direct equity investment. This is not a product failure — it's a deliberate trade-off. Ensure clients understand the cost of protection before markets rise." },
  };

  const narr = narratives[scenario];

  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="section-header">
        <div className="section-icon">🎲</div>
        <div>
          <div className="teal-line" style={{ margin: 0, marginBottom: 4 }} />
          <h2 className="playfair" style={{ fontSize: 24 }}>Payoff Explorer</h2>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>What can actually happen — dispersion, not promises</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {products.map(p => (
            <button key={p.id} onClick={() => setProduct(p.id)}
              style={{ padding: "6px 14px", borderRadius: 4, fontSize: 12, fontWeight: 600, border: `1px solid ${product === p.id ? theme.gold : theme.border}`, background: product === p.id ? `rgba(201,168,76,0.1)` : "transparent", color: product === p.id ? theme.gold : theme.textMuted, transition: "all 0.2s" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
              Scenario Outcome Fan — Underlying Index Level
            </div>
            <ScenarioFan product={product} params={params} scenario={scenario} />
          </div>

          <div className="card" style={{ borderColor: `${theme.gold}30`, background: `rgba(201,168,76,0.02)` }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: theme.text }}>{narr.heading}</div>
            <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.8 }}>{narr.body}</div>
          </div>
        </div>

        {/* Scenario picker */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Market Scenario</div>
          {scenarios.map(s => (
            <button key={s.id} onClick={() => setScenario(s.id)}
              style={{
                padding: "12px 14px", borderRadius: 4, textAlign: "left",
                border: `1px solid ${scenario === s.id ? theme.gold : theme.border}`,
                background: scenario === s.id ? `rgba(201,168,76,0.08)` : theme.surface,
                transition: "all 0.2s",
              }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: scenario === s.id ? theme.gold : theme.text, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.5 }}>{s.desc}</div>
            </button>
          ))}

          <div className="card" style={{ marginTop: 8, background: `rgba(248,81,73,0.04)`, borderColor: `${theme.danger}30` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.danger, marginBottom: 6, letterSpacing: "0.05em" }}>PATH DEPENDENCY</div>
            <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.7 }}>
              Payoff charts show terminal outcomes only. Barriers are monitored <em>continuously</em>. A product that "recovers" at maturity may have triggered full downside months earlier.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
