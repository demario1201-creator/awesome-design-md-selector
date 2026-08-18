// Preview theme utilities - light/dark switching for the iframe preview
// Constraint: no algorithmic color derivation per brand.
// Light brands in dark mode get a neutral dark canvas with brand primary preserved.
// Native-dark brands keep their tokens as-is.

import type { PreviewTheme } from "./types";

/**
 * Compute relative luminance (0~1) of a hex color. Returns null for invalid input.
 */
export function luminance(hex: string): number | null {
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
 * Detect whether a brand's token palette is natively dark.
 * ink = colors.ink ?? colors.text; canvas = colors.canvas ?? colors.background ?? colors.bg
 */
export function isNativeDark(colors: Record<string, string>): boolean {
  const ink = colors.ink ?? colors.text;
  const canvas = colors.canvas ?? colors.background ?? colors.bg;
  const inkLum = ink ? luminance(ink) : null;
  const canvasLum = canvas ? luminance(canvas) : null;
  return (inkLum !== null && inkLum > 0.7) && (canvasLum === null || canvasLum < 0.3);
}

/**
 * Neutral dark overrides for light brands. Matches the app shell palette
 * (globals.css --app-* variables). Does NOT touch primary/on-primary/radius/spacing/typography,
 * preserving the brand's visual DNA.
 */
export const DARK_OVERRIDES: Record<string, string> = {
  "--brand-canvas": "#0a0a0b",
  "--brand-surface": "#131316",
  "--brand-surface-card": "#1a1a1e",
  "--brand-border": "#27272a",
  "--brand-ink": "#e4e4e7",
  "--brand-body": "#a1a1aa",
  "--brand-muted": "#71717a",
};

/**
 * Build the CSS override block for a given theme.
 * Returns "" when no override is needed (light theme on light brand, or any theme on native-dark brand).
 */
export function buildThemeOverrides(
  theme: PreviewTheme,
  colors: Record<string, string>
): string {
  if (isNativeDark(colors)) return "";
  if (theme !== "dark") return "";

  // Compute --brand-primary-text for dark canvas: if primary is dark (low
  // luminance), it won't be visible on the dark override canvas (#0a0a0b).
  // Use the primary if it's light enough; otherwise fall back to the dark
  // override ink (#e4e4e7).
  const primary = colors.primary ?? "#171717";
  const primaryLum = luminance(primary);
  const primaryTextDark = primaryLum !== null && primaryLum > 0.3
    ? primary
    : "#e4e4e7";

  const rules = Object.entries(DARK_OVERRIDES)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  const primaryTextRule = `  --brand-primary-text: ${primaryTextDark};`;
  return `/* Neutral dark theme override for light brand */\nhtml[data-theme="dark"] {\n${rules}\n${primaryTextRule}\n}`;
}
