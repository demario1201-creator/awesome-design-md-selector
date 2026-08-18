/**
 * Build script: reads all 74 DESIGN.md files, parses YAML frontmatter,
 * generates data/styles.json with metadata + parsed tokens.
 *
 * Run: node scripts/build-styles.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const designMdDir = path.join(projectRoot, "data", "design-md");
const outputPath = path.join(projectRoot, "data", "styles.json");
// Raw DESIGN.md content is written to public/design-md/<id>.md for on-demand
// loading (export / AI polish), keeping styles.json (and the initial bundle) small.
const rawOutDir = path.join(projectRoot, "public", "design-md");

// Brand -> category mapping (from VoltAgent/awesome-design-md README)
const brandCategories = {
  // AI & LLM Platforms
  claude: "AI & LLM",
  cohere: "AI & LLM",
  elevenlabs: "AI & LLM",
  minimax: "AI & LLM",
  "mistral.ai": "AI & LLM",
  ollama: "AI & LLM",
  "opencode.ai": "AI & LLM",
  replicate: "AI & LLM",
  runwayml: "AI & LLM",
  "together.ai": "AI & LLM",
  voltagent: "AI & LLM",
  "x.ai": "AI & LLM",
  // Developer Tools & IDEs
  cursor: "Developer Tools",
  expo: "Developer Tools",
  lovable: "Developer Tools",
  raycast: "Developer Tools",
  superhuman: "Developer Tools",
  vercel: "Developer Tools",
  warp: "Developer Tools",
  // Backend, Database & DevOps
  clickhouse: "Backend & DevOps",
  composio: "Backend & DevOps",
  hashicorp: "Backend & DevOps",
  mongodb: "Backend & DevOps",
  posthog: "Backend & DevOps",
  sanity: "Backend & DevOps",
  sentry: "Backend & DevOps",
  supabase: "Backend & DevOps",
  // Productivity & SaaS
  cal: "Productivity & SaaS",
  intercom: "Productivity & SaaS",
  "linear.app": "Productivity & SaaS",
  mintlify: "Productivity & SaaS",
  notion: "Productivity & SaaS",
  resend: "Productivity & SaaS",
  zapier: "Productivity & SaaS",
  // Design & Creative Tools
  airtable: "Design & Creative",
  clay: "Design & Creative",
  figma: "Design & Creative",
  framer: "Design & Creative",
  miro: "Design & Creative",
  webflow: "Design & Creative",
  // Fintech & Crypto
  binance: "Fintech & Crypto",
  coinbase: "Fintech & Crypto",
  kraken: "Fintech & Crypto",
  mastercard: "Fintech & Crypto",
  revolut: "Fintech & Crypto",
  stripe: "Fintech & Crypto",
  wise: "Fintech & Crypto",
  // E-commerce & Retail
  airbnb: "E-commerce & Retail",
  meta: "E-commerce & Retail",
  nike: "E-commerce & Retail",
  shopify: "E-commerce & Retail",
  starbucks: "E-commerce & Retail",
  // Media & Consumer Tech
  apple: "Media & Consumer Tech",
  hp: "Media & Consumer Tech",
  ibm: "Media & Consumer Tech",
  nvidia: "Media & Consumer Tech",
  pinterest: "Media & Consumer Tech",
  playstation: "Media & Consumer Tech",
  spacex: "Media & Consumer Tech",
  spotify: "Media & Consumer Tech",
  theverge: "Media & Consumer Tech",
  uber: "Media & Consumer Tech",
  vodafone: "Media & Consumer Tech",
  wired: "Media & Consumer Tech",
  // Automotive
  bmw: "Automotive",
  "bmw-m": "Automotive",
  bugatti: "Automotive",
  ferrari: "Automotive",
  lamborghini: "Automotive",
  renault: "Automotive",
  tesla: "Automotive",
  // Retro Web
  "dell-1996": "Retro Web",
  "nintendo-2001": "Retro Web",
  // Other
  slack: "Other",
};

// Display names for brands
const brandNames = {
  bmw: "BMW",
  "bmw-m": "BMW M",
  hp: "HP",
  ibm: "IBM",
  "mistral.ai": "Mistral AI",
  "opencode.ai": "OpenCode AI",
  "together.ai": "Together AI",
  "x.ai": "xAI",
  "linear.app": "Linear",
  "dell-1996": "Dell (1996)",
  "nintendo-2001": "Nintendo (2001)",
  theverge: "The Verge",
  runwayml: "Runway",
};

/**
 * Simple YAML frontmatter parser (no external dep in build script).
 * Extracts the YAML block between --- markers and parses key-value pairs.
 */
function parseFrontmatter(raw) {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return { frontmatter: null, content: raw, hasFrontmatter: false };

  const yamlStr = fmMatch[1];
  const content = raw.slice(fmMatch[0].length).trimStart();

  // Parse YAML into nested object (simplified parser for our structure)
  const frontmatter = parseYaml(yamlStr);
  return { frontmatter, content, hasFrontmatter: true };
}

/**
 * Simplified YAML parser that handles our DESIGN.md structure:
 * - Top-level keys with string values
 * - Nested objects (colors, typography, rounded, spacing, components)
 * - Quoted and unquoted values
 */
function parseYaml(yamlStr) {
  const result = {};
  const lines = yamlStr.split("\n");
  let currentKey = null;
  let currentObj = null;
  let inNested = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const indent = line.length - line.trimStart().length;

    if (indent === 0) {
      // Top-level key
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();

      if (value === "") {
        // Nested object - start collecting
        currentKey = key;
        currentObj = {};
        result[key] = currentObj;
        inNested = true;
      } else {
        // Simple value
        result[key] = parseYamlValue(value);
        inNested = false;
      }
    } else if (inNested && currentObj) {
      // Nested property
      const trimmedLine = line.trimStart();
      const colonIdx = trimmedLine.indexOf(":");
      if (colonIdx === -1) continue;
      const key = trimmedLine.slice(0, colonIdx).trim();
      const value = trimmedLine.slice(colonIdx + 1).trim();

      if (value === "") {
        // Deeper nesting (e.g., typography.display-xl)
        if (!currentObj[key]) currentObj[key] = {};
      } else {
        // Check if we're at a deeper level
        const nestedIndent = line.length - line.trimStart().length;
        if (nestedIndent > 2) {
          // This is a property of a sub-object (e.g., display-xl.fontSize)
          // Find the parent key from the last added sub-object
          const subKeys = Object.keys(currentObj);
          const lastSubKey = subKeys[subKeys.length - 1];
          if (lastSubKey && typeof currentObj[lastSubKey] === "object") {
            currentObj[lastSubKey][key] = parseYamlValue(value);
          }
        } else {
          currentObj[key] = parseYamlValue(value);
        }
      }
    }
  }

  return result;
}

function parseYamlValue(val) {
  // Remove quotes
  if (val.startsWith('"') && val.endsWith('"')) {
    return val.slice(1, -1);
  }
  if (val.startsWith("'") && val.endsWith("'")) {
    return val.slice(1, -1);
  }
  // Try number
  const num = Number(val);
  if (!isNaN(num) && val !== "") return num;
  // Boolean
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}

/**
 * Extract colors from frontmatter or parse from Markdown content.
 */
function extractColors(frontmatter, content) {
  if (frontmatter && frontmatter.colors) {
    return frontmatter.colors;
  }
  // Fallback: parse hex colors from Markdown content (## Color section)
  const colors = {};
  const colorSection = content.match(/## \d*\.?\s*Color[\s\S]*?(?=\n## |$)/);
  if (colorSection) {
    const lines = colorSection[0].split("\n");
    for (const line of lines) {
      // Match patterns like: **Electric Blue** (`#3E6AE1`) or | Name | #HEX |
      const hexMatch = line.match(/`?(#[0-9a-fA-F]{3,8})`?/);
      if (!hexMatch) continue;
      const hex = hexMatch[1];

      // Try to extract a color name from bold text
      const boldMatch = line.match(/\*\*([^*]+)\*\*/);
      if (boldMatch && boldMatch[1]) {
        const name = boldMatch[1].toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        if (name) colors[name] = hex;
        continue;
      }

      // Try table format: | Name | #HEX |
      const parts = line.split("|").map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const name = parts[0].toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        if (name) colors[name] = hex;
        continue;
      }

      // Try to extract name before the hex: "Electric Blue (#3E6AE1)"
      const beforeHex = line.split("#")[0].trim();
      if (beforeHex) {
        const name = beforeHex.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        if (name) colors[name] = hex;
      }
    }
  }

  // If we found any colors, also try to identify common semantic ones
  if (Object.keys(colors).length > 0) {
    // Map first color to "primary" if no primary exists
    if (!colors.primary) {
      const firstKey = Object.keys(colors)[0];
      colors.primary = colors[firstKey];
    }
  }

  return colors;
}

/**
 * Extract typography from frontmatter.
 */
function extractTypography(frontmatter) {
  if (frontmatter && frontmatter.typography) {
    return frontmatter.typography;
  }
  return {};
}

/**
 * Extract rounded tokens from frontmatter.
 */
function extractRounded(frontmatter) {
  if (frontmatter && frontmatter.rounded) {
    return frontmatter.rounded;
  }
  return { sm: "4px", md: "8px", lg: "12px", pill: "9999px" };
}

/**
 * Extract spacing tokens from frontmatter.
 */
function extractSpacing(frontmatter) {
  if (frontmatter && frontmatter.spacing) {
    return frontmatter.spacing;
  }
  return { xs: "8px", sm: "12px", md: "16px", lg: "24px", xl: "32px" };
}

// Main build
const brands = fs.readdirSync(designMdDir).filter((d) =>
  fs.statSync(path.join(designMdDir, d)).isDirectory()
);
brands.sort();

const styles = [];
let fallbackCount = 0;

for (const brand of brands) {
  const designMdPath = path.join(designMdDir, brand, "DESIGN.md");
  if (!fs.existsSync(designMdPath)) {
    console.warn(`  SKIP: ${brand} (no DESIGN.md)`);
    continue;
  }

  const raw = fs.readFileSync(designMdPath, "utf-8");
  const { frontmatter, content, hasFrontmatter } = parseFrontmatter(raw);

  // Write raw DESIGN.md to public/design-md/<id>.md for on-demand loading
  fs.mkdirSync(rawOutDir, { recursive: true });
  fs.writeFileSync(path.join(rawOutDir, `${brand}.md`), raw);

  const colors = extractColors(frontmatter, content);
  const typography = extractTypography(frontmatter);
  const rounded = extractRounded(frontmatter);
  const spacing = extractSpacing(frontmatter);

  const hasColors = colors && Object.keys(colors).length > 0;
  const isFallback = !hasColors;

  if (isFallback) fallbackCount++;

  const displayName =
    brandNames[brand] ||
    brand
      .split(/[-.]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const category = brandCategories[brand] || "Other";

  // Extract description from frontmatter or first paragraph
  let description = "";
  if (frontmatter && frontmatter.description) {
    description = frontmatter.description;
  } else {
    const firstPara = content.match(/^#\s+.*\n+([\s\S]*?)(\n##|\n$|$)/);
    if (firstPara) description = firstPara[1].trim().slice(0, 200);
  }

  styles.push({
    id: brand,
    name: displayName,
    category,
    description,
    hasFrontmatter,
    fallback: isFallback,
    tokens: {
      colors,
      typography,
      rounded,
      spacing,
      components: frontmatter?.components || {},
    },
  });

  console.log(`  ${isFallback ? "[FALLBACK]" : "[OK]"} ${brand} (${category})`);
}

const output = {
  generatedAt: new Date().toISOString(),
  totalStyles: styles.length,
  fallbackCount,
  styles,
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`\nDone! ${styles.length} styles written to data/styles.json (${fallbackCount} fallback)`);
console.log(`Raw DESIGN.md files written to public/design-md/ (${styles.length} files)`);
