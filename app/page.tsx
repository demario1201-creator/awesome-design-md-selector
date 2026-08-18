"use client";

import StyleList from "@/components/StyleList";
import AnimationList from "@/components/AnimationList";
import PreviewWindow from "@/components/PreviewWindow";
import AIPanel from "@/components/AIPanel";
import ExportButton from "@/components/ExportButton";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Palette, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { styles, selectedStyleId } = useStore();
  const t = useT();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiPanelExpanded, setAiPanelExpanded] = useState(false);

  const selectedStyle = styles.find((s) => s.id === selectedStyleId);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--app-bg)" }}>
      {/* Left Sidebar */}
      <aside
        className="flex flex-col transition-all duration-200 flex-shrink-0"
        style={{
          width: sidebarCollapsed ? "0px" : "260px",
          borderRight: sidebarCollapsed ? "none" : "1px solid var(--app-border)",
          background: "var(--app-surface)",
          overflow: "hidden",
        }}
      >
        {/* Logo / Title */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 border-b flex-shrink-0"
          style={{ borderColor: "var(--app-border)" }}
        >
          <Palette size={14} style={{ color: "var(--app-accent)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--app-text)" }}>
            {t("app.title")}
          </span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded-full ml-auto"
            style={{
              background: "var(--app-surface-hover)",
              color: "var(--app-text-muted)",
            }}
          >
            {t("app.stylesCount", { n: String(styles.length) })}
          </span>
        </div>

        {/* Style List (flex-1) */}
        <div className="flex-1 overflow-hidden">
          <StyleList />
        </div>

        {/* Animation List (fixed height) */}
        <div
          className="border-t flex-shrink-0"
          style={{
            borderColor: "var(--app-border)",
            height: "200px",
          }}
        >
          <AnimationList />
        </div>

        {/* Export Section */}
        <div
          className="border-t p-2.5 flex-shrink-0"
          style={{ borderColor: "var(--app-border)" }}
        >
          <ExportButton />
        </div>
      </aside>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1 rounded-r-md transition-all"
        style={{
          left: sidebarCollapsed ? "0px" : "260px",
          background: "var(--app-surface)",
          border: "1px solid var(--app-border)",
          borderLeft: "none",
          color: "var(--app-text-muted)",
        }}
        aria-label={sidebarCollapsed ? t("app.expandSidebar") : t("app.collapseSidebar")}
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div
          className="flex items-center gap-3 px-4 py-2 border-b flex-shrink-0"
          style={{
            borderColor: "var(--app-border)",
            background: "var(--app-surface)",
          }}
        >
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold" style={{ color: "var(--app-text)" }}>
              {t("app.titleFull")}
            </h1>
          </div>

          {/* Selected style info */}
          {selectedStyle && (
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--app-surface-hover)",
                  color: "var(--app-text-muted)",
                }}
              >
                {selectedStyle.category}
              </span>
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{
                  background: selectedStyle.tokens.colors?.primary || "#71717a",
                  border: "1px solid var(--app-border)",
                }}
              />
              <span className="text-xs" style={{ color: "var(--app-text)" }}>
                {selectedStyle.name}
              </span>
              {selectedStyle.fallback && (
                <span
                  className="text-[9px] px-1 py-0.5 rounded"
                  style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "#f59e0b",
                  }}
                >
                  {t("app.fallback")}
                </span>
              )}
            </div>
          )}

          {/* AI panel toggle */}
          <button
            onClick={() => setAiPanelExpanded(!aiPanelExpanded)}
            className="ml-auto px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5"
            style={{
              background: aiPanelExpanded ? "var(--app-accent)" : "var(--app-surface-hover)",
              color: aiPanelExpanded ? "#fff" : "var(--app-text-muted)",
              border: aiPanelExpanded ? "none" : "1px solid var(--app-border)",
            }}
          >
            <Sparkles size={11} />
            {t("app.ai")}
          </button>
        </div>

        {/* Preview + AI Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview Window */}
          <div className="flex-1 overflow-hidden">
            <PreviewWindow />
          </div>

          {/* AI Panel (right side, collapsible) */}
          {aiPanelExpanded && (
            <div
              className="w-80 flex-shrink-0 border-l overflow-y-auto"
              style={{ borderColor: "var(--app-border)" }}
            >
              <AIPanel />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
