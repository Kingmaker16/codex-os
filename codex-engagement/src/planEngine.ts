import { EngagementRequest, EngagementResponse, EngagementPlan, EngagementMove } from "./types.js";
import { v4 as uuid } from "uuid";
import fetch from "node-fetch";

const BRIDGE_URL = "http://localhost:4000/respond?provider=openai&model=gpt-4o";

export async function buildEngagementPlan(req: EngagementRequest): Promise<EngagementResponse> {
  const { context, comments } = req;

  const topComments = comments.slice(0, 5).map(c => `- (${c.sentiment}) [${c.likes}❤ / ${c.replies}💬] ${c.text}`).join("\n");

  const prompt = `
You are an expert social media engagement strategist.

Niche: ${context.niche}
Platform: ${context.platform}
Risk tier: ${context.riskTier}
Content type: ${context.contentType}

Recent top comments:
${topComments || "No comments yet."}

Design a short, tactical engagement plan for the next 24 hours to:
- Boost comment activity safely
- Encourage conversation
- Strengthen community
- Avoid spammy behavior
- Respect platform rules

Respond as JSON with:
{
  "strategy": "high level description",
  "moves": [
    {
      "type": "REPLY" | "ASK_QUESTION" | "PIN_COMMENT" | "CTA" | "THANK_YOU",
      "template": "text to use with placeholders",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "riskTierAllowed": ["SAFE","MEDIUM","EXPERIMENT"]
    }
  ]
}
`;

  const resp = await fetch(BRIDGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: "You only output raw JSON. No commentary, no markdown." },
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await resp.json() as any;
  let parsed: any;

  try {
    parsed = JSON.parse(data.output);
  } catch {
    // fallback basic plan if model output isn't JSON
    const fallbackPlan: EngagementPlan = {
      id: uuid(),
      strategy: "Basic thank-you replies and a pinned CTA comment.",
      moves: [
        {
          id: uuid(),
          type: "THANK_YOU",
          template: "Thank you so much for watching 🙏 What was your favorite part?",
          priority: "HIGH",
          riskTierAllowed: ["SAFE","MEDIUM","EXPERIMENT"]
        },
        {
          id: uuid(),
          type: "ASK_QUESTION",
          template: "If you could change one thing about this topic, what would it be?",
          priority: "MEDIUM",
          riskTierAllowed: ["SAFE","MEDIUM"]
        }
      ]
    };
    return { ok: true, plan: fallbackPlan };
  }

  const moves: EngagementMove[] = (parsed.moves || []).map((m: any) => ({
    id: uuid(),
    type: m.type,
    template: m.template,
    priority: m.priority,
    riskTierAllowed: m.riskTierAllowed || ["SAFE","MEDIUM","EXPERIMENT"]
  }));

  const plan: EngagementPlan = {
    id: uuid(),
    strategy: parsed.strategy || "Engagement plan generated.",
    moves
  };

  return { ok: true, plan };
}
