import { useState } from "react";
import { useTheme } from "../theme/ThemeContext.js";

export default function LifecycleSection() {
  const theme = useTheme();
  const [product, setProduct] = useState("brc");
  const [currentStep, setCurrentStep] = useState(0);

  const products = [
    { id: "brc", label: "Barrier Reverse Convertible" },
    { id: "autocall", label: "Autocall / Phoenix" },
    { id: "cpn", label: "Capital Protected Note" },
    { id: "rc", label: "Reverse Convertible" },
  ];

  const timelines = {
    brc: [
      { month: 0, label: "Inception", icon: "🏁", type: "event", title: "Trade Date & Pricing", desc: "The issuer prices the BRC. A strike price (typically 100% of spot) and a barrier level (e.g. 65% of spot) are set. The coupon is fixed — reflecting implied volatility, dividend yield, and the barrier level. The client commits capital. No optionality left after this point.", status: "neutral", risk: "Barrier is monitoring from Day 1. Any intraday print at or below the barrier activates downside exposure — including on the day of inception." },
      { month: 1, label: "Month 1–3", icon: "📊", type: "monitoring", title: "Continuous Barrier Monitoring", desc: "The barrier is monitored continuously (European-style barriers are end-of-life only; American-style — most common in retail — are daily or intraday). Even a brief spike down that touches the barrier locks in equity-like exposure for the remaining life.", status: "watch", risk: "If the underlying drops sharply and recovers, the product still behaves like a long equity position from that point forward. The recovery doesn't undo the breach." },
      { month: 6, label: "Mid-Life", icon: "📉", type: "scenario", title: "Barrier Breach Scenario", desc: "If the underlying has traded at or below the barrier at any point, the product is now 'knocked in.' The investor is now long equity from the strike level. Any further decline is fully their risk. The coupon continues to accrue regardless.", status: "danger", risk: "This is the most common point of client surprise. Many investors assume recovery = protection restored. It does not. Once breached, the down-and-in put is permanently activated." },
      { month: 18, label: "Month 18", icon: "⏳", type: "monitoring", title: "Ongoing Coupon Accrual", desc: "The coupon (e.g. 8.5% p.a.) continues to accrue throughout the product's life regardless of the underlying's performance or barrier status. It is paid at maturity along with the principal settlement.", status: "neutral", risk: "Clients sometimes interpret the coupon as evidence the product is 'working.' Remind them: the coupon is the premium paid upfront for the risks they accepted — not a signal of product health." },
      { month: 24, label: "Maturity", icon: "🏦", type: "settlement", title: "Final Settlement", desc: "Two outcomes: (1) Barrier NOT breached → client receives 100% par + total coupon. (2) Barrier WAS breached AND underlying closes below strike → client receives shares at strike price (physical delivery) or cash equivalent. In a -40% scenario with an 8.5% coupon, the net loss is approximately 31.5%.", status: "final", risk: "Physical delivery means the client receives depreciated shares, not cash. They now hold a concentrated equity position they may not want, at a price above market." },
    ],
    autocall: [
      { month: 0, label: "Inception", icon: "🏁", type: "event", title: "Trade Date & Pricing", desc: "The Autocall is priced with a conditional coupon (e.g. 10% p.a.), an autocall trigger (typically 100% of strike), a barrier (e.g. 65%), and observation dates (typically quarterly or annually). All parameters are fixed at inception.", status: "neutral", risk: "The investor has simultaneously sold a put (downside exposure) and granted the issuer a call option (early redemption right). Both are priced into the conditional coupon." },
      { month: 3, label: "Q1 Observation", icon: "🔔", type: "observation", title: "First Autocall Observation", desc: "On the first observation date, if the underlying closes at or above the autocall trigger: the note is called. The investor receives par + coupon for the period (e.g. 2.5% for one quarter). If below trigger: product continues. No coupon is paid at this observation (Phoenix variant pays coupon regardless).", status: "watch", risk: "Early call in a rising market means the investor is redeemed at the best possible time for the issuer. The investor must now reinvest at prevailing market rates — which may be less attractive." },
      { month: 6, label: "Q2 Observation", icon: "🔔", type: "observation", title: "Second Observation — Memory Feature", desc: "If the product has a memory coupon feature (Phoenix): unpaid coupons from Q1 accumulate. If called at Q2, investor receives all accrued coupons. Without memory: only current period coupon is paid. This distinction materially changes the income profile in volatile markets.", status: "neutral", risk: "RMs sometimes sell Autocalls primarily on the memory coupon feature. Remind clients: accumulated coupons are only paid if the autocall trigger is reached — which presupposes the market has recovered." },
      { month: 18, label: "Month 18", icon: "⚠️", type: "scenario", title: "Barrier at Risk", desc: "If the underlying has been trending down and approaches the barrier level, the product enters a critical zone. No autocall has occurred (market below trigger), and the barrier is at risk of breach. The investor is now in the worst possible position: no early redemption, barrier about to be activated.", status: "danger", risk: "The correlation of autocall non-redemption with barrier breach is strongly negative: products don't get called precisely when markets are falling — which is also when barriers are at risk. This is the structural tail risk." },
      { month: 36, label: "Final Maturity", icon: "🏦", type: "settlement", title: "Final Settlement", desc: "If never called: (1) Barrier NOT breached → par + all accrued coupons. (2) Barrier breached AND below strike → equity delivery or cash loss. Maximum holding period reached. The investor has experienced reinvestment risk (if called early) or capital loss (if barrier breached).", status: "final", risk: "An autocall that runs to final maturity without being called has, by definition, experienced sustained underperformance. The capital loss scenario is the outcome of the exact market environment that made the autocall seem attractive at inception." },
    ],
    cpn: [
      { month: 0, label: "Inception", icon: "🏁", type: "event", title: "Trade Date & Capital Allocation", desc: "At inception the issuer immediately splits the investor's capital: the majority buys a zero-coupon bond (e.g. 90% for a 2Y at ~5% rates) and the residual funds a call option. The protection level and participation rate are fixed. The investor's capital is fully deployed from Day 1.", status: "neutral", risk: "In a rising rate environment, the zero-coupon bond costs more (lower present value discount), leaving less option budget — reducing participation. Rate sensitivity at inception is significant." },
      { month: 6, label: "Month 6", icon: "📈", type: "monitoring", title: "Mark-to-Market Can Be Negative", desc: "Despite 100% capital protection at maturity, the CPN can show negative interim MTM. If the underlying falls sharply and rates rise simultaneously, the mark-to-market value can drop to 85–92. Clients who see a negative MTM may panic and request early exit — typically at a loss.", status: "watch", risk: "Capital protection is a maturity guarantee, not an ongoing floor. The secondary market price depends on the issuer's bid, prevailing rates, and the option's remaining time value. There is no floor on interim MTM." },
      { month: 12, label: "Year 1", icon: "⏳", type: "monitoring", title: "Time Value Decay", desc: "The call option embedded in the CPN loses time value as expiry approaches (theta decay). In a flat or mildly positive market, the option may be worth less than at inception even if the underlying is slightly up. The product 'grinds' toward its floor if markets don't move sufficiently.", status: "neutral", risk: "CPNs underperform in sideways markets. If the underlying ends near strike at maturity, the investor receives par — exactly what they would have received from a deposit. The opportunity cost is the forgone yield on the full notional." },
      { month: 24, label: "Maturity", icon: "🏦", type: "settlement", title: "Final Settlement", desc: "At maturity: investor receives max(Protection%, 100% + Participation × max(0, Underlying return)). Full capital protection is honoured regardless of underlying performance. If underlying is up significantly, the investor participates at the agreed rate. The protection floor is always the minimum.", status: "final", risk: "The CPN delivers on its promise — but only if held to maturity and only if the issuer remains solvent. Issuer credit risk is the one scenario in which the capital protection fails entirely." },
    ],
    rc: [
      { month: 0, label: "Inception", icon: "🏁", type: "event", title: "Trade Date", desc: "At inception, the investor lends par to the issuer and simultaneously sells a put option. The put premium is paid as an enhanced coupon over the product's life. The strike is typically set at-the-money (100% of spot). No barrier — full downside from Day 1 below strike.", status: "neutral", risk: "Unlike a BRC, there is no barrier providing conditional protection. If the underlying closes even 1% below strike at maturity, the investor receives shares. The full linear downside is active from inception." },
      { month: 1, label: "During Life", icon: "📊", type: "monitoring", title: "Daily P&L Exposure", desc: "The investor's economic position is equivalent to holding a bond plus a short put. As the underlying falls, the short put moves into the money and the MTM deteriorates. There is no barrier to absorb the first tranche of downside — the investor is long equity risk from strike.", status: "watch", risk: "Short-dated RCs (1–3 months) on single stocks are the highest-risk variant. A single earnings miss or dividend cut can produce a 20–30% loss in a matter of days, against a coupon of perhaps 8% annualised." },
      { month: 12, label: "Maturity", icon: "🏦", type: "settlement", title: "Final Settlement", desc: "Two outcomes: (1) Underlying at or above strike → investor receives par + full coupon. Clean redemption. (2) Underlying below strike → investor receives shares calculated at strike price. On a 100-strike RC with a 9% coupon, if the underlying is at 70, the net position is -21% (received 9 coupon, lost 30 on stock).", status: "final", risk: "The worst outcome is receiving shares of a stock that has fundamentally deteriorated. Unlike a BRC with a barrier, the RC investor begins accumulating loss from the very first percent below strike. The coupon must be weighed against this unbuffered downside." },
    ],
  };

  const steps = timelines[product] || [];
  const step = steps[currentStep] || steps[0];

  const statusColors = { neutral: theme.accent, watch: theme.warning, danger: theme.danger, final: theme.gold };
  const statusLabels = { neutral: "Normal", watch: "Monitor", danger: "Risk Event", final: "Settlement" };

  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: "0 auto" }}>
      <div className="section-header">
        <div className="section-icon">⏱️</div>
        <div>
          <div className="teal-line" style={{ margin: 0, marginBottom: 4 }} />
          <h2 className="playfair" style={{ fontSize: 24 }}>Product Lifecycle</h2>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>What happens month by month — path dependency made tangible</p>
        </div>
      </div>

      {/* Product selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {products.map(p => (
          <button key={p.id} onClick={() => { setProduct(p.id); setCurrentStep(0); }}
            style={{ padding: "8px 16px", borderRadius: 4, fontSize: 12, fontWeight: 500, border: `1px solid ${product === p.id ? theme.gold : theme.border}`, background: product === p.id ? "rgba(201,168,76,0.1)" : "transparent", color: product === p.id ? theme.gold : theme.textMuted, transition: "all 0.2s" }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Timeline bar */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        {/* Track */}
        <div style={{ position: "absolute", top: 18, left: 24, right: 24, height: 2, background: theme.border, zIndex: 0 }} />
        <div style={{ position: "absolute", top: 18, left: 24, height: 2, background: theme.gold, zIndex: 1, transition: "width 0.4s ease", width: `calc(${(currentStep / (steps.length - 1)) * 100}% * (100% - 48px) / 100% + ${currentStep === 0 ? 0 : 24}px)` }} />

        <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
          {steps.map((s, i) => {
            const isActive = i === currentStep;
            const isPast = i < currentStep;
            const col = statusColors[s.status];
            return (
              <button key={i} onClick={() => setCurrentStep(i)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", minWidth: 70 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: isActive ? col : isPast ? `${col}40` : theme.surface2, border: `2px solid ${isActive ? col : isPast ? col : theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "all 0.3s", boxShadow: isActive ? `0 0 0 4px ${col}20` : "none" }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 10, color: isActive ? theme.text : theme.textDim, textAlign: "center", fontWeight: isActive ? 600 : 400, lineHeight: 1.3 }}>{s.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step detail */}
      <div key={`${product}-${currentStep}`} className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="card" style={{ borderColor: `${statusColors[step.status]}40` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{step.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{step.title}</div>
                <span className="pill" style={{ background: `${statusColors[step.status]}18`, color: statusColors[step.status], fontSize: 10, marginTop: 4, display: "inline-block" }}>{statusLabels[step.status]}</span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.8 }}>{step.desc}</div>
          </div>

          {/* Nav buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}
              style={{ flex: 1, padding: "10px", borderRadius: 4, border: `1px solid ${theme.border}`, background: "transparent", color: currentStep === 0 ? theme.textDim : theme.text, fontSize: 12, fontWeight: 500, cursor: currentStep === 0 ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
              ← Previous
            </button>
            <button onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))} disabled={currentStep === steps.length - 1}
              style={{ flex: 1, padding: "10px", borderRadius: 4, border: `1px solid ${currentStep === steps.length - 1 ? theme.border : theme.gold}`, background: currentStep === steps.length - 1 ? "transparent" : "rgba(201,168,76,0.1)", color: currentStep === steps.length - 1 ? theme.textDim : theme.gold, fontSize: 12, fontWeight: 500, cursor: currentStep === steps.length - 1 ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
              Next →
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="card" style={{ background: "rgba(248,81,73,0.04)", borderColor: `${theme.danger}30` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.danger, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>⚠ RM Awareness</div>
            <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.8 }}>{step.risk}</div>
          </div>

          {/* Mini timeline progress */}
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 600, color: theme.textDim, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>All Events</div>
            {steps.map((s, i) => (
              <div key={i} onClick={() => setCurrentStep(i)} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 0", borderBottom: i < steps.length - 1 ? `1px solid ${theme.border}` : "none", cursor: "pointer", opacity: i === currentStep ? 1 : 0.5, transition: "opacity 0.2s" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColors[s.status], marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: i === currentStep ? theme.text : theme.textMuted }}>{s.label} — {s.title}</div>
                  <div style={{ fontSize: 10, color: theme.textDim }}>{statusLabels[s.status]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STRESS TEST SECTION ──────────────────────────────────────────────────────
