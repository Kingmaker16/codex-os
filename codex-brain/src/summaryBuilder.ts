export function buildSummary(events: Array<Record<string, any>>) {
  // Very small, extractive summary:
  // - take the last N textual turns and join them
  // - return a short summary by truncating and listing speakers
  const last = events.slice(0, 20).reverse(); // oldest -> newest
  const snippets = last
    .filter(e => typeof e.text === "string" && e.text.trim())
    .map(e => `${e.role ?? "?"}: ${e.text.trim()}`);

  const joined = snippets.join(" \n");
  const summary = joined.length > 400 ? joined.slice(0, 400) + "…" : joined;

  return {
    summary,
    count: snippets.length,
    recent: snippets.slice(-5)
  };
}
