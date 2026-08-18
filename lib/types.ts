// Type definitions for Frontend Style Selector
// Based on PRD Section 6 - Data Structure Design

export type Lang = "zh" | "en";

export type TabKey = "home" | "carousel" | "login" | "register";

export type PreviewTheme = "light" | "dark";

export type AIStatus = "idle" | "loading" | "success" | "error";

export interface DesignTokens {
  colors: Record<string, string>;
  typography: Record<string, Record<string, string | number>>;
  rounded: Record<string, string>;
  spacing: Record<string, string>;
  components: Record<string, Record<string, string>>;
}

export interface StyleMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  hasFrontmatter: boolean;
  fallback: boolean;
  tokens: DesignTokens;
}

export interface ParsedDesignDoc {
  frontmatter: Record<string, unknown>;
  content: string;
  sections: Record<string, string>;
}

export type AnimationBehavior =
  | "intersection-observer"
  | "stagger"
  | "interval-carousel"
  | "marquee"
  | "count-up"
  | "parallax-scroll"
  | "tilt-3d"
  | "none";

export interface AnimationMeta {
  id: string;
  name: string;
  description: string;
  position: string;
  effect: string;
  targetPages: TabKey[];
  targetSelector: string;
  cssClass: string;
  css?: string;
  jsBehavior: AnimationBehavior;
  config: Record<string, unknown>;
}

export interface AIResult {
  rawText: string;
  doc: ParsedDesignDoc;
}

export interface AppState {
  // Selection state
  selectedStyleId: string | null;
  selectedAnimationId: string | null;
  activeTab: TabKey;

  // UI state (persisted)
  lang: Lang;
  previewTheme: PreviewTheme;

  // AI state (memory only, never persisted)
  apiKey: string;
  customIdea: string;
  aiStatus: AIStatus;
  aiError: string | null;
  aiResult: AIResult | null;

  // Data
  styles: StyleMeta[];
  animations: AnimationMeta[];
  searchQuery: string;

  // Actions
  setSelectedStyle: (id: string) => void;
  setSelectedAnimation: (id: string | null) => void;
  setActiveTab: (tab: TabKey) => void;
  setLang: (lang: Lang) => void;
  setPreviewTheme: (theme: PreviewTheme) => void;
  setApiKey: (key: string) => void;
  setCustomIdea: (idea: string) => void;
  setAIStatus: (status: AIStatus, error?: string | null) => void;
  setAIResult: (result: AIResult | null) => void;
  setSearchQuery: (query: string) => void;
}
