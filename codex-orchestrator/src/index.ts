import Fastify from "fastify";
import { httpGetJson, httpPostJson } from "./http.js";
import { findFreePort } from "./portUtils.js";
import { visionRouter } from "./vision/visionRouter.js";
import { registerEcommerceRoutes } from "./routers/ecommerceRouter.js";
import { registerStrategyRoutes } from "./routers/strategyRouter.js";
import { registerTrendsRoutes } from "./routers/trendsRouter.js";
import { simRouter } from "./routers/simRouter.js";
import { registerHands5Router } from "./routers/hands5Router.js";
import { registerVision26Routes } from "./routers/orchestratorVision2.6.js";
import opsRouter from "./routers/opsRouter.js";
import apiRouter from "./routers/apiRouter.js";
import { registerAutonomyRoutes } from "./routers/autonomyRouter.js";
import { runDiagnosticsSuite } from "./diagnostics/diagnosticsRunner.js";
import { createTaskGraph, updateTaskStatus, type TaskGraph, type OrchestratorTask } from "./intents/taskGraph.js";
import { executeTaskGraph } from "./agents/executionAgent.js";
import { storeTaskGraph, getTaskGraph, getAllTaskGraphs } from "./context/sessionMemory.js";
import { selectPlanningModel } from "./models/modelSelector.js";

const app = Fastify({ logger: true });

// PHASE 1 — Task Shape
type HandsTask =
  | {
      kind: "create_file";
      sessionId: string;
      path: string;      // relative to Codex root
      content: string;
    }
  | {
      kind: "edit_file";
      sessionId: string;
      path: string;
      content: string;
      mode?: "append" | "overwrite";
    }
  | {
      kind: "run_script";
      sessionId: string;
      project: "codex-orchestrator" | "codex-desktop" | "codex-bridge" | "codex-brain" | "codex-hands";
      script: "build" | "dev" | "start";
    };

// Task Planner v1 — PlannedTask with description
type PlannedTask = HandsTask & {
  description: string;  // human-readable explanation
};

async function main() {
  try {
    // 1) Enable CORS using Fastify's built-in support
    app.addHook('onRequest', async (request, reply) => {
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      reply.header('Access-Control-Allow-Headers', 'Content-Type');
      if (request.method === 'OPTIONS') {
        reply.send();
      }
    });

    // 2) Hydrate rules from codex-brain (codex-system) with retry
    let hydratedRules: string[] = [];
    const maxRetries = 5;
    const retryDelay = 1000; // ms
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const mem = await httpGetJson("http://localhost:4100/memory?sessionId=codex-system");
        const events = (mem as any)?.events ?? [];
        if (Array.isArray(events)) {
          // Extract text from all system events (full kernel, not just recent 5)
          hydratedRules = events
            .filter((e: any) => e.role === "system" && e.sessionId === "codex-system")
            .map((e: any) => e.text);
        }
        app.log.info({ count: hydratedRules.length }, "hydrated rules");
        break; // Success, exit retry loop
      } catch (err) {
        if (attempt < maxRetries) {
          app.log.warn({ attempt, maxRetries }, "brain not ready, retrying...");
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          app.log.warn({ err }, "failed to hydrate rules from brain after max retries; using no rules");
        }
      }
    }

    // 3) Health route
    app.get("/health", async () => ({
      ok: true,
      service: "codex-orchestrator",
      version: "2.0.0",
      features: [
        "chat",
        "task-planning",
        "task-execution",
        "multi-service-orchestration",
        "ai-workflow-intelligence"
      ]
    }));

    // 3b) Orchestrator Hardening Status (v3)
    app.get("/orchestrator/health", async () => ({
      ok: true,
      service: "codex-orchestrator",
      version: "3.0.0",
      modes: ["SIMULATION", "DRY_RUN", "LIVE"],
      hardened: true,
      features: [
        "circuit-breakers",
        "automatic-retries",
        "execution-modes",
        "timeout-management",
        "failure-isolation"
      ]
    }));

    // 4) /chat route
    app.post("/chat", async (req, reply) => {
      try {
        const body = req.body as {
          sessionId: string;
          provider?: string;
          model?: string;
          messages: { role: string; content: string }[];
          max_tokens?: number;
          temperature?: number;
        };

        if (!body.sessionId || !body.messages || body.messages.length === 0) {
          reply.status(400);
          return { error: "bad_request", message: "sessionId and messages required" };
        }

        const provider = (body.provider ?? "").trim() || "openai";
        let model = (body.model ?? "").trim();

        if (!model) {
          switch (provider) {
            case "openai":
              model = "gpt-4o";
              break;
            case "claude":
              model = "claude-haiku-4-5-20251001";
              break;
            case "grok":
              model = "grok-4-latest";
              break;
            case "gemini":
              model = "gemini-2.5-flash";
              break;
            case "deepseek":
              model = "deepseek-coder";
              break;
            default:
              model = "mock";
              break;
          }
        }

        // Build messages array with rules first, then user messages
        const rules = hydratedRules.map((r) => ({
          role: "system" as const,
          content: r,
        }));
        const messagesWithRules = [...rules, ...body.messages];

        // Forward to Bridge
        const bridgeUrl = `http://localhost:4000/respond?provider=${encodeURIComponent(
          provider
        )}&model=${encodeURIComponent(model)}`;

        const bridgeResp = await httpPostJson(bridgeUrl, {
          messages: messagesWithRules,
          max_tokens: body.max_tokens ?? 512,
          temperature: body.temperature ?? 0.7,
        });

        if ((bridgeResp as any).error) {
          reply.status(500);
          return { error: "orchestrator_error", message: (bridgeResp as any).error };
        }

        const { output, usage } = bridgeResp as any;

        // Log to Brain
        const now = new Date().toISOString();
        const firstUser = body.messages[0];

        await httpPostJson("http://localhost:4100/event", {
          kind: "TurnAppended",
          event: {
            sessionId: body.sessionId,
            role: "user",
            text: firstUser?.content ?? "",
            ts: now,
          },
        }).catch(() => null);

        await httpPostJson("http://localhost:4100/event", {
          kind: "TurnAppended",
          event: {
            sessionId: body.sessionId,
            role: "assistant",
            text: output,
            ts: new Date().toISOString(),
          },
        }).catch(() => null);

        return {
          reply: output,
          provider,
          model,
          usage: usage ?? {},
        };
      } catch (err: any) {
        app.log.error({ err }, "/chat failed");
        reply.status(500);
        return { error: "orchestrator_error", message: err?.message };
      }
    });

    // Knowledge Engine v1.1 - Skill Extraction
    app.post("/skills/extract", async (req, reply) => {
      try {
        const body = req.body as {
          domain: string;
          docId: string;
          provider?: string;
          model?: string;
        };

        // Validate inputs
        if (!body.domain || typeof body.domain !== "string" || !body.domain.trim()) {
          reply.status(400);
          return { ok: false, error: "Invalid input", details: "domain is required" };
        }
        if (!body.docId || typeof body.docId !== "string" || !body.docId.trim()) {
          reply.status(400);
          return { ok: false, error: "Invalid input", details: "docId is required" };
        }

        const domain = body.domain.trim();
        const docId = body.docId.trim();
        const provider = (body.provider ?? "").trim() || "openai";
        let model = (body.model ?? "").trim();

        if (!model) {
          switch (provider) {
            case "openai":
              model = "gpt-4o";
              break;
            case "claude":
              model = "claude-haiku-4-5-20251001";
              break;
            default:
              model = "gpt-4o";
              break;
          }
        }

        // Fetch chunks from Brain
        const chunksResp = await httpGetJson(
          `http://localhost:4100/documentChunks?docId=${encodeURIComponent(docId)}`
        );

        if (!(chunksResp as any).ok || !Array.isArray((chunksResp as any).chunks)) {
          reply.status(500);
          return { ok: false, error: "Failed to fetch document chunks" };
        }

        const chunks = (chunksResp as any).chunks as { chunkIndex: number; content: string }[];

        if (chunks.length === 0) {
          return { ok: true, domain, docId, rulesExtracted: 0, message: "No chunks found" };
        }

        let totalRulesExtracted = 0;

        // Process each chunk
        for (const chunk of chunks) {
          // Build extraction prompt
          const extractionMessages = [
            ...hydratedRules.map((r) => ({
              role: "system" as const,
              content: r,
            })),
            {
              role: "system" as const,
              content: `You are Codex, extracting skill rules from domain-specific documentation for Amar.

Given the following text chunk, extract a small list of actionable rules or skills in the form of bullet lines starting with 'rule:'. Keep them concise, executable, and domain-tagged as [${domain}].

Example format:
rule: [${domain}] When optimizing conversion rates, always test headlines first.
rule: [${domain}] Use A/B testing for all major UI changes before full rollout.

Only output rule lines, nothing else.`,
            },
            {
              role: "user" as const,
              content: chunk.content,
            },
          ];

          // Call Bridge for extraction
          const bridgeUrl = `http://localhost:4000/respond?provider=${encodeURIComponent(
            provider
          )}&model=${encodeURIComponent(model)}`;

          const bridgeResp = await httpPostJson(bridgeUrl, {
            messages: extractionMessages,
            max_tokens: 1024,
            temperature: 0.3,
          });

          if ((bridgeResp as any).error) {
            app.log.warn({ error: (bridgeResp as any).error }, "Bridge extraction failed for chunk");
            continue;
          }

          const output = (bridgeResp as any).output as string;

          // Parse rule lines
          const lines = output.split("\n");
          const rules = lines
            .map((line) => line.trim())
            .filter((line) => line.toLowerCase().startsWith("rule:"));

          // Store each rule in Brain under codex-skill-{domain}
          for (const rule of rules) {
            try {
              await httpPostJson("http://localhost:4100/event", {
                kind: "TurnAppended",
                event: {
                  sessionId: `codex-skill-${domain}`,
                  role: "system",
                  text: rule,
                  ts: new Date().toISOString(),
                },
              });
              totalRulesExtracted++;
            } catch (err) {
              app.log.warn({ err, rule }, "Failed to store skill rule");
            }
          }
        }

        return {
          ok: true,
          domain,
          docId,
          rulesExtracted: totalRulesExtracted,
        };
      } catch (err: any) {
        app.log.error({ err }, "/skills/extract failed");
        reply.status(500);
        return { ok: false, error: "extraction_error", message: err?.message };
      }
    });

    // PHASE 2 — /hands/execute Route
    app.post("/hands/execute", async (req, reply) => {
      try {
        const task = req.body as HandsTask;

        // Validate sessionId
        if (!task.sessionId || typeof task.sessionId !== "string" || !task.sessionId.trim()) {
          reply.status(400);
          return { ok: false, error: "Invalid input", details: "sessionId is required" };
        }

        // Validate kind
        if (!task.kind || !["create_file", "edit_file", "run_script"].includes(task.kind)) {
          reply.status(400);
          return { ok: false, error: "Invalid input", details: "kind must be create_file, edit_file, or run_script" };
        }

        let handsUrl: string;
        let handsPayload: any;
        let logDescription: string;

        // Route to appropriate codex-hands endpoint
        if (task.kind === "create_file") {
          // Validate create_file fields
          if (!task.path || typeof task.path !== "string" || !task.path.trim()) {
            reply.status(400);
            return { ok: false, error: "Invalid input", details: "path is required for create_file" };
          }
          if (!task.content || typeof task.content !== "string") {
            reply.status(400);
            return { ok: false, error: "Invalid input", details: "content is required for create_file" };
          }

          handsUrl = "http://localhost:4300/hands/createFile";
          handsPayload = { path: task.path, content: task.content };
          logDescription = `Hands executed: create_file with payload ${JSON.stringify({ path: task.path })}`;
        } else if (task.kind === "edit_file") {
          // Validate edit_file fields
          if (!task.path || typeof task.path !== "string" || !task.path.trim()) {
            reply.status(400);
            return { ok: false, error: "Invalid input", details: "path is required for edit_file" };
          }
          if (!task.content || typeof task.content !== "string") {
            reply.status(400);
            return { ok: false, error: "Invalid input", details: "content is required for edit_file" };
          }

          const mode = task.mode ?? "overwrite";
          handsUrl = "http://localhost:4300/hands/editFile";
          handsPayload = { path: task.path, content: task.content, mode };
          logDescription = `Hands executed: edit_file with payload ${JSON.stringify({ path: task.path, mode })}`;
        } else if (task.kind === "run_script") {
          // Validate run_script fields
          const validProjects = ["codex-orchestrator", "codex-desktop", "codex-bridge", "codex-brain", "codex-hands"];
          const validScripts = ["build", "dev", "start"];

          if (!task.project || !validProjects.includes(task.project)) {
            reply.status(400);
            return { ok: false, error: "Invalid input", details: `project must be one of: ${validProjects.join(", ")}` };
          }
          if (!task.script || !validScripts.includes(task.script)) {
            reply.status(400);
            return { ok: false, error: "Invalid input", details: `script must be one of: ${validScripts.join(", ")}` };
          }

          handsUrl = "http://localhost:4300/hands/runScript";
          handsPayload = { project: task.project, script: task.script };
          logDescription = `Hands executed: run_script with payload ${JSON.stringify({ project: task.project, script: task.script })}`;
        } else {
          reply.status(400);
          return { ok: false, error: "Invalid input", details: "Unknown task kind" };
        }

        // Call codex-hands
        let handsResult: any;
        try {
          handsResult = await httpPostJson(handsUrl, handsPayload);
        } catch (err: any) {
          app.log.error({ err, task }, "Hands execution failed");
          reply.status(500);
          return { ok: false, error: "Hands execution failed", details: err?.message };
        }

        // Check if hands reported success
        if (!handsResult.ok) {
          reply.status(500);
          return { ok: false, error: "Hands execution failed", details: handsResult };
        }

        // PHASE 3 — Log to Brain
        try {
          await httpPostJson("http://localhost:4100/event", {
            kind: "TurnAppended",
            event: {
              sessionId: task.sessionId,
              role: "system",
              text: logDescription,
              ts: new Date().toISOString(),
            },
          });
        } catch (err) {
          app.log.warn({ err }, "Failed to log Hands execution to Brain");
        }

        // Return success
        return {
          ok: true,
          task,
          handsResult,
        };
      } catch (err: any) {
        app.log.error({ err }, "/hands/execute failed");
        reply.status(500);
        return { ok: false, error: "orchestrator_error", message: err?.message };
      }
    });

    // Task Planner v1 — Helper function to plan tasks via OpenAI
    async function planTasks(
      sessionId: string,
      domain: string,
      input: string
    ): Promise<PlannedTask[]> {
      const messages = [
        ...hydratedRules.map((r) => ({ role: "system" as const, content: r })),
        {
          role: "system" as const,
          content: [
            "You are Codex OS, Amar's tactical AI operating system.",
            "Your job is to take a natural-language request and turn it into a small list of concrete Hands tasks.",
            "Hands can currently do three things:",
            "- create_file: create a file under the Codex repo with given path+content.",
            "- edit_file: overwrite or append content to an existing file.",
            "- run_script: run whitelisted npm scripts in whitelisted Codex projects.",
            "",
            "You must return ONLY a JSON array of tasks in the following format, nothing else:",
            "",
            " [",
            "   {",
            '     "kind": "create_file" | "edit_file" | "run_script",',
            '     "sessionId": "...",',
            '     "path"?: "relative/path",',
            '     "content"?: "...",',
            '     "mode"?: "append" | "overwrite",',
            '     "project"?: "codex-orchestrator" | "codex-desktop" | "codex-bridge" | "codex-brain",',
            '     "script"?: "build" | "dev" | "start",',
            '     "description": "short explanation of why this task helps"',
            "   },",
            "   ...",
            " ]",
            "",
            "Do NOT include explanations or markdown, only valid JSON.",
            "",
          ].join("\n"),
        },
        {
          role: "user" as const,
          content: `Domain: ${domain}\nSession: ${sessionId}\nRequest: ${input}`,
        },
      ];

      try {
        const bridgeUrl = "http://localhost:4000/respond?provider=openai&model=gpt-4o";
        const bridgeResp = await httpPostJson(bridgeUrl, {
          messages,
          max_tokens: 512,
          temperature: 0.2,
        });

        if ((bridgeResp as any).error) {
          app.log.warn({ error: (bridgeResp as any).error }, "Bridge planning failed");
          return [];
        }

        const raw = (bridgeResp as any).output as string;
        let plannedTasks: PlannedTask[] = [];

        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            plannedTasks = parsed;
          }
        } catch (err) {
          app.log.warn({ err, raw }, "Failed to parse planned tasks JSON");
        }

        return plannedTasks;
      } catch (err) {
        app.log.error({ err }, "planTasks failed");
        return [];
      }
    }

    // PHASE 2 — /tasks/plan Endpoint
    app.post("/tasks/plan", async (req, reply) => {
      try {
        const body = req.body as {
          sessionId: string;
          domain: string;
          input: string;
          execute?: boolean;
        };

        // Validate inputs
        if (!body.sessionId || typeof body.sessionId !== "string" || !body.sessionId.trim()) {
          reply.status(400);
          return { ok: false, error: "Invalid input", details: "sessionId is required" };
        }
        if (!body.domain || typeof body.domain !== "string" || !body.domain.trim()) {
          reply.status(400);
          return { ok: false, error: "Invalid input", details: "domain is required" };
        }
        if (!body.input || typeof body.input !== "string" || !body.input.trim()) {
          reply.status(400);
          return { ok: false, error: "Invalid input", details: "input is required" };
        }

        const sessionId = body.sessionId.trim();
        const domain = body.domain.trim();
        const input = body.input.trim();
        const execute = body.execute ?? false;

        // Plan tasks using OpenAI
        const plannedTasks = await planTasks(sessionId, domain, input);

        // If no tasks planned
        if (plannedTasks.length === 0) {
          return {
            ok: true,
            domain,
            sessionId,
            plannedTasks: [],
            executed: false,
            message: "No actionable tasks planned.",
          };
        }

        // Log planning event to Brain
        try {
          await httpPostJson("http://localhost:4100/event", {
            kind: "TurnAppended",
            event: {
              sessionId,
              role: "system",
              text: `Planner generated ${plannedTasks.length} task(s) for domain=${domain}: ${plannedTasks.map((t) => t.kind).join(", ")}`,
              ts: new Date().toISOString(),
            },
          });
        } catch (err) {
          app.log.warn({ err }, "Failed to log planning event to Brain");
        }

        // PHASE 3 — Semi-Autonomous Execution (TP2)
        if (!execute) {
          // Planning only, no execution
          return {
            ok: true,
            domain,
            sessionId,
            plannedTasks,
            executed: false,
          };
        }

        // Execute planned tasks
        const results: Array<{ task: PlannedTask; handsResult?: any; error?: string }> = [];

        for (const plannedTask of plannedTasks) {
          // Strip description to create pure HandsTask
          const { description, ...handsTask } = plannedTask;

          try {
            const handsResult = await httpPostJson("http://localhost:4200/hands/execute", handsTask);

            if (!handsResult.ok) {
              // Hands execution failed
              results.push({
                task: plannedTask,
                error: handsResult.error || "Hands execution failed",
              });
              // Stop on first failure for v1
              break;
            }

            results.push({
              task: plannedTask,
              handsResult,
            });

            // Log successful execution to Brain
            try {
              const logPayload: Record<string, any> = {};
              if (plannedTask.kind === "create_file" || plannedTask.kind === "edit_file") {
                logPayload.path = (plannedTask as any).path;
                if (plannedTask.kind === "edit_file") {
                  logPayload.mode = (plannedTask as any).mode ?? "overwrite";
                }
              } else if (plannedTask.kind === "run_script") {
                logPayload.project = (plannedTask as any).project;
                logPayload.script = (plannedTask as any).script;
              }

              await httpPostJson("http://localhost:4100/event", {
                kind: "TurnAppended",
                event: {
                  sessionId,
                  role: "system",
                  text: `Hands executed planned task: ${plannedTask.kind} with payload ${JSON.stringify(logPayload)}`,
                  ts: new Date().toISOString(),
                },
              });
            } catch (err) {
              app.log.warn({ err }, "Failed to log execution to Brain");
            }
          } catch (err: any) {
            app.log.error({ err, task: plannedTask }, "Failed to execute planned task");
            results.push({
              task: plannedTask,
              error: err?.message || "Execution failed",
            });
            // Stop on first failure for v1
            break;
          }
        }

        return {
          ok: true,
          domain,
          sessionId,
          plannedTasks,
          executed: true,
          results,
        };
      } catch (err: any) {
        app.log.error({ err }, "/tasks/plan failed");
        reply.status(500);
        return { ok: false, error: "planner_error", message: err?.message };
      }
    });

    // ═══════════════════════════════════════════════════════════════
    // ORCHESTRATOR INTELLIGENCE V2.0 — Task Graph Management
    // ═══════════════════════════════════════════════════════════════

    /**
     * POST /orchestrator/plan
     * Interpret a high-level user command into a TaskGraph using AI
     */
    app.post("/orchestrator/plan", async (req, reply) => {
      try {
        const body = req.body as {
          sessionId: string;
          command: string;
        };

        if (!body.sessionId || !body.command) {
          reply.status(400);
          return { ok: false, error: "sessionId and command required" };
        }

        app.log.info({ sessionId: body.sessionId, command: body.command }, "Planning task graph");

        // Select best model for planning
        const modelSelection = selectPlanningModel();
        
        // Build planning prompt
        const planningMessages = [
          {
            role: "system" as const,
            content: `You are Codex Orchestrator Planner. Your job is to interpret user commands and decompose them into structured task graphs.

OUTPUT FORMAT: JSON ONLY. No markdown, no explanations. Just the JSON array.

Available task types:
- research, knowledge_query: Query Knowledge Engine
- social_post, post_video: Upload to social media
- social_plan, plan_content: Create content calendar
- social_caption, generate_caption: Generate AI captions
- social_trends: Get trending topics
- generate_video, create_video: Generate video content
- optimize_mac, system_optimize: Mac system optimization
- summarize_revenue, get_revenue: Get monetization summary
- record_revenue: Record revenue data
- diagnostics, health_check: Run diagnostics
- hands_task, browser_automation: Browser automation
- vision_analyze, image_analysis: Image analysis
- voice_tts, text_to_speech: Text-to-speech
- voice_stt, speech_to_text: Speech-to-text

TASK STRUCTURE:
{
  "id": "t1",
  "type": "research",
  "dependsOn": [],
  "payload": { "topic": "viral TikTok pet products", "depth": "comprehensive" }
}

DEPENDENCIES: Use dependsOn array to specify task IDs that must complete first.

Example command: "Research 3 viral pet products, create one video, and schedule it to post on TikTok."
Example output:
[
  {
    "id": "t1",
    "type": "research",
    "dependsOn": [],
    "payload": { "topic": "viral TikTok pet products", "count": 3 }
  },
  {
    "id": "t2",
    "type": "generate_video",
    "dependsOn": ["t1"],
    "payload": { "scriptFromTask": "t1", "style": "engaging", "duration": 60 }
  },
  {
    "id": "t3",
    "type": "social_post",
    "dependsOn": ["t2"],
    "payload": { "videoFromTask": "t2", "platforms": ["tiktok"], "niche": "pets" }
  }
]`,
          },
          {
            role: "user" as const,
            content: body.command,
          },
        ];

        // Call Bridge for planning
        const bridgeUrl = `http://localhost:4000/respond?provider=${encodeURIComponent(
          modelSelection.provider
        )}&model=${encodeURIComponent(modelSelection.model)}`;

        const bridgeResp = await httpPostJson(bridgeUrl, {
          messages: planningMessages,
          max_tokens: 2048,
          temperature: 0.3,
        });

        if ((bridgeResp as any).error) {
          reply.status(500);
          return { ok: false, error: "planning_failed", message: (bridgeResp as any).error };
        }

        const output = (bridgeResp as any).output as string;

        // Parse JSON tasks
        let tasks: OrchestratorTask[];
        try {
          // Try to extract JSON from markdown code blocks if present
          let jsonStr = output.trim();
          if (jsonStr.includes("```json")) {
            jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
          } else if (jsonStr.includes("```")) {
            jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
          }
          
          const parsed = JSON.parse(jsonStr);
          tasks = Array.isArray(parsed) ? parsed : [parsed];
        } catch (err: any) {
          app.log.error({ err, output }, "Failed to parse AI planning output");
          reply.status(500);
          return { ok: false, error: "parse_failed", message: "AI did not return valid JSON", output };
        }

        // Validate and normalize tasks
        tasks = tasks.map((t, idx) => ({
          id: t.id || `t${idx + 1}`,
          type: t.type || "unknown",
          status: "pending" as const,
          dependsOn: t.dependsOn || [],
          payload: t.payload || {},
        }));

        // Create TaskGraph
        const graph = createTaskGraph(tasks);

        // Store in session memory
        storeTaskGraph(body.sessionId, graph.id, graph);

        app.log.info({ graphId: graph.id, taskCount: tasks.length }, "Task graph created");

        return {
          ok: true,
          graphId: graph.id,
          sessionId: body.sessionId,
          tasks: graph.tasks,
          createdAt: graph.createdAt,
        };
      } catch (err: any) {
        app.log.error({ err }, "/orchestrator/plan failed");
        reply.status(500);
        return { ok: false, error: "planner_error", message: err?.message };
      }
    });

    /**
     * POST /orchestrator/execute
     * Execute a previously planned TaskGraph
     */
    app.post("/orchestrator/execute", async (req, reply) => {
      try {
        const body = req.body as {
          sessionId: string;
          graphId: string;
        };

        if (!body.sessionId || !body.graphId) {
          reply.status(400);
          return { ok: false, error: "sessionId and graphId required" };
        }

        // Load graph from session memory
        const graph = getTaskGraph(body.sessionId, body.graphId);
        if (!graph) {
          reply.status(404);
          return { ok: false, error: "graph_not_found", message: `No graph found with ID ${body.graphId}` };
        }

        app.log.info({ graphId: body.graphId, taskCount: graph.tasks.length }, "Executing task graph");

        // Execute the graph
        const executedGraph = await executeTaskGraph(graph);

        // Update in session memory
        storeTaskGraph(body.sessionId, executedGraph.id, executedGraph);

        // Log to Brain
        try {
          await httpPostJson("http://localhost:4100/event", {
            kind: "TurnAppended",
            event: {
              sessionId: "codex-orchestrator-graphs",
              role: "system",
              text: JSON.stringify({
                graphId: executedGraph.id,
                sessionId: body.sessionId,
                tasks: executedGraph.tasks,
                completedAt: executedGraph.updatedAt,
              }),
              ts: new Date().toISOString(),
            },
          });
        } catch (err) {
          app.log.warn({ err }, "Failed to log graph execution to Brain");
        }

        app.log.info({ graphId: executedGraph.id }, "Task graph execution complete");

        return {
          ok: true,
          graph: executedGraph,
        };
      } catch (err: any) {
        app.log.error({ err }, "/orchestrator/execute failed");
        reply.status(500);
        return { ok: false, error: "execution_error", message: err?.message };
      }
    });

    /**
     * GET /orchestrator/status
     * Get the current status of a TaskGraph
     */
    app.get("/orchestrator/status", async (req, reply) => {
      try {
        const query = req.query as { sessionId?: string; graphId?: string };

        if (!query.sessionId || !query.graphId) {
          reply.status(400);
          return { ok: false, error: "sessionId and graphId query params required" };
        }

        const graph = getTaskGraph(query.sessionId, query.graphId);
        if (!graph) {
          reply.status(404);
          return { ok: false, error: "graph_not_found" };
        }

        // Calculate statistics
        const stats = {
          total: graph.tasks.length,
          pending: graph.tasks.filter((t: OrchestratorTask) => t.status === "pending").length,
          running: graph.tasks.filter((t: OrchestratorTask) => t.status === "running").length,
          done: graph.tasks.filter((t: OrchestratorTask) => t.status === "done").length,
          failed: graph.tasks.filter((t: OrchestratorTask) => t.status === "failed").length,
        };

        return {
          ok: true,
          graph,
          stats,
        };
      } catch (err: any) {
        app.log.error({ err }, "/orchestrator/status failed");
        reply.status(500);
        return { ok: false, error: "status_error", message: err?.message };
      }
    });

    /**
     * POST /orchestrator/quickRun
     * Plan and immediately execute a command in one call
     * Now supports execution modes: SIMULATION, DRY_RUN, LIVE
     */
    app.post("/orchestrator/quickRun", async (req, reply) => {
      try {
        const body = req.body as {
          sessionId: string;
          command: string;
          mode?: string;
        };

        if (!body.sessionId || !body.command) {
          reply.status(400);
          return { ok: false, error: "sessionId and command required" };
        }

        const mode = body.mode || "LIVE";
        app.log.info({ sessionId: body.sessionId, command: body.command, mode }, "Quick run: planning and executing");

        // STEP 1: Plan
        const modelSelection = selectPlanningModel();
        
        const planningMessages = [
          {
            role: "system" as const,
            content: `You are Codex Orchestrator Planner. Your job is to interpret user commands and decompose them into structured task graphs.

OUTPUT FORMAT: JSON ONLY. No markdown, no explanations. Just the JSON array.

Available task types:
- research, knowledge_query: Query Knowledge Engine
- social_post, post_video: Upload to social media
- social_plan, plan_content: Create content calendar
- social_caption, generate_caption: Generate AI captions
- social_trends: Get trending topics
- generate_video, create_video: Generate video content
- optimize_mac, system_optimize: Mac system optimization
- summarize_revenue, get_revenue: Get monetization summary
- record_revenue: Record revenue data
- diagnostics, health_check: Run diagnostics
- hands_task, browser_automation: Browser automation
- vision_analyze, image_analysis: Image analysis
- voice_tts, text_to_speech: Text-to-speech
- voice_stt, speech_to_text: Speech-to-text

TASK STRUCTURE:
{
  "id": "t1",
  "type": "research",
  "dependsOn": [],
  "payload": { "topic": "viral TikTok pet products", "depth": "comprehensive" }
}

DEPENDENCIES: Use dependsOn array to specify task IDs that must complete first.`,
          },
          {
            role: "user" as const,
            content: body.command,
          },
        ];

        const bridgeUrl = `http://localhost:4000/respond?provider=${encodeURIComponent(
          modelSelection.provider
        )}&model=${encodeURIComponent(modelSelection.model)}`;

        const bridgeResp = await httpPostJson(bridgeUrl, {
          messages: planningMessages,
          max_tokens: 2048,
          temperature: 0.3,
        });

        if ((bridgeResp as any).error) {
          reply.status(500);
          return { ok: false, error: "planning_failed", message: (bridgeResp as any).error };
        }

        const output = (bridgeResp as any).output as string;

        // Parse JSON tasks
        let tasks: OrchestratorTask[];
        try {
          let jsonStr = output.trim();
          if (jsonStr.includes("```json")) {
            jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
          } else if (jsonStr.includes("```")) {
            jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
          }
          
          const parsed = JSON.parse(jsonStr);
          tasks = Array.isArray(parsed) ? parsed : [parsed];
        } catch (err: any) {
          app.log.error({ err, output }, "Failed to parse AI planning output");
          reply.status(500);
          return { ok: false, error: "parse_failed", message: "AI did not return valid JSON", output };
        }

        // Validate and normalize tasks
        tasks = tasks.map((t, idx) => ({
          id: t.id || `t${idx + 1}`,
          type: t.type || "unknown",
          status: "pending" as const,
          dependsOn: t.dependsOn || [],
          payload: t.payload || {},
        }));

        // Create TaskGraph
        const graph = createTaskGraph(tasks);

        // STEP 2: Execute immediately
        const executedGraph = await executeTaskGraph(graph);

        // Store in session memory
        storeTaskGraph(body.sessionId, executedGraph.id, executedGraph);

        // Log to Brain
        try {
          await httpPostJson("http://localhost:4100/event", {
            kind: "TurnAppended",
            event: {
              sessionId: "codex-orchestrator-graphs",
              role: "system",
              text: JSON.stringify({
                graphId: executedGraph.id,
                sessionId: body.sessionId,
                command: body.command,
                tasks: executedGraph.tasks,
                completedAt: executedGraph.updatedAt,
              }),
              ts: new Date().toISOString(),
            },
          });
        } catch (err) {
          app.log.warn({ err }, "Failed to log quick run to Brain");
        }

        app.log.info({ graphId: executedGraph.id }, "Quick run complete");

        return {
          ok: true,
          graphId: executedGraph.id,
          graph: executedGraph,
          command: body.command,
        };
      } catch (err: any) {
        app.log.error({ err }, "/orchestrator/quickRun failed");
        reply.status(500);
        return { ok: false, error: "quickrun_error", message: err?.message };
      }
    });

    // 5) Register vision router
    app.register(visionRouter, { prefix: "/vision" });

    // 5a) Register e-commerce router
    await registerEcommerceRoutes(app);

    // 5b) Register strategy router
    await registerStrategyRoutes(app);

    // 5c) Register trends router
    await registerTrendsRoutes(app);

    // 5d) Register simulation router
    app.register(simRouter, { prefix: "/sim" });

    // 5e) Register Hands v5.0 router
    await registerHands5Router(app);

    // 5f) Register Vision v2.6 router
    await registerVision26Routes(app);

    // 5g) Register Ops Engine router
    app.register(opsRouter, { prefix: "/ops" });

    // 5h) Register API Gateway router
    app.register(apiRouter);

    // 5i) Register Autonomy Engine v1 router
    await registerAutonomyRoutes(app);

    // 5j) Knowledge Engine v2.5 proxy (C1-STRICT mode)
    app.post("/research/:endpoint", async (req, reply) => {
      try {
        const { endpoint } = req.params as { endpoint: string };
        const response = await fetch(`http://localhost:4500/research/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req.body)
        });
        const data = await response.json();
        return data;
      } catch (err: any) {
        app.log.error({ err }, `research proxy error: ${err.message}`);
        reply.status(500);
        return { success: false, error: err.message };
      }
    });

    app.get("/kernels", async (req, reply) => {
      try {
        const response = await fetch("http://localhost:4500/kernels");
        const data = await response.json();
        return data;
      } catch (err: any) {
        app.log.error({ err }, "kernels proxy error");
        reply.status(500);
        return { success: false, error: err.message };
      }
    });

    // 6) Diagnostics endpoint
    app.post("/diagnostics/run", async (req, reply) => {
      try {
        app.log.info("Running diagnostics suite...");
        const report = await runDiagnosticsSuite();
        return { ok: true, report };
      } catch (err: any) {
        app.log.error({ err }, "Diagnostics run failed");
        reply.status(500);
        return {
          ok: false,
          error: err?.message ?? "Diagnostics run failed."
        };
      }
    });

    // 11) Monetization Engine v1 forwarding
    app.get("/monetization/:endpoint*", async (req, reply) => {
      try {
        const path = req.url || "";
        const url = `http://localhost:4850${path}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
      } catch (err: any) {
        app.log.error({ err }, "Monetization Engine GET forwarding failed");
        reply.status(500);
        return { success: false, error: err.message };
      }
    });

    app.post("/monetization/:endpoint*", async (req, reply) => {
      try {
        const path = req.url || "";
        const url = `http://localhost:4850${path}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req.body)
        });
        const data = await response.json();
        return data;
      } catch (err: any) {
        app.log.error({ err }, "Monetization Engine POST forwarding failed");
        reply.status(500);
        return { success: false, error: err.message };
      }
    });

    // Optimizer routes (5490)
    app.all("/optimizer*", async (req, reply) => {
      try {
        const path = req.url || "";
        const url = `http://localhost:5490${path}`;
        const response = await fetch(url, {
          method: req.method,
          headers: { "Content-Type": "application/json" },
          body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined
        });
        const data = await response.json();
        return data;
      } catch (err: any) {
        app.log.error({ err }, "Optimizer Engine forwarding failed");
        reply.status(500);
        return { success: false, error: err.message };
      }
    });

    // Self-Audit routes (5530)
    app.all("/selfAudit/*", async (req, reply) => {
      try {
        const path = req.url.replace(/^\/selfAudit/, "") || "";
        const url = `http://localhost:5530${path}`;
        const response = await fetch(url, {
          method: req.method,
          headers: { "Content-Type": "application/json" },
          body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined
        });
        const data = await response.json();
        return data;
      } catch (err: any) {
        app.log.error({ err }, "Self-Audit Engine forwarding failed");
        reply.status(500);
        return { success: false, error: err.message };
      }
    });

    // Self-Regulation Layer routes (5540)
    app.all("/srl*", async (req, reply) => {
      try {
        const path = req.url || "";
        const url = `http://localhost:5540${path}`;
        const response = await fetch(url, {
          method: req.method,
          headers: { "Content-Type": "application/json" },
          body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined
        });
        const data = await response.json();
        return data;
      } catch (err: any) {
        app.log.error({ err }, "Self-Regulation Layer forwarding failed");
        reply.status(500);
        return { success: false, error: err.message };
      }
    });

    // Hardening Engine routes (5555)
    app.all("/hardening*", async (req, reply) => {
      try {
        const path = req.url || "";
        const url = `http://localhost:5555${path}`;
        const response = await fetch(url, {
          method: req.method,
          headers: { "Content-Type": "application/json" },
          body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined
        });
        const data = await response.json();
        return data;
      } catch (err: any) {
        app.log.error({ err }, "Hardening Engine forwarding failed");
        reply.status(500);
        return { success: false, error: err.message };
      }
    });

    // System Orchestrator Mesh routes (5565)
    app.all("/mesh/*", async (req, reply) => {
      try {
        const path = req.url.replace(/^\/mesh/, "") || "";
        const url = `http://localhost:5565${path}`;
        const response = await fetch(url, {
          method: req.method,
          headers: { "Content-Type": "application/json" },
          body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined
        });
        const data = await response.json();
        return data;
      } catch (err: any) {
        app.log.error({ err }, "System Orchestrator Mesh forwarding failed");
        reply.status(500);
        return { success: false, error: err.message };
      }
    });

    // Adaptive Intelligence Engine routes (5440)
    app.all("/adaptive/*", async (req, reply) => {
      try {
        const path = req.url.replace(/^\/adaptive/, "") || "";
        const url = `http://localhost:5440${path}`;
        const response = await fetch(url, {
          method: req.method,
          headers: { "Content-Type": "application/json" },
          body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined
        });
        const data = await response.json();
        return data;
      } catch (err: any) {
        app.log.error({ err }, "Adaptive Intelligence Engine forwarding failed");
        reply.status(500);
        return { success: false, error: err.message };
      }
    });

    // Autonomy Knowledge Memory routes (5570)
    app.all("/autonomy/*", async (req, reply) => {
      try {
        const url = `http://localhost:5570${req.url}`;
        const response = await fetch(url, {
          method: req.method,
          headers: { "Content-Type": "application/json" },
          body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined
        });
        const data = await response.json();
        return data;
      } catch (err: any) {
        app.log.error({ err }, "Autonomy Knowledge Memory forwarding failed");
        reply.status(500);
        return { success: false, error: err.message };
      }
    });

    // Meta-Cognition Engine routes (5580)
    app.all("/metacog/*", async (req, reply) => {
      try {
        const url = `http://localhost:5580${req.url}`;
        const response = await fetch(url, {
          method: req.method,
          headers: { "Content-Type": "application/json" },
          body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined
        });
        const data = await response.json();
        return data;
      } catch (err: any) {
        app.log.error({ err }, "Meta-Cognition Engine forwarding failed");
        reply.status(500);
        return { success: false, error: err.message };
      }
    });

    // Adaptive Strategy Layer routes (5445)
    app.all("/adaptive-strategy/*", async (req, reply) => {
      try {
        const path = req.url.replace(/^\/adaptive-strategy/, "");
        const url = `http://localhost:5445${path}`;
        const response = await fetch(url, {
          method: req.method,
          headers: { "Content-Type": "application/json" },
          body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined
        });
        const data = await response.json();
        return data;
      } catch (err: any) {
        app.log.error({ err }, "Adaptive Strategy Layer forwarding failed");
        reply.status(500);
        return { success: false, error: err.message };
      }
    });

    // 7) Port selection + listen
    const desired = Number(process.env.PORT ?? 4200);
    const port = await findFreePort(desired);
    app.log.info(`codex-orchestrator selected port ${port} (desired ${desired})`);
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`codex-orchestrator listening on :${port}`);

    // 8) Start nightly diagnostics timer (every 24 hours)
    setInterval(() => {
      app.log.info("Running scheduled nightly diagnostics...");
      runDiagnosticsSuite().catch((err) => {
        app.log.error({ err }, "Nightly diagnostics failed");
      });
    }, 24 * 60 * 60 * 1000); // 24 hours
  } catch (err) {
    app.log.error({ err }, "codex-orchestrator fatal startup error");
    process.exit(1);
  }
}

main();