import { useState } from "react";
import { useTheme } from "../theme/ThemeContext.js";

export default function CreditSection() {
  const theme = useTheme();
  const [scenario, setScenario] = useState("normal");

  const scenarios = {
    normal: { label: "Normal Operation", recovery: 100, color: theme.success, desc: "The issuer remains solvent throughout the product's life. At maturity, all contractual obligations — capital protection, coupon, physical settlement — are honoured in full. The credit risk premium embedded in the product's pricing is the investor's compensation for bearing this risk." },
    stress: { label: "Issuer Under Stress", recovery: 75, color: theme.warning, desc: "The issuer experiences financial difficulty. Secondary market prices drop not only due to underlying performance but also due to widening issuer CDS spreads. The product MTM deteriorates independently of the underlying. Early redemption may realise this credit-related loss." },
    default: { label: "Issuer Default (Lehman)", recovery: 15, color: theme.danger, desc: "The issuer files for bankruptcy. Structured products become unsecured creditor claims. Recovery values in the Lehman case ranged from 8 to 28 cents on the dollar, after years of legal proceedings. Capital protection clauses became worthless — the bond component was the defaulted issuer's obligation." },
  };

  const sc = scenarios[scenario];

  const protectionTypes = [
    { type: "Structured Note (typical)", protected: false, desc: "An unsecured debt obligation of the issuer. In default, ranks pari passu with other senior unsecured creditors. Recovery is uncertain and typically takes years.", risk: "high" },
    { type: "COSI / Collateralised Note", protected: true, desc: "Collateralised issuance — the issuer pledges assets (often SIX Swiss Exchange eligible) against the note. In default, the collateral is liquidated and returned to investors. Significantly reduces credit exposure.", risk: "low" },
    { type: "SSPA / Pfandbrief-backed", protected: true, desc: "Notes backed by covered bond pools (Pfandbrief). Common in Switzerland and Germany. Provides strong regulatory protection of the underlying collateral pool.", risk: "low" },
    { type: "ETF-wrapped / Fund structure", protected: true, desc: "The payoff is achieved through a fund or ETF structure with segregated assets. Not an issuer obligation — the underlying assets are bankruptcy-remote.", risk: "low" },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="section-header">
        <div className="section-icon">🏦</div>
        <div>
          <div className="teal-line" style={{ margin: 0, marginBottom: 4 }} />
          <h2 className="playfair" style={{ fontSize: 24 }}>Issuer Credit Risk</h2>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>The dimension most often missing from structured product discussions</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, borderColor: `${theme.danger}30`, background: "rgba(248,81,73,0.03)" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Structured products are unsecured issuer obligations</div>
            <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.8 }}>Unlike a bank deposit (insured up to limits), a mutual fund (segregated assets), or a government bond, a standard structured note is an unsecured debt claim on the issuing bank. If the issuer defaults, the investor is an unsecured creditor — regardless of what the product's payoff structure promised.</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Scenario selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Issuer Scenario</div>
          {Object.entries(scenarios).map(([id, s]) => (
            <button key={id} onClick={() => setScenario(id)}
              style={{ padding: "12px 14px", borderRadius: 4, textAlign: "left", border: `1px solid ${scenario === id ? s.color : theme.border}`, background: scenario === id ? `${s.color}0C` : theme.surface, transition: "all 0.2s" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: scenario === id ? s.color : theme.text, marginBottom: 4 }}>{s.label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: theme.textDim }}>Expected recovery:</span>
                <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.recovery}%</span>
              </div>
            </button>
          ))}
        </div>

        {/* Impact visual */}
        <div className="card" key={scenario} style={{ borderColor: `${sc.color}40` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: sc.color, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Impact on a 100% Capital Protected Note</div>
          {/* Visual bar */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: theme.textMuted }}>Contractual entitlement</span>
              <span className="mono" style={{ fontSize: 11, color: theme.text }}>100%</span>
            </div>
            <div style={{ height: 12, background: theme.border, borderRadius: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "100%", background: `${theme.accent}60`, borderRadius: 6 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: theme.textMuted }}>Actual recovery</span>
              <span className="mono" style={{ fontSize: 11, color: sc.color }}>{sc.recovery}%</span>
            </div>
            <div style={{ height: 12, background: theme.border, borderRadius: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${sc.recovery}%`, background: sc.color, borderRadius: 6, transition: "width 0.6s ease", opacity: 0.75 }} />
            </div>
          </div>
          <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.8 }}>{sc.desc}</div>
        </div>
      </div>

      {/* Protection types */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: theme.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Note Structures & Credit Protection</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {protectionTypes.map((pt, i) => (
            <div key={i} className="card" style={{ display: "flex", gap: 14, alignItems: "flex-start", borderColor: pt.risk === "low" ? `${theme.success}30` : `${theme.danger}30` }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: pt.risk === "low" ? theme.success : theme.danger, marginTop: 4, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 4 }}>{pt.type}</div>
                <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.7 }}>{pt.desc}</div>
              </div>
              <span className="pill" style={{ background: pt.risk === "low" ? `${theme.success}18` : `${theme.danger}18`, color: pt.risk === "low" ? theme.success : theme.danger, whiteSpace: "nowrap", flexShrink: 0 }}>{pt.risk === "low" ? "Protected" : "Unsecured"}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="insight-box" style={{ marginTop: 20 }}>
        <strong>RM talking point — </strong>Always disclose the issuer to clients and provide a brief credit quality summary. In Switzerland, COSI-structured products are the most common collateralised format. For clients with large notionals (&gt;CHF 500k in a single issuer), consider diversifying across issuers to manage concentration of credit risk.
      </div>
    </div>
  );
}

// ─── GLOSSARY SECTION ─────────────────────────────────────────────────────────
