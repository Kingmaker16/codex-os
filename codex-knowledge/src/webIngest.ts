/**
 * Knowledge Engine v2 - Web Ingest
 * 
 * Ingests content from web pages.
 */

import type { IngestResult } from "./types.js";

/**
 * Ingest content from a web URL
 */
export async function ingestWeb(url: string): Promise<IngestResult> {
  try {
    // Use Hands service to scrape web content
    const response = await fetch("http://localhost:4300/hands/web/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "knowledge-ingest",
        url
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to open URL: HTTP ${response.status}`);
    }

    // For now, return basic success
    // In production, would extract page content
    return {
      success: true,
      content: `Content from ${url} (extraction pending - needs browser content API)`,
      metadata: {
        url,
        timestamp: new Date().toISOString()
      }
    };
  } catch (err: any) {
    return {
      success: false,
      content: "",
      metadata: { url },
      error: err.message
    };
  }
}
