/**
 * Knowledge Engine v2.5 - Summary Engine
 * 
 * Model-based content summarization
 */

import { runFusion } from "./fusionEngine.js";

export async function summarizeContent(content: string, targetLength: "short" | "medium" | "long" = "medium"): Promise<string> {
  const lengthGuide = {
    short: "2-3 sentences",
    medium: "1 paragraph (4-6 sentences)",
    long: "2-3 paragraphs"
  };

  const prompt = `Summarize the following content in ${lengthGuide[targetLength]}. Focus on key insights, actionable information, and main concepts.

Content:
${content}

Summary:`;

  const fusion = await runFusion({ prompt });
  return fusion.result;
}

export async function extractInsights(content: string): Promise<string[]> {
  const prompt = `Extract 3-5 key insights from the following content. Each insight should be a complete, actionable statement.

Content:
${content}

List each insight on a new line starting with "-".`;

  const fusion = await runFusion({ prompt });
  
  const insights = fusion.result
    .split("\n")
    .filter(line => line.trim().startsWith("-"))
    .map(line => line.trim().substring(1).trim());

  return insights;
}
