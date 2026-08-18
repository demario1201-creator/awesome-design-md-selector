// On-demand loader for raw DESIGN.md content (export + AI polish only).
// Raw content is split out of styles.json into public/design-md/<id>.md
// to keep the initial bundle small. Loaded via fetch with in-memory cache.

const cache = new Map<string, Promise<string>>();

export function loadDesignMd(id: string): Promise<string> {
  const key = encodeURIComponent(id);
  if (!cache.has(key)) {
    const promise = fetch(`design-md/${key}.md`).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    });
    cache.set(key, promise);
    // Drop failed promises from cache so retry works
    promise.catch(() => cache.delete(key));
  }
  return cache.get(key)!;
}
