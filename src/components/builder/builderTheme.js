const T = {
  bg: "#0A0E17", surface: "#111827", surface2: "#1A2235", border: "#1F2D45",
  gold: "#C9A84C", goldLight: "#E4C66A", goldDim: "#7A6230",
  text: "#E8EFF8", textMuted: "#7A8FA6", textDim: "#374151",
  accent: "#3B82F6", success: "#22C55E", danger: "#EF4444", warning: "#F59E0B",
  purple: "#8B5CF6",
};


const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${T.bg};color:${T.text};font-family:'Sora',sans-serif;font-size:13px;line-height:1.6}
  ::-webkit-scrollbar{width:3px;height:3px}
  ::-webkit-scrollbar-track{background:${T.bg}}
  ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
  button{cursor:pointer;border:none;background:none;font-family:inherit}
  @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .fade-up{animation:fadeUp .35s ease forwards}
  .mono{font-family:'JetBrains Mono',monospace}
  input[type=range]{-webkit-appearance:none;height:2px;background:${T.border};border-radius:1px;outline:none;width:100%}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;background:${T.gold};border-radius:50%;cursor:pointer;box-shadow:0 0 0 3px ${T.gold}22}
  .card{background:${T.surface};border:1px solid ${T.border};border-radius:8px;padding:18px}
  .chip{display:inline-flex;align-items:center;padding:2px 9px;border-radius:10px;font-size:10px;font-weight:600;letter-spacing:.05em}
  .tab-btn{padding:8px 16px;font-size:11px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:${T.textMuted};border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;background:none}
  .tab-btn.active{color:${T.gold};border-bottom-color:${T.gold}}
  .tab-btn:hover{color:${T.text}}
`;


export { T, CSS };
