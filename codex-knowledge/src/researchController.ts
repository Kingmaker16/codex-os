/**
 * Knowledge Engine v2 - Research Controller
 * 
 * Main orchestration logic for research pipeline:
 * Query → Classify → Ingest → Extract → Fusion → Summarize → Store
 */

import type { 
  ResearchRequest, 
  ResearchResult, 
  ConceptChunk, 
  ExtractedSkill, 
  FusionResponse,
  DomainClassification
} from "./types.js";

import { classifyDomain, determineDepth } from "./classifier.js";
import { extractChunks } from "./extractor.js";
import { runFusion, extractSkillsWithFusion, generateSummary } from "./fusionEngine.js";
import { writeToDomainKernel, writeSkill } from "./domainKernels.js";
import { ingestWeb } from "./webIngest.js";
import { ingestYoutube } from "./youtubeIngest.js";
import { ingestPdf, ingestAudio, ingestScreenshot } from "./otherIngest.js";
import { CONFIG } from "./config.js";

/**
 * Main research orchestration function
 */
export async function runResearch(request: ResearchRequest): Promise<ResearchResult> {
  const startTime = Date.now();
  
  console.log(`[Research] Starting research for query: "${request.query}"`);
  console.log(`[Research] Mode: ${CONFIG.mode} (explicit only: ${CONFIG.explicitOnly})`);

  try {
    // Step 1: Classify domain
    const classification = await classifyDomain(request.query);
    console.log(`[Research] Classified as domain: ${classification.domain} (confidence: ${classification.confidence})`);

    // Step 2: Determine research depth
    const depth = request.depth || determineDepth(request.query);
    console.log(`[Research] Research depth: ${depth}`);

    // Step 3: Ingest content (if source provided)
    let content = request.content || "";
    if (request.source) {
      console.log(`[Research] Ingesting content from source: ${request.source}`);
      const ingestResult = await ingestFromSource(request.source);
      if (ingestResult.success) {
        content = ingestResult.content;
        console.log(`[Research] Ingested ${content.length} characters`);
      } else {
        console.warn(`[Research] Ingest failed: ${ingestResult.error}`);
      }
    }

    // If no content, use fusion to research the query directly
    if (!content) {
      console.log(`[Research] No content provided, using AGI fusion to research query`);
      const fusionResult = await runFusion(
        `Research this question in depth: ${request.query}\n\nProvide comprehensive information, key insights, and actionable knowledge.`
      );
      content = fusionResult.result;
    }

    // Step 4: Extract conceptual chunks
    console.log(`[Research] Extracting chunks from content`);
    const chunks = extractChunks(content, request.query);
    console.log(`[Research] Extracted ${chunks.length} chunks`);

    // Step 5: Filter by relevance (keep top chunks based on depth)
    const maxChunks = depth === "shallow" ? 3 : depth === "medium" ? 6 : 10;
    const relevantChunks = chunks
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxChunks);
    console.log(`[Research] Keeping top ${relevantChunks.length} most relevant chunks`);

    // Step 6: Extract skills using multi-model fusion
    console.log(`[Research] Extracting skills via AGI fusion`);
    let skills: ExtractedSkill[] = [];
    if (classification.domain !== "unknown") {
      skills = await extractSkillsWithFusion(
        relevantChunks,
        request.query,
        classification.domain
      );
      console.log(`[Research] Extracted ${skills.length} skills`);
    }

    // Step 7: Generate summary
    console.log(`[Research] Generating summary via AGI fusion`);
    const summaryTexts = relevantChunks.map(c => c.text);
    const summary = await generateSummary(summaryTexts, request.query);

    // Step 8: Store in domain kernel (Brain)
    if (CONFIG.explicitOnly && classification.domain !== "unknown") {
      console.log(`[Research] C1 Mode: Storing research in domain kernel ${classification.domain}`);
      await writeToDomainKernel(classification.domain, {
        query: request.query,
        summary,
        skills: skills.length
      });

      // Store each skill individually
      for (const skill of skills) {
        await writeSkill(classification.domain, skill);
      }
    } else {
      console.log(`[Research] Skipping kernel storage (domain: ${classification.domain})`);
    }

    // Step 9: Return result
    const duration = Date.now() - startTime;
    console.log(`[Research] Research complete in ${duration}ms`);

    return {
      query: request.query,
      domain: classification.domain,
      summary,
      skills,
      chunks: relevantChunks.map(c => ({
        text: c.text,
        relevance: c.relevance,
        concepts: c.concepts
      })),
      confidence: classification.confidence,
      metadata: {
        depth,
        duration,
        chunkCount: chunks.length,
        skillCount: skills.length,
        source: request.source,
        mode: CONFIG.mode
      }
    };

  } catch (error: any) {
    console.error(`[Research] Error during research:`, error);
    throw new Error(`Research failed: ${error.message}`);
  }
}

/**
 * Ingest content from various source types
 */
async function ingestFromSource(source: string) {
  // Detect source type
  if (source.startsWith("http://") || source.startsWith("https://")) {
    if (source.includes("youtube.com") || source.includes("youtu.be")) {
      return await ingestYoutube(source);
    } else {
      return await ingestWeb(source);
    }
  } else if (source.endsWith(".pdf")) {
    return await ingestPdf(source);
  } else if (source.endsWith(".mp3") || source.endsWith(".wav") || source.endsWith(".m4a")) {
    return await ingestAudio(source);
  } else if (source.endsWith(".png") || source.endsWith(".jpg") || source.endsWith(".jpeg")) {
    return await ingestScreenshot(source);
  } else {
    return {
      success: false,
      content: "",
      metadata: { source },
      error: `Unsupported source type: ${source}`
    };
  }
}
