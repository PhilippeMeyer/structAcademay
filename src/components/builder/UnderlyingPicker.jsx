import { useState, useEffect, useRef } from "react";
import { T } from "./builderTheme.js";
import UNIVERSE from "../../data/underlyings.js";
import { fetchQuote } from "./fetchQuote.js";
import Spinner from "./Spinner.jsx";

export default function UnderlyingPicker({ value, onChange, label = "Underlying", multi = false, basket = [], onBasketChange }) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All");
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState({});
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const regions = ["All", "CH", "EU", "US"];
  const filtered = UNIVERSE.filter(u =>
    (region === "All" || u.region === region) &&
    (query === "" || u.label.toLowerCase().includes(query.toLowerCase()) || u.id.toLowerCase().includes(query.toLowerCase()))
  );

  const fetchAndCache = async (id) => {
    if (quotes[id] || loading[id]) return;
    setLoading(l => ({ ...l, [id]: true }));
    const q = await fetchQuote(id);
    setQuotes(prev => ({ ...prev, [id]: q }));
    setLoading(l => ({ ...l, [id]: false }));
  };

  const selectItem = (u) => {
    if (multi) {
      const inBasket = basket.some(b => b.id === u.id);
      if (inBasket) { onBasketChange(basket.filter(b => b.id !== u.id)); return; }
      if (basket.length >= 4) return;
      fetchAndCache(u.id);
      onBasketChange([...basket, u]);
    } else {
      fetchAndCache(u.id);
      onChange(u);
      setOpen(false);
    }
  };

  useEffect(() => {
    if (value && !multi) fetchAndCache(value.id);
  }, [value?.id]);

  const q = value ? quotes[value.id] : null;
  const isLoading = value ? loading[value.id] : false;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Selected display */}
      {!multi && (
        <button onClick={() => setOpen(o => !o)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 6, border: `1px solid ${open ? T.gold : T.border}`, background: T.surface2, color: T.text, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "border-color .2s" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: value ? T.text : T.textMuted }}>{value ? value.label : `Select ${label}...`}</div>
            {value && <div style={{ fontSize: 10, color: T.textMuted, marginTop: 1 }}>{value.id} · {value.sector} · {value.currency}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isLoading && <Spinner />}
            {q?.ok && <span className="mono" style={{ fontSize: 13, color: T.gold, fontWeight: 600 }}>{q.price?.toFixed(2)}</span>}
            <span style={{ color: T.textDim, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
          </div>
        </button>
      )}

      {/* Dropdown */}
      {(open || multi) && (
        <div style={multi ? {} : { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, boxShadow: "0 16px 40px rgba(0,0,0,.5)" }}>
          {/* Search + region filter */}
          <div style={{ padding: "10px 12px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name or ticker..."
              style={{ flex: "1 1 140px", padding: "6px 10px", borderRadius: 4, border: `1px solid ${T.border}`, background: T.surface2, color: T.text, fontSize: 11, outline: "none", fontFamily: "Sora" }} />
            {regions.map(r => (
              <button key={r} onClick={() => setRegion(r)}
                style={{ padding: "4px 10px", borderRadius: 10, fontSize: 10, fontWeight: 600, border: `1px solid ${region === r ? T.gold : T.border}`, background: region === r ? `${T.gold}18` : "transparent", color: region === r ? T.gold : T.textMuted, cursor: "pointer" }}>
                {r}
              </button>
            ))}
          </div>
          {/* List */}
          <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {filtered.map(u => {
              const inBasket = multi && basket.some(b => b.id === u.id);
              const disabled = multi && !inBasket && basket.length >= 4;
              const qd = quotes[u.id];
              return (
                <button key={u.id} onClick={() => !disabled && selectItem(u)} disabled={disabled}
                  style={{ display: "flex", width: "100%", padding: "9px 14px", gap: 12, alignItems: "center", background: inBasket ? `${T.gold}12` : "transparent", borderBottom: `1px solid ${T.border}30`, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, transition: "background .15s" }}
                  onMouseEnter={e => { if (!inBasket) e.currentTarget.style.background = `${T.border}50`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = inBasket ? `${T.gold}12` : "transparent"; }}>
                  <div style={{ flex: 1, textAlign: "left" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: inBasket ? T.gold : T.text }}>{u.label}</div>
                    <div style={{ fontSize: 10, color: T.textMuted }}>{u.id} · {u.sector}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="mono" style={{ fontSize: 11, color: T.textMuted }}>{u.histVol}% vol</div>
                    {qd?.ok && <div className="mono" style={{ fontSize: 11, color: T.gold }}>{qd.price?.toFixed(2)}</div>}
                    {!qd && !loading[u.id] && (
                      <button onClick={e => { e.stopPropagation(); fetchAndCache(u.id); }}
                        style={{ fontSize: 9, color: T.accent, background: "transparent", border: `1px solid ${T.accent}40`, borderRadius: 3, padding: "1px 5px", cursor: "pointer" }}>
                        fetch
                      </button>
                    )}
                    {loading[u.id] && <Spinner />}
                  </div>
                  {inBasket && <span style={{ color: T.gold, fontSize: 14 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QUOTE PANEL ──────────────────────────────────────────────────────────────
