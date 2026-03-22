import { T } from "./builderTheme.js";
import Spinner from "./Spinner.jsx";

export default function QuotePanel({ underlying, quote }) {
  if (!underlying) return null;
  const u = underlying;
  const priceChange = quote?.ok && quote.price && quote.prev ? ((quote.price - quote.prev) / quote.prev * 100) : null;
  const rangePos = quote?.ok && quote.high52 && quote.low52
    ? Math.min(100, Math.max(0, ((quote.price - quote.low52) / (quote.high52 - quote.low52)) * 100)) : null;

  return (
    <div className="card fade-up" style={{ borderColor: `${T.gold}30` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{u.label}</div>
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{u.id} · {u.exchange ?? u.region} · {u.currency}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          {quote?.ok ? (
            <>
              <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: T.gold }}>{quote.price?.toFixed(2)}</div>
              {priceChange !== null && (
                <div className="mono" style={{ fontSize: 11, color: priceChange >= 0 ? T.success : T.danger }}>
                  {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
                </div>
              )}
            </>
          ) : quote && !quote.ok ? (
            <div style={{ fontSize: 11, color: T.textMuted }}>Live price unavailable — using illustrative data</div>
          ) : (
            <Spinner />
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: quote?.ok && rangePos !== null ? 12 : 0 }}>
        {[
          { l: "Sector", v: u.sector },
          { l: "Hist. Vol", v: `${u.histVol}%` },
          { l: "Div. Yield", v: `${u.divYield}%` },
          quote?.ok && quote.high52 ? { l: "52W High", v: quote.high52?.toFixed(2) } : null,
          quote?.ok && quote.low52 ? { l: "52W Low", v: quote.low52?.toFixed(2) } : null,
        ].filter(Boolean).map((s, i) => (
          <div key={i} style={{ padding: "4px 10px", background: T.surface2, borderRadius: 4, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 9, color: T.textDim }}>{s.l}</div>
            <div className="mono" style={{ fontSize: 12, color: T.text, fontWeight: 500 }}>{s.v}</div>
          </div>
        ))}
      </div>
      {rangePos !== null && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: T.textDim }}>52-week range</span>
            <span style={{ fontSize: 9, color: T.textMuted }}>Current: {rangePos.toFixed(0)}th percentile</span>
          </div>
          <div style={{ height: 4, background: T.border, borderRadius: 2, position: "relative" }}>
            <div style={{ position: "absolute", left: `${rangePos}%`, top: -3, width: 10, height: 10, borderRadius: "50%", background: T.gold, transform: "translateX(-50%)" }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TERM SHEET PANEL ─────────────────────────────────────────────────────────
