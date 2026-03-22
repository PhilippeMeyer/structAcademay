import UNDERLYINGS from "../data/underlyings.js";
import { useState } from "react";
import { useTheme } from "../theme/ThemeContext.js";

export default function VolatilitySection() {
  const theme = useTheme();
  const [vol, setVol] = useState(20);
  const [rates, setRates] = useState(3);
  const [dividends, setDividends] = useState(2);
  const [maturity, setMaturity] = useState(2);
  const [product, setProduct] = useState("brc");
  const [regime, setRegime] = useState(null);

  const regimes = [
    { id: "low_vol", label: "Low Vol / ZIRP", icon: "😴", vol: 12, rates: 0.5, dividends: 2.5, maturity: 2, desc: "2019–2021 environment. Near-zero rates crushed CPN participation; BRC coupons were thin. Autocalls were popular as the main yield source." },
    { id: "high_vol", label: "Crisis / High Vol", icon: "🔥", vol: 38, rates: 2, dividends: 1.5, maturity: 1, desc: "2008 / 2020 crash environment. BRC coupons spiked (options expensive), but barrier breach risk was extreme. Many products knocked in." },
    { id: "rate_shock", label: "Rate Shock", icon: "📈", vol: 22, rates: 5, dividends: 3, maturity: 2, desc: "2022–2023 environment. Rising rates boosted CPN participation rates significantly. BRC coupons also rose. ZCB cheaper → more option budget." },
    { id: "normal", label: "Normal Market", icon: "⚖️", vol: 20, rates: 3, dividends: 2, maturity: 2, desc: "Baseline mid-cycle environment. Moderate vol, positive carry, normal yield curve. Typical product economics apply." },
  ];

  const applyRegime = (r) => {
    setRegime(r.id); setVol(r.vol); setRates(r.rates); setDividends(r.dividends); setMaturity(r.maturity);
  };

  // Simplified option budget and coupon model (directional, illustrative)
  const optionBudget = Math.max(2, Math.min(25, (1 - Math.exp(-rates / 100 * maturity)) * 100 * 0.85));
  const volFactor = vol / 20;
  const divFactor = dividends / 2;

  const metrics = {
    brc: {
      coupon: Math.min(18, Math.max(1.5, (vol * 0.38 + rates * 0.2 - dividends * 0.15) * (maturity * 0.4))),
      barrierProb: Math.min(55, Math.max(3, vol * 0.9 - 8)),
      label: "BRC Coupon (est. p.a.)",
      color: theme.gold,
    },
    cpn: {
      participation: Math.min(150, Math.max(10, optionBudget * (vol * 0.12) / maturity * 3.5)),
      label: "CPN Participation Rate",
      color: theme.accent,
    },
    autocall: {
      coupon: Math.min(20, Math.max(2, (vol * 0.42 + rates * 0.18 - dividends * 0.12) * (maturity * 0.35))),
      label: "Autocall Coupon (est. p.a.)",
      color: "#A78BFA",
    },
  };

  const m = metrics[product];

  const drivers = [
    {
      param: "Implied Volatility", value: `${vol}%`, direction: vol > 20 ? "↑" : vol < 20 ? "↓" : "—",
      effect: {
        brc: vol > 20 ? "Higher coupon — put more valuable" : "Lower coupon — put cheaper",
        cpn: vol > 20 ? "Higher participation — call more valuable" : "Lower participation — call cheaper",
        autocall: vol > 20 ? "Higher coupon — more premium collected" : "Lower coupon — less premium",
      }[product],
      color: vol > 20 ? theme.success : vol < 20 ? theme.danger : theme.textMuted,
    },
    {
      param: "Interest Rates", value: `${rates}%`, direction: rates > 3 ? "↑" : rates < 3 ? "↓" : "—",
      effect: {
        brc: rates > 3 ? "Slightly higher coupon (forward effect)" : "Slightly lower coupon",
        cpn: rates > 3 ? "More option budget — ZCB cheaper → higher participation" : "Less option budget — ZCB expensive → lower participation",
        autocall: rates > 3 ? "Higher coupon + better carry on bond leg" : "Lower coupon, less carry",
      }[product],
      color: rates > 3 ? theme.success : rates < 3 ? theme.danger : theme.textMuted,
    },
    {
      param: "Dividend Yield", value: `${dividends}%`, direction: dividends > 2 ? "↑" : dividends < 2 ? "↓" : "—",
      effect: {
        brc: dividends > 2 ? "Slightly lower coupon — dividends reduce put premium" : "Higher coupon — lower dividends inflate put value",
        cpn: dividends > 2 ? "Lower participation — dividends reduce call value" : "Higher participation — lower dividends inflate call",
        autocall: dividends > 2 ? "Slightly lower coupon" : "Slightly higher coupon",
      }[product],
      color: dividends > 2 ? theme.danger : dividends < 2 ? theme.success : theme.textMuted,
    },
    {
      param: "Maturity", value: `${maturity}Y`, direction: maturity > 2 ? "↑" : maturity < 2 ? "↓" : "—",
      effect: {
        brc: maturity > 2 ? "Higher total coupon (more time = more premium)" : "Lower total coupon",
        cpn: maturity > 2 ? "More option budget available (ZCB cheaper over longer horizon at positive rates)" : "Less option budget",
        autocall: maturity > 2 ? "Higher potential coupon but more reinvestment uncertainty" : "Lower coupon, faster potential redemption",
      }[product],
      color: theme.textMuted,
    },
  ];

  // Simple SVG budget bar for CPN
  const zcbPct = Math.min(97, Math.max(70, 100 - optionBudget));
  const optPct = 100 - zcbPct;

  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="section-header">
        <div className="section-icon">🎛️</div>
        <div>
          <div className="teal-line" style={{ margin: 0, marginBottom: 4 }} />
          <h2 className="playfair" style={{ fontSize: 24 }}>Volatility & Pricing Intuition</h2>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>How market conditions shift product economics — no formulas, just cause and effect</p>
        </div>
      </div>

      {/* Regime presets */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {regimes.map(r => (
          <button key={r.id} onClick={() => applyRegime(r)}
            style={{ padding: "8px 14px", borderRadius: 4, fontSize: 12, fontWeight: 500, border: `1px solid ${regime === r.id ? theme.gold : theme.border}`, background: regime === r.id ? "rgba(201,168,76,0.1)" : "transparent", color: regime === r.id ? theme.gold : theme.textMuted, transition: "all 0.2s", cursor: "pointer" }}>
            {r.icon} {r.label}
          </button>
        ))}
      </div>

      {regime && (
        <div className="card" style={{ marginBottom: 20, borderColor: `${theme.gold}30`, background: `rgba(201,168,76,0.03)`, padding: "12px 16px" }}>
          <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.8 }}>{regimes.find(r => r.id === regime)?.desc}</div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Market Parameters</div>
            {[
              { label: "Implied Volatility", key: "vol", val: vol, set: setVol, min: 8, max: 60, step: 1, fmt: v => `${v}%` },
              { label: "Risk-Free Rate", key: "rates", val: rates, set: setRates, min: 0, max: 8, step: 0.25, fmt: v => `${v}%` },
              { label: "Dividend Yield", key: "div", val: dividends, set: setDividends, min: 0, max: 6, step: 0.25, fmt: v => `${v}%` },
              { label: "Maturity", key: "mat", val: maturity, set: setMaturity, min: 1, max: 5, step: 0.5, fmt: v => `${v}Y` },
            ].map(ctrl => (
              <div key={ctrl.key} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: theme.textMuted }}>{ctrl.label}</span>
                  <span className="mono" style={{ fontSize: 13, color: theme.gold, fontWeight: 500 }}>{ctrl.fmt(ctrl.val)}</span>
                </div>
                <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step} value={ctrl.val} onChange={e => { setRegime(null); ctrl.set(parseFloat(e.target.value)); }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                  <span className="mono" style={{ fontSize: 9, color: theme.textDim }}>{ctrl.fmt(ctrl.min)}</span>
                  <span className="mono" style={{ fontSize: 9, color: theme.textDim }}>{ctrl.fmt(ctrl.max)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Product selector */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Product</div>
            {[{ id: "brc", label: "Barrier Rev. Conv." }, { id: "cpn", label: "Capital Protected Note" }, { id: "autocall", label: "Autocall" }].map(p => (
              <button key={p.id} onClick={() => setProduct(p.id)}
                style={{ display: "block", width: "100%", padding: "8px 10px", marginBottom: 6, borderRadius: 4, textAlign: "left", border: `1px solid ${product === p.id ? theme.gold : theme.border}`, background: product === p.id ? "rgba(201,168,76,0.08)" : "transparent", color: product === p.id ? theme.gold : theme.textMuted, fontSize: 12, cursor: "pointer" }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Output panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Key metric */}
          <div className="card" style={{ borderColor: `${m.color}40`, background: `${m.color}06`, textAlign: "center", padding: "28px 20px" }}>
            <div style={{ fontSize: 12, color: theme.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{m.label}</div>
            {product === "cpn" ? (
              <div className="mono" style={{ fontSize: 52, fontWeight: 700, color: m.color }}>{Math.round(metrics.cpn.participation)}%</div>
            ) : (
              <div className="mono" style={{ fontSize: 52, fontWeight: 700, color: m.color }}>{(product === "brc" ? metrics.brc.coupon : metrics.autocall.coupon).toFixed(1)}%</div>
            )}
            <div style={{ fontSize: 11, color: theme.textDim, marginTop: 4 }}>Illustrative — directional only</div>
          </div>

          {/* CPN budget visualisation */}
          {product === "cpn" && (
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Capital Allocation (illustrative)</div>
              <div style={{ display: "flex", height: 28, borderRadius: 4, overflow: "hidden", gap: 2, marginBottom: 10 }}>
                <div style={{ width: `${zcbPct}%`, background: theme.accent, opacity: 0.75, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>ZCB {Math.round(zcbPct)}%</span>
                </div>
                <div style={{ width: `${optPct}%`, background: theme.success, opacity: 0.75, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>Option {Math.round(optPct)}%</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.7 }}>
                At {rates}% rates over {maturity}Y: the zero-coupon bond consumes ~{Math.round(zcbPct)}% of capital. The remaining ~{Math.round(optPct)}% buys the call option — this budget, combined with {vol}% implied vol, determines the participation rate.
              </div>
            </div>
          )}

          {/* Driver explanations */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>What's driving the economics</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {drivers.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: 10, borderBottom: i < drivers.length - 1 ? `1px solid ${theme.border}` : "none" }}>
                  <div style={{ flexShrink: 0, minWidth: 130 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: theme.text }}>{d.param}</div>
                    <div className="mono" style={{ fontSize: 13, color: d.color, fontWeight: 600 }}>{d.direction} {d.value}</div>
                  </div>
                  <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.7 }}>{d.effect}</div>
                </div>
              ))}
            </div>
          </div>

          {product === "brc" && (
            <div className="card" style={{ borderColor: `${theme.danger}30`, background: `rgba(248,81,73,0.04)` }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: theme.danger, marginBottom: 6 }}>BARRIER BREACH PROBABILITY (illustrative)</div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div className="mono" style={{ fontSize: 32, color: theme.danger, fontWeight: 700 }}>{Math.round(metrics.brc.barrierProb)}%</div>
                <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.7 }}>At {vol}% vol over {maturity}Y with a 65% barrier. Higher vol → higher coupon AND higher breach probability. The two are inseparable.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── WORST-OF BASKET SECTION ──────────────────────────────────────────────────
