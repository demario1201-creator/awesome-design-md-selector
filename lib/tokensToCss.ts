// Token → CSS Variable mapping
// Converts parsed design tokens into CSS custom properties for iframe injection
// Based on PRD Section 6.5

import type { DesignTokens } from "./types";

/**
 * Compute relative luminance (0~1) of a hex color. Returns null for invalid input.
 */
function luminance(hex: string): number | null {
  const m = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(m)) return null;
  const full =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * Compute WCAG contrast ratio between two hex colors.
 */
function contrast(a: string, b: string): number | null {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return null;
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// Default tokens used when a style's tokens are missing fields
const DEFAULT_TOKENS: DesignTokens = {
  colors: {
    primary: "#171717",
    "primary-active": "#333333",
    canvas: "#ffffff",
    ink: "#171717",
    body: "#404040",
    muted: "#737373",
    "on-primary": "#ffffff",
    surface: "#f5f5f5",
    "surface-card": "#ffffff",
    border: "#e5e5e5",
    error: "#ef4444",
    success: "#22c55e",
    warning: "#f59e0b",
  },
  typography: {
    "display-xl": { fontFamily: "Inter, system-ui, sans-serif", fontSize: "48px", fontWeight: 700, lineHeight: "1.1" },
    "display-lg": { fontFamily: "Inter, system-ui, sans-serif", fontSize: "36px", fontWeight: 700, lineHeight: "1.15" },
    "display-md": { fontFamily: "Inter, system-ui, sans-serif", fontSize: "28px", fontWeight: 600, lineHeight: "1.2" },
    "title-lg": { fontFamily: "Inter, system-ui, sans-serif", fontSize: "22px", fontWeight: 600, lineHeight: "1.3" },
    "title-md": { fontFamily: "Inter, system-ui, sans-serif", fontSize: "18px", fontWeight: 600, lineHeight: "1.4" },
    "body-md": { fontFamily: "Inter, system-ui, sans-serif", fontSize: "16px", fontWeight: 400, lineHeight: "1.55" },
    "body-sm": { fontFamily: "Inter, system-ui, sans-serif", fontSize: "14px", fontWeight: 400, lineHeight: "1.55" },
    "caption": { fontFamily: "Inter, system-ui, sans-serif", fontSize: "13px", fontWeight: 500, lineHeight: "1.4" },
    "button": { fontFamily: "Inter, system-ui, sans-serif", fontSize: "14px", fontWeight: 500, lineHeight: "1" },
  },
  rounded: { xs: "4px", sm: "6px", md: "8px", lg: "12px", xl: "16px", pill: "9999px" },
  spacing: { xxs: "4px", xs: "8px", sm: "12px", md: "16px", lg: "24px", xl: "32px", xxl: "48px" },
  components: {},
};

/**
 * Merge style tokens with defaults to ensure all CSS variables exist.
 */
function mergeTokens(styleTokens: DesignTokens): DesignTokens {
  return {
    colors: { ...DEFAULT_TOKENS.colors, ...styleTokens.colors },
    typography: { ...DEFAULT_TOKENS.typography, ...styleTokens.typography },
    rounded: { ...DEFAULT_TOKENS.rounded, ...styleTokens.rounded },
    spacing: { ...DEFAULT_TOKENS.spacing, ...styleTokens.spacing },
    components: { ...styleTokens.components },
  };
}

/**
 * Convert design tokens to CSS custom properties string.
 * Produces a :root { ... } block ready for injection into iframe.
 */
export function tokensToCssVars(tokens: DesignTokens): string {
  const merged = mergeTokens(tokens);

  // Preview-layer accessibility fixes: these only affect injected iframe CSS
  // variables and do NOT modify the exported brand tokens.
  const colors = merged.colors as Record<string, string>;
  const rawColors = tokens.colors ?? {};

  // 1. Normalize on-primary: the brand's own value (via any equivalent key)
  // must win over the DEFAULT "on-primary" that mergeTokens injected. If the
  // brand provides none, pick whichever of #171717 / #ffffff contrasts better
  // with the primary (a plain luminance threshold mis-falls for mid-luminance
  // primaries like Spotify green).
  const brandOnPrimary =
    rawColors["on-primary"] ||
    rawColors["on-primary-text"] ||
    rawColors["primary-on"] ||
    rawColors["on-light"];
  if (brandOnPrimary) {
    colors["on-primary"] = brandOnPrimary;
  } else {
    const c1 = contrast(colors.primary, "#171717");
    const c2 = contrast(colors.primary, "#ffffff");
    colors["on-primary"] = c1 !== null && c2 !== null && c1 >= c2 ? "#171717" : "#ffffff";
  }

  // 2. Fix muted text readability: extend to ALL brands (not just native-dark).
  // Brands like Notion (#bbb8b1 muted on #ffffff canvas) also fail WCAG.
  const canvas = colors.canvas;
  if (canvas && colors.muted) {
    const canvasLum = luminance(canvas);
    const ratio = contrast(canvas, colors.muted);
    if (canvasLum !== null && ratio !== null && ratio < 4.5) {
      // Pick a readable muted based on canvas luminance
      colors.muted = canvasLum < 0.35 ? "#a1a1aa" : "#6b7280";
    }
  }

  // 3. Fix body text readability: some brands have body text too close to canvas
  // (e.g. Binance #eaecef on #ffffff, Linear #404040 on #010102)
  if (canvas && colors.body) {
    const canvasLum = luminance(canvas);
    const ratio = contrast(canvas, colors.body);
    if (canvasLum !== null && ratio !== null && ratio < 4.5) {
      colors.body = canvasLum < 0.35 ? "#d4d4d8" : "#52525b";
    }
  }

  // 4. Compute --brand-primary-text: a readable variant of primary for text/icons
  // rendered on canvas/surface backgrounds. Brands with light primaries (Binance
  // yellow, Spotify green, Wise green, Renault yellow) produce invisible text
  // when primary is used directly as color on white canvas.
  let primaryText = colors.primary;
  if (canvas && colors.primary) {
    const canvasLum = luminance(canvas);
    const ratioPC = contrast(canvas, colors.primary);
    if (canvasLum !== null && ratioPC !== null && ratioPC < 3.0) {
      // Primary contrasts poorly with canvas — try ink first
      const inkColor = colors.ink ?? colors.text ?? "#171717";
      const ratioIC = contrast(canvas, inkColor);
      if (ratioIC !== null && ratioIC >= 3.0) {
        primaryText = inkColor;
      } else {
        // Ink also fails — use black/white based on canvas luminance
        primaryText = canvasLum < 0.35 ? "#e4e4e7" : "#27272a";
      }
    }
  }

  const vars: string[] = [];

  // Colors -> --brand-* / --color-*
  for (const [key, value] of Object.entries(merged.colors)) {
    const cssKey = `--color-${key}`;
    vars.push(`  ${cssKey}: ${value};`);
    // Common aliases
    if (key === "primary") {
      vars.push(`  --brand-primary: ${value};`);
      vars.push(`  --brand-primary-text: ${primaryText};`);
    }
    if (key === "canvas") vars.push(`  --brand-canvas: ${value};`);
    if (key === "ink") vars.push(`  --brand-ink: ${value};`);
    if (key === "body") vars.push(`  --brand-body: ${value};`);
    if (key === "muted") vars.push(`  --brand-muted: ${value};`);
    if (key === "surface" || key === "surface-card") vars.push(`  --brand-surface: ${value};`);
    if (key === "border" || key === "hairline") vars.push(`  --brand-border: ${value};`);
    if (key === "on-primary") vars.push(`  --brand-on-primary: ${value};`);
    if (key === "error") vars.push(`  --brand-error: ${value};`);
    if (key === "success") vars.push(`  --brand-success: ${value};`);
  }

  // Ensure critical aliases exist even if source uses different keys
  ensureAlias(vars, "--brand-primary", merged.colors, ["primary"]);
  ensureAlias(vars, "--brand-canvas", merged.colors, ["canvas", "background", "bg"]);
  ensureAlias(vars, "--brand-ink", merged.colors, ["ink", "text", "heading"]);
  ensureAlias(vars, "--brand-body", merged.colors, ["body", "text-body"]);
  ensureAlias(vars, "--brand-muted", merged.colors, ["muted", "text-muted", "secondary"]);
  ensureAlias(vars, "--brand-surface", merged.colors, ["surface", "surface-card", "card", "surface-soft"]);
  ensureAlias(vars, "--brand-border", merged.colors, ["border", "hairline", "hairline-soft"]);
  ensureAlias(vars, "--brand-on-primary", merged.colors, ["on-primary", "on-primary-text", "primary-on", "on-light"]);
  ensureAlias(vars, "--brand-error", merged.colors, ["error", "danger"]);
  ensureAlias(vars, "--brand-success", merged.colors, ["success", "positive"]);
  ensureAlias(vars, "--brand-on-surface", merged.colors, ["on-surface", "on-dark", "on-dark-soft"]);

  // Typography -> --font-*
  for (const [key, value] of Object.entries(merged.typography)) {
    if (typeof value === "object" && value !== null) {
      const tv = value as Record<string, string | number>;
      if (tv.fontFamily) vars.push(`  --font-${key}: ${tv.fontFamily};`);
      if (tv.fontSize) vars.push(`  --font-${key}-size: ${tv.fontSize};`);
      if (tv.fontWeight) vars.push(`  --font-${key}-weight: ${tv.fontWeight};`);
      if (tv.lineHeight) vars.push(`  --font-${key}-line-height: ${tv.lineHeight};`);
      if (tv.letterSpacing) vars.push(`  --font-${key}-letter-spacing: ${tv.letterSpacing};`);
    }
  }

  // Typography aliases for common usage
  const displayFont = getFirstTypographyValue(merged, ["display-xl", "display-lg", "display-md", "title-lg"], "fontFamily");
  const bodyFont = getFirstTypographyValue(merged, ["body-md", "body-sm", "title-md", "title-sm"], "fontFamily");
  if (displayFont) vars.push(`  --font-heading: ${displayFont};`);
  if (bodyFont) vars.push(`  --font-body: ${bodyFont};`);

  const h1Size = getFirstTypographyValue(merged, ["display-xl", "display-lg", "display-md"], "fontSize");
  const h2Size = getFirstTypographyValue(merged, ["display-lg", "display-md", "display-sm", "title-lg"], "fontSize");
  const h3Size = getFirstTypographyValue(merged, ["display-md", "display-sm", "title-lg", "title-md"], "fontSize");
  if (h1Size) vars.push(`  --font-h1-size: ${h1Size};`);
  if (h2Size) vars.push(`  --font-h2-size: ${h2Size};`);
  if (h3Size) vars.push(`  --font-h3-size: ${h3Size};`);

  // Rounded -> --radius-*
  for (const [key, value] of Object.entries(merged.rounded)) {
    vars.push(`  --radius-${key}: ${value};`);
  }
  // Ensure common radius aliases
  ensureAlias(vars, "--radius-sm", merged.rounded, ["sm", "xs"]);
  ensureAlias(vars, "--radius-md", merged.rounded, ["md", "sm"]);
  ensureAlias(vars, "--radius-lg", merged.rounded, ["lg", "md"]);

  // Spacing -> --space-*
  for (const [key, value] of Object.entries(merged.spacing)) {
    vars.push(`  --space-${key}: ${value};`);
  }
  // Ensure common spacing aliases
  ensureAlias(vars, "--space-sm", merged.spacing, ["sm", "xs"]);
  ensureAlias(vars, "--space-md", merged.spacing, ["md", "sm"]);
  ensureAlias(vars, "--space-lg", merged.spacing, ["lg", "md"]);
  ensureAlias(vars, "--space-xl", merged.spacing, ["xl", "lg"]);

  // Component tokens (resolve {colors.xxx} references)
  for (const [compKey, compValue] of Object.entries(merged.components)) {
    if (typeof compValue === "object" && compValue !== null) {
      for (const [prop, val] of Object.entries(compValue)) {
        if (typeof val === "string") {
          const resolved = resolveTokenRef(val, merged);
          vars.push(`  --comp-${compKey}-${prop}: ${resolved};`);
        }
      }
    }
  }

  // Button-specific aliases (commonly used in demo pages)
  const btnPrimary = merged.components["button-primary"] || {};
  const btnSecondary = merged.components["button-secondary"] || {};
  if (btnPrimary.backgroundColor) vars.push(`  --btn-primary-bg: ${resolveTokenRef(btnPrimary.backgroundColor, merged)};`);
  if (btnPrimary.textColor) vars.push(`  --btn-primary-text: ${resolveTokenRef(btnPrimary.textColor, merged)};`);
  if (btnSecondary.backgroundColor) vars.push(`  --btn-secondary-bg: ${resolveTokenRef(btnSecondary.backgroundColor, merged)};`);
  if (btnSecondary.textColor) vars.push(`  --btn-secondary-text: ${resolveTokenRef(btnSecondary.textColor, merged)};`);

  // Ensure button aliases with fallback
  if (!vars.some((v) => v.includes("--btn-primary-bg"))) vars.push(`  --btn-primary-bg: var(--brand-primary, #171717);`);
  if (!vars.some((v) => v.includes("--btn-primary-text"))) vars.push(`  --btn-primary-text: var(--brand-on-primary, #ffffff);`);
  if (!vars.some((v) => v.includes("--btn-secondary-bg"))) vars.push(`  --btn-secondary-bg: var(--brand-canvas, #ffffff);`);
  if (!vars.some((v) => v.includes("--btn-secondary-text"))) vars.push(`  --btn-secondary-text: var(--brand-ink, #171717);`);

  return `:root {\n${vars.join("\n")}\n}`;
}

/**
 * Resolve token references like "{colors.primary}" to actual values.
 */
function resolveTokenRef(ref: string, tokens: DesignTokens): string {
  // Handle compound refs like "12px {spacing.sm}". Keys may contain hyphens
  // (e.g. {colors.primary-on}, {colors.surface-card}), so match [\w-]+.
  return ref.replace(/\{(\w+)\.([\w-]+)\}/g, (match, category, key) => {
    const categoryMap = tokens[category as keyof DesignTokens];
    if (categoryMap && typeof categoryMap === "object" && key in categoryMap) {
      const val = (categoryMap as Record<string, unknown>)[key];
      return String(val);
    }
    return match;
  });
}

/**
 * Ensure a CSS variable alias exists, using the first available source key.
 */
function ensureAlias(
  vars: string[],
  alias: string,
  source: Record<string, string>,
  keys: string[]
): void {
  if (vars.some((v) => v.includes(`${alias}:`))) return;
  for (const key of keys) {
    if (source[key]) {
      vars.push(`  ${alias}: ${source[key]};`);
      return;
    }
  }
}

/**
 * Get the first available typography property value from a list of keys.
 */
function getFirstTypographyValue(
  tokens: DesignTokens,
  keys: string[],
  prop: string
): string | null {
  for (const key of keys) {
    const tv = tokens.typography[key];
    if (tv && typeof tv === "object" && tv[prop as keyof typeof tv]) {
      return String(tv[prop as keyof typeof tv]);
    }
  }
  return null;
}
