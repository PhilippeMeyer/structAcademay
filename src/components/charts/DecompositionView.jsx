import { useTheme } from "../../theme/ThemeContext.js";
import { GT } from "../Tooltip.jsx";

export default function DecompositionView({ product, params }) {
  const theme = useTheme();
  const configs = {
    cpn: {
      bond: params.protection,
      options: [
        { label: "Long Call (upside participation)", color: theme.success, size: 100 - params.protection },
      ],
      narrative: <span>The issuer uses {params.protection}% of your capital to buy a <GT>Zero-Coupon Bond</GT> — this guarantees the <GT>Capital Protection</GT> floor at maturity. The remaining {100 - params.protection}% is the option budget: it purchases a <GT>Call Option</GT> giving you {params.participation}% <GT>Participation Rate</GT> in any upside. Higher protection = smaller option budget = lower participation.</span>,
    },
    rc: {
      bond: 90,
      options: [
        { label: "Short Put (you sell downside to the issuer)", color: theme.danger, size: 45 },
      ],
      narrative: <span>You effectively own a bond ({(params.coupon).toFixed(1)}% <GT>Coupon</GT>) and have sold a <GT>Put Option</GT> on the underlying. The put <GT>Premium</GT> finances the enhanced coupon. Below <GT>Strike</GT> at maturity, you receive shares instead of par — this is <GT>Physical Delivery</GT>.</span>,
    },
    brc: {
      bond: 85,
      options: [
        { label: "Short Down-and-In Put (conditional exposure)", color: theme.danger, size: 55 },
      ],
      narrative: <span>Similar to a <GT>Reverse Convertible</GT>, but downside is only activated if the <GT>Barrier</GT> ({params.barrier}%) is breached — a <GT>Knock-In</GT> event. The conditional nature allows a higher <GT>Coupon</GT> ({params.coupon.toFixed(1)}%) — compensation for taking on this tail risk. This is <GT>Path Dependency</GT> in practice.</span>,
    },
    autocall: {
      bond: 80,
      options: [
        { label: "Short Down-and-In Put", color: theme.danger, size: 40 },
        { label: "Autocall feature (issuer call option)", color: theme.warning, size: 30 },
      ],
      narrative: <span>If the underlying is at or above the <GT>Strike</GT> on <GT>Observation Date</GT>s, the note is called early and pays <GT>Coupon</GT>. You have sold both a <GT>Put Option</GT> and the right for the issuer to redeem early — both risks are compensated in the coupon ({params.coupon.toFixed(1)}%). <GT>Reinvestment Risk</GT> applies if called early.</span>,
    },
  };

  const cfg = configs[product] || configs.cpn;
  const totalOption = cfg.options.reduce((s, o) => s + o.size, 0);
  const total = cfg.bond + totalOption;
  const bondPct = Math.round((cfg.bond / total) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 3, height: 32, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${bondPct}%`, background: theme.accent, opacity: 0.8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", padding: "0 6px" }}>Bond {bondPct}%</span>
        </div>
        {cfg.options.map((o, i) => {
          const w = Math.round((o.size / total) * 100);
          return (
            <div key={i} style={{ width: `${w}%`, background: o.color, opacity: 0.75, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", padding: "0 4px" }}>{w}%</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: theme.accent, opacity: 0.8 }} />
          <span style={{ fontSize: 12, color: theme.textMuted }}>Zero-coupon bond (capital floor)</span>
        </div>
        {cfg.options.map((o, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: o.color, opacity: 0.75 }} />
            <span style={{ fontSize: 12, color: theme.textMuted }}>{o.label}</span>
          </div>
        ))}
      </div>
      <div className="insight-box">
        {cfg.narrative}
      </div>
    </div>
  );
}

// ─── SCENARIO FAN CHART ───────────────────────────────────────────────────────
