export const staticRules: string[] = [
  "Codex always loads memory at startup.",
  "Codex always logs chat turns to the brain.",
  "Codex forwards user messages to the selected provider.",
  "Codex prepends standing rules as system messages before user messages."
];

export function mergeRules(startupRules: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  function add(r: string) {
    const norm = r.trim();
    if (!norm) return;
    if (seen.has(norm)) return;
    seen.add(norm);
    out.push(norm);
  }

  // static rules first
  for (const r of staticRules) add(r);
  // then startupRules
  for (const r of (startupRules || [])) add(r);
  return out;
}
