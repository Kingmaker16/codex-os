// brandVoice.ts - Brand Voice Enforcement Engine

import type { BrandVoiceCheck, BrandViolation } from "./types.js";

// Amar's Brand Voice Profile
const AMAR_BRAND_VOICE = {
  tone: "direct, confident, no-BS, energetic",
  language: "casual but professional, uses 'you' frequently",
  style: "short punchy sentences, actionable advice, results-focused",
  prohibited: [
    "corporate jargon",
    "passive voice",
    "vague promises",
    "clickbait without value",
  ],
  preferred: [
    "straight to the point",
    "data-backed claims",
    "specific numbers",
    "clear actionable steps",
  ],
  examples: [
    "Here's exactly how to 10x your TikTok reach in 30 days.",
    "Stop wasting time on vanity metrics. Focus on these 3 KPIs instead.",
    "I tested 47 different hooks. These 5 got me 10M+ views.",
  ],
};

export class BrandVoice {
  /**
   * Check if text aligns with Amar's brand voice
   */
  checkBrandVoice(text: string): BrandVoiceCheck {
    console.log("[BrandVoice] Checking brand voice alignment");

    const violations: BrandViolation[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Check for corporate jargon
    const jargon = this.detectCorporateJargon(text);
    if (jargon.length > 0) {
      violations.push({
        type: "language",
        severity: "high",
        description: `Corporate jargon detected: ${jargon.join(", ")}`,
        suggestion: "Use simple, direct language instead",
      });
      score -= 20;
    }

    // Check for passive voice
    const passiveCount = this.detectPassiveVoice(text);
    if (passiveCount > 2) {
      violations.push({
        type: "style",
        severity: "medium",
        description: `${passiveCount} instances of passive voice detected`,
        suggestion: "Use active voice for stronger impact",
      });
      score -= 15;
    }

    // Check for vague language
    const vagueTerms = this.detectVagueLanguage(text);
    if (vagueTerms.length > 0) {
      violations.push({
        type: "tone",
        severity: "medium",
        description: `Vague terms detected: ${vagueTerms.join(", ")}`,
        suggestion: "Use specific numbers and data instead",
      });
      score -= 10;
    }

    // Check sentence length
    const avgSentenceLength = this.calculateAverageSentenceLength(text);
    if (avgSentenceLength > 20) {
      violations.push({
        type: "structure",
        severity: "low",
        description: "Sentences are too long (avg ${avgSentenceLength} words)",
        suggestion: "Break into shorter, punchier sentences (10-15 words)",
      });
      score -= 10;
    }

    // Check for actionable content
    const hasActionable = this.hasActionableContent(text);
    if (!hasActionable) {
      violations.push({
        type: "tone",
        severity: "medium",
        description: "Content lacks clear actionable advice",
        suggestion: "Add specific steps or tactics",
      });
      score -= 15;
    }

    // Check for "you" usage (direct address)
    const youCount = (text.match(/\byou\b/gi) || []).length;
    const wordCount = text.split(/\s+/).length;
    const youRatio = youCount / wordCount;

    if (youRatio < 0.02) {
      // Less than 2% "you"
      violations.push({
        type: "tone",
        severity: "medium",
        description: "Not enough direct address to reader",
        suggestion: "Use 'you' more to create connection",
      });
      score -= 10;
    }

    // Generate aligned version if violations found
    let alignedVersion: string | undefined;
    if (violations.length > 0) {
      alignedVersion = this.alignToBrandVoice(text, violations);
      suggestions.push("See alignedVersion for brand-compliant alternative");
    }

    // Add positive suggestions
    if (score > 85) {
      suggestions.push("Strong brand voice alignment! Minor tweaks only.");
    } else if (score > 70) {
      suggestions.push("Good foundation, needs refinement for brand consistency");
    } else {
      suggestions.push("Significant rewrites needed to match brand voice");
    }

    return {
      originalText: text,
      score: Math.max(0, score),
      violations,
      suggestions,
      alignedVersion,
    };
  }

  /**
   * Detect corporate jargon
   */
  private detectCorporateJargon(text: string): string[] {
    const jargonPatterns = [
      /\bsynerg(y|ies|istic)\b/gi,
      /\bleverag(e|ing)\b/gi,
      /\bparadigm\b/gi,
      /\blow-hanging fruit\b/gi,
      /\bcircle back\b/gi,
      /\bmove the needle\b/gi,
      /\bthought leadership\b/gi,
      /\bbest practices\b/gi,
      /\btouch base\b/gi,
      /\bgoing forward\b/gi,
    ];

    const found: string[] = [];
    jargonPatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        found.push(...matches.map((m) => m.toLowerCase()));
      }
    });

    return [...new Set(found)];
  }

  /**
   * Detect passive voice
   */
  private detectPassiveVoice(text: string): number {
    const passivePatterns = [
      /\b(is|are|was|were|been|being)\s+\w+ed\b/gi,
      /\b(is|are|was|were)\s+(being|been)\s+\w+/gi,
    ];

    let count = 0;
    passivePatterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) count += matches.length;
    });

    return count;
  }

  /**
   * Detect vague language
   */
  private detectVagueLanguage(text: string): string[] {
    const vagueTerms = [
      /\bvery\b/gi,
      /\breally\b/gi,
      /\bsort of\b/gi,
      /\bkind of\b/gi,
      /\ba lot of\b/gi,
      /\bmany\b/gi,
      /\bseveral\b/gi,
      /\bsome\b/gi,
      /\boften\b/gi,
      /\busually\b/gi,
    ];

    const found: string[] = [];
    vagueTerms.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        found.push(...matches.map((m) => m.toLowerCase()));
      }
    });

    return [...new Set(found)];
  }

  /**
   * Calculate average sentence length
   */
  private calculateAverageSentenceLength(text: string): number {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    if (sentences.length === 0) return 0;

    const totalWords = sentences.reduce(
      (sum, sentence) => sum + sentence.trim().split(/\s+/).length,
      0
    );

    return Math.round(totalWords / sentences.length);
  }

  /**
   * Check if content has actionable advice
   */
  private hasActionableContent(text: string): boolean {
    const actionablePatterns = [
      /\b(do|try|use|start|stop|avoid|focus|test|implement|apply)\b/gi,
      /\bstep \d+/gi,
      /\bhere's (how|what|why)/gi,
      /\b\d+ (ways|tips|steps|tactics|strategies)\b/gi,
    ];

    return actionablePatterns.some((pattern) => pattern.test(text));
  }

  /**
   * Align text to brand voice
   */
  private alignToBrandVoice(text: string, violations: BrandViolation[]): string {
    let aligned = text;

    // Replace corporate jargon
    aligned = aligned
      .replace(/\bsynerg(y|ies|istic)\b/gi, "working together")
      .replace(/\bleverag(e|ing)\b/gi, "use")
      .replace(/\bparadigm\b/gi, "approach")
      .replace(/\blow-hanging fruit\b/gi, "easy wins")
      .replace(/\bcircle back\b/gi, "follow up")
      .replace(/\bmove the needle\b/gi, "get results");

    // Fix passive voice (simplified)
    aligned = aligned.replace(
      /\b(is|are|was|were)\s+(\w+ed)\b/gi,
      (match) => match.replace(/\b(is|are|was|were)\s+/, "")
    );

    // Remove vague qualifiers
    aligned = aligned
      .replace(/\bvery\s+/gi, "")
      .replace(/\breally\s+/gi, "")
      .replace(/\bsort of\s+/gi, "")
      .replace(/\bkind of\s+/gi, "");

    // Make more direct
    if ((aligned.match(/\byou\b/gi) || []).length < 2) {
      aligned = `You need to know this: ${aligned}`;
    }

    return aligned;
  }

  /**
   * Get brand voice examples for reference
   */
  getBrandVoiceExamples(): string[] {
    return AMAR_BRAND_VOICE.examples;
  }

  /**
   * Get brand voice guidelines
   */
  getBrandVoiceGuidelines(): {
    tone: string;
    language: string;
    style: string;
    prohibited: string[];
    preferred: string[];
  } {
    return AMAR_BRAND_VOICE;
  }

  /**
   * Generate brand-aligned caption variations
   */
  generateBrandAlignedCaptions(topic: string, platform: string, count: number = 3): string[] {
    const templates = [
      `Here's exactly how to ${topic}. (No fluff)`,
      `I tested ${topic} for 30 days. Here's what worked.`,
      `Stop doing ${topic} wrong. Do this instead. 👇`,
      `${topic}: The strategy nobody talks about.`,
      `Your ${topic} playbook: 5 steps that actually work.`,
      `I spent $10K learning ${topic}. These are the only 3 things that matter.`,
      `${topic} in 2024: What works vs what's dead.`,
      `The ${topic} formula that got me [specific result].`,
    ];

    return templates.slice(0, count).map((t) => t.replace(/\$\{topic\}/g, topic));
  }

  /**
   * Score caption for brand voice strength
   */
  scoreCaptionForBrand(caption: string): {
    score: number;
    strengths: string[];
    weaknesses: string[];
  } {
    const check = this.checkBrandVoice(caption);

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (check.score >= 90) strengths.push("Excellent brand voice alignment");
    if ((caption.match(/\byou\b/gi) || []).length >= 2)
      strengths.push("Strong direct address");
    if (/\d+/.test(caption)) strengths.push("Uses specific numbers");
    if (this.hasActionableContent(caption)) strengths.push("Actionable content");

    check.violations.forEach((v) => {
      weaknesses.push(v.description);
    });

    return {
      score: check.score,
      strengths,
      weaknesses,
    };
  }
}
