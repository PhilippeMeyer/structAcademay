import { useTheme } from "../theme/ThemeContext.js";
import LOGO_SRC from "../data/logo.js";

export default function HomeSection({ onNavigate, visited, onReset, completedCount, total }) {
  const theme = useTheme();

  // 12 module tiles — no quiz here
  const tiles = [
    { icon: "🎓", title: "Options Primer",          desc: "Calls, puts, and key strategies — the building blocks of every structured product.", badge: "Prerequisite", color: "#A78BFA",       tab: "options" },
    { icon: "⚙️", title: "Product Builder",          desc: "Bond + options decomposition — understand the engineering, not the marketing.",       badge: "Foundation",  color: theme.accent,    tab: "builder" },
    { icon: "📈", title: "Payoff Explorer",           desc: "Visualise what actually happens across a range of market outcomes.",                  badge: "Core",        color: theme.gold,      tab: "payoff" },
    { icon: "📊", title: "Portfolio Context",         desc: "Where does a structured product fit vs bonds, equities, and cash?",                   badge: "Applied",     color: theme.success,   tab: "portfolio" },
    { icon: "⚠️", title: "Suitability Reflexes",     desc: "Build correct habits. Learn when not to propose a structured product.",               badge: "Conduct",     color: theme.warning,   tab: "suitability" },
    { icon: "⏱️", title: "Product Lifecycle",         desc: "What happens month by month — path dependency made tangible.",                        badge: "Applied",     color: theme.accent,    tab: "lifecycle" },
    { icon: "📉", title: "Historical Stress Tests",   desc: "GFC, COVID, 2022 rate shock — what would have happened to your client.",              badge: "Applied",     color: theme.danger,    tab: "stress" },
    { icon: "🏦", title: "Issuer Credit Risk",        desc: "The dimension most often missing. Unsecured obligations, Lehman 2008, COSI.",          badge: "Risk",        color: theme.danger,    tab: "credit" },
    { icon: "🎛️", title: "Vol & Pricing Intuition",   desc: "How vol, rates and dividends shift product economics — no formulas.",                 badge: "Advanced",    color: theme.accent,    tab: "volatility" },
    { icon: "🧺", title: "Worst-of Basket",           desc: "The correlation effect — lower correlation means higher coupon AND higher risk.",      badge: "Advanced",    color: theme.danger,    tab: "worstof" },
    { icon: "📖", title: "Glossary",                  desc: "60+ terms with plain-language definitions. Hover any underlined term for a tooltip.",  badge: "Reference",   color: theme.textMuted, tab: "glossary" },
    { icon: "📋", title: "Product Comparison",        desc: "All four products side-by-side across 12 dimensions — at a glance.",                  badge: "Reference",   color: theme.gold,      tab: "comparison" },
  ];

  const quizVisited = visited && visited["quiz"];
  const quizDoneCount = Object.values(visited || {}).filter(Boolean).length;

  return (
    <div className="fade-in" style={{ maxWidth: 1100, margin: "0 auto" }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 40, paddingTop: 8 }}>
        <img
          src={LOGO_SRC}
          alt="structAcademy"
          style={{ height: 96, width: "auto", objectFit: "contain", marginBottom: 20, display: "block" }}
        />
        <h1 style={{ fontSize: 36, fontWeight: 700, color: theme.text, letterSpacing: "-0.01em", lineHeight: 1.2, marginBottom: 6 }}>
          Structured Products,{" "}
          <span style={{ color: theme.teal }}>demystified.</span>
        </h1>
        <p style={{ fontSize: 14, color: theme.teal, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 14, textTransform: "uppercase" }}>
          From Theory to Payoff
        </p>
        <p style={{ fontSize: 15, color: theme.textMuted, maxWidth: 580, lineHeight: 1.8 }}>
          An RM enablement platform — understand how structured products are built, what risks they embed, and when — or when not — to propose them to clients.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <span className="pill pill-teal">Training Only</span>
          <span className="pill pill-navy">No Client Data</span>
          <span className="pill" style={{ background: "rgba(139,148,158,0.1)", color: theme.textMuted }}>No Real-Time Pricing</span>
        </div>
      </div>

      {/* ── 12 module tiles — 4 columns ───────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {tiles.map((t, i) => {
          const isVisited = visited && visited[t.tab];
          return (
            <button key={i} onClick={() => onNavigate(t.tab)}
              style={{ textAlign: "left", display: "block", width: "100%", background: "none", border: "none", padding: 0 }}>
              <div className="card" style={{
                cursor: "pointer", height: "100%",
                transition: "border-color 0.2s, transform 0.2s, background 0.2s",
                animation: `fadeIn 0.35s ${i * 0.04}s ease both`,
                borderColor: isVisited ? `${theme.success}40` : theme.border,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = `${t.color}08`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = isVisited ? `${theme.success}40` : theme.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.background = theme.surface; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{t.icon}</span>
                  {isVisited && <span style={{ fontSize: 10, color: theme.success, fontWeight: 600 }}>✓</span>}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5, color: theme.text, lineHeight: 1.3 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.6, marginBottom: 12 }}>{t.desc}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="pill" style={{ background: `${t.color}18`, color: t.color, fontSize: 9 }}>{t.badge}</span>
                  <span style={{ fontSize: 10, color: t.color, fontWeight: 500 }}>Open →</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Progress bar ──────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 16, borderColor: `${theme.teal}30`, background: `${theme.teal}05` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.teal }}>Learning Progress</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="mono" style={{ fontSize: 13, color: theme.teal }}>{completedCount}/{total} modules</span>
            {completedCount > 0 && (
              <button onClick={onReset} style={{ fontSize: 10, color: theme.textDim, background: "transparent", border: `1px solid ${theme.border}`, borderRadius: 3, padding: "3px 8px", cursor: "pointer" }}>Reset</button>
            )}
          </div>
        </div>
        <div style={{ height: 6, background: theme.border, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(completedCount / total) * 100}%`, background: `linear-gradient(90deg, ${theme.tealDim}, ${theme.teal})`, borderRadius: 3, transition: "width 0.5s ease" }} />
        </div>
        {completedCount === total && (
          <div style={{ marginTop: 10, fontSize: 12, color: theme.success, fontWeight: 500 }}>✓ All modules completed — well done.</div>
        )}
      </div>

      {/* ── Core principle ────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 16, borderColor: `${theme.teal}30`, background: `${theme.teal}06` }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ fontSize: 22, flexShrink: 0 }}>💡</div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 5, fontSize: 13 }}>Core principle behind every structured product</div>
            <div style={{ color: theme.textMuted, fontSize: 13, lineHeight: 1.8 }}>
              Structured products combine a <strong style={{ color: theme.accent }}>bond</strong> (providing capital floor or coupon) with <strong style={{ color: theme.danger }}>options</strong> (shaping the payoff profile). The client either sells optionality to finance yield, or buys it to secure protection. <em style={{ color: theme.teal }}>There is no free lunch — yield is compensation for a risk the client is accepting.</em>
            </div>
          </div>
        </div>
      </div>

      {/* ── Knowledge Check — full width, concludes the journey ───────────── */}
      <button onClick={() => onNavigate("quiz")} style={{ display: "block", width: "100%", background: "none", border: "none", padding: 0, marginBottom: 16, cursor: "pointer" }}>
        <div style={{
          position: "relative", overflow: "hidden", borderRadius: 8,
          border: `1px solid ${quizVisited ? theme.success : "#F59E0B"}60`,
          background: theme.isDark
            ? `linear-gradient(135deg, #0D1117 0%, #1a1200 50%, #0D1117 100%)`
            : `linear-gradient(135deg, #FAFAF5 0%, #FFFBEB 50%, #FAFAF5 100%)`,
          transition: "border-color 0.2s, transform 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#F59E0B"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = `${quizVisited ? theme.success : "#F59E0B"}60`; e.currentTarget.style.transform = "none"; }}>
          {/* Dot grid */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, ${"#F59E0B"}18 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
          <div style={{ position: "relative", padding: "28px 32px", display: "flex", alignItems: "center", gap: 28 }}>
            {/* Icon + badge */}
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: `${"#F59E0B"}18`, border: `1px solid ${"#F59E0B"}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                🧠
              </div>
              {quizVisited && (
                <span style={{ fontSize: 10, fontWeight: 700, color: theme.success, background: `${theme.success}18`, padding: "2px 8px", borderRadius: 10 }}>✓ Completed</span>
              )}
            </div>
            {/* Text */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: theme.text, fontFamily: "'Playfair Display', serif" }}>Knowledge Check</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 10, background: "#F59E0B18", color: "#F59E0B", letterSpacing: "0.05em" }}>15 Questions</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 10, background: `${theme.success}18`, color: theme.success, letterSpacing: "0.05em" }}>Assessment</span>
              </div>
              <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.7, maxWidth: 640 }}>
                Scenario-based questions across all modules — suitability, product mechanics, options, volatility, credit risk, and worst-of baskets. Complete the modules above, then test your understanding here.
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {["Suitability", "Product Mechanics", "Options", "Volatility & Pricing", "Credit Risk", "Worst-of Basket", "Lifecycle"].map((topic, i) => (
                  <span key={i} style={{ fontSize: 10, color: theme.textDim, padding: "2px 8px", borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.surface2 }}>{topic}</span>
                ))}
              </div>
            </div>
            {/* CTA */}
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ padding: "14px 28px", borderRadius: 6, background: `linear-gradient(135deg, #d97706, #F59E0B)`, color: "#000", fontSize: 14, fontWeight: 700, letterSpacing: "0.03em", boxShadow: "0 4px 20px #F59E0B40", whiteSpace: "nowrap" }}>
                {quizVisited ? "Retake Quiz →" : "Start Quiz →"}
              </div>
              <span style={{ fontSize: 10, color: theme.textDim }}>~10 min</span>
            </div>
          </div>
        </div>
      </button>

      {/* ── Real Product Builder launch card ──────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden", borderRadius: 8, border: `1px solid ${theme.gold}50`, background: theme.isDark ? "linear-gradient(135deg, #0D1117 0%, #1a1400 50%, #0D1117 100%)" : "linear-gradient(135deg, #FAFAF5 0%, #FEF9EC 50%, #FAFAF5 100%)" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, ${theme.gold}15 1px, transparent 1px)`, backgroundSize: "24px 24px", pointerEvents: "none" }} />
        <div style={{ position: "relative", padding: "24px 32px", display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 12, background: `${theme.gold}18`, border: `1px solid ${theme.gold}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🏗️</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: theme.text, fontFamily: "'Playfair Display', serif" }}>Real Product Builder</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: `${theme.success}18`, color: theme.success }}>LIVE DATA</span>
            </div>
            <div style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.7, maxWidth: 560 }}>
              Build real structured products on live underlyings — SMI, Euro Stoxx 50, individual stocks. Black-Scholes pricing, basket construction with pairwise correlation, full term sheet output.
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {["23 underlyings", "Live Yahoo Finance prices", "Basket + correlation", "BS option pricing", "4 payoff structures"].map((f, i) => (
                <span key={i} style={{ fontSize: 10, color: theme.textDim, padding: "2px 8px", borderRadius: 4, border: `1px solid ${theme.border}`, background: theme.surface2 }}>{f}</span>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNavigate("realbuilder")}
            style={{ flexShrink: 0, padding: "12px 24px", borderRadius: 6, background: `linear-gradient(135deg, ${theme.goldDim}, ${theme.gold})`, border: "none", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 20px ${theme.gold}40`, transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 24px ${theme.gold}60`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 20px ${theme.gold}40`; }}
          >
            Open Builder ↗
          </button>
        </div>
      </div>

    </div>
  );
}
