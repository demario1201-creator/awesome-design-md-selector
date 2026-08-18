"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { callDeepSeek } from "@/lib/deepseek";
import { loadStyleRaw } from "@/lib/designMd";
import { useT } from "@/lib/i18n";
import { Key, Loader2, Sparkles, AlertCircle, CheckCircle, Copy } from "lucide-react";

export default function AIPanel() {
  const {
    styles,
    selectedStyleId,
    apiKey,
    customIdea,
    aiStatus,
    aiError,
    aiResult,
    setApiKey,
    setCustomIdea,
    setAIStatus,
    setAIResult,
  } = useStore();
  const t = useT();

  const [showResult, setShowResult] = useState(false);

  const selectedStyle = styles.find((s) => s.id === selectedStyleId);

  const handlePolish = async () => {
    if (!apiKey.trim()) {
      setAIStatus("error", t("ai.needKey"));
      return;
    }
    if (!selectedStyle) return;

    setAIStatus("loading");
    setShowResult(false);

    try {
      const raw = await loadStyleRaw(selectedStyle.id);
      const result = await callDeepSeek(apiKey, raw, customIdea);
      setAIResult(result);
      setAIStatus("success");
      setShowResult(true);
    } catch (err) {
      setAIStatus("error", err instanceof Error ? err.message : t("ai.unknownError"));
    }
  };

  const handleCopyResult = () => {
    if (aiResult?.rawText) {
      navigator.clipboard.writeText(aiResult.rawText);
    }
  };

  return (
    <div
      className="border-t flex flex-col"
      style={{
        borderColor: "var(--app-border)",
        background: "var(--app-surface)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-1.5 px-3 py-2 border-b"
        style={{ borderColor: "var(--app-border)" }}
      >
        <Sparkles size={12} style={{ color: "var(--app-accent)" }} />
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--app-text-dim)" }}
        >
          {t("ai.title")}
        </span>
      </div>

      <div className="p-3 space-y-2">
        {/* API Key input */}
        <div>
          <label
            className="text-[10px] font-medium block mb-1"
            style={{ color: "var(--app-text-muted)" }}
          >
            {t("ai.apiKeyLabel")}
          </label>
          <div className="relative">
            <Key
              size={12}
              className="absolute left-2 top-1/2 -translate-y-1/2"
              style={{ color: "var(--app-text-dim)" }}
            />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full pl-7 pr-3 py-1.5 text-xs rounded-md border outline-none"
              style={{
                background: "var(--app-bg)",
                borderColor: "var(--app-border)",
                color: "var(--app-text)",
              }}
              aria-label={t("ai.apiKeyAria")}
            />
          </div>
        </div>

        {/* Custom idea textarea */}
        <div>
          <label
            className="text-[10px] font-medium block mb-1"
            style={{ color: "var(--app-text-muted)" }}
          >
            {t("ai.customIdea")}
          </label>
          <textarea
            value={customIdea}
            onChange={(e) => setCustomIdea(e.target.value)}
            placeholder={t("ai.customIdeaPh")}
            rows={2}
            className="w-full px-2.5 py-1.5 text-xs rounded-md border outline-none resize-none"
            style={{
              background: "var(--app-bg)",
              borderColor: "var(--app-border)",
              color: "var(--app-text)",
            }}
            aria-label={t("ai.customIdeaAria")}
          />
        </div>

        {/* Polish button */}
        <button
          onClick={handlePolish}
          disabled={aiStatus === "loading" || !apiKey.trim()}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "var(--app-accent)",
            color: "#fff",
          }}
        >
          {aiStatus === "loading" ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              {t("ai.polishing")}
            </>
          ) : (
            <>
              <Sparkles size={12} />
              {t("ai.polish")}
            </>
          )}
        </button>

        {/* Error state */}
        {aiStatus === "error" && aiError && (
          <div
            className="flex items-start gap-1.5 p-2 rounded-md text-[11px]"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
            }}
          >
            <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
            <span>{aiError}</span>
          </div>
        )}

        {/* Success state */}
        {aiStatus === "success" && aiResult && (
          <div
            className="flex items-center gap-1.5 p-2 rounded-md text-[11px]"
            style={{
              background: "rgba(34, 197, 94, 0.1)",
              color: "#22c55e",
            }}
          >
            <CheckCircle size={12} />
            <span>{t("ai.success")}</span>
          </div>
        )}

        {/* Result preview */}
        {aiStatus === "success" && aiResult && showResult && (
          <div
            className="border rounded-md p-2 max-h-32 overflow-y-auto"
            style={{
              borderColor: "var(--app-border)",
              background: "var(--app-bg)",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-[10px] font-medium"
                style={{ color: "var(--app-text-muted)" }}
              >
                {t("ai.preview")}
              </span>
              <button
                onClick={handleCopyResult}
                className="text-[10px] flex items-center gap-1 transition-colors"
                style={{ color: "var(--app-text-muted)" }}
              >
                <Copy size={10} />
                {t("ai.copy")}
              </button>
            </div>
            <pre
              className="text-[10px] whitespace-pre-wrap break-all"
              style={{ color: "var(--app-text-muted)" }}
            >
              {aiResult.rawText.slice(0, 500)}
              {aiResult.rawText.length > 500 && "..."}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
