import fetch from "node-fetch";
import { RepurposeRequest } from "./types.js";

const CREATIVE_URL = "http://localhost:5250/creative/analyze";
const VIDEO_URL = "http://localhost:4700/video/ugc";

export async function repurposeContent(req: RepurposeRequest): Promise<{ ok: boolean; details?: any }> {
  const analyze = await fetch(CREATIVE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentId: req.contentId,
      sourcePlatform: req.sourcePlatform
    })
  });

  const analysis = analyze.ok ? await analyze.json() : { hooks: [], scenes: [] };

  const outputs: any[] = [];

  for (const target of req.targetPlatforms) {
    const gen = await fetch(VIDEO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: `repurpose-${req.contentId}-${target}`,
        templateId: "problem-solution",
        productName: req.strategyHint || "Repurposed Content",
        aspectRatio: target === "youtube" ? "16:9" : "9:16"
      })
    });
    const genJson = gen.ok ? await gen.json() : {};
    outputs.push({ target, gen: genJson });
  }

  return {
    ok: true,
    details: {
      analysis,
      outputs
    }
  };
}
