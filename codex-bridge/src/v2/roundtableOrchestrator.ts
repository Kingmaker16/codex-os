/**
 * Codex Bridge v2 - Roundtable Orchestrator
 * 
 * Multi-LLM coordination engine that runs collaborative problem-solving sessions
 * with specialized AI participants:
 * - Planner (GPT): Strategic planning and decomposition
 * - Researcher (Gemini): Context analysis and research
 * - Coder (Claude): Implementation and code generation
 * - Critic (Grok): Review and risk assessment
 * - Analyst (Qwen): Data analysis, multilingual reasoning, trend mapping
 * - Judge (Claude/GPT): Synthesis and final plan
 */

import type { IModelProvider, ModelRequest } from "../providers/types.js";
import type {
  RoundtableRequest,
  RoundtableResponse,
  RoundtableParticipantResult,
  TaskForCoder,
  ParticipantConfig
} from "../types/roundtable.js";

const DEFAULT_PARTICIPANTS = {
  planner: { provider: "openai", model: "gpt-4" },
  researcher: { provider: "gemini", model: "gemini-pro" },
  coder: { provider: "claude", model: "claude-3-5-haiku-20241022" },
  critic: { provider: "grok", model: "grok-beta" },
  analyst: { provider: "qwen", model: "qwen-max" },
  judge: { provider: "claude", model: "claude-3-5-haiku-20241022" }
};
  judge: { provider: "anthropic", model: "claude-3-opus-20240229" }
};

export class RoundtableOrchestrator {
  private providers: Record<string, IModelProvider>;

  constructor(providers: Record<string, IModelProvider>) {
    this.providers = providers;
  }

  /**
   * Run a multi-LLM roundtable session
   */
  async runRoundtable(request: RoundtableRequest): Promise<RoundtableResponse> {
    const startTime = new Date().toISOString();
    const participantResults: RoundtableParticipantResult[] = [];

    // Merge custom participants with defaults
    const participants = {
      planner: request.participants?.planner || DEFAULT_PARTICIPANTS.planner,
      researcher: request.participants?.researcher || DEFAULT_PARTICIPANTS.researcher,
      coder: request.participants?.coder || DEFAULT_PARTICIPANTS.coder,
      critic: request.participants?.critic || DEFAULT_PARTICIPANTS.critic,
      analyst: request.participants?.analyst || DEFAULT_PARTICIPANTS.analyst,
      judge: request.participants?.judge || DEFAULT_PARTICIPANTS.judge
    };

    // Phase 1: Planner - Strategic planning
    const plannerResult = await this.runParticipant(
      'planner',
      participants.planner,
      this.buildPlannerPrompt(request)
    );
    participantResults.push(plannerResult);

    // Phase 2: Researcher - Context analysis (runs in parallel with Phase 1 results)
    const researcherResult = await this.runParticipant(
      'researcher',
      participants.researcher,
      this.buildResearcherPrompt(request, plannerResult)
    );
    participantResults.push(researcherResult);

    // Phase 3: Coder - Implementation strategy
    const coderResult = await this.runParticipant(
      'coder',
      participants.coder,
      this.buildCoderPrompt(request, plannerResult, researcherResult)
    );
    participantResults.push(coderResult);

    // Phase 4: Critic - Review and risk assessment
    const criticResult = await this.runParticipant(
      'critic',
      participants.critic,
      this.buildCriticPrompt(request, plannerResult, researcherResult, coderResult)
    );
    participantResults.push(criticResult);

    // Phase 5: Analyst - Data analysis and trend mapping
    const analystResult = await this.runParticipant(
      'analyst',
      participants.analyst,
      this.buildAnalystPrompt(request, plannerResult, researcherResult, coderResult, criticResult)
    );
    participantResults.push(analystResult);

    // Phase 6: Judge - Synthesize final plan
    const judgeResult = await this.synthesizeFinalPlan(
      request,
      participants.judge,
      participantResults
    );

    return {
      sessionId: request.sessionId,
      goal: request.goal,
      mode: request.mode,
      finalPlan: judgeResult.finalPlan,
      tasksForCoder: judgeResult.tasks,
      notesForDirector: judgeResult.notes,
      riskFlags: judgeResult.risks,
      participantResults,
      judgeReasoning: judgeResult.reasoning,
      timestamp: startTime
    };
  }

  /**
   * Run a single participant
   */
  private async runParticipant(
    role: 'planner' | 'researcher' | 'coder' | 'critic' | 'analyst',
    config: ParticipantConfig,
    messages: ModelRequest
  ): Promise<RoundtableParticipantResult> {
    const timestamp = new Date().toISOString();
    
    try {
      const provider = this.providers[config.provider];
      if (!provider) {
        return {
          role,
          provider: config.provider,
          model: config.model,
          content: '',
          error: `Provider ${config.provider} not available`,
          timestamp
        };
      }

      // Use the model from config
      const requestWithModel = { ...messages, model: config.model };
      const response = await provider.respond(requestWithModel);

      return {
        role,
        provider: config.provider,
        model: config.model,
        content: response.output,
        raw: response,
        timestamp
      };
    } catch (err) {
      return {
        role,
        provider: config.provider,
        model: config.model,
        content: '',
        error: (err as Error).message,
        timestamp
      };
    }
  }

  /**
   * Build planner prompt
   */
  private buildPlannerPrompt(request: RoundtableRequest): ModelRequest {
    const contextStr = request.context ? `

**Context:**
${request.context.repoSummary || ''}
${request.context.filesChanged ? `Files changed: ${request.context.filesChanged.join(', ')}` : ''}
${request.context.logs || ''}
${request.context.notes || ''}
` : '';

    return {
      model: 'gpt-4', // will be overridden by participant config
      messages: [
        {
          role: 'system',
          content: `You are the Strategic Planner in a multi-LLM roundtable. Your role is to:
1. Break down the goal into clear, actionable phases
2. Identify dependencies and risks
3. Propose a high-level execution strategy
4. Consider resource requirements

Output format: Structured markdown with sections for Strategy, Phases, Dependencies, Risks.`
        },
        {
          role: 'user',
          content: `Mode: ${request.mode}
Goal: ${request.goal}${contextStr}

Provide a strategic plan for achieving this goal.`
        }
      ]
    };
  }

  /**
   * Build researcher prompt
   */
  private buildResearcherPrompt(
    request: RoundtableRequest,
    plannerResult: RoundtableParticipantResult
  ): ModelRequest {
    return {
      model: 'gemini-pro',
      messages: [
        {
          role: 'system',
          content: `You are the Researcher in a multi-LLM roundtable. Your role is to:
1. Analyze the planner's strategy
2. Identify knowledge gaps and assumptions
3. Provide domain-specific insights
4. Suggest best practices and patterns

Output format: Structured analysis with sections for Analysis, Insights, Recommendations.`
        },
        {
          role: 'user',
          content: `Goal: ${request.goal}
Mode: ${request.mode}

Planner's Strategy:
${plannerResult.content}

Provide research insights and recommendations.`
        }
      ]
    };
  }

  /**
   * Build coder prompt
   */
  private buildCoderPrompt(
    request: RoundtableRequest,
    plannerResult: RoundtableParticipantResult,
    researcherResult: RoundtableParticipantResult
  ): ModelRequest {
    return {
      model: 'claude-3-sonnet-20240229',
      messages: [
        {
          role: 'system',
          content: `You are the Implementation Engineer in a multi-LLM roundtable. Your role is to:
1. Review the planner's strategy and researcher's insights
2. Propose concrete implementation steps
3. Identify technical challenges
4. Suggest code patterns and architecture

Output format: Implementation plan with file-level tasks, code patterns, and technical notes.`
        },
        {
          role: 'user',
          content: `Goal: ${request.goal}
Mode: ${request.mode}

Strategic Plan:
${plannerResult.content}

Research Insights:
${researcherResult.content}

Provide a detailed implementation plan with specific tasks.`
        }
      ]
    };
  }

  /**
   * Build critic prompt
   */
  private buildCriticPrompt(
    request: RoundtableRequest,
    plannerResult: RoundtableParticipantResult,
    researcherResult: RoundtableParticipantResult,
    coderResult: RoundtableParticipantResult
  ): ModelRequest {
    return {
      model: 'grok-beta',
      messages: [
        {
          role: 'system',
          content: `You are the Critical Reviewer in a multi-LLM roundtable. Your role is to:
1. Identify potential issues in the plan
2. Assess technical and business risks
3. Challenge assumptions
4. Suggest improvements

Output format: Critical analysis with sections for Strengths, Weaknesses, Risks, Improvements.`
        },
        {
          role: 'user',
          content: `Goal: ${request.goal}

Planner's Strategy:
${plannerResult.content}

Researcher's Insights:
${researcherResult.content}

Coder's Implementation Plan:
${coderResult.content}

Provide a critical review identifying risks and improvements.`
        }
      ]
    };
  }

  /**
   * Build analyst prompt
   */
  private buildAnalystPrompt(
    request: RoundtableRequest,
    plannerResult: RoundtableParticipantResult,
    researcherResult: RoundtableParticipantResult,
    coderResult: RoundtableParticipantResult,
    criticResult: RoundtableParticipantResult
  ): ModelRequest {
    return {
      model: 'qwen-max',
      messages: [
        {
          role: 'system',
          content: `You are the Data Analyst in a multi-LLM roundtable. Your role is to:
1. Analyze data patterns and trends in the proposed solution
2. Provide multilingual and cross-cultural insights if relevant
3. Identify e-commerce or business intelligence opportunities
4. Map global trends and market implications
5. Quantify impact metrics and success criteria

Output format: Analytical report with sections for Data Insights, Trends, Metrics, Opportunities.`
        },
        {
          role: 'user',
          content: `Goal: ${request.goal}
Mode: ${request.mode}

Planner's Strategy:
${plannerResult.content}

Researcher's Insights:
${researcherResult.content}

Coder's Implementation Plan:
${coderResult.content}

Critic's Review:
${criticResult.content}

Provide data-driven analysis, trend mapping, and quantifiable metrics for this initiative.`
        }
      ]
    };
  }

  /**
   * Synthesize final plan from all participants
   */
  private async synthesizeFinalPlan(
    request: RoundtableRequest,
    judgeConfig: ParticipantConfig,
    results: RoundtableParticipantResult[]
  ): Promise<{
    finalPlan: string;
    tasks: TaskForCoder[];
    notes?: string;
    risks?: string[];
    reasoning: string;
  }> {
    const planner = results.find(r => r.role === 'planner');
    const researcher = results.find(r => r.role === 'researcher');
    const coder = results.find(r => r.role === 'coder');
    const critic = results.find(r => r.role === 'critic');
    const analyst = results.find(r => r.role === 'analyst');

    const provider = this.providers[judgeConfig.provider];
    if (!provider) {
      return {
        finalPlan: 'Judge provider not available',
        tasks: [],
        reasoning: 'Error: Judge provider not found'
      };
    }

    const judgeRequest: ModelRequest = {
      model: judgeConfig.model,
      messages: [
        {
          role: 'system',
          content: `You are the Judge in a multi-LLM roundtable. Your role is to:
1. Synthesize all participant inputs into a coherent final plan
2. Extract concrete tasks for implementation
3. Identify risk flags that need attention
4. Provide director-level notes

You are receiving inputs from 5 specialized AI participants:
- PLANNER: Strategic planning and decomposition
- RESEARCHER: Context analysis and domain knowledge
- CODER: Implementation strategy and technical design
- CRITIC: Risk assessment and improvement suggestions
- ANALYST: Data insights, trends, and quantifiable metrics

CRITICAL: Codex OS is a TypeScript monorepo with services like:
- codex-brain (4100): Event logging
- codex-bridge (4000): Multi-LLM coordination
- codex-orchestrator (4200): Workflow intelligence
- codex-hands (4300): File operations
- codex-telemetry, codex-visibility, codex-engagement: Monitoring services
- codex-boot-manager: Service startup orchestration

File paths MUST be relative to /Users/amar/Codex and follow this pattern:
- codex-{service}/src/index.ts (main entry)
- codex-{service}/src/{feature}.ts (feature files)
- docs/CODEX_*.md (documentation)

Example valid paths:
- "codex-telemetry/src/health.ts"
- "codex-boot-manager/src/services.v2.ts"
- "docs/CODEX_OS_SUMMARY_FOR_AI.md"

INVALID: /codex-os/..., /Users/..., ./scripts/...

Output your response as valid JSON with this structure:
{
  "finalPlan": "comprehensive plan as markdown",
  "tasks": [
    {"id": "task-1", "file": "codex-service/src/file.ts", "instructions": "what to do", "priority": "high"}
  ],
  "notes": "high-level notes for project director",
  "risks": ["risk 1", "risk 2"],
  "reasoning": "explanation of synthesis decisions"
}`
        },
        {
          role: 'user',
          content: `Goal: ${request.goal}
Mode: ${request.mode}

PLANNER (${planner?.provider}):
${planner?.content || 'No input'}

RESEARCHER (${researcher?.provider}):
${researcher?.content || 'No input'}

CODER (${coder?.provider}):
${coder?.content || 'No input'}

CRITIC (${critic?.provider}):
${critic?.content || 'No input'}

ANALYST (${analyst?.provider}):
${analyst?.content || 'No input'}

Synthesize these 5 perspectives into a final plan with concrete tasks.`
        }
      ]
    };

    try {
      const response = await provider.respond(judgeRequest);
      const parsed = this.parseJudgeResponse(response.output);
      
      return {
        finalPlan: parsed.finalPlan || response.output,
        tasks: parsed.tasks || [],
        notes: parsed.notes,
        risks: parsed.risks,
        reasoning: parsed.reasoning || 'See final plan'
      };
    } catch (err) {
      return {
        finalPlan: `Error synthesizing plan: ${(err as Error).message}`,
        tasks: [],
        reasoning: `Judge error: ${(err as Error).message}`
      };
    }
  }

  /**
   * Parse judge's JSON response
   */
  private parseJudgeResponse(output: string): {
    finalPlan?: string;
    tasks?: TaskForCoder[];
    notes?: string;
    risks?: string[];
    reasoning?: string;
  } {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = output.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : output;
      
      const parsed = JSON.parse(jsonStr);
      return {
        finalPlan: parsed.finalPlan,
        tasks: parsed.tasks,
        notes: parsed.notes,
        risks: parsed.risks,
        reasoning: parsed.reasoning
      };
    } catch {
      // If JSON parsing fails, return raw output as final plan
      return {
        finalPlan: output,
        tasks: [],
        reasoning: 'Failed to parse structured output'
      };
    }
  }
}
