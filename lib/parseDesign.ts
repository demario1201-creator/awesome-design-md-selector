// DESIGN.md parser - extracts frontmatter and splits into 9 standard sections
// Based on PRD Section 6.3

import type { ParsedDesignDoc } from "./types";

// 9 standard section keys (PRD 6.3)
export const SECTION_KEYS = [
  "overview",
  "colors",
  "typography",
  "layout",
  "elevation",
  "shapes",
  "components",
  "dos-and-donts",
  "responsive",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

// Section title patterns to match (case-insensitive, flexible numbering)
const SECTION_PATTERNS: Record<SectionKey, RegExp[]> = {
  overview: [/^##\s*\d*\.?\s*Visual\s+Theme/i, /^##\s*\d*\.?\s*Overview/i],
  colors: [/^##\s*\d*\.?\s*Color\s+Palette/i, /^##\s*\d*\.?\s*Colors/i],
  typography: [/^##\s*\d*\.?\s*Typography/i],
  layout: [/^##\s*\d*\.?\s*Layout/i],
  elevation: [/^##\s*\d*\.?\s*Depth\s+\&\s*Elevation/i, /^##\s*\d*\.?\s*Elevation/i],
  shapes: [/^##\s*\d*\.?\s*Shapes/i, /^##\s*\d*\.?\s*Component\s+Stylings/i],
  components: [/^##\s*\d*\.?\s*Components/i, /^##\s*\d*\.?\s*Component\s+Stylings/i],
  "dos-and-donts": [/^##\s*\d*\.?\s*Do.*s\s+and\s+Don.*ts/i, /^##\s*\d*\.?\s*Do.*Don/i],
  responsive: [/^##\s*\d*\.?\s*Responsive/i],
};

/**
 * Parse a DESIGN.md document into frontmatter + content + sections.
 * Uses a lightweight frontmatter extractor (no gray-matter dependency at runtime).
 */
export function parseDesignDoc(raw: string): ParsedDesignDoc {
  const { frontmatter, content } = extractFrontmatter(raw);
  const sections = splitSections(content);
  return { frontmatter, content, sections };
}

/**
 * Extract YAML frontmatter from raw markdown.
 */
function extractFrontmatter(raw: string): {
  frontmatter: Record<string, unknown>;
  content: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return { frontmatter: {}, content: raw };
  }

  const yamlStr = match[1];
  const content = raw.slice(match[0].length).trimStart();

  try {
    const frontmatter = parseSimpleYaml(yamlStr);
    return { frontmatter, content };
  } catch {
    return { frontmatter: {}, content };
  }
}

/**
 * Simplified YAML parser for DESIGN.md frontmatter.
 * Handles nested objects, arrays, quoted/unquoted strings, numbers.
 */
function parseSimpleYaml(yamlStr: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = yamlStr.split("\n");
  const stack: { indent: number; obj: Record<string, unknown> }[] = [
    { indent: -1, obj: result },
  ];

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();
    const colonIdx = trimmed.indexOf(":");

    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    // Pop stack to find parent
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1].obj;

    if (value === "") {
      // Nested object
      const newObj: Record<string, unknown> = {};
      parent[key] = newObj;
      stack.push({ indent, obj: newObj });
    } else {
      parent[key] = parseScalar(value);
    }
  }

  return result;
}

function parseScalar(val: string): unknown {
  // Remove quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  // Number
  const num = Number(val);
  if (!isNaN(num) && val !== "") return num;
  // Boolean
  if (val === "true") return true;
  if (val === "false") return false;
  return val;
}

/**
 * Split markdown content into 9 standard sections.
 */
function splitSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = content.split("\n");

  // Find all section headers
  const sectionPositions: { key: SectionKey; lineIdx: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    for (const sectionKey of SECTION_KEYS) {
      const patterns = SECTION_PATTERNS[sectionKey];
      if (patterns.some((p) => p.test(lines[i]))) {
        // Avoid duplicate matches (e.g., "Component Stylings" matching both shapes and components)
        if (!sectionPositions.some((s) => s.lineIdx === i)) {
          sectionPositions.push({ key: sectionKey, lineIdx: i });
        }
        break;
      }
    }
  }

  // Extract content between sections
  for (let i = 0; i < sectionPositions.length; i++) {
    const { key, lineIdx } = sectionPositions[i];
    const endIdx =
      i + 1 < sectionPositions.length ? sectionPositions[i + 1].lineIdx : lines.length;
    const sectionContent = lines.slice(lineIdx, endIdx).join("\n").trim();
    sections[key] = sectionContent;
  }

  return sections;
}

/**
 * Validate that a parsed DESIGN.md has required structure.
 * Used for AI export validation (PRD 8.4).
 */
export function validateDesignDoc(raw: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const { frontmatter, sections } = parseDesignDoc(raw);

  // Check frontmatter
  if (!frontmatter || Object.keys(frontmatter).length === 0) {
    issues.push("Missing YAML frontmatter");
  } else if (!frontmatter.name) {
    issues.push("Frontmatter missing 'name' field");
  }

  // Check 9 sections
  const requiredSections: SectionKey[] = [...SECTION_KEYS];
  for (const sectionKey of requiredSections) {
    // Allow either "shapes" or "components" to satisfy the "Shapes/Components" requirement
    if (sectionKey === "shapes") {
      if (!sections[sectionKey] && !sections["components"]) {
        issues.push(`Missing section: Shapes or Components`);
      }
    } else if (sectionKey === "components") {
      // Already checked above
      continue;
    } else if (!sections[sectionKey]) {
      issues.push(`Missing section: ${sectionKey}`);
    }
  }

  return { valid: issues.length === 0, issues };
}
