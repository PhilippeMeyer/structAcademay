// ─── StructAcademy Design System v1 ──────────────────────────────────────────
// Primary: Navy #0B1F3B  |  Secondary: Teal #14B8A6  |  Accent: Gold #D4AF37

export const lightTheme = {
  // Core palette
  bg:          "#F5F7FA",
  surface:     "#FFFFFF",
  surface2:    "#F0F4F8",
  border:      "#E2E8F0",

  // Navy primary
  navy:        "#0B1F3B",
  navyLight:   "#1A3A6B",
  navyDim:     "#0D2847",

  // Teal secondary
  teal:        "#14B8A6",
  tealLight:   "#2DD4C4",
  tealDim:     "#0E9688",

  // Gold accent
  gold:        "#D4AF37",
  goldLight:   "#E8CB5A",
  goldDim:     "#B8941A",

  // Text
  text:        "#0F172A",
  textMuted:   "#64748B",
  textDim:     "#94A3B8",

  // Semantic
  accent:      "#14B8A6",   // teal as accent
  danger:      "#EF4444",
  success:     "#22C55E",
  warning:     "#F59E0B",

  // Compat aliases (used across existing components)
  goldLight_compat: "#E8CB5A",

  isDark: false,
};

// Dark variant — navy-deep background
export const darkTheme = {
  bg:          "#060E1C",
  surface:     "#0B1F3B",
  surface2:    "#0F2847",
  border:      "#1E3A5F",

  navy:        "#0B1F3B",
  navyLight:   "#1A3A6B",
  navyDim:     "#07162B",

  teal:        "#14B8A6",
  tealLight:   "#2DD4C4",
  tealDim:     "#0E9688",

  gold:        "#D4AF37",
  goldLight:   "#E8CB5A",
  goldDim:     "#B8941A",

  text:        "#F1F5F9",
  textMuted:   "#94A3B8",
  textDim:     "#475569",

  accent:      "#14B8A6",
  danger:      "#EF4444",
  success:     "#22C55E",
  warning:     "#F59E0B",

  isDark: true,
};
