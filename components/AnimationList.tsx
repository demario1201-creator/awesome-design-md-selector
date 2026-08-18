"use client";

import { useStore } from "@/lib/store";
import { useT, type DictKey } from "@/lib/i18n";
import { Zap } from "lucide-react";

export default function AnimationList() {
  const { animations, selectedAnimationId, setSelectedAnimation, activeTab } = useStore();
  const t = useT();

  return (
    <div className="flex flex-col h-full">
      <div
        className="px-3 py-2 border-b flex items-center gap-1.5"
        style={{ borderColor: "var(--app-border)" }}
      >
        <Zap size={12} style={{ color: "var(--app-text-muted)" }} />
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--app-text-dim)" }}
        >
          {t("animations.title")}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {/* No animation option */}
        <button
          onClick={() => setSelectedAnimation(null)}
          className="w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors mb-1"
          style={{
            background:
              selectedAnimationId === null
                ? "var(--app-accent)"
                : "transparent",
            color:
              selectedAnimationId === null ? "#fff" : "var(--app-text)",
          }}
          onMouseEnter={(e) => {
            if (selectedAnimationId !== null)
              e.currentTarget.style.background = "var(--app-surface-hover)";
          }}
          onMouseLeave={(e) => {
            if (selectedAnimationId !== null)
              e.currentTarget.style.background = "transparent";
          }}
        >
          {t("animations.none")}
        </button>

        {animations.map((anim) => {
          const isMatch = anim.targetPages.includes(activeTab);
          const isSelected = selectedAnimationId === anim.id;
          const nameKey = `anim.${anim.id}.name` as DictKey;
          const descKey = `anim.${anim.id}.desc` as DictKey;
          const animName = t(nameKey);
          const animDesc = t(descKey);

          return (
            <button
              key={anim.id}
              onClick={() => setSelectedAnimation(isSelected ? null : anim.id)}
              className="w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors mb-1"
              style={{
                background: isSelected ? "var(--app-accent)" : "transparent",
                color: isSelected ? "#fff" : "var(--app-text)",
                opacity: isMatch ? 1 : 0.5,
              }}
              onMouseEnter={(e) => {
                if (!isSelected)
                  e.currentTarget.style.background = "var(--app-surface-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected)
                  e.currentTarget.style.background = "transparent";
              }}
              title={
                isMatch
                  ? animDesc
                  : t("animations.appliesTo", {
                      pages: anim.targetPages
                        .map((p) => t(`tabs.${p}` as DictKey))
                        .join(", "),
                    })
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex-1">{animName}</span>
                {!isMatch && (
                  <span
                    className="text-[9px] px-1 py-0.5 rounded flex-shrink-0"
                    style={{
                      background: "var(--app-border)",
                      color: "var(--app-text-muted)",
                    }}
                  >
                    {t(`tabs.${anim.targetPages[0]}` as DictKey)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
