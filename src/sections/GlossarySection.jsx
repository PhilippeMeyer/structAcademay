import { useState } from "react";
import { useTheme } from "../theme/ThemeContext.js";
import GLOSSARY_TERMS from "../data/glossary.js";

export default function GlossarySection() {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  // Build sorted term list from shared constant, de-duplicating short aliases
  const terms = Object.entries(GLOSSARY_TERMS)
    .filter(([k]) => !["BRC","RC","CPN"].includes(k)) // skip short aliases, full names already present
    .map(([term, { tag, def }]) => ({ term, tag, def }))
    .sort((a, b) => a.term.localeCompare(b.term));

  const tags = ["All", ...new Set(terms.map(t => t.tag))];
  const filtered = terms.filter(t =>
    (activeTag === "All" || t.tag === activeTag) &&
    (search === "" || t.term.toLowerCase().includes(search.toLowerCase()) || t.def.toLowerCase().includes(search.toLowerCase()))
  );

  const tagColors = { Product: theme.gold, Options: "#A78BFA", Mechanics: theme.accent, Greeks: theme.warning, Pricing: theme.success, Credit: theme.danger, Strategy: "#34D399", Risk: theme.danger };

  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="section-header">
        <div className="section-icon">📖</div>
        <div>
          <div className="teal-line" style={{ margin: 0, marginBottom: 4 }} />
          <h2 className="playfair" style={{ fontSize: 24 }}>Glossary</h2>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>
            {terms.length} terms — hover any <span style={{ borderBottom: `1px dashed ${theme.gold}`, cursor: "help" }}>underlined term</span> anywhere in the app for an instant definition
          </p>
        </div>
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search terms..."
          style={{ flex: "1 1 220px", padding: "9px 14px", borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.surface2, color: theme.text, fontSize: 13, outline: "none", fontFamily: "IBM Plex Sans" }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(tag)}
              style={{ padding: "5px 12px", borderRadius: 12, fontSize: 11, fontWeight: 500, border: `1px solid ${activeTag === tag ? (tagColors[tag] || theme.gold) : theme.border}`, background: activeTag === tag ? `${tagColors[tag] || theme.gold}18` : "transparent", color: activeTag === tag ? (tagColors[tag] || theme.gold) : theme.textMuted, transition: "all 0.2s", cursor: "pointer" }}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 14 }}>{filtered.length} term{filtered.length !== 1 ? "s" : ""}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((t, i) => (
          <div key={t.term} className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start", animation: `fadeIn 0.2s ${Math.min(i, 10) * 0.03}s ease both` }}>
            <div style={{ minWidth: 180, flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: tagColors[t.tag] || theme.gold, marginBottom: 4 }}>{t.term}</div>
              <span className="pill" style={{ background: `${tagColors[t.tag] || theme.gold}18`, color: tagColors[t.tag] || theme.gold, fontSize: 9 }}>{t.tag}</span>
            </div>
            <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.8 }}>{t.def}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: theme.textDim, fontSize: 13 }}>No terms match your search.</div>
        )}
      </div>
    </div>
  );
}

// ─── COMPARISON TABLE ─────────────────────────────────────────────────────────
