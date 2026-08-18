"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useStore } from "@/lib/store";
import { downloadFile, validateAIOutput } from "@/lib/deepseek";
import { loadStyleRaw } from "@/lib/designMd";
import { useT } from "@/lib/i18n";
import {
  Download,
  FileText,
  Sparkles,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";

type PreviewSource = "original" | "ai";

export default function ExportButton() {
  const { styles, selectedStyleId, aiStatus, aiResult } = useStore();
  const t = useT();
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedStyle = styles.find((s) => s.id === selectedStyleId);
  const hasAIResult = aiStatus === "success" && aiResult !== null;

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSource, setPreviewSource] = useState<PreviewSource>("original");
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const loadPreview = async (source: PreviewSource) => {
    if (!selectedStyle) return;
    if (source === "ai") {
      setPreviewContent(aiResult?.rawText ?? "");
      setPreviewError(null);
      return;
    }
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const raw = await loadStyleRaw(selectedStyle.id);
      setPreviewContent(raw);
    } catch (err) {
      setPreviewError(
        err instanceof Error ? err.message : "Failed to load DESIGN.md"
      );
      setPreviewContent(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const openPreview = (source: PreviewSource = "original") => {
    setPreviewSource(source);
    setPreviewOpen(true);
    loadPreview(source);
  };

  const switchSource = (source: PreviewSource) => {
    setPreviewSource(source);
    loadPreview(source);
  };

  // Close modal on Escape
  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewOpen]);

  const handleExportOriginal = async () => {
    if (!selectedStyle || loading) return;
    setLoading(true);
    setValidationWarning(null);
    try {
      const raw = await loadStyleRaw(selectedStyle.id);
      downloadFile(raw, `DESIGN-${selectedStyle.id}.md`);
    } catch (err) {
      setValidationWarning(
        err instanceof Error ? err.message : "Failed to load DESIGN.md"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportAI = () => {
    if (!selectedStyle || !aiResult) return;

    const validation = validateAIOutput(aiResult.rawText);
    if (!validation.valid) {
      setValidationWarning(
        t("export.validation", { issues: validation.issues.join(", ") })
      );
    } else {
      setValidationWarning(null);
    }

    downloadFile(aiResult.rawText, `DESIGN-${selectedStyle.id}-ai.md`);
  };

  const handleDownloadFromPreview = () => {
    if (!selectedStyle) return;
    if (previewSource === "ai") handleExportAI();
    else handleExportOriginal();
    setPreviewOpen(false);
  };

  if (!selectedStyle) return null;

  const previewFilename =
    previewSource === "ai"
      ? `DESIGN-${selectedStyle.id}-ai.md`
      : `DESIGN-${selectedStyle.id}.md`;

  const closeModal = () => setPreviewOpen(false);

  return (
    <div className="flex flex-col gap-1.5">
      {/* Validation warning */}
      {validationWarning && (
        <div
          className="flex items-start gap-1.5 p-1.5 rounded text-[10px]"
          style={{
            background: "rgba(245, 158, 11, 0.1)",
            color: "#f59e0b",
          }}
        >
          <AlertCircle size={10} className="flex-shrink-0 mt-0.5" />
          <span>{validationWarning}</span>
        </div>
      )}

      <div className="flex gap-1.5">
        {/* Preview */}
        <button
          onClick={() => openPreview("original")}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors"
          style={{
            background: "var(--app-surface-hover)",
            color: "var(--app-text)",
            border: "1px solid var(--app-border)",
          }}
          title={t("export.preview")}
        >
          <Eye size={12} />
          {t("export.preview")}
        </button>

        {/* Export original */}
        <button
          onClick={handleExportOriginal}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors"
          style={{
            background: "var(--app-surface-hover)",
            color: "var(--app-text)",
            border: "1px solid var(--app-border)",
          }}
          title={`DESIGN-${selectedStyle.id}.md`}
        >
          <Download size={12} />
          {loading ? t("export.loading") : t("export.export")}
        </button>

        {/* Export AI (only if AI result exists) */}
        {hasAIResult && (
          <button
            onClick={handleExportAI}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{
              background: "var(--app-accent)",
              color: "#fff",
            }}
            title={`DESIGN-${selectedStyle.id}-ai.md`}
          >
            <Sparkles size={12} />
            {t("export.exportAI")}
          </button>
        )}
      </div>

      {/* File info */}
      <div
        className="flex items-center gap-1 text-[9px]"
        style={{ color: "var(--app-text-dim)" }}
      >
        <FileText size={9} />
        <span>
          {hasAIResult
            ? `DESIGN-${selectedStyle.id}-ai.md`
            : `DESIGN-${selectedStyle.id}.md`}
        </span>
      </div>

      {/* Preview modal */}
      {previewOpen &&
        createPortal(
          <div
            onClick={closeModal}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--app-surface)",
                border: "1px solid var(--app-border)",
                borderRadius: "8px",
                width: "100%",
                maxWidth: "640px",
                maxHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center gap-2 px-3 py-2.5"
                style={{ borderBottom: "1px solid var(--app-border)" }}
              >
                <FileText size={14} style={{ color: "var(--app-accent)" }} />
                <span
                  className="text-xs font-semibold truncate"
                  style={{
                    color: "var(--app-text)",
                    flex: 1,
                    minWidth: 0,
                  }}
                  title={previewFilename}
                >
                  {previewFilename}
                </span>
                <button
                  onClick={closeModal}
                  aria-label="关闭"
                  className="flex-shrink-0 p-1 rounded transition-colors"
                  style={{ color: "var(--app-text-dim)" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Source toggle (only when AI result exists) */}
              {hasAIResult && (
                <div
                  className="flex gap-1 px-3 py-2"
                  style={{ borderBottom: "1px solid var(--app-border)" }}
                >
                  {(
                    [
                      ["original", t("export.previewOriginal")],
                      ["ai", t("export.previewAI")],
                    ] as [PreviewSource, string][]
                  ).map(([src, label]) => {
                    const active = previewSource === src;
                    return (
                      <button
                        key={src}
                        onClick={() => switchSource(src)}
                        className="px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                        style={{
                          background: active
                            ? "var(--app-accent)"
                            : "var(--app-bg)",
                          color: active ? "#fff" : "var(--app-text-muted)",
                          border: "1px solid var(--app-border)",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Body */}
              <div
                className="flex-1 overflow-y-auto p-3"
                style={{ background: "var(--app-bg)" }}
              >
                {previewLoading && (
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--app-text-muted)" }}
                  >
                    {t("export.previewLoading")}
                  </div>
                )}
                {previewError && (
                  <div
                    className="text-[11px]"
                    style={{ color: "#ef4444" }}
                  >
                    {t("export.previewError", { msg: previewError })}
                  </div>
                )}
                {!previewLoading &&
                  !previewError &&
                  previewContent !== null && (
                    <pre
                      className="whitespace-pre-wrap break-words"
                      style={{
                        margin: 0,
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                        fontSize: "11px",
                        lineHeight: 1.6,
                        color: "var(--app-text)",
                      }}
                    >
                      {previewContent}
                    </pre>
                  )}
              </div>

              {/* Footer */}
              <div
                className="flex justify-end px-3 py-2.5"
                style={{ borderTop: "1px solid var(--app-border)" }}
              >
                <button
                  onClick={handleDownloadFromPreview}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                  style={{
                    background: "var(--app-accent)",
                    color: "#fff",
                  }}
                >
                  <Download size={12} />
                  {t("export.previewDownload")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
