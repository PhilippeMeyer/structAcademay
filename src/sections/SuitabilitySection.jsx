import { useState } from "react";
import { useTheme } from "../theme/ThemeContext.js";

export default function SuitabilitySection() {
  const theme = useTheme();
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: "liquidity", label: "Client Liquidity Horizon",
      options: [
        { value: "short", label: "< 12 months", risk: "danger", msg: "Structured products are illiquid and designed to be held to maturity. A client with near-term liquidity needs should not hold structured products as a significant portfolio sleeve. Secondary market exit is at issuer discretion and typically at a significant discount." },
        { value: "medium", label: "1–3 years", risk: "warning", msg: "Matches typical structured product maturities, but ensure no significant liquidity events (property purchase, education, business needs) fall within the product lifetime." },
        { value: "long", label: "3+ years", risk: "success", msg: "Liquidity horizon is compatible with structured product maturities. Ensure the client understands there is still no guaranteed secondary market." },
      ],
    },
    {
      id: "loss_tolerance", label: "Interim Mark-to-Market Tolerance",
      options: [
        { value: "zero", label: "Cannot tolerate interim losses", risk: "danger", msg: "Critical: structured products can show significant interim mark-to-market losses even if they are ultimately capital-protected at maturity. A client who will react emotionally to a -20% interim mark cannot hold BRCs or Autocalls." },
        { value: "moderate", label: "Can tolerate up to 20% interim loss", risk: "warning", msg: "Review downside scenarios for each product. BRC barrier breaches can generate 30%+ interim losses before any recovery. Confirm whether 20% is the right tolerance threshold." },
        { value: "high", label: "Comfortable with equity-like volatility", risk: "success", msg: "Client can hold through interim mark-to-market movements. Ensure they understand this tolerance is specifically for structured product interim valuations, not just equity portfolio movements." },
      ],
    },
    {
      id: "underlying", label: "Reference Underlying",
      options: [
        { value: "single", label: "Single stock", risk: "danger", msg: "Single-stock structured products carry concentrated idiosyncratic risk — earnings surprises, M&A, dividend cuts can all independently breach barriers. For most clients, single-stock reference is inappropriate unless they already hold that position and are hedging." },
        { value: "basket", label: "Worst-of basket (2–4 stocks)", risk: "warning", msg: "Worst-of structures produce higher coupons — but clients must understand the payoff is linked to the worst-performing component. Correlation assumptions embedded in the structure may not match client understanding. Always explain the 'weakest link' mechanic explicitly." },
        { value: "index", label: "Broad equity index", risk: "success", msg: "Index-linked products are typically more suitable: lower single-name risk, transparent reference, and more liquid options market. Still review barrier levels and historical drawdowns for that index." },
      ],
    },
    {
      id: "objectif", label: "Client Investment Objective",
      options: [
        { value: "capital", label: "Capital preservation", risk: "warning", msg: "Only Capital Protected Notes are compatible with a capital preservation objective — and only at 100% protection. BRCs and RCs should not be presented to clients whose primary objective is capital preservation." },
        { value: "income", label: "Regular income", risk: "warning", msg: "BRCs and RCs provide income-like coupons, but income is contingent on no barrier breach or physical settlement event. This is not equivalent to bond coupons. Clients must understand income is conditional, not contractual." },
        { value: "growth", label: "Long-term growth", risk: "success", msg: "For growth-oriented clients, CPNs with high participation or Autocalls with attractive conditional coupons can be relevant. Ensure they understand participation caps and early redemption mechanics." },
      ],
    },
  ];

  const riskColors = { danger: theme.danger, warning: theme.warning, success: theme.success };

  const selectedAnswers = Object.values(answers).filter(Boolean);
  const hasReds = Object.values(answers).some(a => {
    const q = questions.find(q => Object.keys(answers).find(k => k === q.id));
    return a?.risk === "danger";
  });
  // Recheck
  const redFlags = questions.map(q => answers[q.id]).filter(a => a?.risk === "danger").length;

  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div className="section-header">
        <div className="section-icon">⚠️</div>
        <div>
          <div className="teal-line" style={{ margin: 0, marginBottom: 4 }} />
          <h2 className="playfair" style={{ fontSize: 24 }}>Suitability Reflexes</h2>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>Build correct habits — educational only, not a suitability determination</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, borderColor: `${theme.accent}30`, background: `rgba(76,158,235,0.03)` }}>
        <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.8 }}>
          <strong style={{ color: theme.accent }}>This is a training exercise, not an advice tool.</strong> The prompts below are designed to help RMs develop the right reflexes when assessing whether a structured product is appropriate to discuss with a client. No client data should be entered here.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {questions.map((q, qi) => {
          const selected = answers[q.id];
          return (
            <div key={q.id} className="card" style={{ animation: `fadeIn 0.3s ${qi * 0.08}s ease both` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 14 }}>
                <span className="mono" style={{ fontSize: 10, color: theme.textDim, marginRight: 8 }}>Q{qi + 1}</span>
                {q.label}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: selected ? 14 : 0 }}>
                {q.options.map(opt => (
                  <button key={opt.value} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                    style={{
                      padding: "8px 14px", borderRadius: 4, fontSize: 12, fontWeight: 500,
                      border: `1px solid ${selected?.value === opt.value ? riskColors[opt.risk] : theme.border}`,
                      background: selected?.value === opt.value ? `${riskColors[opt.risk]}18` : "transparent",
                      color: selected?.value === opt.value ? riskColors[opt.risk] : theme.textMuted,
                      transition: "all 0.2s",
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {selected && (
                <div className="slide-in" style={{ padding: "12px 14px", borderRadius: 4, borderLeft: `3px solid ${riskColors[selected.risk]}`, background: `${riskColors[selected.risk]}0C`, fontSize: 12, color: theme.textMuted, lineHeight: 1.8 }}>
                  {selected.msg}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {Object.keys(answers).length >= 2 && (
        <div className="card fade-in" style={{ marginTop: 20, borderColor: redFlags > 1 ? `${theme.danger}50` : redFlags === 1 ? `${theme.warning}50` : `${theme.success}50`, background: redFlags > 1 ? `rgba(248,81,73,0.04)` : `rgba(63,185,80,0.04)` }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: redFlags > 1 ? theme.danger : redFlags === 1 ? theme.warning : theme.success }}>
            {redFlags > 1 ? "⛔ Multiple Red Flags — Structured product likely inappropriate" : redFlags === 1 ? "⚠️ Proceed with Caution — Address flagged items before proceeding" : "✓ Profile Compatible — Review full circumstances before any discussion"}
          </div>
          <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.8 }}>
            {redFlags > 1
              ? "Based on the training scenario, this client profile raises multiple suitability concerns. A structured product discussion would likely be inappropriate without fundamental changes to the client's situation or product selection."
              : redFlags === 1
                ? "There is at least one material concern that must be addressed and documented before a structured product is discussed with a client."
                : "The training scenario suggests no immediate red flags. Remember: this is an educational exercise and does not constitute a suitability assessment. Always follow your firm's suitability process."}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── OPTIONS PRIMER SECTION ───────────────────────────────────────────────────
