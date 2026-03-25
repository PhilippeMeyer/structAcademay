import { useState, useEffect, useCallback, useRef } from "react";
import { T, CSS } from "../components/builder/builderTheme.js";
import { priceStructure } from "../components/builder/pricing.js";
import { fetchQuote } from "../components/builder/fetchQuote.js";
import UNIVERSE from "../data/underlyings.js";
import Spinner from "../components/builder/Spinner.jsx";
import StatBox from "../components/builder/StatBox.jsx";
import SliderRow from "../components/builder/SliderRow.jsx";
import PayoffChart from "../components/builder/BuilderPayoffChart.jsx";
import UnderlyingPicker from "../components/builder/UnderlyingPicker.jsx";
import QuotePanel from "../components/builder/QuotePanel.jsx";
import TermSheet from "../components/builder/TermSheet.jsx";
import BasketPanel from "../components/builder/BasketPanel.jsx";
import ScenarioFanChart from "../components/builder/ScenarioFanChart.jsx";
import IntentCapture from "../components/builder/IntentCapture.jsx";

export default function RealBuilderSection() {
  // ── Intent / step state ──────────────────────────────────────────────────
  const [step, setStep] = useState("intent"); // "intent" | "builder"
  const [intentSource, setIntentSource] = useState(null);

  const handleIntentComplete = ({ source, params }) => {
    if (source === "skip") {
      setStep("builder");
      return;
    }
    if (params) {
      // Apply derived params before showing builder
      const u = UNIVERSE.find(x => x.id === params.underlyingId) ?? UNIVERSE.find(x => x.id === "^STOXX50E");
      setUnderlying(u);
      setProductType(params.productType ?? "brc");
      setMaturity(params.maturity ?? 2);
      if (params.barrier)    setBarrier(params.barrier);
      if (params.protection) setProtection(params.protection);
      if (params.couponTarget) setCoupon(params.couponTarget);
      if (params.basketMode) setMode("basket");
      setIntentSource(source);
    }
    setStep("builder");
  };
  const [mode, setMode] = useState("single"); // single | basket
  const [productType, setProductType] = useState("brc");
  const [underlying, setUnderlying] = useState(UNIVERSE.find(u => u.id === "^STOXX50E"));
  const [basket, setBasket] = useState([]);
  const [correlations, setCorrelations] = useState({});
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [scenario, setScenario] = useState("sideways");
  const [outputTab, setOutputTab] = useState("payoff");
  const [rates, setRates] = useState(3.0);

  // Product params
  const [protection, setProtection] = useState(90);
  const [participation, setParticipation] = useState(100);
  const [coupon, setCoupon] = useState(8);
  const [barrier, setBarrier] = useState(65);
  const [maturity, setMaturity] = useState(2);
  const [autocallTrigger, setAutocallTrigger] = useState(100);

  const params = { protection, participation, coupon, barrier, maturity, autocallTrigger };
  const activeUnderlying = mode === "basket" ? basket[0] : underlying;
  const effectiveVol = mode === "basket"
    ? basket.reduce((s, u) => s + u.histVol, 0) / Math.max(1, basket.length)
    : activeUnderlying?.histVol ?? 20;
  const effectiveDivYield = activeUnderlying?.divYield ?? 2;

  const mktData = { vol: effectiveVol, rate: rates / 100, div: effectiveDivYield / 100, maturity };
  const pricing = priceStructure(productType, params, mktData);

  // Auto-fill params from pricing
  useEffect(() => {
    if (productType === "cpn" && pricing?.participation) setParticipation(Math.round(pricing.participation));
    if ((productType === "rc" || productType === "brc" || productType === "autocall") && pricing?.coupon) setCoupon(Math.round(pricing.coupon * 2) / 2);
  }, [productType, effectiveVol, rates, maturity, protection, barrier]);

  // Fetch quote when underlying changes
  useEffect(() => {
    if (!activeUnderlying) return;
    setQuote(null);
    setQuoteLoading(true);
    fetchQuote(activeUnderlying.id).then(q => { setQuote(q); setQuoteLoading(false); });
  }, [activeUnderlying?.id]);

  const productTypes = [
    { id: "cpn", label: "CPN", full: "Capital Protected Note", color: T.accent },
    { id: "rc", label: "RC", full: "Reverse Convertible", color: T.warning },
    { id: "brc", label: "BRC", full: "Barrier Rev. Conv.", color: T.danger },
    { id: "autocall", label: "Autocall", full: "Autocall / Phoenix", color: T.purple },
  ];

  const outputTabs = [
    { id: "payoff", label: "Payoff Diagram" },
    { id: "scenarios", label: "Scenarios" },
    { id: "decomposition", label: "Decomposition" },
    { id: "termsheet", label: "Term Sheet" },
  ];

  const activeProduct = productTypes.find(p => p.id === productType);

  const decomp = (() => {
    if (productType === "cpn") {
      const zcb = 100 - (pricing?.optBudget ?? 10);
      const opt = pricing?.optBudget ?? 10;
      return [{ label: `Zero-Coupon Bond (${Math.round(zcb)}%)`, pct: Math.round(zcb), color: T.accent }, { label: `Long Call (${Math.round(opt)}%)`, pct: Math.round(opt), color: T.success }];
    }
    if (productType === "rc") return [{ label: "Bond (90%)", pct: 90, color: T.accent }, { label: "Short Put (10%)", pct: 10, color: T.danger }];
    if (productType === "brc") return [{ label: "Bond (85%)", pct: 85, color: T.accent }, { label: "Short Down-and-In Put (15%)", pct: 15, color: T.danger }];
    if (productType === "autocall") return [{ label: "Bond (80%)", pct: 80, color: T.accent }, { label: "Short DI Put (12%)", pct: 12, color: T.danger }, { label: "Short Autocall Option (8%)", pct: 8, color: T.warning }];
    return [];
  })();

  return (
    <>
      {/* Intent capture step */}
      {step === "intent" && <IntentCapture onComplete={handleIntentComplete} />}

      {/* Builder step */}
      {step === "builder" && (
      <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: T.bg }}>
        {/* Header */}
        <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 20, height: 52 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: `${T.gold}15`, border: `1px solid ${T.gold}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏗️</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: "-.01em" }}>Real Product Builder</div>
                <div style={{ fontSize: 9, color: T.textDim, letterSpacing: ".1em", textTransform: "uppercase" }}>
                  Live Underlyings · Indicative Pricing
                  {intentSource && <span style={{ marginLeft: 8, color: T.teal }}>· Built from {intentSource === "questionnaire" ? "questionnaire" : "AI brief"}</span>}
                </div>
              </div>
            </div>

            {/* Product type selector */}
            <div style={{ display: "flex", gap: 4, flex: 1 }}>
              {productTypes.map(p => (
                <button key={p.id} onClick={() => setProductType(p.id)}
                  style={{ padding: "6px 14px", borderRadius: 4, fontSize: 11, fontWeight: 600, border: `1px solid ${productType === p.id ? p.color : T.border}`, background: productType === p.id ? `${p.color}18` : "transparent", color: productType === p.id ? p.color : T.textMuted, transition: "all .2s" }}>
                  <span className="mono" style={{ fontSize: 9, marginRight: 5, opacity: .6 }}>{p.label}</span>
                  {p.full}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              {["single", "basket"].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  style={{ padding: "6px 14px", borderRadius: 4, fontSize: 11, fontWeight: 600, border: `1px solid ${mode === m ? T.gold : T.border}`, background: mode === m ? `${T.gold}18` : "transparent", color: mode === m ? T.gold : T.textMuted }}>
                  {m === "single" ? "Single Name" : "🧺 Basket"}
                </button>
              ))}
            </div>

            <button onClick={() => { setStep("intent"); setIntentSource(null); }}
              style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 4, fontSize: 11, fontWeight: 600, border: `1px solid ${T.teal}40`, background: `${T.teal}10`, color: T.teal, cursor: "pointer" }}>
              ← Revise intent
            </button>

            <span className="chip" style={{ background: `${T.gold}15`, color: T.gold, flexShrink: 0 }}>TRAINING</span>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
          {/* LEFT PANEL — Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Underlying selector */}
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>
                {mode === "basket" ? `Basket Components (${basket.length}/4)` : "Reference Underlying"}
              </div>
              {mode === "single" ? (
                <UnderlyingPicker value={underlying} onChange={u => { setUnderlying(u); setQuote(null); }} />
              ) : (
                <UnderlyingPicker multi basket={basket} onBasketChange={setBasket} />
              )}
            </div>

            {/* Quote card — single mode */}
            {mode === "single" && (activeUnderlying || quoteLoading) && (
              <QuotePanel underlying={activeUnderlying} quote={quoteLoading ? null : quote} />
            )}

            {/* Basket correlation — basket mode */}
            {mode === "basket" && basket.length > 1 && (
              <BasketPanel basket={basket} correlations={correlations} setCorrelations={setCorrelations} />
            )}

            {/* Market params */}
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 14 }}>Market Parameters</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                {[{ l: "Impl. Vol", v: `${effectiveVol}%` }, { l: "Div. Yield", v: `${effectiveDivYield}%` }].map((s, i) => (
                  <div key={i} style={{ padding: "6px 10px", background: T.surface2, borderRadius: 4, border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 9, color: T.textDim }}>{s.l}</div>
                    <div className="mono" style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <SliderRow label="Risk-Free Rate" val={rates} set={setRates} min={0} max={8} step={0.25} fmt={v => `${v}%`} />
            </div>

            {/* Structure params */}
            <div className="card">
              <div style={{ fontSize: 11, fontWeight: 700, color: activeProduct?.color ?? T.gold, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 14 }}>Structure Parameters</div>
              <SliderRow label="Maturity" val={maturity} set={setMaturity} min={1} max={5} step={0.5} fmt={v => `${v}Y`} />
              {productType === "cpn" && <>
                <SliderRow label="Capital Protection" val={protection} set={setProtection} min={70} max={100} step={1} fmt={v => `${v}%`} />
              </>}
              {(productType === "brc" || productType === "autocall") && <>
                <SliderRow label="Barrier Level" val={barrier} set={setBarrier} min={40} max={85} step={5} fmt={v => `${v}%`} color={T.danger} />
              </>}
              {productType === "autocall" && <>
                <SliderRow label="Autocall Trigger" val={autocallTrigger} set={setAutocallTrigger} min={90} max={110} step={5} fmt={v => `${v}%`} color={T.purple} />
              </>}
              {(productType === "rc" || productType === "brc" || productType === "autocall") && <>
                <SliderRow label="Coupon (p.a.)" val={coupon} set={setCoupon} min={1} max={25} step={0.5} fmt={v => `${v.toFixed(1)}%`} />
              </>}
            </div>
          </div>

          {/* RIGHT PANEL — Outputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Key metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {productType === "cpn" && <>
                <StatBox label="Participation Rate" value={`${pricing?.participation ?? "—"}%`} sub="Market-derived" color={T.accent} large />
                <StatBox label="ZCB Cost" value={`${Math.round(100 - (pricing?.optBudget ?? 10))}%`} sub="of capital" color={T.textMuted} />
                <StatBox label="Option Budget" value={`${pricing?.optBudget?.toFixed(1) ?? "—"}%`} sub="residual capital" color={T.success} />
                <StatBox label="Call Value" value={`${pricing?.callValue ?? "—"}`} sub="per 100 notional" color={T.textMuted} />
              </>}
              {(productType === "rc" || productType === "brc" || productType === "autocall") && <>
                <StatBox label="Indicative Coupon" value={`${coupon.toFixed(1)}%`} sub="p.a." color={activeProduct?.color ?? T.gold} large />
                <StatBox label="Total over Maturity" value={`${(coupon * maturity).toFixed(1)}%`} sub={`over ${maturity}Y`} color={T.textMuted} />
                {(productType === "brc" || productType === "autocall") && <StatBox label="Barrier" value={`${barrier}%`} sub="American, continuous" color={T.danger} />}
                <StatBox label="Impl. Vol" value={`${effectiveVol}%`} sub={underlying?.label ?? "basket avg"} color={T.textMuted} />
              </>}
            </div>

            {/* Output tabs */}
            <div className="card" style={{ padding: 0 }}>
              <div style={{ borderBottom: `1px solid ${T.border}`, display: "flex", padding: "0 4px" }}>
                {outputTabs.map(t => (
                  <button key={t.id} className={`tab-btn ${outputTab === t.id ? "active" : ""}`} onClick={() => setOutputTab(t.id)}>{t.label}</button>
                ))}
              </div>
              <div style={{ padding: 18 }}>
                {outputTab === "payoff" && (
                  <div className="fade-up">
                    <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14, fontWeight: 600 }}>
                      Payoff at Maturity — {activeProduct?.full}
                      {activeUnderlying && <span style={{ color: T.textDim, marginLeft: 8 }}>on {mode === "basket" ? `Worst-of (${basket.length} stocks)` : activeUnderlying.label}</span>}
                    </div>
                    <PayoffChart type={productType} params={params} color={activeProduct?.color ?? T.gold} />
                    <div style={{ marginTop: 14, padding: "10px 14px", background: T.surface2, borderRadius: 6, fontSize: 11, color: T.textMuted, lineHeight: 1.8, borderLeft: `2px solid ${activeProduct?.color ?? T.gold}` }}>
                      {productType === "cpn" && `With ${protection}% protection and ${pricing?.participation ?? participation}% participation at ${rates}% rates — the ZCB consumes ${Math.round(100 - (pricing?.optBudget ?? 10))}% of capital, leaving ${pricing?.optBudget?.toFixed(1) ?? "—"}% to purchase the call option.`}
                      {productType === "rc" && `A ${coupon.toFixed(1)}% p.a. coupon is funded by selling a put at the strike. If ${activeUnderlying?.label ?? "the underlying"} closes below strike at maturity, the client receives shares — not par.`}
                      {productType === "brc" && `A ${coupon.toFixed(1)}% p.a. coupon from selling a down-and-in put with ${barrier}% barrier on ${activeUnderlying?.label ?? "the underlying"}. Capital at risk only if barrier is breached continuously.`}
                      {productType === "autocall" && `Conditional ${coupon.toFixed(1)}% p.a. coupon. If ${activeUnderlying?.label ?? "the underlying"} is at/above ${autocallTrigger}% on quarterly observation dates, the product is called early. Barrier at ${barrier}% provides conditional downside protection.`}
                    </div>
                  </div>
                )}

                {outputTab === "scenarios" && (
                  <div className="fade-up">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600 }}>Scenario Fan Chart — Underlying Index</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[{ id: "sideways", l: "Sideways" }, { id: "drawdown", l: "Drawdown" }, { id: "bull", l: "Bull" }, { id: "volatile", l: "Volatile" }].map(s => (
                          <button key={s.id} onClick={() => setScenario(s.id)}
                            style={{ padding: "4px 10px", fontSize: 10, borderRadius: 3, border: `1px solid ${scenario === s.id ? T.gold : T.border}`, background: scenario === s.id ? `${T.gold}15` : "transparent", color: scenario === s.id ? T.gold : T.textMuted, cursor: "pointer" }}>
                            {s.l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <ScenarioFanChart vol={effectiveVol} maturity={maturity} scenario={scenario} barrier={productType !== "cpn" ? barrier : null} />
                    <div style={{ marginTop: 10, display: "flex", gap: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 18, height: 2, background: T.gold, borderRadius: 1 }} /><span style={{ fontSize: 10, color: T.textMuted }}>Median path</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 14, height: 8, background: T.gold, opacity: .25, borderRadius: 1 }} /><span style={{ fontSize: 10, color: T.textMuted }}>25th–75th pctile</span></div>
                    </div>
                  </div>
                )}

                {outputTab === "decomposition" && (
                  <div className="fade-up">
                    <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 600, marginBottom: 16 }}>Bond + Options Decomposition</div>
                    <div style={{ display: "flex", gap: 2, height: 36, borderRadius: 5, overflow: "hidden", marginBottom: 14 }}>
                      {decomp.map((d, i) => (
                        <div key={i} style={{ width: `${d.pct}%`, background: d.color, opacity: .8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 10, color: "#fff", fontWeight: 700, padding: "0 5px", whiteSpace: "nowrap", overflow: "hidden" }}>{d.pct}%</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
                      {decomp.map((d, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, opacity: .8 }} />
                          <span style={{ fontSize: 11, color: T.textMuted }}>{d.label}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.8, padding: "12px 14px", borderLeft: `2px solid ${T.gold}`, background: `${T.gold}08`, borderRadius: "0 4px 4px 0" }}>
                      {productType === "cpn" && `At ${rates}% risk-free rates over ${maturity}Y: the zero-coupon bond requires ~${Math.round(100 - (pricing?.optBudget ?? 10))}% of capital to guarantee the ${protection}% floor. The remaining ~${pricing?.optBudget?.toFixed(1) ?? "—"}% buys the call option — combined with ${effectiveVol}% vol, this produces ~${pricing?.participation ?? participation}% upside participation.`}
                      {productType === "rc" && `The bond component generates par redemption. The short put — funded by the put premium — produces the enhanced ${coupon.toFixed(1)}% coupon. If the underlying falls below the strike at maturity, the put is exercised against the client and they receive depreciated shares.`}
                      {productType === "brc" && `The bond component generates par redemption. The short down-and-in put (barrier: ${barrier}%) produces the ${coupon.toFixed(1)}% coupon. The conditional nature makes the put cheaper than a vanilla put — enabling a higher coupon for the same underlying risk profile.`}
                      {productType === "autocall" && `Three components: the bond (par redemption), a short down-and-in put (downside exposure, barrier ${barrier}%), and the short autocall feature (issuer's right to call early). Combined premium funds the ${coupon.toFixed(1)}% conditional coupon.`}
                    </div>
                  </div>
                )}

                {outputTab === "termsheet" && (
                  <div className="fade-up">
                    <TermSheet type={productType} params={params} pricing={pricing} underlying={activeUnderlying}
                      basketItems={mode === "basket" ? basket : null} />
                  </div>
                )}
              </div>
            </div>

            {/* Risk callouts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="card" style={{ borderColor: `${T.danger}30`, background: `${T.danger}05`, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: T.danger, fontWeight: 700, letterSpacing: ".08em", marginBottom: 5 }}>KEY RISK</div>
                <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.7 }}>
                  {productType === "cpn" && "Issuer credit risk — capital protection is an issuer obligation, not a segregated asset. Zero upside if held by a defaulting issuer."}
                  {productType === "rc" && "Full equity downside below strike from day 1. Physical delivery means receiving shares at a price that may have fundamentally deteriorated."}
                  {productType === "brc" && `Path dependency — a single intraday breach of the ${barrier}% barrier permanently activates equity exposure, even if the underlying recovers.`}
                  {productType === "autocall" && `Reinvestment risk if called early + barrier breach risk (${barrier}%) if markets decline. Products are not called in falling markets — exactly when barriers are at risk.`}
                </div>
              </div>
              <div className="card" style={{ borderColor: `${T.warning}30`, background: `${T.warning}05`, padding: "12px 14px" }}>
                <div style={{ fontSize: 10, color: T.warning, fontWeight: 700, letterSpacing: ".08em", marginBottom: 5 }}>SUITABILITY CHECK</div>
                <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.7 }}>
                  {productType === "cpn" && "Suitable for capital-preservation clients wanting market exposure. Not efficient for growth-oriented clients who don't need protection."}
                  {productType === "rc" && "Requires client comfort with equity risk and physical delivery. Not suitable for clients who cannot tolerate losses exceeding the coupon."}
                  {productType === "brc" && "Requires understanding of path dependency and barrier mechanics. Not suitable for clients who cannot tolerate 30–50% interim losses."}
                  {productType === "autocall" && "Requires understanding of conditional income and early redemption mechanics. Not suitable for clients with fixed income horizon."}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${T.border}`, padding: "12px 24px", display: "flex", justifyContent: "space-between", background: T.surface }}>
          <span style={{ fontSize: 10, color: T.textDim }}>Educational use only · Prices via Yahoo Finance (allorigins.win proxy) · Not a binding offer · No suitability determination</span>
          <span className="mono" style={{ fontSize: 10, color: T.textDim }}>v1.0</span>
        </div>
      </div>
      </>
      )}
    </>
  );
}
