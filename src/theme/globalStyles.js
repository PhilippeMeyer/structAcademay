// ─── StructAcademy Global Styles ─────────────────────────────────────────────
// Design System v1: Inter / Navy / Teal / Gold / 8pt grid / 12-col / max 1200px

const makeGlobalStyles = (t) => `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${t.bg};
    color: ${t.text};
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    overflow-x: hidden;
    transition: background 0.25s, color 0.25s;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: ${t.bg}; }
  ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 2px; }

  .mono { font-family: 'JetBrains Mono', monospace; }

  @keyframes fadeIn  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes drawLine { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .fade-in  { animation: fadeIn  0.35s ease forwards; }
  .slide-in { animation: slideIn 0.3s ease forwards; }

  button { cursor: pointer; border: none; background: none; font-family: inherit; }

  .card {
    background: ${t.surface};
    border: 1px solid ${t.border};
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,${t.isDark ? '0.2' : '0.05'});
    transition: background 0.25s, border-color 0.25s;
  }

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
    background: ${t.teal};
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 0 3px ${t.teal}22;
  }

  .nav-tab {
    padding: 12px 14px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: ${t.textMuted};
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    white-space: nowrap;
    background: none;
    font-family: 'Inter', sans-serif;
  }
  .nav-tab:hover { color: ${t.text}; }
  .nav-tab.active { color: ${t.teal}; border-bottom-color: ${t.teal}; }

  .pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .pill-navy  { background: ${t.navy}15;  color: ${t.isDark ? '#7BA7CC' : t.navy}; }
  .pill-teal  { background: ${t.teal}18;  color: ${t.teal}; }
  .pill-gold  { background: ${t.gold}20;  color: ${t.isDark ? t.goldLight : t.goldDim}; }
  .pill-blue  { background: ${t.teal}18;  color: ${t.teal}; }
  .pill-red   { background: ${t.danger}15; color: ${t.danger}; }
  .pill-green { background: ${t.success}15; color: ${t.success}; }

  .gold-line {
    width: 40px; height: 2px;
    background: linear-gradient(90deg, ${t.teal}, transparent);
    margin-bottom: 8px;
  }
  .teal-line {
    width: 40px; height: 3px;
    background: linear-gradient(90deg, ${t.teal}, ${t.tealLight});
    border-radius: 2px;
    margin-bottom: 8px;
  }

  .section-header {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 24px;
  }
  .section-icon {
    width: 40px; height: 40px;
    background: ${t.teal}15;
    border: 1px solid ${t.teal}30;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }

  .insight-box {
    background: ${t.teal}0C;
    border-left: 3px solid ${t.teal};
    padding: 12px 16px;
    border-radius: 0 8px 8px 0;
    font-size: 13px;
    color: ${t.textMuted};
    line-height: 1.7;
    margin-top: 12px;
  }
  .insight-box strong { color: ${t.teal}; font-weight: 600; }
`;

export default makeGlobalStyles;
