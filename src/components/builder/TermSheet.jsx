import { T } from "./builderTheme.js";

export default function TermSheet({ type, params, pricing, underlying, basketItems }) {
  const typeLabels = { cpn: "Capital Protected Note", rc: "Reverse Convertible", brc: "Barrier Reverse Convertible", autocall: "Autocall / Phoenix" };
  const isBasket = basketItems && basketItems.length > 1;
  const underlyingDesc = isBasket
    ? `Worst-of basket: ${basketItems.map(u => u.label).join(", ")}`
    : underlying?.label ?? "—";

  const rows = [
    { label: "Product Type", value: typeLabels[type] },
    { label: "Reference Underlying", value: underlyingDesc },
    { label: "Currency", value: underlying?.currency ?? "—" },
    { label: "Maturity", value: `${params.maturity ?? 2} year${params.maturity !== 1 ? "s" : ""}` },
    { label: "Strike", value: "100% of initial fixing price" },
    type === "cpn" ? { label: "Capital Protection", value: `${params.protection ?? 90}%` } : null,
    type === "cpn" ? { label: "Participation Rate", value: `${pricing?.participation ?? "—"}%` } : null,
    (type === "rc" || type === "brc" || type === "autocall") ? { label: "Coupon (p.a.)", value: `${pricing?.coupon?.toFixed(1) ?? "—"}%` } : null,
    (type === "brc" || type === "autocall") ? { label: "Barrier Level", value: `${params.barrier ?? 65}% (American, continuous)` } : null,
    type === "autocall" ? { label: "Autocall Trigger", value: `${params.autocallTrigger ?? 100}% of strike` } : null,
    type === "autocall" ? { label: "Observation Frequency", value: "Quarterly" } : null,
    { label: "Settlement", value: type === "cpn" ? "Cash" : "Physical (shares) or cash equivalent" },
    { label: "Secondary Market", value: "Issuer bid — no guaranteed liquidity" },
    { label: "Issuer Credit Risk", value: "Full notional at risk in issuer default" },
  ].filter(Boolean);

  return (
    <div className="card" style={{ borderColor: `${T.gold}30` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 14 }}>Indicative Term Sheet</div>
      <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 14 }}>Illustrative only · Not a binding offer · For training purposes</div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: i < rows.length - 1 ? `1px solid ${T.border}40` : "none", alignItems: "flex-start" }}>
          <span style={{ fontSize: 11, color: T.textMuted, flexShrink: 0 }}>{r.label}</span>
          <span style={{ fontSize: 11, color: T.text, textAlign: "right", fontWeight: 500 }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── BASKET CORRELATION PANEL ─────────────────────────────────────────────────
