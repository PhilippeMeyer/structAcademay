import { T } from "./builderTheme.js";

export default function Spinner() {
  return <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${T.border}`, borderTopColor: T.gold, animation: "spin .7s linear infinite", display: "inline-block" }} />;
}
