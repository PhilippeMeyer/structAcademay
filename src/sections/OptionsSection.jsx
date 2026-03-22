import { useState } from "react";
import { useTheme } from "../theme/ThemeContext.js";
import OptionPayoffChart from "../components/charts/OptionPayoffChart.jsx";

export default function OptionsSection() {
  const theme = useTheme();
  const violet = theme.isDark ? "#A78BFA" : "#7C3AED";
  const [activeCategory, setActiveCategory] = useState("basics");
  const [activeStrategy, setActiveStrategy] = useState("long_call");

  const categories = [
    { id: "basics", label: "Vanilla Options", icon: "🧱" },
    { id: "covered", label: "Covered Strategies", icon: "🛡️" },
    { id: "spreads", label: "Spreads", icon: "↔️" },
    { id: "combinations", label: "Combinations", icon: "🔗" },
    { id: "structured", label: "SP Building Blocks", icon: "🏗️" },
  ];

  const strategies = {
    basics: [
      {
        id: "long_call", label: "Long Call", tag: "Bullish",
        legs: [{ type: "call", strike: 100, premium: 5, position: "long" }],
        maxProfit: "Unlimited", maxLoss: "Premium paid (5)", breakeven: "Strike + Premium = 105",
        when: "You expect the underlying to rise significantly above the strike.",
        insight: "This is the option the CPN buyer receives exposure to — the issuer purchases a call to give upside participation. The premium cost comes from the protection budget.",
        tagColor: theme.success,
      },
      {
        id: "short_call", label: "Short Call", tag: "Bearish / Income",
        legs: [{ type: "call", strike: 100, premium: 5, position: "short" }],
        maxProfit: "Premium received (5)", maxLoss: "Unlimited (above strike)",
        breakeven: "Strike + Premium = 105",
        when: "You expect the underlying to stay below the strike. You collect premium but accept unlimited upside risk.",
        insight: "Issuers sell calls embedded in structured products. The premium received is recycled to fund protection or enhanced coupons. The issuer is always hedging this position dynamically.",
        tagColor: theme.danger,
      },
      {
        id: "long_put", label: "Long Put", tag: "Bearish / Protective",
        legs: [{ type: "put", strike: 100, premium: 5, position: "long" }],
        maxProfit: "Strike − Premium = 95 (if underlying → 0)", maxLoss: "Premium paid (5)",
        breakeven: "Strike − Premium = 95",
        when: "You want to profit from a decline, or protect an existing long position.",
        insight: "Capital protected notes implicitly contain a long put — the capital guarantee is economically equivalent to holding equity plus a put. The bond + call structure is the more common framing.",
        tagColor: theme.success,
      },
      {
        id: "short_put", label: "Short Put", tag: "Moderately Bullish",
        legs: [{ type: "put", strike: 100, premium: 5, position: "short" }],
        maxProfit: "Premium received (5)", maxLoss: "Strike − Premium = 95 (if underlying → 0)",
        breakeven: "Strike − Premium = 95",
        when: "You are willing to buy the underlying at the strike price. You accept downside below strike in exchange for the premium.",
        insight: "This is the core risk inside Reverse Convertibles. The client sells a put on the underlying — if the stock falls below strike at maturity, they receive shares (not par). The coupon is the put premium.",
        tagColor: theme.warning,
      },
    ],
    covered: [
      {
        id: "covered_call", label: "Covered Call", tag: "Income / Mildly Bullish",
        legs: [
          { type: "stock", strike: 100, premium: 0, position: "long" },
          { type: "call", strike: 110, premium: 6, position: "short" },
        ],
        maxProfit: "Call strike − Stock cost + Premium = 16", maxLoss: "Stock cost − Premium (large downside)",
        breakeven: "Stock purchase price − Premium = 94",
        when: "You hold a long equity position and want to generate income by selling the right to buy your shares at a higher price. You accept that upside is capped at the strike.",
        insight: "The covered call is the most direct parallel to structured product yield engineering: the client 'sells' the top of the market in exchange for income. This is exactly what happens in a Reverse Convertible — the coupon is the call premium collected on the client's notional equity exposure.",
        tagColor: theme.gold,
      },
      {
        id: "protective_put", label: "Protective Put", tag: "Downside Protection",
        legs: [
          { type: "stock", strike: 100, premium: 0, position: "long" },
          { type: "put", strike: 95, premium: 5, position: "long" },
        ],
        maxProfit: "Unlimited above stock cost + Premium", maxLoss: "Stock cost − Put strike + Premium = 10",
        breakeven: "Stock cost + Premium = 105",
        when: "You hold a long position and want to cap your downside at the put strike, accepting the cost of the premium as insurance.",
        insight: "The protective put is the purest form of capital protection. A CPN is economically a protective put (at 90–100%) layered over a long equity position — but packaged as a note. Understanding this equivalence helps explain why protection costs more in high-volatility environments.",
        tagColor: theme.success,
      },
      {
        id: "covered_collar", label: "Covered Collar", tag: "Zero / Low Cost Protection",
        legs: [
          { type: "stock", strike: 100, premium: 0, position: "long" },
          { type: "put", strike: 90, premium: 5, position: "long" },
          { type: "call", strike: 112, premium: 5, position: "short" },
        ],
        maxProfit: "Cap − Stock cost = 12", maxLoss: "Stock cost − Floor = 10",
        breakeven: "~100 (near zero net cost when put and call premiums offset)",
        when: "You want to protect a long equity position cheaply by giving up upside. The call premium finances part or all of the put cost — creating a 'free' collar if strikes are chosen correctly.",
        insight: "The collar is the institutional version of a CPN. Many private banking clients who hold concentrated equity positions use collars to lock in gains. Structured product salespeople repackage collars as notes for clients who prefer a single instrument over managing separate legs.",
        tagColor: theme.accent,
      },
      {
        id: "cash_secured_put", label: "Cash-Secured Put", tag: "Income / Acquisition Strategy",
        legs: [
          { type: "put", strike: 100, premium: 6, position: "short" },
        ],
        maxProfit: "Premium received (6)", maxLoss: "Strike − Premium = 94 (if underlying → 0)",
        breakeven: "Strike − Premium = 94",
        when: "You hold cash and are willing to buy the underlying at the strike price. You collect premium as compensation for the commitment. If the price stays above strike, you keep the premium and your cash.",
        insight: "The cash-secured put is the closest vanilla equivalent to a Reverse Convertible from the client's perspective: you are paid a yield (premium) in exchange for agreeing to buy equity at a set price if markets fall. The key difference is the RC wraps this in a note, adds a fixed maturity, and may include a barrier.",
        tagColor: theme.warning,
      },
      {
        id: "buy_write", label: "Buy-Write (Synthetic RC)", tag: "Income / Capped Upside",
        legs: [
          { type: "stock", strike: 100, premium: 0, position: "long" },
          { type: "call", strike: 100, premium: 8, position: "short" },
          { type: "put", strike: 100, premium: 8, position: "short" },
        ],
        maxProfit: "Premiums received (16) — if underlying stays near strike", maxLoss: "Significant (put exposure below strike)",
        breakeven: "Stock cost − Total premium = 84",
        when: "A simultaneous purchase of stock and sale of both an ATM call and ATM put — equivalent to selling a straddle against a long position. Maximises premium income but creates bilateral risk.",
        insight: "A buy-write selling both call and put is the direct mechanical equivalent of a Reverse Convertible: the investor owns the 'bond' (funded by short put premium) and delivers shares if below strike. Structurers package this into a note to make it accessible for clients who cannot trade options directly.",
        tagColor: theme.danger,
      },
    ],
    spreads: [
      {
        id: "bull_call", label: "Bull Call Spread", tag: "Bullish / Capped",
        legs: [
          { type: "call", strike: 95, premium: 8, position: "long" },
          { type: "call", strike: 115, premium: 3, position: "short" },
        ],
        maxProfit: "Spread width − Net premium = 20 − 5 = 15", maxLoss: "Net premium paid (5)",
        breakeven: "Lower strike + Net premium = 100",
        when: "You are bullish but want to reduce the cost of a long call by capping the upside.",
        insight: "Used in CPNs with capped participation — the issuer buys a call at spot and sells a call at the cap level. The short call premium reduces cost, making the structure cheaper to build.",
        tagColor: theme.success,
      },
      {
        id: "bear_put", label: "Bear Put Spread", tag: "Bearish / Capped",
        legs: [
          { type: "put", strike: 105, premium: 8, position: "long" },
          { type: "put", strike: 85, premium: 3, position: "short" },
        ],
        maxProfit: "Spread width − Net premium = 20 − 5 = 15", maxLoss: "Net premium paid (5)",
        breakeven: "Upper strike − Net premium = 100",
        when: "You expect a moderate decline but want to reduce cost vs an outright long put.",
        insight: "Selling the lower-strike put limits the protection benefit below a floor — analogous to a CPN that protects down to 80% but not below. The client implicitly holds this structure in some capital-protected products.",
        tagColor: theme.danger,
      },
      {
        id: "collar", label: "Collar", tag: "Protective / Capped",
        legs: [
          { type: "stock", strike: 100, premium: 0, position: "long" },
          { type: "put", strike: 90, premium: 4, position: "long" },
          { type: "call", strike: 115, premium: 4, position: "short" },
        ],
        maxProfit: "Cap − Spot + Net premium = 15", maxLoss: "Spot − Floor − Net premium = 10",
        breakeven: "~Spot (near zero net premium)",
        when: "You hold an equity position and want to protect it cheaply by giving up upside.",
        insight: "A collar is the prototype for capital-protected structures from the client's viewpoint. The long stock + long put + short call is economically equivalent to a CPN — it's often how institutional clients implement the same payoff directly.",
        tagColor: theme.gold,
      },
    ],
    combinations: [
      {
        id: "straddle", label: "Long Straddle", tag: "High Vol / Directionally Neutral",
        legs: [
          { type: "call", strike: 100, premium: 6, position: "long" },
          { type: "put", strike: 100, premium: 6, position: "long" },
        ],
        maxProfit: "Unlimited (either direction)", maxLoss: "Total premium paid (12)",
        breakeven: "Strike ± Total premium = 88 / 112",
        when: "You expect a large move but are unsure of direction — e.g. around earnings or major macro events.",
        insight: "Straddle pricing reveals the market's implied move expectation. Issuers use straddle pricing to calibrate ATM volatility — the primary input to option premium in structured products.",
        tagColor: theme.accent,
      },
      {
        id: "strangle", label: "Long Strangle", tag: "High Vol / Cheaper than Straddle",
        legs: [
          { type: "call", strike: 110, premium: 4, position: "long" },
          { type: "put", strike: 90, premium: 4, position: "long" },
        ],
        maxProfit: "Unlimited (either direction)", maxLoss: "Total premium paid (8)",
        breakeven: "Call strike + premium = 114 / Put strike − premium = 86",
        when: "You expect a very large move but want to pay less premium than a straddle. Requires a bigger move to profit.",
        insight: "Strangle pricing isolates OTM volatility — the 'skew.' In structured products, downside skew (OTM puts trade richer) directly inflates BRC coupons: the put sold is OTM and skew-expensive.",
        tagColor: theme.accent,
      },
      {
        id: "risk_reversal", label: "Risk Reversal", tag: "Skew Trade",
        legs: [
          { type: "call", strike: 110, premium: 3, position: "long" },
          { type: "put", strike: 90, premium: 6, position: "short" },
        ],
        maxProfit: "Unlimited above 113", maxLoss: "Unlimited below 84",
        breakeven: "Approx. 113 (call side) / 84 (put side)",
        when: "You believe the skew is mispriced — that downside puts are too expensive relative to upside calls.",
        insight: "Risk reversals expose the volatility skew directly. In equity markets, puts trade rich to calls (negative skew). This skew premium is what makes BRC coupons higher than RC coupons for the same strike — the barrier put has embedded skew value.",
        tagColor: theme.warning,
      },
    ],
    structured: [
      {
        id: "di_put", label: "Down-and-In Put", tag: "BRC Core Risk",
        legs: [
          { type: "put", strike: 100, premium: 8, position: "short" },
        ],
        maxProfit: "Premium received (8) — if barrier never touched", maxLoss: "Strike − Premium at barrier breach",
        breakeven: "92 (if activated)",
        when: "Core component of Barrier Reverse Convertibles. The client sells this option — the conditional nature makes it cheaper than a vanilla put, enabling a higher coupon.",
        insight: "A down-and-in put is only activated if the underlying trades at or below the barrier at any point during the product's life. This path dependency is the most misunderstood risk in retail structured products. The chart shows the equivalent always-active payoff — in reality, no breach = no downside.",
        tagColor: theme.danger,
      },
      {
        id: "autocall_combo", label: "Autocall Option Package", tag: "Autocall Core",
        legs: [
          { type: "put", strike: 100, premium: 10, position: "short" },
          { type: "call", strike: 100, premium: 3, position: "short" },
        ],
        maxProfit: "Combined premium (13) if called early or index above strike at maturity",
        maxLoss: "Large below strike (put exposure activated)",
        breakeven: "~87",
        when: "An Autocall sells both a put (downside risk) and a call (early redemption right to the issuer). Combined premium finances the conditional coupon.",
        insight: "The autocall feature is an issuer call option — they redeem the product when markets are up, reinvesting their hedge at better terms. The client receives early redemption + coupon, but loses the remaining coupon stream. This is reinvestment risk.",
        tagColor: theme.warning,
      },
      {
        id: "cpn_option", label: "CPN Option Package", tag: "CPN Core",
        legs: [
          { type: "call", strike: 100, premium: 5, position: "long" },
        ],
        maxProfit: "Unlimited above 105", maxLoss: "Limited to option budget (no capital risk)",
        breakeven: "105",
        when: "The CPN purchases a call option with the residual capital after funding the zero-coupon bond. The option budget constrains both participation rate and maturity.",
        insight: "In a low rate environment, the zero-coupon bond is expensive (rates low → price high → less residual budget). The option budget shrinks, forcing a lower participation rate or longer maturity to maintain the same payoff quality.",
        tagColor: theme.success,
      },
    ],
  };

  const currentList = strategies[activeCategory] || [];
  const current = currentList.find(s => s.id === activeStrategy) || currentList[0];

  // Auto-select first strategy when switching categories
  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setActiveStrategy((strategies[cat] || [])[0]?.id || "");
  };

  return (
    <div className="fade-in" style={{ maxWidth: 1020, margin: "0 auto" }}>
      <div className="section-header">
        <div className="section-icon" style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)" }}>🎓</div>
        <div>
          <div style={{ width: 40, height: 2, background: `linear-gradient(90deg, ${violet}, transparent)`, marginBottom: 4 }} />
          <h2 className="playfair" style={{ fontSize: 24 }}>Options Primer</h2>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>Calls, puts & key strategies — the building blocks of every structured product</p>
        </div>
      </div>

      {/* Conceptual intro */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { icon: "📞", title: "Call Option", subtitle: "The right to buy", desc: "A call gives the holder the right — not the obligation — to buy an asset at a fixed price (strike) on or before expiry. The buyer pays a premium; the seller collects it.", color: theme.success },
          { icon: "🤚", title: "Put Option", subtitle: "The right to sell", desc: "A put gives the holder the right — not the obligation — to sell an asset at a fixed price on or before expiry. Puts are the primary instrument of downside protection.", color: theme.danger },
        ].map((item, i) => (
          <div key={i} className="card" style={{ borderColor: `${item.color}30` }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.title} <span style={{ color: theme.textMuted, fontWeight: 400 }}>— {item.subtitle}</span></div>
                <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.7, marginTop: 4 }}>{item.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key concepts strip */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { term: "Premium", def: "Price paid to buy the option" },
          { term: "Strike (K)", def: "The reference price for exercise" },
          { term: "Expiry", def: "The date the option lapses" },
          { term: "Moneyness", def: "ITM / ATM / OTM relative to spot" },
          { term: "Volatility (σ)", def: "Higher vol → higher premium" },
          { term: "Delta (Δ)", def: "Sensitivity of option price to spot move" },
        ].map((c, i) => (
          <div key={i} style={{ padding: "7px 12px", background: theme.surface2, borderRadius: 4, border: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: violet }}>{c.term}</span>
            <span style={{ fontSize: 11, color: theme.textMuted }}> — {c.def}</span>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => handleCategoryChange(cat.id)}
            style={{
              padding: "8px 16px", borderRadius: 4, fontSize: 12, fontWeight: 500,
              border: `1px solid ${activeCategory === cat.id ? violet : theme.border}`,
              background: activeCategory === cat.id ? "rgba(167,139,250,0.1)" : "transparent",
              color: activeCategory === cat.id ? violet : theme.textMuted,
              transition: "all 0.2s",
            }}>
            <span style={{ marginRight: 6 }}>{cat.icon}</span>{cat.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        {/* Strategy list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {currentList.map(s => (
            <button key={s.id} onClick={() => setActiveStrategy(s.id)}
              style={{
                padding: "10px 14px", borderRadius: 4, textAlign: "left",
                border: `1px solid ${activeStrategy === s.id ? violet : theme.border}`,
                background: activeStrategy === s.id ? "rgba(167,139,250,0.08)" : theme.surface,
                transition: "all 0.2s",
              }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: activeStrategy === s.id ? violet : theme.text, marginBottom: 3 }}>{s.label}</div>
              <span className="pill" style={{ background: `${s.tagColor}18`, color: s.tagColor, fontSize: 9 }}>{s.tag}</span>
            </button>
          ))}
        </div>

        {/* Strategy detail */}
        {current && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }} key={current.id}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h3 className="playfair" style={{ fontSize: 20 }}>{current.label}</h3>
              <span className="pill" style={{ background: `${current.tagColor}18`, color: current.tagColor }}>{current.tag}</span>
            </div>

            {/* Legs summary */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {current.legs.filter(l => l.type !== "stock").map((leg, i) => (
                <div key={i} style={{
                  padding: "6px 12px", borderRadius: 4, fontSize: 11, fontWeight: 500,
                  background: `${leg.position === "long" ? theme.success : theme.danger}18`,
                  border: `1px solid ${leg.position === "long" ? theme.success : theme.danger}40`,
                  color: leg.position === "long" ? theme.success : theme.danger,
                }}>
                  {leg.position === "long" ? "▲ Long" : "▼ Short"} {leg.type.charAt(0).toUpperCase() + leg.type.slice(1)} · K={leg.strike} · Prem={leg.premium}
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="card" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: theme.textDim, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                Profit / Loss at Expiry (illustrative, not to scale)
              </div>
              <OptionPayoffChart legs={current.legs} />
              <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 12, height: 12, background: theme.success, opacity: 0.4, borderRadius: 2 }} />
                  <span style={{ fontSize: 10, color: theme.textMuted }}>Profit zone</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 12, height: 12, background: theme.danger, opacity: 0.4, borderRadius: 2 }} />
                  <span style={{ fontSize: 10, color: theme.textMuted }}>Loss zone</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 20, height: 2, background: violet, opacity: 0.5, borderRadius: 1 }} />
                  <span style={{ fontSize: 10, color: theme.textMuted }}>Strike(s)</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Max Profit", value: current.maxProfit, color: theme.success },
                { label: "Max Loss", value: current.maxLoss, color: theme.danger },
                { label: "Breakeven", value: current.breakeven, color: theme.gold },
              ].map((s, i) => (
                <div key={i} className="card" style={{ padding: "10px 14px", borderColor: `${s.color}30` }}>
                  <div style={{ fontSize: 10, color: theme.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: s.color, fontWeight: 500, lineHeight: 1.4 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* When to use */}
            <div className="card" style={{ background: `rgba(167,139,250,0.04)`, borderColor: `${violet}30` }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: violet, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>When is this relevant?</div>
              <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.8 }}>{current.when}</div>
            </div>

            {/* SP link */}
            <div className="insight-box">
              <strong>Link to structured products — </strong>{current.insight}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LIFECYCLE SECTION ───────────────────────────────────────────────────────
