// Codex Voice OS v2 - Intent Parser

export type IntentType = "COMMAND" | "QUERY" | "FOLLOWUP" | "DELEGATION" | "OBSERVATION";

export interface ParsedIntent {
  type: IntentType;
  confidence: number;
  entities: string[];
  raw: string;
}

/**
 * Parse user text into intent categories:
 * - COMMAND: Direct action requests (e.g., "open TikTok", "send email")
 * - QUERY: Information requests (e.g., "what is...", "how do I...")
 * - FOLLOWUP: Contextual follow-ups (e.g., "tell me more", "what about X")
 * - DELEGATION: Task handoffs (e.g., "handle this", "you decide")
 * - OBSERVATION: Statements/observations (e.g., "it's raining", "I'm tired")
 */
export function parseIntent(text: string): ParsedIntent {
  const normalized = text.toLowerCase().trim();

  // COMMAND patterns
  if (isCommand(normalized)) {
    return {
      type: "COMMAND",
      confidence: 0.9,
      entities: extractEntities(normalized),
      raw: text,
    };
  }

  // QUERY patterns
  if (isQuery(normalized)) {
    return {
      type: "QUERY",
      confidence: 0.85,
      entities: extractEntities(normalized),
      raw: text,
    };
  }

  // FOLLOWUP patterns
  if (isFollowup(normalized)) {
    return {
      type: "FOLLOWUP",
      confidence: 0.8,
      entities: extractEntities(normalized),
      raw: text,
    };
  }

  // DELEGATION patterns
  if (isDelegation(normalized)) {
    return {
      type: "DELEGATION",
      confidence: 0.75,
      entities: extractEntities(normalized),
      raw: text,
    };
  }

  // Default to OBSERVATION
  return {
    type: "OBSERVATION",
    confidence: 0.6,
    entities: extractEntities(normalized),
    raw: text,
  };
}

/**
 * Detect COMMAND intent
 */
function isCommand(text: string): boolean {
  const commandPrefixes = [
    "open",
    "close",
    "launch",
    "start",
    "stop",
    "run",
    "execute",
    "send",
    "create",
    "delete",
    "update",
    "play",
    "pause",
    "resume",
    "cancel",
    "search for",
    "find",
    "show me",
    "go to",
    "navigate to",
  ];

  return commandPrefixes.some((prefix) => text.startsWith(prefix));
}

/**
 * Detect QUERY intent
 */
function isQuery(text: string): boolean {
  const queryPrefixes = [
    "what",
    "when",
    "where",
    "who",
    "why",
    "how",
    "which",
    "is it",
    "are there",
    "can you",
    "do you",
    "tell me",
    "explain",
    "describe",
  ];

  return queryPrefixes.some((prefix) => text.startsWith(prefix));
}

/**
 * Detect FOLLOWUP intent
 */
function isFollowup(text: string): boolean {
  const followupPhrases = [
    "tell me more",
    "what about",
    "and then",
    "also",
    "continue",
    "next",
    "another",
    "more",
    "else",
    "that one",
    "this one",
    "go on",
  ];

  return followupPhrases.some((phrase) => text.includes(phrase));
}

/**
 * Detect DELEGATION intent
 */
function isDelegation(text: string): boolean {
  const delegationPhrases = [
    "handle this",
    "take care of",
    "you decide",
    "figure it out",
    "do what's best",
    "up to you",
    "whatever works",
    "make it happen",
    "deal with it",
  ];

  return delegationPhrases.some((phrase) => text.includes(phrase));
}

/**
 * Extract named entities (basic implementation)
 * In production, use NER model or LLM-based extraction
 */
function extractEntities(text: string): string[] {
  const entities: string[] = [];

  // Extract capitalized words (potential proper nouns)
  const words = text.split(/\s+/);
  for (const word of words) {
    if (word.length > 1 && /^[A-Z]/.test(word)) {
      entities.push(word);
    }
  }

  // Extract app names
  const appNames = ["tiktok", "youtube", "instagram", "gmail", "slack", "notion"];
  for (const app of appNames) {
    if (text.toLowerCase().includes(app)) {
      entities.push(app);
    }
  }

  return [...new Set(entities)]; // Remove duplicates
}
