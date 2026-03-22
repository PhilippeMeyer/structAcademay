import { T } from "./builderTheme.js";

export default function Pill({ label, color = T.gold }) {
  return <span className="chip" style={{ background: `${color}18`, color }}>{label}</span>;
}
