// Global state management with Zustand
// Based on PRD Section 6.1 - AppState

import { create } from "zustand";
import type { AppState, AIStatus, AIResult, Lang, PreviewTheme, TabKey } from "./types";
import { ANIMATIONS } from "../data/animations";
import stylesData from "../data/styles.json";

const LANG_KEY = "fss-lang";
const THEME_KEY = "fss-preview-theme";

function readStored<T extends string>(key: string, fallback: T, valid: T[]): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key) as T | null;
    return v && valid.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

export const useStore = create<AppState>((set) => ({
  // Selection state
  selectedStyleId: stylesData.styles[0]?.id ?? null,
  selectedAnimationId: null,
  activeTab: "home",

  // UI state (persisted)
  lang: readStored<Lang>(LANG_KEY, "zh", ["zh", "en"]),
  previewTheme: readStored<PreviewTheme>(THEME_KEY, "light", ["light", "dark"]),

  // AI state (memory only)
  apiKey: "",
  customIdea: "",
  aiStatus: "idle",
  aiError: null,
  aiResult: null,

  // Data
  styles: stylesData.styles as any,
  animations: ANIMATIONS,
  searchQuery: "",

  // Actions
  setSelectedStyle: (id: string) => set({ selectedStyleId: id }),
  setSelectedAnimation: (id: string | null) => set({ selectedAnimationId: id }),
  setActiveTab: (tab: TabKey) => set({ activeTab: tab }),
  setLang: (lang: Lang) => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
    set({ lang });
  },
  setPreviewTheme: (theme: PreviewTheme) => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
    set({ previewTheme: theme });
  },
  setApiKey: (key: string) => set({ apiKey: key }),
  setCustomIdea: (idea: string) => set({ customIdea: idea }),
  setAIStatus: (status: AIStatus, error: string | null = null) =>
    set({ aiStatus: status, aiError: error }),
  setAIResult: (result: AIResult | null) => set({ aiResult: result }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
}));
