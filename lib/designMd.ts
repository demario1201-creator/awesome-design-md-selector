// On-demand loader for raw DESIGN.md content.
// Raw files are NOT inlined into styles.json (bundle size) — the build
// script writes them to public/design-md/<id>.md, which is served at
// /design-md/<id>.md and fetched lazily for export / AI polish.

const cache = new Map<string, string>();

/**
 * Load the full DESIGN.md markdown for a style id.
 * Results are cached in memory to avoid repeated network fetches.
 */
export async function loadStyleRaw(id: string): Promise<string> {
  const cached = cache.get(id);
  if (cached !== undefined) return cached;

  const res = await fetch(`design-md/${encodeURIComponent(id)}.md`);
  if (!res.ok) {
    throw new Error(`Failed to load DESIGN.md for "${id}" (HTTP ${res.status})`);
  }

  const text = await res.text();
  cache.set(id, text);
  return text;
}
