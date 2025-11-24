import axios from "axios";
import { FrameContext, UIState, EditAction, VisionV3Suggestion } from "./types.js";

const PROVIDERS = [
  { provider: "openai", model: "gpt-4o" },
  { provider: "claude", model: "claude-3-5-sonnet-20241022" },
  { provider: "gemini", model: "gemini-2.5-flash" },
  { provider: "grok", model: "grok-4-latest" }
];

async function callLLM(provider: string, model: string, payload: any): Promise<any> {
  const resp = await axios.post(
    `http://localhost:4000/respond?provider=${provider}&model=${model}`,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  return resp.data;
}

export async function fuseVision(frames: FrameContext[], uiStates: UIState[], actions: EditAction[]): Promise<VisionV3Suggestion> {
  const summaryPrompt = `
You are a senior video editor and UI cognition expert.
You are given a timeline with some proposed actions. Evaluate and refine them.

Frames info:
${frames.map(f => `- frameId=${f.frameId}, platform=${f.platform}, ts=${f.timestamp}`).join("\n")}

UI States:
${uiStates.map(s => `- frameId=${s.frameId}, inferredMode=${s.inferredMode}, elements=${s.elements.length}`).join("\n")}

Proposed Actions:
${actions.map(a => `- type=${a.type}, desc=${a.description}`).join("\n")}

Task:
1) Decide which actions are useful and why.
2) Suggest 1-3 additional improvements if needed.
3) Output JSON ONLY with:
{
  "rationale": "string",
  "actions": [
    { "type": "...", "description": "...", "params": { ... } }
  ]
}
`;

  const payload = {
    messages: [
      { role: "system", content: "You only output raw JSON. No commentary, no markdown." },
      { role: "user", content: summaryPrompt }
    ]
  };

  const results = await Promise.all(
    PROVIDERS.map(p => callLLM(p.provider, p.model, payload).catch(() => null))
  );

  const valid = results.filter(r => r && r.output);
  let fusedRationale = "Base rationale from initial heuristic.";
  const fusedActions: EditAction[] = [...actions];

  for (const r of valid) {
    try {
      const parsed = JSON.parse(r.output);
      if (parsed.rationale) fusedRationale = parsed.rationale;
      for (const act of parsed.actions || []) {
        fusedActions.push({
          id: `llm-${act.type}`,
          type: act.type,
          description: act.description,
          params: act.params
        });
      }
    } catch {
      // ignore bad JSON
    }
  }

  return {
    requiresApproval: true,
    frameSequence: frames.map(f => f.frameId),
    uiStates,
    actionsProposed: fusedActions,
    rationale: fusedRationale
  };
}
