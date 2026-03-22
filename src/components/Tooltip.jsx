import { useState, useRef } from "react";
import { useTheme } from "../theme/ThemeContext.js";
import GLOSSARY_TERMS from "../data/glossary.js";

export function Tooltip({ term, def, tag, children }) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const tagColors = {
    Product: theme.gold, Options: "#A78BFA", Mechanics: theme.accent,
    Greeks: theme.warning, Pricing: theme.success, Credit: theme.danger,
    Strategy: "#34D399", Risk: theme.danger,
  };
  const tagColor = tagColors[tag] || theme.gold;

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.bottom + 8 });
    setVisible(true);
  };

  return (
    <span
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
      style={{ position: "relative", display: "inline" }}
    >
      <span style={{
        borderBottom: `1px dashed ${tagColor}`,
        color: "inherit",
        cursor: "help",
        textDecoration: "none",
      }}>
        {children}
      </span>
      {visible && (
        <span style={{
          position: "fixed",
          left: Math.min(pos.x, window.innerWidth - 280),
          top: pos.y,
          zIndex: 9999,
          width: 260,
          background: theme.isDark ? "#1C2333" : "#FFFFFF",
          border: `1px solid ${tagColor}60`,
          borderRadius: 6,
          padding: "10px 12px",
          boxShadow: theme.isDark
            ? `0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px ${tagColor}30`
            : `0 8px 24px rgba(0,0,0,0.15), 0 0 0 1px ${tagColor}30`,
          pointerEvents: "none",
          animation: "fadeIn 0.15s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: tagColor, fontFamily: "IBM Plex Sans" }}>{term}</span>
            <span style={{
              fontSize: 9, fontWeight: 600, letterSpacing: "0.06em",
              padding: "1px 6px", borderRadius: 8,
              background: `${tagColor}18`, color: tagColor,
            }}>{tag}</span>
          </div>
          <p style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.7, margin: 0, fontFamily: "IBM Plex Sans" }}>{def}</p>
        </span>
      )}
    </span>
  );
}

// Wraps any text, automatically detecting glossary terms and making them hoverable

export function GT({ children }) {
  const entry = GLOSSARY_TERMS[children];
  if (!entry) return <>{children}</>;
  return <Tooltip term={children} def={entry.def} tag={entry.tag}>{children}</Tooltip>;
}

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const makeGlobalStyles = (t) => `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=JetBrains+Mono:wght@300;400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    background: ${t.bg};
    color: ${t.text};
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    overflow-x: hidden;
    transition: background 0.25s, color 0.25s;
  }
  
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${t.bg}; }
  ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 2px; }
  
  .playfair { font-family: 'Playfair Display', serif; }
  .mono { font-family: 'JetBrains Mono', monospace; }
  
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes drawLine { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
  
  .fade-in { animation: fadeIn 0.4s ease forwards; }
  .slide-in { animation: slideIn 0.3s ease forwards; }
  
  button { cursor: pointer; border: none; background: none; font-family: inherit; }
  input[type=range] {
    -webkit-appearance: none;
    height: 3px;
    background: ${t.border};
    border-radius: 2px;
    outline: none;
    width: 100%;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px; height: 14px;
    background: ${t.gold};
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 0 3px ${t.gold}26;
  }
  
  .gold-line {
    width: 40px; height: 2px;
    background: linear-gradient(90deg, ${t.gold}, transparent);
    margin-bottom: 8px;
  }
  
  .nav-tab {
    padding: 10px 18px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${t.textMuted};
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    white-space: nowrap;
    background: none;
  }
  .nav-tab:hover { color: ${t.text}; }
  .nav-tab.active { color: ${t.gold}; border-bottom-color: ${t.gold}; }
  
  .card {
    background: ${t.surface};
    border: 1px solid ${t.border};
    border-radius: 6px;
    padding: 20px;
    transition: background 0.25s, border-color 0.25s;
  }
  
  .insight-box {
    background: ${t.isDark ? "rgba(201,168,76,0.06)" : "rgba(160,118,42,0.08)"};
    border-left: 2px solid ${t.gold};
    padding: 12px 16px;
    border-radius: 0 4px 4px 0;
    font-size: 13px;
    color: ${t.textMuted};
    line-height: 1.6;
    margin-top: 12px;
  }
  .insight-box strong { color: ${t.goldLight}; font-weight: 500; }
  
  .pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.05em;
  }
  .pill-gold { background: ${t.isDark ? "rgba(201,168,76,0.15)" : "rgba(160,118,42,0.12)"}; color: ${t.gold}; }
  .pill-blue { background: ${t.isDark ? "rgba(76,158,235,0.15)" : "rgba(26,107,181,0.1)"}; color: ${t.accent}; }
  .pill-red { background: ${t.isDark ? "rgba(248,81,73,0.15)" : "rgba(192,57,43,0.1)"}; color: ${t.danger}; }
  .pill-green { background: ${t.isDark ? "rgba(63,185,80,0.15)" : "rgba(30,126,52,0.1)"}; color: ${t.success}; }
  
  .section-header {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 24px;
  }
  .section-icon {
    width: 36px; height: 36px;
    background: ${t.isDark ? "rgba(201,168,76,0.1)" : "rgba(160,118,42,0.08)"};
    border: 1px solid ${t.isDark ? "rgba(201,168,76,0.2)" : "rgba(160,118,42,0.2)"};
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  /* Theme toggle */
  .theme-toggle {
    width: 44px; height: 24px;
    border-radius: 12px;
    border: 1px solid ${t.border};
    background: ${t.isDark ? t.surface2 : "#E8E4DC"};
    position: relative;
    cursor: pointer;
    transition: background 0.25s, border-color 0.25s;
    flex-shrink: 0;
  }
  .theme-toggle-knob {
    position: absolute;
    top: 3px;
    left: ${t.isDark ? "3px" : "21px"};
    width: 16px; height: 16px;
    border-radius: 50%;
    background: ${t.gold};
    transition: left 0.25s ease;
    font-size: 9px;
    display: flex; align-items: center; justify-content: center;
  }
`;

// ─── SVG PAYOFF CHART ─────────────────────────────────────────────────────────
