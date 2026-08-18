"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { isNativeDark } from "@/lib/theme";
import { Search, Sun, Moon } from "lucide-react";

// Category order for display
const CATEGORY_ORDER = [
  "AI & LLM",
  "Developer Tools",
  "Backend & DevOps",
  "Productivity & SaaS",
  "Design & Creative",
  "Fintech & Crypto",
  "E-commerce & Retail",
  "Media & Consumer Tech",
  "Automotive",
  "Retro Web",
  "Other",
];

export default function StyleList() {
  const { styles, selectedStyleId, setSelectedStyle, searchQuery, setSearchQuery } = useStore();
  const t = useT();

  // Filter and group styles
  const grouped = useMemo(() => {
    const filtered = styles.filter((s) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    });

    const groups: Record<string, typeof styles> = {};
    for (const style of filtered) {
      if (!groups[style.category]) groups[style.category] = [];
      groups[style.category].push(style);
    }
    return groups;
  }, [styles, searchQuery]);

  const totalCount = styles.length;
  const filteredCount = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: "var(--app-border)" }}>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--app-text-muted)" }}
          />
          <input
            type="text"
            placeholder={t("search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border outline-none transition-colors"
            style={{
              background: "var(--app-surface)",
              borderColor: "var(--app-border)",
              color: "var(--app-text)",
            }}
            aria-label={t("search.aria")}
          />
        </div>
        <div className="mt-1.5 text-[10px]" style={{ color: "var(--app-text-dim)" }}>
          {t("search.count", { filtered: String(filteredCount), total: String(totalCount) })}
        </div>
      </div>

      {/* Style list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filteredCount === 0 ? (
          <div
            className="text-center py-8 text-xs"
            style={{ color: "var(--app-text-muted)" }}
          >
            {t("search.empty", { q: searchQuery })}
          </div>
        ) : (
          CATEGORY_ORDER.filter((cat) => grouped[cat]?.length).map((category) => {
            const catLabel = t(`cat.${category}` as any);
            return (
            <div key={category} className="mb-3">
              <div
                className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--app-text-dim)" }}
              >
                {catLabel} ({grouped[category].length})
              </div>
              {grouped[category].map((style) => {
                const dark = isNativeDark(style.tokens.colors);
                const isSelected = selectedStyleId === style.id;
                return (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                      e.preventDefault();
                      const all = styles;
                      const idx = all.findIndex((s) => s.id === selectedStyleId);
                      const next =
                        e.key === "ArrowDown"
                          ? all[(idx + 1) % all.length]
                          : all[(idx - 1 + all.length) % all.length];
                      setSelectedStyle(next.id);
                    }
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center gap-2 group"
                  style={{
                    background: isSelected ? "var(--app-accent)" : "transparent",
                    color: isSelected ? "#fff" : "var(--app-text)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "var(--app-surface-hover)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      background: style.tokens.colors?.primary || "#71717a",
                    }}
                  />
                  <span className="flex-1 truncate">{style.name}</span>
                  {/* Theme indicator */}
                  {dark ? (
                    <span title={t("preview.nativeDark")} className="flex-shrink-0">
                      <Moon
                        size={10}
                        style={{
                          color: isSelected ? "rgba(255,255,255,0.6)" : "#818cf8",
                        }}
                      />
                    </span>
                  ) : (
                    <span title={t("preview.themeLight") + " / " + t("preview.themeDark")} className="flex-shrink-0">
                      <Sun
                        size={10}
                        style={{
                          color: isSelected ? "rgba(255,255,255,0.6)" : "var(--app-text-dim)",
                        }}
                      />
                    </span>
                  )}
                  {style.fallback && (
                    <span
                      className="text-[9px] px-1 py-0.5 rounded"
                      style={{
                        background: "var(--app-border)",
                        color: "var(--app-text-muted)",
                      }}
                    >
                      {t("app.fallback")}
                    </span>
                  )}
                </button>
                );
              })}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
