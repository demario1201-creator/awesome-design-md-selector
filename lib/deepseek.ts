// DeepSeek API client - pure browser-side call
// Based on PRD Section 7

import type { Lang, ParsedDesignDoc } from "./types";
import { parseDesignDoc, validateDesignDoc } from "./parseDesign";
import { t } from "./i18n";

const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-chat";
const TIMEOUT_MS = 30000;

interface DeepSeekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

const SYSTEM_PROMPT_BASE = `You are a senior design system engineer who writes AI-friendly design documentation.

Your task is to rewrite a DESIGN.md file based on a base style and user requirements.

Output format constraints:
1. The output MUST start with YAML frontmatter (between --- markers)
2. The frontmatter MUST include: version, name, description, colors, typography, rounded, spacing, components
3. After the frontmatter, the Markdown body MUST contain exactly these 9 sections (in order):
   ## Overview
   ## Colors
   ## Typography
   ## Layout
   ## Elevation & Depth
   ## Shapes
   ## Components
   ## Do's and Don'ts
   ## Responsive Behavior
4. Preserve the base style's visual DNA while incorporating the user's custom requirements
5. Do NOT invent color values that don't exist in the base style's palette unless the user specifically requests them
6. The Do's and Don'ts section should include guardrails for AI-generated UI scenarios
7. Output ONLY the DESIGN.md content, no explanations or meta-commentary`;

/** Build system prompt with an output-language instruction appended. */
function buildSystemPrompt(lang: Lang): string {
  const languageInstruction =
    lang === "zh"
      ? "\n8. Write the entire output document (frontmatter description and all section text) in Simplified Chinese."
      : "\n8. Write the entire output document (frontmatter description and all section text) in English.";
  return SYSTEM_PROMPT_BASE + languageInstruction;
}

/**
 * Call DeepSeek API to rewrite a DESIGN.md.
 * Returns the raw text response and parsed document.
 */
export async function callDeepSeek(
  apiKey: string,
  baseDesignMd: string,
  customIdea: string,
  lang: Lang = "zh"
): Promise<{ rawText: string; doc: ParsedDesignDoc }> {
  if (!apiKey) {
    throw new Error(t("ai.err.noKey", lang));
  }

  const userPrompt = buildUserPrompt(baseDesignMd, customIdea, lang);

  const messages: DeepSeekMessage[] = [
    { role: "system", content: buildSystemPrompt(lang) },
    { role: "user", content: userPrompt },
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(DEEPSEEK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 8000,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      return handleErrorStatus(response.status, errorBody, lang);
    }

    const data: DeepSeekResponse = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(t("ai.err.empty", lang));
    }

    const doc = parseDesignDoc(content);
    return { rawText: content, doc };
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(t("ai.err.timeout", lang));
    }
    if (err instanceof Error) throw err;
    throw new Error(t("ai.err.unexpected", lang));
  }
}

function buildUserPrompt(baseDesignMd: string, customIdea: string, lang: Lang): string {
  const idea =
    customIdea ||
    (lang === "zh"
      ? "（无特殊要求 —— 在保持基础风格前提下进行增强与润色）"
      : "(No specific custom requirements - enhance and refine the base style)");
  const languageInstruction =
    lang === "zh"
      ? "5. 整个输出文档（frontmatter 描述与全部章节正文）必须使用简体中文撰写。"
      : "5. The entire output document (frontmatter description and all section text) must be written in English.";
  return `Please rewrite a complete DESIGN.md based on the following base design style, incorporating my requirements.

[Base Style DESIGN.md]
${baseDesignMd}

[My Custom Requirements]
${idea}

[Requirements]
1. The output must be a complete, usable Markdown document starting with --- frontmatter.
2. Preserve the core philosophy of the base style while incorporating my requirements into colors, typography, components, and other sections.
3. Must include all 9 sections (Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts, Responsive Behavior) - do not omit any, do not add extra sections.
4. If my requirements conflict with the base style's philosophy, find a balanced solution and note the change in the Overview section.
${languageInstruction}`;
}

function handleErrorStatus(status: number, body: string, lang: Lang): never {
  switch (status) {
    case 401:
    case 403:
      throw new Error(t("ai.err.invalidKey", lang));
    case 429:
      throw new Error(t("ai.err.rateLimit", lang));
    case 500:
    case 502:
    case 503:
      throw new Error(t("ai.err.unavailable", lang));
    default:
      throw new Error(t("ai.err.http", lang, { status: String(status), body: body.slice(0, 200) }));
  }
}

/**
 * Validate an AI-generated DESIGN.md for export.
 * Returns { valid, issues }.
 */
export function validateAIOutput(rawText: string): { valid: boolean; issues: string[] } {
  return validateDesignDoc(rawText);
}

/**
 * Trigger a browser file download.
 */
export function downloadFile(content: string, filename: string, mimeType = "text/markdown"): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
