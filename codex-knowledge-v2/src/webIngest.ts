/**
 * Knowledge Engine v2.5 - Web Ingestion
 */

import type { IngestedContent } from "./types.js";
import { chunkContent } from "./extractor.js";

export async function ingestWeb(url: string): Promise<IngestedContent> {
  console.log(`[WebIngest] Fetching ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();
  const rawContent = extractTextFromHTML(html);
  const chunks = chunkContent(rawContent);

  return {
    type: "web",
    source: url,
    rawContent,
    chunks,
    metadata: {
      url,
      contentType: response.headers.get("content-type"),
      fetchedAt: new Date().toISOString()
    }
  };
}

function extractTextFromHTML(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  
  // Clean whitespace
  text = text.replace(/\s+/g, " ").trim();
  
  return text;
}
