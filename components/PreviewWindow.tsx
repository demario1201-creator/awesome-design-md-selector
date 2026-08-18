"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { generateIframeContent } from "@/lib/iframeContent";
import { isNativeDark } from "@/lib/theme";
import { useT, type DictKey } from "@/lib/i18n";
import type { TabKey } from "@/lib/types";
import { Monitor, RefreshCw, Sun, Moon, Languages, Zap, MapPin, Sparkles, X } from "lucide-react";

const TAB_KEYS: TabKey[] = ["home", "carousel", "login", "register"];

export default function PreviewWindow() {
  const {
    styles,
    selectedStyleId,
    selectedAnimationId,
    animations,
    activeTab,
    setActiveTab,
    lang,
    setLang,
    previewTheme,
    setPreviewTheme,
  } = useStore();
  const t = useT();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [animInfoDismissed, setAnimInfoDismissed] = useState(false);

  // Reset the info card whenever a different animation is selected
  useEffect(() => {
    setAnimInfoDismissed(false);
  }, [selectedAnimationId]);

  const selectedStyle = useMemo(
    () => styles.find((s) => s.id === selectedStyleId),
    [styles, selectedStyleId]
  );

  const selectedAnimation = useMemo(
    () => animations.find((a) => a.id === selectedAnimationId) || null,
    [animations, selectedAnimationId]
  );

  // Detect if the selected style is natively dark (theme is fixed)
  const nativeDark = useMemo(() => {
    if (!selectedStyle) return false;
    return isNativeDark(selectedStyle.tokens.colors);
  }, [selectedStyle]);

  // Effective theme: native-dark brands are always dark
  const effectiveTheme = nativeDark ? "dark" : previewTheme;

  // Generate iframe content
  const iframeContent = useMemo(() => {
    if (!selectedStyle) return "";
    return generateIframeContent(
      selectedStyle.tokens,
      activeTab,
      selectedAnimation,
      selectedStyle.name,
      lang,
      effectiveTheme
    );
  }, [selectedStyle, activeTab, selectedAnimation, lang, effectiveTheme, refreshKey]);

  // Tab config with i18n labels
  const tabs = useMemo(
    () =>
      TAB_KEYS.map((key) => ({
        key,
        label: t(`tabs.${key}` as any),
        url:
          key === "home"
            ? "nova.dev/home"
            : key === "carousel"
            ? "nova.dev/products"
            : key === "login"
            ? "nova.dev/login"
            : "nova.dev/register",
      })),
    [t]
  );

  const currentUrl = tabs.find((tab) => tab.key === activeTab)?.url || "";

  // Animation mismatch warning
  const animationMismatch = useMemo(() => {
    if (!selectedAnimation) return null;
    if (!selectedAnimation.targetPages.includes(activeTab)) {
      const pages = selectedAnimation.targetPages
        .map((p) => t(`tabs.${p}` as any))
        .join(", ");
      return t("preview.animMismatch", { pages });
    }
    return null;
  }, [selectedAnimation, activeTab, t]);

  // Whether the selected animation applies to the current tab
  const animationAppliesToTab = useMemo(() => {
    if (!selectedAnimation) return false;
    return selectedAnimation.targetPages.includes(activeTab);
  }, [selectedAnimation, activeTab]);

  if (!selectedStyle) {
    return (
      <div
        className="flex items-center justify-center h-full text-sm"
        style={{ color: "var(--app-text-muted)" }}
      >
        {t("preview.selectPrompt")}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Browser chrome top bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ borderColor: "var(--app-border)", background: "var(--app-surface)" }}
      >
        {/* Window dots */}
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
        </div>

        {/* Address bar */}
        <div
          className="flex-1 flex items-center gap-2 px-3 py-1 rounded-md text-xs"
          style={{
            background: "var(--app-bg)",
            color: "var(--app-text-muted)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span>{currentUrl}</span>
        </div>

        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === "zh" ? "en" : "zh")}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors"
          style={{
            background: "var(--app-surface-hover)",
            color: "var(--app-text-muted)",
            border: "1px solid var(--app-border)",
          }}
          title={t("app.langAria")}
          aria-label={t("app.langAria")}
        >
          <Languages size={11} />
          {lang === "zh" ? "中" : "EN"}
        </button>

        {/* Theme toggle - only for non-native-dark brands */}
        {!nativeDark && (
          <button
            onClick={() => setPreviewTheme(previewTheme === "light" ? "dark" : "light")}
            className="flex items-center justify-center p-1 rounded-md transition-colors"
            style={{
              background: "var(--app-surface-hover)",
              color: "var(--app-text-muted)",
              border: "1px solid var(--app-border)",
            }}
            title={previewTheme === "light" ? t("preview.themeDark") : t("preview.themeLight")}
            aria-label={previewTheme === "light" ? t("preview.themeDark") : t("preview.themeLight")}
          >
            {previewTheme === "light" ? <Moon size={12} /> : <Sun size={12} />}
          </button>
        )}

        {/* Native dark badge */}
        {nativeDark && (
          <span
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium"
            style={{
              background: "rgba(99, 102, 241, 0.1)",
              color: "#818cf8",
              border: "1px solid rgba(99, 102, 241, 0.2)",
            }}
            title={t("preview.nativeDark")}
          >
            <Moon size={10} />
            Dark
          </span>
        )}

        {/* Refresh button */}
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="p-1 rounded hover:bg-opacity-80 transition-colors"
          style={{ color: "var(--app-text-muted)" }}
          title={t("preview.refresh")}
          aria-label={t("preview.refresh")}
        >
          <RefreshCw size={12} />
        </button>

        <div className="flex items-center gap-1" style={{ color: "var(--app-text-dim)" }}>
          <Monitor size={12} />
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex items-center gap-0 px-2 border-b"
        style={{ borderColor: "var(--app-border)", background: "var(--app-surface)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-3 py-2 text-xs font-medium transition-colors relative"
            style={{
              color: activeTab === tab.key ? "var(--app-text)" : "var(--app-text-muted)",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key)
                e.currentTarget.style.color = "var(--app-text)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key)
                e.currentTarget.style.color = "var(--app-text-muted)";
            }}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: "var(--app-accent)" }}
              />
            )}
          </button>
        ))}

        {/* Style name badge */}
        <div className="ml-auto pr-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{
              background: "var(--app-surface-hover)",
              color: "var(--app-text-muted)",
            }}
          >
            {selectedStyle.name}
          </span>
        </div>
      </div>

      {/* Animation mismatch warning */}
      {animationMismatch && (
        <div
          className="px-3 py-1.5 text-[10px] text-center"
          style={{
            background: "rgba(245, 158, 11, 0.1)",
            color: "#f59e0b",
            borderBottom: "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          {animationMismatch}
        </div>
      )}

      {/* Preview iframe + animation info overlay */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{ background: effectiveTheme === "dark" ? "#0a0a0b" : "#fff" }}
      >
        <iframe
          ref={iframeRef}
          key={`${selectedStyleId}-${activeTab}-${selectedAnimationId}-${lang}-${effectiveTheme}-${refreshKey}`}
          srcDoc={iframeContent}
          title={t("preview.iframeTitle")}
          sandbox="allow-scripts"
          className="w-full h-full border-0"
          style={{ pointerEvents: "auto" }}
        />

        {/* Animation info floating card */}
        {selectedAnimation &&
          animationAppliesToTab &&
          !animInfoDismissed && (
            <div
              className="absolute bottom-3 left-3 z-10 flex items-start gap-2.5 px-3 py-2.5 rounded-lg shadow-lg text-[11px] leading-relaxed max-w-[420px]"
              style={{
                background: "var(--app-surface)",
                border: "1px solid var(--app-border)",
                color: "var(--app-text)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                className="flex items-center justify-center w-5 h-5 rounded flex-shrink-0 mt-0.5"
                style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}
              >
                <Zap size={11} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold mb-1">
                  {t(`anim.${selectedAnimation.id}.name` as DictKey)}
                </div>
                <div className="flex items-start gap-1.5 mb-0.5">
                  <MapPin
                    size={11}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: "var(--app-text-muted)" }}
                  />
                  <span>
                    <span style={{ color: "var(--app-text-muted)" }}>
                      {t("preview.animInfo.position")}:
                    </span>{" "}
                    {t(`anim.${selectedAnimation.id}.position` as DictKey)}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Sparkles
                    size={11}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: "var(--app-text-muted)" }}
                  />
                  <span>
                    <span style={{ color: "var(--app-text-muted)" }}>
                      {t("preview.animInfo.effect")}:
                    </span>{" "}
                    {t(`anim.${selectedAnimation.id}.effect` as DictKey)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAnimInfoDismissed(true)}
                className="flex-shrink-0 p-0.5 rounded transition-colors"
                style={{ color: "var(--app-text-muted)" }}
                title={t("preview.animInfo.dismiss")}
                aria-label={t("preview.animInfo.dismiss")}
              >
                <X size={12} />
              </button>
            </div>
          )}
      </div>
    </div>
  );
}
