import { useState, useEffect, useCallback } from "react";
import { darkTheme, lightTheme } from "./theme/themes.js";
import { ThemeContext } from "./theme/ThemeContext.js";
import makeGlobalStyles from "./theme/globalStyles.js";
import LOGO_SRC from "./data/logo.js";
import { useProgress } from "./hooks/useProgress.js";

// Sections — Training Platform
import HomeSection from "./sections/HomeSection.jsx";
import OptionsSection from "./sections/OptionsSection.jsx";
import BuilderSection from "./sections/BuilderSection.jsx";
import PayoffSection from "./sections/PayoffSection.jsx";
import PortfolioSection from "./sections/PortfolioSection.jsx";
import SuitabilitySection from "./sections/SuitabilitySection.jsx";
import LifecycleSection from "./sections/LifecycleSection.jsx";
import StressSection from "./sections/StressSection.jsx";
import CreditSection from "./sections/CreditSection.jsx";
import GlossarySection from "./sections/GlossarySection.jsx";
import ComparisonSection from "./sections/ComparisonSection.jsx";
import QuizSection from "./sections/QuizSection.jsx";
import VolatilitySection from "./sections/VolatilitySection.jsx";
import WorstOfSection from "./sections/WorstOfSection.jsx";

// Real Product Builder
import RealBuilderSection from "./sections/RealBuilderSection.jsx";

const MODULE_IDS = [
  "options", "builder", "payoff", "portfolio", "suitability",
  "lifecycle", "stress", "credit", "glossary", "comparison",
  "quiz", "volatility", "worstof", "realbuilder",
];

const SECTION_MAP = {
  home: HomeSection,
  options: OptionsSection,
  builder: BuilderSection,
  payoff: PayoffSection,
  portfolio: PortfolioSection,
  suitability: SuitabilitySection,
  lifecycle: LifecycleSection,
  stress: StressSection,
  credit: CreditSection,
  glossary: GlossarySection,
  comparison: ComparisonSection,
  quiz: QuizSection,
  volatility: VolatilitySection,
  worstof: WorstOfSection,
  realbuilder: RealBuilderSection,
};

const TABS = [
  { id: "home",        label: "Learning Hub",     icon: "🏛️" },
  { id: "options",     label: "Options Primer",   icon: "🎓" },
  { id: "builder",     label: "Product Builder",  icon: "⚙️" },
  { id: "payoff",      label: "Payoff Explorer",  icon: "🎲" },
  { id: "portfolio",   label: "Portfolio Context",icon: "📊" },
  { id: "suitability", label: "Suitability",      icon: "⚠️" },
  { id: "lifecycle",   label: "Lifecycle",        icon: "⏱️" },
  { id: "stress",      label: "Stress Tests",     icon: "📉" },
  { id: "credit",      label: "Credit Risk",      icon: "🏦" },
  { id: "volatility",  label: "Vol & Pricing",    icon: "🎛️" },
  { id: "worstof",     label: "Worst-of Basket",  icon: "🧺" },
  { id: "quiz",        label: "Knowledge Check",  icon: "🧠" },
  { id: "glossary",    label: "Glossary",         icon: "📖" },
  { id: "comparison",  label: "Comparison",       icon: "📋" },
  { id: "realbuilder", label: "Real Builder",     icon: "🏗️" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isDark, setIsDark] = useState(false);
  const { visited, markVisited, reset } = useProgress();

  const theme = isDark ? darkTheme : lightTheme;

  const navigate = useCallback((id) => {
    setActiveTab(id);
    if (MODULE_IDS.includes(id)) markVisited(id);
  }, [markVisited]);

  useEffect(() => {
    if (MODULE_IDS.includes(activeTab)) markVisited(activeTab);
  }, [activeTab, markVisited]);

  const completedCount = MODULE_IDS.filter((id) => visited[id]).length;
  const Section = SECTION_MAP[activeTab] ?? HomeSection;

  // The Real Builder has its own full-screen style; wrap it differently
  const isRealBuilder = activeTab === "realbuilder";

  return (
    <ThemeContext.Provider value={theme}>
      <style>{makeGlobalStyles(theme)}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: theme.bg, transition: "background 0.25s" }}>

        {/* ── Top navigation bar ──────────────────────────────────────────── */}
        <div style={{ background: theme.isDark ? theme.navy : theme.surface, borderBottom: `1px solid ${theme.border}`, position: "sticky", top: 0, zIndex: 100, transition: "background 0.25s, border-color 0.25s" }}>
          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 16 }}>

            {/* Logo */}
            <div
              style={{ display: "flex", alignItems: "center", padding: "8px 0", flexShrink: 0, cursor: "pointer" }}
              onClick={() => navigate("home")}
            >
              <img
                src={LOGO_SRC}
                alt="structAcademy"
                style={{ height: 52, width: "auto", objectFit: "contain" }}
              />
            </div>

            {/* Nav tabs */}
            <div style={{ display: "flex", overflowX: "auto", flex: 1, scrollbarWidth: "none" }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => navigate(t.id)}
                  className={`nav-tab ${activeTab === t.id ? "active" : ""}`}
                  style={{ position: "relative" }}
                >
                  <span style={{ marginRight: 4 }}>{t.icon}</span>
                  {t.label}
                  {t.id === "realbuilder" && (
                    <span style={{ marginLeft: 4, fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 8, background: `${theme.teal}20`, color: theme.teal }}>LIVE</span>
                  )}
                  {MODULE_IDS.includes(t.id) && visited[t.id] && (
                    <span style={{ position: "absolute", top: 6, right: 3, width: 4, height: 4, borderRadius: "50%", background: theme.success }} />
                  )}
                </button>
              ))}
            </div>

            {/* Progress + theme toggle */}
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                <div style={{ fontSize: 9, color: theme.textDim, letterSpacing: "0.08em" }}>
                  {completedCount}/{MODULE_IDS.length} MODULES
                </div>
                <div style={{ width: 72, height: 3, background: theme.border, borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${(completedCount / MODULE_IDS.length) * 100}%`, background: theme.teal, borderRadius: 2, transition: "width 0.4s ease" }} />
                </div>
              </div>

              <button
                onClick={() => setIsDark((d) => !d)}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                style={{ width: 42, height: 22, borderRadius: 11, border: `1px solid ${theme.border}`, background: isDark ? theme.surface2 : "#E8E4DC", position: "relative", cursor: "pointer", transition: "all 0.25s", flexShrink: 0 }}
              >
                <div style={{ position: "absolute", top: 2, left: isDark ? 2 : 20, width: 16, height: 16, borderRadius: "50%", background: theme.gold, transition: "left 0.25s ease", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>
                  {isDark ? "🌙" : "☀️"}
                </div>
              </button>

              <span className="pill pill-teal" style={{ fontSize: 9, letterSpacing: "0.1em", flexShrink: 0 }}>TRAINING ONLY</span>
            </div>
          </div>
        </div>

        {/* ── Page content ───────────────────────────────────────────────── */}
        <div style={{ flex: 1, padding: isRealBuilder ? "0" : "32px 20px", maxWidth: isRealBuilder ? "100%" : 1300, width: "100%", margin: "0 auto" }}>
          <Section
            key={activeTab}
            onNavigate={navigate}
            visited={visited}
            onReset={reset}
            completedCount={completedCount}
            total={MODULE_IDS.length}
          />
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        {!isRealBuilder && (
          <div style={{ borderTop: `1px solid ${theme.border}`, padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: theme.surface, transition: "all 0.25s" }}>
            <span style={{ fontSize: 11, color: theme.textDim }}>
              Educational use only · No client data · No real-time pricing · No suitability determination
            </span>
            <span className="mono" style={{ fontSize: 10, color: theme.textDim }}>v1.0 — structAcademy</span>
          </div>
        )}
      </div>
    </ThemeContext.Provider>
  );
}
