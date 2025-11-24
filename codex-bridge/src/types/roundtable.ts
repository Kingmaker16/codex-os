/**
 * Codex Bridge v2 - Multi-LLM Roundtable Types
 * 
 * Coordinates multiple LLM providers in a collaborative "roundtable" pattern:
 * - GPT (Planner): Strategic planning and task decomposition
 * - Gemini (Researcher): Context gathering and analysis
 * - Claude (Coder): Implementation and code generation
 * - Grok (Critic): Review, validation, and risk assessment
 * - Qwen (Analyst): Data analysis, multilingual reasoning, e-commerce intelligence
 * - Judge: Synthesizes all inputs into final plan
 */

export type RoundtableMode = 'plan' | 'code' | 'debug' | 'review';

export interface RoundtableContext {
  repoSummary?: string;
  filesChanged?: string[];
  logs?: string;
  notes?: string;
}

export interface RoundtableParticipantResult {
  role: 'planner' | 'researcher' | 'coder' | 'critic' | 'analyst';
  provider: 'openai' | 'anthropic' | 'gemini' | 'grok' | 'qwen' | string;
  model: string;
  content: string;
  raw?: any;
  error?: string;
  timestamp?: string;
}

export interface TaskForCoder {
  id: string;
  file: string;
  instructions: string;
  patch?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface ParticipantConfig {
  provider: string;
  model: string;
}

export interface RoundtableRequest {
  sessionId: string;
  goal: string;
  mode: RoundtableMode;
  context?: RoundtableContext;
  participants?: {
    planner?: ParticipantConfig;
    researcher?: ParticipantConfig;
    coder?: ParticipantConfig;
    critic?: ParticipantConfig;
    analyst?: ParticipantConfig;
    judge?: ParticipantConfig;
  };
}

export interface RoundtableResponse {
  sessionId: string;
  goal: string;
  mode: RoundtableMode;
  finalPlan: string;
  tasksForCoder: TaskForCoder[];
  notesForDirector?: string;
  riskFlags?: string[];
  participantResults: RoundtableParticipantResult[];
  judgeReasoning?: string;
  timestamp: string;
}
