/**
 * Knowledge Engine v2.5 - Research Controller
 * 
 * Master pipeline orchestrating the full research flow
 */

import type { ResearchRequest, ResearchResult, KnowledgeBlock } from "./types.js";
import { ingestWeb } from "./webIngest.js";
import { ingestPDF } from "./pdfIngest.js";
import { ingestYouTube } from "./youtubeIngest.js";
import { ingestAudio } from "./audioIngest.js";
import { ingestScreenshot } from "./screenshotIngest.js";
import { classifyDomain } from "./classifier.js";
import { extractKeywords } from "./extractor.js";
import { summarizeContent } from "./summaryEngine.js";
import { extractSkills } from "./skillExtraction.js";
import { saveKnowledge, saveSkill } from "./domainKernels.js";
import { linkKnowledgeBlocks } from "./knowledgeGraph.js";
import { logResearch } from "./brainLogger.js";
import { runFusion } from "./fusionEngine.js";

export async function runResearch(request: ResearchRequest): Promise<ResearchResult> {
  console.log(`[ResearchController] Starting research: "${request.query}"`);
  const startTime = Date.now();

  try {
    // Step 1: Ingest content from sources
    const contents = [];
    if (request.sources && request.sources.length > 0) {
      for (const source of request.sources) {
        try {
          const content = await ingestFromSource(source);
          contents.push(content);
        } catch (error: any) {
          console.warn(`[ResearchController] Failed to ingest ${source}:`, error.message);
        }
      }
    }

    // Step 2: If no sources, use query-based research
    if (contents.length === 0) {
      const queryContent = await researchFromQuery(request.query);
      contents.push(queryContent);
    }

    // Step 3: Classify domain
    const combinedContent = contents.map(c => c.rawContent).join("\n\n");
    const classification = await classifyDomain(combinedContent, request.domain);
    const domain = classification.domain;

    console.log(`[ResearchController] Classified as domain: ${domain}`);

    // Step 4: Process each content chunk
    const knowledgeBlocks: KnowledgeBlock[] = [];

    for (const content of contents) {
      for (const chunk of content.chunks) {
        const keywords = extractKeywords(chunk.content);
        const summary = await summarizeContent(chunk.content, "short");

        const block: KnowledgeBlock = {
          id: `${domain}-${Date.now()}-${chunk.index}`,
          domain,
          content: chunk.content,
          summary,
          keywords,
          relations: [],
          confidence: 0.8,
          source: content.source,
          timestamp: new Date().toISOString()
        };

        knowledgeBlocks.push(block);
        await saveKnowledge(domain, block);
      }
    }

    // Step 5: Link knowledge blocks
    linkKnowledgeBlocks(knowledgeBlocks);

    // Step 6: Extract skills
    const skills = [];
    for (const content of contents) {
      const extractedSkills = await extractSkills(content.rawContent, domain);
      skills.push(...extractedSkills);
      
      for (const skill of extractedSkills) {
        await saveSkill(domain, skill);
      }
    }

    // Step 7: Generate overall summary
    const overallSummary = await summarizeContent(combinedContent, "medium");

    // Step 8: Calculate confidence
    const avgConfidence = knowledgeBlocks.reduce((sum, b) => sum + b.confidence, 0) / knowledgeBlocks.length;

    const result: ResearchResult = {
      success: true,
      query: request.query,
      domain,
      knowledge: knowledgeBlocks,
      summary: overallSummary,
      skills,
      confidence: avgConfidence,
      sources: request.sources || ["query-based"],
      timestamp: new Date().toISOString()
    };

    // Step 9: Log to Brain
    await logResearch(request.query, result);

    const elapsed = Date.now() - startTime;
    console.log(`[ResearchController] Research complete in ${elapsed}ms: ${knowledgeBlocks.length} blocks, ${skills.length} skills`);

    return result;

  } catch (error: any) {
    console.error(`[ResearchController] Research failed:`, error);
    return {
      success: false,
      query: request.query,
      domain: request.domain || "generic",
      knowledge: [],
      summary: `Research failed: ${error.message}`,
      skills: [],
      confidence: 0,
      sources: request.sources || [],
      timestamp: new Date().toISOString()
    };
  }
}

async function ingestFromSource(source: string): Promise<any> {
  if (source.startsWith("http://") || source.startsWith("https://")) {
    if (source.includes("youtube.com") || source.includes("youtu.be")) {
      return await ingestYouTube(source);
    } else {
      return await ingestWeb(source);
    }
  } else if (source.endsWith(".pdf")) {
    return await ingestPDF(source);
  } else if (source.endsWith(".mp3") || source.endsWith(".wav") || source.endsWith(".m4a")) {
    return await ingestAudio(source);
  } else {
    throw new Error(`Unsupported source format: ${source}`);
  }
}

async function researchFromQuery(query: string): Promise<any> {
  console.log(`[ResearchController] Generating research from query`);

  const prompt = `Research and provide comprehensive information about: ${query}

Include:
- Key concepts and definitions
- Important facts and data
- Practical applications
- Best practices and guidelines
- Common pitfalls to avoid

Provide detailed, actionable information.`;

  const fusion = await runFusion({ prompt });

  return {
    type: "query",
    source: "ai-research",
    rawContent: fusion.result,
    chunks: [{ id: "query-0", content: fusion.result, index: 0, tokens: fusion.result.length / 4 }],
    metadata: { query, confidence: fusion.confidence }
  };
}
