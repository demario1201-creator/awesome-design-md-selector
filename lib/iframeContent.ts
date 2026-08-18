// iframe content generator - builds complete HTML for preview window srcdoc
// Based on PRD Section 9 - Preview DEMO Page Design
// Phase 2: i18n (lang param) + theme (light/dark) + realistic product pages

import type { DesignTokens, AnimationMeta, TabKey, Lang, PreviewTheme } from "./types";
import { tokensToCssVars } from "./tokensToCss";
import { buildThemeOverrides } from "./theme";
import { t } from "./i18n";

// SVG icons (inline, no emoji - P0 rule compliance)
const ICONS = {
  spark: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>`,
  bolt: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></svg>`,
  globe: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></svg>`,
  chart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18M7 14l4-4 4 4 5-5"/></svg>`,
  arrow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
  mail: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>`,
  lock: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`,
  user: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  eye: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M14.12 14.12a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>`,
  chevronLeft: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`,
  chevronRight: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>`,
  star: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  quote: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M10 7L8 11h3v6H5v-6l2-4h3zm9 0l-2 4h3v6h-6v-6l2-4h3z"/></svg>`,
  google: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
  github: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.36 9.36 0 015 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.25 10.25 0 0022 12.25C22 6.58 17.52 2 12 2z"/></svg>`,
};

/** Render a row of 5 star icons. */
function renderStars(ariaLabel: string): string {
  return `<span class="stars" role="img" aria-label="${ariaLabel}">${ICONS.star.repeat(5)}</span>`;
}

/**
 * Generate the complete iframe HTML document for a preview page.
 */
export function generateIframeContent(
  tokens: DesignTokens,
  tab: TabKey,
  animation: AnimationMeta | null,
  styleName: string,
  lang: Lang = "zh",
  theme: PreviewTheme = "light"
): string {
  const cssVars = tokensToCssVars(tokens);
  const themeOverrides = buildThemeOverrides(theme, tokens.colors);
  const animationCss = animation?.css || "";
  const pageHtml = generatePageHtml(tab, lang);
  const animationJs = generateAnimationJs(animation, tab);
  const authJs = generateAuthScripts(tab, lang);

  return `<!DOCTYPE html>
<html lang="${lang}" data-theme="${theme}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${styleName} - ${t("preview.iframeTitle", lang)}</title>
<style>
${cssVars}

${themeOverrides}

/* Base reset */
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: var(--font-body, 'Inter', system-ui, sans-serif);
  font-size: var(--font-body-md-size, 16px);
  line-height: var(--font-body-md-line-height, 1.55);
  color: var(--brand-ink, #171717);
  background: var(--brand-canvas, #ffffff);
  -webkit-font-smoothing: antialiased;
}

/* Typography */
h1, h2, h3, h4 { font-family: var(--font-heading, var(--font-body, 'Inter', sans-serif)); }
h1 { font-size: var(--font-h1-size, 48px); font-weight: var(--font-display-xl-weight, 700); line-height: var(--font-display-xl-line-height, 1.1); letter-spacing: var(--font-display-xl-letter-spacing, -0.02em); }
h2 { font-size: var(--font-h2-size, 36px); font-weight: var(--font-display-lg-weight, 600); line-height: 1.15; }
h3 { font-size: var(--font-h3-size, 28px); font-weight: var(--font-display-md-weight, 600); line-height: 1.2; }

/* Layout helpers */
.container { max-width: 1200px; margin: 0 auto; padding: 0 var(--space-lg, 24px); }
.section { padding: var(--space-xxl, 48px) 0; }
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-lg, 24px); }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-lg, 24px); }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-lg, 24px); }

/* Navigation */
.nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-md, 16px) var(--space-lg, 24px);
  border-bottom: 1px solid var(--brand-border, #e5e5e5);
  background: var(--brand-canvas, #fff);
  position: sticky; top: 0; z-index: 10;
}
.nav-logo { font-family: var(--font-heading, sans-serif); font-size: 20px; font-weight: 700; color: var(--brand-ink, #171717); }
.nav-links { display: flex; gap: var(--space-lg, 24px); align-items: center; }
.nav-link { font-size: 14px; font-weight: 500; color: var(--brand-body, #404040); text-decoration: none; transition: color 0.2s; cursor: pointer; }
.nav-link:hover { color: var(--brand-primary-text, var(--brand-ink, #171717)); }
.nav-cta { display: flex; gap: var(--space-sm, 12px); align-items: center; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-button, var(--font-body, sans-serif));
  font-size: var(--font-button-size, 14px); font-weight: var(--font-button-weight, 500);
  padding: 10px 20px; border: none; cursor: pointer;
  border-radius: var(--radius-md, 8px);
  transition: all 0.2s ease; text-decoration: none;
}
.btn-primary { background: var(--btn-primary-bg, var(--brand-primary, #171717)); color: var(--btn-primary-text, var(--brand-on-primary, #fff)); }
.btn-primary:hover { opacity: 0.88; }
.btn-secondary { background: var(--btn-secondary-bg, var(--brand-surface, #f5f5f5)); color: var(--btn-secondary-text, var(--brand-ink, #171717)); border: 1px solid var(--brand-border, #e5e5e5); }
.btn-secondary:hover { opacity: 0.88; }
.btn-sm { padding: 6px 14px; font-size: 13px; }
.btn-block { width: 100%; justify-content: center; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Hero */
.hero { padding: var(--space-xxl, 48px) 0 var(--space-xl, 32px); text-align: center; }
.hero h1 { margin-bottom: var(--space-md, 16px); }
.hero-subtitle { font-size: 18px; color: var(--brand-body, #404040); max-width: 600px; margin: 0 auto var(--space-lg, 24px); line-height: 1.6; }
.hero-cta { display: flex; gap: var(--space-sm, 12px); justify-content: center; }
.eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 14px; margin-bottom: var(--space-md, 16px);
  border-radius: var(--radius-pill, 9999px);
  background: color-mix(in srgb, var(--brand-primary-text, var(--brand-primary, #171717)) 12%, var(--brand-canvas, #fff));
  color: var(--brand-primary-text, var(--brand-ink, #171717));
  font-size: 13px; font-weight: 600; letter-spacing: 0.01em;
}
/* Hero visual - abstract product window placeholder (token-driven) */
.hero-visual {
  margin: var(--space-xl, 32px) auto 0; max-width: 820px; height: 320px;
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--brand-border, #e5e5e5);
  background-image:
    linear-gradient(color-mix(in srgb, var(--brand-ink, #171717) 6%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--brand-ink, #171717) 6%, transparent) 1px, transparent 1px),
    linear-gradient(135deg, color-mix(in srgb, var(--brand-primary, #171717) 42%, var(--brand-canvas, #fff)), var(--brand-canvas, #fff));
  background-size: 28px 28px, 28px 28px, 100% 100%;
  display: flex; align-items: center; justify-content: center;
}
.hv-window {
  width: 68%; background: var(--brand-canvas, #fff);
  border: 1px solid var(--brand-border, #e5e5e5);
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 24px 60px color-mix(in srgb, var(--brand-ink, #171717) 18%, transparent);
  overflow: hidden; text-align: left;
}
.hv-bar { display: flex; gap: 5px; padding: 9px 12px; border-bottom: 1px solid var(--brand-border, #e5e5e5); background: var(--brand-surface, #f5f5f5); }
.hv-bar span { width: 8px; height: 8px; border-radius: 50%; background: var(--brand-border, #e5e5e5); }
.hv-bar span:first-child { background: color-mix(in srgb, var(--brand-primary-text, var(--brand-primary, #171717)) 55%, var(--brand-border, #e5e5e5)); }
.hv-body { padding: 16px 18px 20px; }
.hv-line { height: 8px; border-radius: 4px; background: var(--brand-border, #e5e5e5); margin-bottom: 10px; }
.hv-line-lg { width: 72%; background: color-mix(in srgb, var(--brand-primary-text, var(--brand-primary, #171717)) 30%, var(--brand-border, #e5e5e5)); }
.hv-line-sm { width: 48%; }
.hv-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
.hv-cell { height: 44px; border-radius: 6px; background: var(--brand-surface, #f5f5f5); border: 1px solid var(--brand-border, #e5e5e5); }

/* Logo wall */
.logo-wall-title { text-align: center; font-size: 13px; color: var(--brand-muted, #737373); margin-bottom: var(--space-lg, 24px); letter-spacing: 0.03em; }
.logo-wall { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-lg, 24px) var(--space-xl, 32px); }
.logo-item { display: inline-flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 600; color: var(--brand-muted, #737373); font-family: var(--font-heading, sans-serif); }
.logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--brand-primary-text, var(--brand-primary, #171717)); opacity: 0.55; }
.logo-item:nth-child(2n) .logo-dot { opacity: 0.8; }
.logo-item:nth-child(3n) .logo-dot { opacity: 0.35; }

/* Cards */
.card {
  background: var(--brand-surface, var(--brand-surface-card, #fff));
  border: 1px solid var(--brand-border, #e5e5e5);
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-lg, 24px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px;
  background: var(--brand-surface, #f5f5f5);
  border-radius: var(--radius-md, 8px);
  color: var(--brand-primary-text, var(--brand-ink, #171717));
  margin-bottom: var(--space-md, 16px);
}
.card h3 { margin-bottom: var(--space-xs, 8px); font-size: 18px; }
.card p { color: var(--brand-muted, #737373); font-size: 14px; line-height: 1.55; }

/* Stats */
.stat { text-align: center; }
.stat-number { font-size: 36px; font-weight: 700; color: var(--brand-ink, #171717); font-family: var(--font-heading, sans-serif); }
.stat-label { font-size: 14px; color: var(--brand-muted, #737373); margin-top: 4px; }
.stat-bar { margin-top: var(--space-xs, 8px); }

/* Testimonials */
.testimonial { display: flex; flex-direction: column; }
.test-quote { color: var(--brand-primary-text, var(--brand-ink, #171717)); margin-bottom: var(--space-sm, 12px); }
.test-text { flex: 1; font-size: 15px; line-height: 1.6; color: var(--brand-ink, #171717); margin-bottom: var(--space-md, 16px); }
.test-author { display: flex; align-items: center; gap: 10px; }
.test-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--brand-primary, #171717); color: var(--brand-on-primary, #fff);
}

/* Marquee */
.marquee-container { overflow: hidden; padding: var(--space-lg, 24px) 0; }
/* NOTE: .marquee-track animation is injected ONLY when the
   capability-marquee animation is selected (see data/animations.ts).
   Keeping it here would break the "no animation" default state. */
.marquee-track { display: flex; gap: var(--space-md, 16px); width: max-content; }
.marquee-tag {
  padding: 6px 16px; border-radius: var(--radius-pill, 9999px);
  background: var(--brand-surface, #f5f5f5); color: var(--brand-body, #404040);
  font-size: 14px; font-weight: 500; white-space: nowrap;
  border: 1px solid var(--brand-border, #e5e5e5);
}

/* Footer */
.footer { padding: var(--space-xl, 32px) 0; border-top: 1px solid var(--brand-border, #e5e5e5); background: var(--brand-surface, #f9f9f9); }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: var(--space-lg, 24px); }
.footer-col-title { font-weight: 600; font-size: 14px; margin-bottom: 8px; color: var(--brand-ink, #171717); }
.footer-link { display: block; color: var(--brand-muted, #737373); font-size: 14px; text-decoration: none; padding: 4px 0; cursor: pointer; }
.footer-link:hover { color: var(--brand-primary-text, var(--brand-ink, #171717)); }
.footer-copy { font-size: 13px; color: var(--brand-muted, #737373); margin-top: var(--space-lg, 24px); }

/* Carousel */
.carousel-wrapper { position: relative; overflow: hidden; border-radius: var(--radius-lg, 12px); }
.carousel-track { position: relative; height: 500px; }
.carousel-slide {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.6s ease-in-out;
  padding: var(--space-xl, 32px); text-align: center;
}
.carousel-slide.is-active { opacity: 1; }
.carousel-slide h2 { margin-bottom: var(--space-xs, 8px); }
.carousel-slide p { color: var(--brand-body, #404040); max-width: 480px; margin-bottom: var(--space-md, 16px); }
.carousel-dots { display: flex; gap: 8px; justify-content: center; margin-top: var(--space-md, 16px); }
.carousel-dot { width: 8px; height: 8px; border-radius: 9999px; background: var(--brand-border, #e5e5e5); cursor: pointer; border: none; transition: background 0.3s; padding: 0; }
.carousel-dot.is-active { background: var(--brand-primary-text, var(--brand-primary, #171717)); }
.carousel-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 40px; height: 40px; border-radius: 9999px;
  border: 1px solid var(--brand-border, #e5e5e5); background: var(--brand-canvas, #fff);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 5; color: var(--brand-ink, #171717);
  transition: all 0.2s;
}
.carousel-arrow:hover { background: var(--brand-surface, #f5f5f5); }
.carousel-arrow.prev { left: 12px; }
.carousel-arrow.next { right: 12px; }
.product-badge {
  display: inline-block; padding: 4px 12px; border-radius: var(--radius-pill, 9999px);
  background: var(--brand-primary, #171717); color: var(--brand-on-primary, #fff);
  font-size: 12px; font-weight: 600; margin-bottom: var(--space-sm, 12px);
}

/* Gradient visual placeholder (PRD 9.3) */
.gradient-visual {
  display: flex; align-items: center; justify-content: center;
  border-radius: var(--radius-md, 8px);
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--brand-primary, #171717) 38%, var(--brand-canvas, #fff)),
    color-mix(in srgb, var(--brand-primary, #171717) 8%, var(--brand-canvas, #fff)));
  border: 1px solid var(--brand-border, #e5e5e5);
  color: color-mix(in srgb, var(--brand-primary-text, var(--brand-ink, #171717)) 55%, var(--brand-muted, #737373));
}
.gv-slide { width: 240px; height: 150px; margin-bottom: var(--space-md, 16px); }
.gv-card { width: 100%; height: 120px; margin-bottom: var(--space-md, 16px); }

/* Stars + pricing */
.stars { display: inline-flex; gap: 2px; color: var(--brand-primary-text, var(--brand-primary, #171717)); margin-bottom: var(--space-xs, 8px); }
.price-row { display: flex; align-items: baseline; justify-content: center; gap: 8px; }
.price-original { font-size: 14px; color: var(--brand-muted, #737373); text-decoration: line-through; }
.price-current { font-size: 24px; font-weight: 700; color: var(--brand-primary-text, var(--brand-primary, #171717)); }
.card .price-row { justify-content: flex-start; }

/* Auth forms (split layout) */
.auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--space-xl, 32px); background: var(--brand-surface, #f5f5f5); }
.auth-split {
  display: flex; width: 100%; max-width: 920px;
  border-radius: var(--radius-xl, 16px); overflow: hidden;
  box-shadow: 0 24px 70px color-mix(in srgb, var(--brand-ink, #171717) 14%, transparent);
}
.auth-visual {
  flex: 1.1; display: flex; flex-direction: column; justify-content: center;
  padding: var(--space-xl, 40px);
  color: var(--brand-on-primary, #fff);
  background: linear-gradient(140deg,
    var(--brand-primary, #171717),
    color-mix(in srgb, var(--brand-primary, #171717) 62%, var(--brand-canvas, #fff)));
}
.av-logo { font-family: var(--font-heading, sans-serif); font-size: 22px; font-weight: 700; margin-bottom: var(--space-lg, 24px); }
.av-title { font-size: 24px; font-weight: 600; line-height: 1.35; margin-bottom: var(--space-lg, 24px); }
.av-quote { font-size: 14px; line-height: 1.6; opacity: 0.92; margin-bottom: var(--space-sm, 12px); }
.av-name { font-size: 13px; opacity: 0.78; }
.auth-card { flex: 1; background: var(--brand-canvas, #fff); padding: var(--space-xl, 40px); }
.auth-logo { font-family: var(--font-heading, sans-serif); font-size: 24px; font-weight: 700; text-align: center; margin-bottom: var(--space-xs, 8px); }
.auth-title { text-align: center; font-size: 22px; font-weight: 600; margin-bottom: var(--space-xs, 8px); }
.auth-subtitle { text-align: center; font-size: 14px; color: var(--brand-muted, #737373); margin-bottom: var(--space-lg, 24px); }
.form-group { margin-bottom: var(--space-md, 16px); }
.form-label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 6px; color: var(--brand-body, #404040); }
.form-input {
  width: 100%; padding: 10px 12px;
  border: 1px solid var(--brand-border, #e5e5e5);
  border-radius: var(--radius-md, 8px);
  font-size: 14px; font-family: inherit;
  background: var(--brand-canvas, #fff); color: var(--brand-ink, #171717);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-input:focus { outline: none; border-color: var(--brand-primary-text, var(--brand-primary, #171717)); box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand-primary-text, var(--brand-primary, #171717)) 15%, transparent); }
.form-input:hover { border-color: var(--brand-muted, #737373); }
.form-input.error { border-color: var(--brand-error, #ef4444); }
.form-input:disabled { opacity: 0.55; cursor: not-allowed; }
.form-error { font-size: 13px; color: var(--brand-error, #ef4444); margin-top: 4px; }
.input-wrap { position: relative; }
.input-wrap .input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--brand-muted, #737373); }
.input-wrap .input-icon ~ .form-input { padding-left: 40px; }
.pwd-toggle {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: var(--brand-muted, #737373); padding: 3px; display: flex;
}
.pwd-toggle:hover { color: var(--brand-ink, #171717); }
.form-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-lg, 24px); }
.checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--brand-body, #404040); cursor: pointer; }
.checkbox { width: 16px; height: 16px; accent-color: var(--brand-primary-text, var(--brand-primary, #171717)); }
.form-link { font-size: 14px; color: var(--brand-primary-text, var(--brand-ink, #171717)); text-decoration: none; cursor: pointer; }
.form-link:hover { text-decoration: underline; }
.auth-footer { text-align: center; margin-top: var(--space-lg, 24px); font-size: 14px; color: var(--brand-muted, #737373); }

/* OAuth */
.oauth-divider { display: flex; align-items: center; gap: 12px; margin: var(--space-lg, 24px) 0; font-size: 12px; color: var(--brand-muted, #737373); }
.oauth-divider::before, .oauth-divider::after { content: ""; flex: 1; height: 1px; background: var(--brand-border, #e5e5e5); }
.oauth-row { display: flex; gap: var(--space-sm, 12px); }
.oauth-btn {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 9px 12px; font-size: 13px; font-weight: 500; cursor: pointer;
  border-radius: var(--radius-md, 8px);
  background: var(--brand-canvas, #fff); color: var(--brand-ink, #171717);
  border: 1px solid var(--brand-border, #e5e5e5);
  transition: background 0.2s;
  font-family: inherit;
}
.oauth-btn:hover { background: var(--brand-surface, #f5f5f5); }

/* Password strength */
.strength-wrap { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.strength-bar { display: flex; gap: 3px; flex: 1; max-width: 120px; }
.strength-segment { flex: 1; height: 4px; border-radius: 2px; background: var(--brand-border, #e5e5e5); transition: background 0.3s; }
.strength-label { font-size: 12px; color: var(--brand-muted, #737373); }
.strength-weak .strength-segment:nth-child(-n+1) { background: var(--brand-error, #ef4444); }
.strength-medium .strength-segment:nth-child(-n+3) { background: #f59e0b; }
.strength-strong .strength-segment:nth-child(-n+4) { background: var(--brand-success, #22c55e); }

/* Animation styles */
.card-back { display: none; }

${animationCss}
</style>
</head>
<body>
${pageHtml}
<script>
${animationJs}
${authJs}
</script>
</body>
</html>`;
}

/**
 * Generate the page HTML for the active tab.
 */
function generatePageHtml(tab: TabKey, lang: Lang): string {
  switch (tab) {
    case "home":
      return generateHomePage(lang);
    case "carousel":
      return generateCarouselPage(lang);
    case "login":
      return generateLoginPage(lang);
    case "register":
      return generateRegisterPage(lang);
    default:
      return generateHomePage(lang);
  }
}

function generateHomePage(lang: Lang): string {
  return `
<nav class="nav">
  <div class="nav-logo">${t("demo.brand", lang)}</div>
  <div class="nav-links">
    <a class="nav-link">${t("demo.nav.product", lang)}</a>
    <a class="nav-link">${t("demo.nav.features", lang)}</a>
    <a class="nav-link">${t("demo.nav.pricing", lang)}</a>
    <a class="nav-link">${t("demo.nav.docs", lang)}</a>
  </div>
  <div class="nav-cta">
    <button class="btn btn-secondary btn-sm">${t("demo.nav.signIn", lang)}</button>
    <button class="btn btn-primary btn-sm">${t("demo.nav.startFree", lang)}</button>
  </div>
</nav>

<section class="hero container">
  <span class="eyebrow" data-animate="hero-stagger">${t("demo.home.eyebrow", lang)}</span>
  <h1 data-animate="hero-stagger">${t("demo.home.heroTitle", lang)}</h1>
  <p class="hero-subtitle" data-animate="hero-stagger" style="animation-delay:80ms">${t("demo.home.heroSubtitle", lang)}</p>
  <div class="hero-cta" data-animate="hero-stagger" style="animation-delay:160ms">
    <button class="btn btn-primary">${t("demo.home.ctaStart", lang)} ${ICONS.arrow}</button>
    <button class="btn btn-secondary">${t("demo.home.ctaDemo", lang)}</button>
  </div>
  <div class="hero-visual" data-animate="hero-stagger" style="animation-delay:240ms">
    <div class="hv-window">
      <div class="hv-bar"><span></span><span></span><span></span></div>
      <div class="hv-body">
        <div class="hv-line hv-line-lg"></div>
        <div class="hv-line"></div>
        <div class="hv-line hv-line-sm"></div>
        <div class="hv-grid">
          <div class="hv-cell"></div><div class="hv-cell"></div><div class="hv-cell"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section container">
  <p class="logo-wall-title" data-animate="scroll-reveal">${t("demo.home.logoWall", lang)}</p>
  <div class="logo-wall" data-animate="scroll-reveal">
    <span class="logo-item"><span class="logo-dot"></span>${t("demo.home.logo1", lang)}</span>
    <span class="logo-item"><span class="logo-dot"></span>${t("demo.home.logo2", lang)}</span>
    <span class="logo-item"><span class="logo-dot"></span>${t("demo.home.logo3", lang)}</span>
    <span class="logo-item"><span class="logo-dot"></span>${t("demo.home.logo4", lang)}</span>
    <span class="logo-item"><span class="logo-dot"></span>${t("demo.home.logo5", lang)}</span>
    <span class="logo-item"><span class="logo-dot"></span>${t("demo.home.logo6", lang)}</span>
  </div>
</section>

<section class="section container">
  <div class="grid-3">
    <div class="card" data-animate="scroll-reveal" data-animate-hover="hover-scale">
      <div class="card-icon">${ICONS.bolt}</div>
      <h3>${t("demo.home.f1Title", lang)}</h3>
      <p>${t("demo.home.f1Desc", lang)}</p>
    </div>
    <div class="card" data-animate="scroll-reveal" data-animate-hover="hover-scale">
      <div class="card-icon">${ICONS.shield}</div>
      <h3>${t("demo.home.f2Title", lang)}</h3>
      <p>${t("demo.home.f2Desc", lang)}</p>
    </div>
    <div class="card" data-animate="scroll-reveal" data-animate-hover="hover-scale">
      <div class="card-icon">${ICONS.globe}</div>
      <h3>${t("demo.home.f3Title", lang)}</h3>
      <p>${t("demo.home.f3Desc", lang)}</p>
    </div>
  </div>
</section>

<section class="section container">
  <div class="grid-4">
    <div class="stat" data-animate="count-up">
      <div class="stat-number" data-target="50000">50000</div>
      <div class="stat-label">${t("demo.home.stat1", lang)}</div>
      <div class="stat-bar"></div>
    </div>
    <div class="stat" data-animate="count-up">
      <div class="stat-number" data-target="99">99</div>
      <div class="stat-label">${t("demo.home.stat2", lang)}</div>
      <div class="stat-bar"></div>
    </div>
    <div class="stat" data-animate="count-up">
      <div class="stat-number" data-target="300">300</div>
      <div class="stat-label">${t("demo.home.stat3", lang)}</div>
      <div class="stat-bar"></div>
    </div>
    <div class="stat" data-animate="count-up">
      <div class="stat-number" data-target="12">12</div>
      <div class="stat-label">${t("demo.home.stat4", lang)}</div>
      <div class="stat-bar"></div>
    </div>
  </div>
</section>

<section class="section container" data-animate="marquee">
  <div class="marquee-container">
    <div class="marquee-track">
      <span class="marquee-tag">TypeScript</span>
      <span class="marquee-tag">React</span>
      <span class="marquee-tag">Next.js</span>
      <span class="marquee-tag">Vue</span>
      <span class="marquee-tag">Svelte</span>
      <span class="marquee-tag">Node.js</span>
      <span class="marquee-tag">Python</span>
      <span class="marquee-tag">Go</span>
      <span class="marquee-tag">Rust</span>
      <span class="marquee-tag">Docker</span>
      <span class="marquee-tag">Kubernetes</span>
      <span class="marquee-tag">GraphQL</span>
      <!-- Duplicate for seamless loop -->
      <span class="marquee-tag">TypeScript</span>
      <span class="marquee-tag">React</span>
      <span class="marquee-tag">Next.js</span>
      <span class="marquee-tag">Vue</span>
      <span class="marquee-tag">Svelte</span>
      <span class="marquee-tag">Node.js</span>
      <span class="marquee-tag">Python</span>
      <span class="marquee-tag">Go</span>
      <span class="marquee-tag">Rust</span>
      <span class="marquee-tag">Docker</span>
      <span class="marquee-tag">Kubernetes</span>
      <span class="marquee-tag">GraphQL</span>
    </div>
  </div>
</section>

<section class="section container">
  <div class="grid-2">
    <div class="card testimonial" data-animate="scroll-reveal">
      <div class="test-quote">${ICONS.quote}</div>
      <p class="test-text">${t("demo.home.test1Quote", lang)}</p>
      <div class="test-author">
        <span class="test-avatar">A</span>
        <span class="test-name">${t("demo.home.test1Name", lang)}</span>
      </div>
    </div>
    <div class="card testimonial" data-animate="scroll-reveal">
      <div class="test-quote">${ICONS.quote}</div>
      <p class="test-text">${t("demo.home.test2Quote", lang)}</p>
      <div class="test-author">
        <span class="test-avatar">S</span>
        <span class="test-name">${t("demo.home.test2Name", lang)}</span>
      </div>
    </div>
  </div>
</section>

<footer class="footer" data-animate="scroll-reveal">
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="nav-logo" style="margin-bottom:12px">${t("demo.brand", lang)}</div>
        <p style="font-size:14px;color:var(--brand-muted,#737373);max-width:300px">${t("demo.footer.tagline", lang)}</p>
      </div>
      <div>
        <div class="footer-col-title">${t("demo.footer.product", lang)}</div>
        <a class="footer-link">${t("demo.footer.features", lang)}</a>
        <a class="footer-link">${t("demo.footer.pricing", lang)}</a>
        <a class="footer-link">${t("demo.footer.changelog", lang)}</a>
        <a class="footer-link">${t("demo.footer.roadmap", lang)}</a>
      </div>
      <div>
        <div class="footer-col-title">${t("demo.footer.company", lang)}</div>
        <a class="footer-link">${t("demo.footer.about", lang)}</a>
        <a class="footer-link">${t("demo.footer.blog", lang)}</a>
        <a class="footer-link">${t("demo.footer.careers", lang)}</a>
        <a class="footer-link">${t("demo.footer.contact", lang)}</a>
      </div>
      <div>
        <div class="footer-col-title">${t("demo.footer.resources", lang)}</div>
        <a class="footer-link">${t("demo.footer.docs", lang)}</a>
        <a class="footer-link">${t("demo.footer.api", lang)}</a>
        <a class="footer-link">${t("demo.footer.community", lang)}</a>
        <a class="footer-link">${t("demo.footer.support", lang)}</a>
      </div>
    </div>
    <div class="footer-copy">${t("demo.footer.copy", lang)}</div>
  </div>
</footer>`;
}

function generateCarouselPage(lang: Lang): string {
  return `
<nav class="nav">
  <div class="nav-logo">${t("demo.brand", lang)}</div>
  <div class="nav-links">
    <a class="nav-link">${t("demo.nav.products", lang)}</a>
    <a class="nav-link">${t("demo.nav.collections", lang)}</a>
    <a class="nav-link">${t("demo.nav.deals", lang)}</a>
    <a class="nav-link">${t("demo.nav.support", lang)}</a>
  </div>
  <div class="nav-cta">
    <button class="btn btn-secondary btn-sm">${t("demo.nav.cart", lang, { n: "0" })}</button>
    <button class="btn btn-primary btn-sm">${t("demo.nav.account", lang)}</button>
  </div>
</nav>

<section class="section container">
  <h2 style="text-align:center;margin-bottom:var(--space-lg,24px)">${t("demo.carousel.title", lang)}</h2>
  <div class="carousel-wrapper" data-animate="auto-carousel">
    <div class="carousel-track" id="carouselTrack">
      <div class="carousel-slide is-active" style="background:var(--brand-surface,#f5f5f5)">
        <span class="product-badge">${t("demo.carousel.badgeNew", lang)}</span>
        <div class="gradient-visual gv-slide">${ICONS.spark}</div>
        <h2>${t("demo.carousel.s1Name", lang)}</h2>
        ${renderStars(`${t("demo.carousel.rating", lang)} 4.8 / 5`)}
        <p>${t("demo.carousel.s1Desc", lang)}</p>
        <div class="price-row">
          <span class="price-original">$59</span>
          <span class="price-current">$49/mo</span>
        </div>
        <button class="btn btn-primary" style="margin-top:16px">${t("demo.carousel.learnMore", lang)} ${ICONS.arrow}</button>
      </div>
      <div class="carousel-slide" style="background:var(--brand-surface,#f5f5f5)">
        <span class="product-badge">${t("demo.carousel.badgePopular", lang)}</span>
        <div class="gradient-visual gv-slide">${ICONS.chart}</div>
        <h2>${t("demo.carousel.s2Name", lang)}</h2>
        ${renderStars(`${t("demo.carousel.rating", lang)} 4.9 / 5`)}
        <p>${t("demo.carousel.s2Desc", lang)}</p>
        <div class="price-row">
          <span class="price-original">$39</span>
          <span class="price-current">$29/mo</span>
        </div>
        <button class="btn btn-primary" style="margin-top:16px">${t("demo.carousel.learnMore", lang)} ${ICONS.arrow}</button>
      </div>
      <div class="carousel-slide" style="background:var(--brand-surface,#f5f5f5)">
        <span class="product-badge">${t("demo.carousel.badgeFree", lang)}</span>
        <div class="gradient-visual gv-slide">${ICONS.bolt}</div>
        <h2>${t("demo.carousel.s3Name", lang)}</h2>
        ${renderStars(`${t("demo.carousel.rating", lang)} 4.7 / 5`)}
        <p>${t("demo.carousel.s3Desc", lang)}</p>
        <div class="price-row">
          <span class="price-current">$0/mo</span>
        </div>
        <button class="btn btn-primary" style="margin-top:16px">${t("demo.carousel.learnMore", lang)} ${ICONS.arrow}</button>
      </div>
    </div>
    <button class="carousel-arrow prev" id="carouselPrev">${ICONS.chevronLeft}</button>
    <button class="carousel-arrow next" id="carouselNext">${ICONS.chevronRight}</button>
  </div>
  <div class="carousel-dots" id="carouselDots">
    <button class="carousel-dot is-active"></button>
    <button class="carousel-dot"></button>
    <button class="carousel-dot"></button>
  </div>
</section>

<section class="section container">
  <h3 style="margin-bottom:var(--space-lg,24px)">${t("demo.carousel.allProducts", lang)}</h3>
  <div class="grid-3">
    <div class="card" data-animate-hover="hover-scale">
      <div class="gradient-visual gv-card">${ICONS.bolt}</div>
      <span class="product-badge">${t("demo.carousel.badgeSale", lang)}</span>
      <h3 style="margin:8px 0 4px">${t("demo.carousel.p1Name", lang)}</h3>
      ${renderStars(`${t("demo.carousel.rating", lang)} 4.6 / 5`)}
      <p>${t("demo.carousel.p1Desc", lang)}</p>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:var(--space-md,16px)">
        <div class="price-row">
          <span class="price-original">$29</span>
          <span class="price-current" style="font-size:18px">$19</span>
        </div>
        <button class="btn btn-secondary btn-sm">${t("demo.carousel.addToCart", lang)}</button>
      </div>
      <div class="card-back">
        <div class="card-icon" style="margin-bottom:8px">${ICONS.check}</div>
        <h3 style="margin-bottom:8px">${t("demo.carousel.p1Name", lang)}</h3>
        <p style="font-size:13px;color:var(--brand-muted,#737373)">${t("demo.carousel.p1Desc", lang)}</p>
      </div>
    </div>
    <div class="card" data-animate-hover="hover-scale">
      <div class="gradient-visual gv-card">${ICONS.spark}</div>
      <span class="product-badge">${t("demo.carousel.badgeNew", lang)}</span>
      <h3 style="margin:8px 0 4px">${t("demo.carousel.p2Name", lang)}</h3>
      ${renderStars(`${t("demo.carousel.rating", lang)} 4.8 / 5`)}
      <p>${t("demo.carousel.p2Desc", lang)}</p>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:var(--space-md,16px)">
        <div class="price-row">
          <span class="price-original">$49</span>
          <span class="price-current" style="font-size:18px">$39</span>
        </div>
        <button class="btn btn-secondary btn-sm">${t("demo.carousel.addToCart", lang)}</button>
      </div>
      <div class="card-back">
        <div class="card-icon" style="margin-bottom:8px">${ICONS.check}</div>
        <h3 style="margin-bottom:8px">${t("demo.carousel.p2Name", lang)}</h3>
        <p style="font-size:13px;color:var(--brand-muted,#737373)">${t("demo.carousel.p2Desc", lang)}</p>
      </div>
    </div>
    <div class="card" data-animate-hover="hover-scale">
      <div class="gradient-visual gv-card">${ICONS.globe}</div>
      <h3 style="margin:8px 0 4px">${t("demo.carousel.p3Name", lang)}</h3>
      ${renderStars(`${t("demo.carousel.rating", lang)} 4.5 / 5`)}
      <p>${t("demo.carousel.p3Desc", lang)}</p>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:var(--space-md,16px)">
        <div class="price-row">
          <span class="price-original">$39</span>
          <span class="price-current" style="font-size:18px">$29</span>
        </div>
        <button class="btn btn-secondary btn-sm">${t("demo.carousel.addToCart", lang)}</button>
      </div>
      <div class="card-back">
        <div class="card-icon" style="margin-bottom:8px">${ICONS.check}</div>
        <h3 style="margin-bottom:8px">${t("demo.carousel.p3Name", lang)}</h3>
        <p style="font-size:13px;color:var(--brand-muted,#737373)">${t("demo.carousel.p3Desc", lang)}</p>
      </div>
    </div>
  </div>
</section>`;
}

function generateAuthVisual(lang: Lang, avatarInitial: string): string {
  return `
<div class="auth-visual">
  <div class="av-logo">${t("demo.brand", lang)}</div>
  <div class="av-title">${t("demo.login.visualTag", lang)}</div>
  <div class="av-quote">${t("demo.login.visualQuote", lang)}</div>
  <div class="av-name">${t("demo.login.visualName", lang)}</div>
</div>`;
}

function generateLoginPage(lang: Lang): string {
  const toggleLabel = t("demo.login.togglePwd", lang);
  return `
<div class="auth-wrap">
  <div class="auth-split">
    ${generateAuthVisual(lang, "J")}
    <div class="auth-card">
      <div class="auth-logo">${t("demo.brand", lang)}</div>
      <h2 class="auth-title">${t("demo.login.title", lang)}</h2>
      <p class="auth-subtitle">${t("demo.login.subtitle", lang)}</p>

      <div class="form-group">
        <label class="form-label">${t("demo.login.email", lang)}</label>
        <div class="input-wrap">
          <span class="input-icon">${ICONS.mail}</span>
          <input type="email" class="form-input" placeholder="you@example.com" value="demo@nova.dev">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${t("demo.login.password", lang)}</label>
        <div class="input-wrap">
          <span class="input-icon">${ICONS.lock}</span>
          <input type="password" id="loginPwd" class="form-input" placeholder="${t("demo.login.pwdPh", lang)}" value="demo123456" style="padding-right:40px">
          <button type="button" class="pwd-toggle" data-target="loginPwd" aria-label="${toggleLabel}">${ICONS.eye}</button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${t("demo.login.errLabel", lang)}</label>
        <div class="input-wrap">
          <span class="input-icon">${ICONS.lock}</span>
          <input type="password" class="form-input error" placeholder="${t("demo.login.pwdPh", lang)}" value="wrong">
        </div>
        <div class="form-error">${t("demo.login.errShort", lang)}</div>
      </div>

      <div class="form-row">
        <label class="checkbox-label">
          <input type="checkbox" class="checkbox" checked>
          ${t("demo.login.remember", lang)}
        </label>
        <a class="form-link">${t("demo.login.forgot", lang)}</a>
      </div>

      <button class="btn btn-primary btn-block">${t("demo.login.submit", lang)}</button>

      <div class="oauth-divider"><span>${t("demo.login.oauthDivider", lang)}</span></div>
      <div class="oauth-row">
        <button class="oauth-btn">${ICONS.google}<span>${t("demo.login.google", lang)}</span></button>
        <button class="oauth-btn">${ICONS.github}<span>${t("demo.login.github", lang)}</span></button>
      </div>

      <div class="auth-footer">
        ${t("demo.login.noAccount", lang)} <a class="form-link">${t("demo.login.signUp", lang)}</a>
      </div>
    </div>
  </div>
</div>`;
}

function generateRegisterPage(lang: Lang): string {
  const toggleLabel = t("demo.login.togglePwd", lang);
  return `
<div class="auth-wrap">
  <div class="auth-split">
    ${generateAuthVisual(lang, "J")}
    <div class="auth-card">
      <div class="auth-logo">${t("demo.brand", lang)}</div>
      <h2 class="auth-title">${t("demo.register.title", lang)}</h2>
      <p class="auth-subtitle">${t("demo.register.subtitle", lang)}</p>

      <div class="form-group">
        <label class="form-label">${t("demo.register.fullName", lang)}</label>
        <div class="input-wrap">
          <span class="input-icon">${ICONS.user}</span>
          <input type="text" class="form-input" placeholder="Jane Developer">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${t("demo.login.email", lang)}</label>
        <div class="input-wrap">
          <span class="input-icon">${ICONS.mail}</span>
          <input type="email" class="form-input" placeholder="you@example.com">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${t("demo.login.password", lang)}</label>
        <div class="input-wrap">
          <span class="input-icon">${ICONS.lock}</span>
          <input type="password" id="regPwd" class="form-input" placeholder="${t("demo.register.pwdPh", lang)}" style="padding-right:40px">
          <button type="button" class="pwd-toggle" data-target="regPwd" aria-label="${toggleLabel}">${ICONS.eye}</button>
        </div>
        <div class="strength-wrap">
          <div class="strength-bar" id="strengthBar">
            <span class="strength-segment"></span>
            <span class="strength-segment"></span>
            <span class="strength-segment"></span>
            <span class="strength-segment"></span>
          </div>
          <span class="strength-label" id="strengthLabel">${t("demo.register.strength", lang)}</span>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${t("demo.register.confirm", lang)}</label>
        <div class="input-wrap">
          <span class="input-icon">${ICONS.lock}</span>
          <input type="password" id="regPwd2" class="form-input" placeholder="${t("demo.register.confirmPh", lang)}" style="padding-right:40px">
          <button type="button" class="pwd-toggle" data-target="regPwd2" aria-label="${toggleLabel}">${ICONS.eye}</button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">${t("demo.register.disabledLabel", lang)}</label>
        <div class="input-wrap">
          <span class="input-icon">${ICONS.lock}</span>
          <input type="password" class="form-input" placeholder="${t("demo.register.disabledPh", lang)}" disabled>
        </div>
      </div>

      <div class="form-row" style="margin-bottom:var(--space-lg,24px)">
        <label class="checkbox-label">
          <input type="checkbox" class="checkbox">
          ${t("demo.register.agree", lang)} <a class="form-link">${t("demo.register.terms", lang)}</a> ${t("demo.register.and", lang)} <a class="form-link">${t("demo.register.privacy", lang)}</a>
        </label>
      </div>

      <button class="btn btn-primary btn-block">${t("demo.register.submit", lang)}</button>
      <button class="btn btn-secondary btn-block" style="margin-top:8px" disabled>${t("demo.register.disabled", lang)}</button>

      <div class="oauth-divider"><span>${t("demo.login.oauthDivider", lang)}</span></div>
      <div class="oauth-row">
        <button class="oauth-btn">${ICONS.google}<span>${t("demo.login.google", lang)}</span></button>
        <button class="oauth-btn">${ICONS.github}<span>${t("demo.login.github", lang)}</span></button>
      </div>

      <div class="auth-footer">
        ${t("demo.register.hasAccount", lang)} <a class="form-link">${t("demo.register.signIn", lang)}</a>
      </div>
    </div>
  </div>
</div>`;
}

/**
 * Generate in-iframe scripts for auth pages (password visibility toggle + strength bar).
 */
function generateAuthScripts(tab: TabKey, lang: Lang): string {
  if (tab !== "login" && tab !== "register") return "";

  const weak = t("demo.register.strengthWeak", lang);
  const medium = t("demo.register.strengthMed", lang);
  const strong = t("demo.register.strengthStrong", lang);
  const strengthLabel = t("demo.register.strength", lang);
  const showHide = t("demo.login.togglePwd", lang);

  return `
(function() {
  // Password visibility toggle
  document.querySelectorAll('.pwd-toggle').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var input = document.getElementById(btn.getAttribute('data-target'));
      if (!input) return;
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
    });
  });

  // Password strength bar (register page)
  var input = document.getElementById('regPwd');
  var bar = document.getElementById('strengthBar');
  var label = document.getElementById('strengthLabel');
  if (input && bar && label) {
    input.addEventListener('input', function() {
      var v = input.value;
      var score = 0;
      if (v.length >= 8) score++;
      if (v.length >= 12) score++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
      if (/\\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;
      bar.className = 'strength-bar';
      if (v.length === 0) { label.textContent = '${strengthLabel}'; return; }
      if (score <= 1) { bar.classList.add('strength-weak'); label.textContent = '${weak}'; }
      else if (score <= 3) { bar.classList.add('strength-medium'); label.textContent = '${medium}'; }
      else { bar.classList.add('strength-strong'); label.textContent = '${strong}'; }
    });
  }
})();
`;
}

/**
 * Generate animation JS for the iframe.
 */
function generateAnimationJs(animation: AnimationMeta | null, tab: TabKey): string {
  if (!animation) return "";

  // Only inject animation JS if the current tab is in the animation's target pages
  if (!animation.targetPages.includes(tab)) {
    return `console.log("Animation '${animation.name}' applies to: ${animation.targetPages.join(", ")}. Current tab: ${tab}");`;
  }

  // Config-driven parameters (fall back to PRD defaults when absent)
  const cfgNum = (key: string, fallback: number): number =>
    typeof animation.config[key] === "number"
      ? (animation.config[key] as number)
      : fallback;

  switch (animation.jsBehavior) {
    case "intersection-observer":
      return `
(function() {
  var els = document.querySelectorAll('[data-animate="scroll-reveal"]');
  if (!els.length) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: ${cfgNum("threshold", 0.2)} });
  els.forEach(function(el) { observer.observe(el); });
})();
`;

    case "stagger":
      return `
(function() {
  var els = document.querySelectorAll(${JSON.stringify(animation.targetSelector)});
  if (!els.length) return;
  els.forEach(function(el, i) {
    el.classList.add(${JSON.stringify(animation.cssClass)});
    el.style.animationDelay = (i * ${cfgNum("delay", 80)}) + 'ms';
  });
})();
`;

    case "interval-carousel":
      return `
(function() {
  var track = document.getElementById('carouselTrack');
  var dots = document.querySelectorAll('#carouselDots .carousel-dot');
  var prevBtn = document.getElementById('carouselPrev');
  var nextBtn = document.getElementById('carouselNext');
  if (!track) return;
  var slides = track.querySelectorAll('.carousel-slide');
  var current = 0;
  var interval = null;

  function goTo(idx) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() { interval = setInterval(next, ${cfgNum("interval", 3000)}); }
  function stopAuto() { if (interval) clearInterval(interval); }

  if (prevBtn) prevBtn.addEventListener('click', function() { stopAuto(); prev(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', function() { stopAuto(); next(); startAuto(); });
  dots.forEach(function(dot, i) {
    dot.addEventListener('click', function() { stopAuto(); goTo(i); startAuto(); });
  });

  startAuto();
})();
`;

    case "marquee":
      return `
(function() {
  var track = document.querySelector('.marquee-track');
  if (!track) return;
  // PRD 9.6: speed 40px/s. Track is duplicated for a seamless -50% loop,
  // so one cycle covers half the track width.
  var speed = ${cfgNum("speed", 40)};
  function apply() {
    var half = track.scrollWidth / 2;
    // Guard: at end-of-body parse time layout may not be ready and
    // scrollWidth can read 0, which would set animationDuration to 0s
    // and kill the animation entirely. Fall back to a sane default.
    var duration = half > 0 ? half / speed : 20;
    track.style.animationDuration = duration + 's';
  }
  // Defer until layout is settled so scrollWidth is reliable.
  if (document.readyState === 'complete') apply();
  else window.addEventListener('load', apply);
  requestAnimationFrame(apply);
})();
`;

    case "count-up":
      return `
(function() {
  var statNumbers = document.querySelectorAll('[data-animate="count-up"] .stat-number');
  var statBars = document.querySelectorAll('[data-animate="count-up"] .stat-bar');
  if (!statNumbers.length) return;

  // The markup renders the final value by default (so stats are never 0
  // when no animation is chosen). Reset to 0 here so the count-up always
  // plays from 0 -> target when this animation IS selected.
  statNumbers.forEach(function(el){ el.textContent = "0"; });

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var duration = ${cfgNum("duration", 1500)};
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var value = Math.floor(progress * target);
      el.textContent = value.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString();
      }
    }
    requestAnimationFrame(step);
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var num = entry.target.querySelector('.stat-number');
        var bar = entry.target.querySelector('.stat-bar');
        if (num) animateCount(num);
        if (bar) bar.classList.add('is-grown');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: ${cfgNum("threshold", 0.3)} });

  document.querySelectorAll('[data-animate="count-up"]').forEach(function(el) {
    observer.observe(el);
  });
})();
`;

    case "parallax-scroll":
      return `
(function() {
  var heroVisual = document.querySelector(${JSON.stringify(animation.targetSelector)});
  if (!heroVisual) return;
  var speed = ${cfgNum("speed", 0.3)};
  var ticking = false;
  function updateParallax() {
    var scrolled = window.pageYOffset || document.documentElement.scrollTop;
    heroVisual.style.transform = 'translateY(' + (scrolled * speed) + 'px)';
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  updateParallax();
})();
`;

    case "tilt-3d":
      return `
(function() {
  var cards = document.querySelectorAll(${JSON.stringify(animation.targetSelector)});
  if (!cards.length) return;
  var maxTilt = ${cfgNum("maxTilt", 8)};
  cards.forEach(function(card) {
    card.classList.add(${JSON.stringify(animation.cssClass)});
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = ((y - centerY) / centerY) * -maxTilt;
      var rotateY = ((x - centerX) / centerX) * maxTilt;
      card.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.03)';
    });
    card.addEventListener('mouseleave', function() {
      card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });
})();
`;

    default:
      return "";
  }
}
