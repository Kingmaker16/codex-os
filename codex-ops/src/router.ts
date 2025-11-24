// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ops Engine v1 ULTRA - API Router
// Defines all ops endpoints: health, run, queue, recover, status
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { v4 as uuidv4 } from "uuid";
import {
  OPS_ENGINE_VERSION,
  type OpsRunRequest,
  type OpsQueueRequest,
  type OpsRecoveryRequest,
  type OpsHealthResponse,
} from "./types.js";
import {
  createTask,
  getQueue,
  getActiveTask,
  getQueueLength,
  getUptime,
  getTask,
} from "./state.js";
import { executeTask } from "./opsExecutor.js";
import { checkAllServices, computeOpsStatus } from "./opsHealth.js";
import { handleServiceFailure } from "./opsRecovery.js";
import {
  logTaskStart,
  logTaskComplete,
  logTaskFailed,
} from "./opsBrainLogger.js";

export default async function opsRouter(app: FastifyInstance) {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET /ops/health - Service health and global system status
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.get("/health", async (request: FastifyRequest, reply: FastifyReply) => {
    const services = await checkAllServices();
    const status = computeOpsStatus(services);
    const activeTask = getActiveTask();

    const response: OpsHealthResponse = {
      ok: true,
      status,
      version: OPS_ENGINE_VERSION,
      services,
      queueLength: getQueueLength(),
      activeTask: activeTask?.taskId,
      uptime: getUptime(),
    };

    reply.send(response);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // POST /ops/run - Execute task immediately (bypasses queue)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.post(
    "/run",
    async (
      request: FastifyRequest<{ Body: OpsRunRequest }>,
      reply: FastifyReply
    ) => {
      const { sessionId, task, steps, params } = request.body;

      if (!sessionId || !task) {
        return reply.status(400).send({
          ok: false,
          error: "sessionId and task are required",
        });
      }

      const taskSteps = steps || [task];
      const opsTask = createTask(task, taskSteps, sessionId, params);

      // Execute immediately in background
      setImmediate(async () => {
        await logTaskStart(opsTask.taskId, opsTask.task, opsTask.sessionId);

        const startTime = Date.now();
        try {
          await executeTask(opsTask);

          if (opsTask.status === "COMPLETED") {
            const latency = Date.now() - startTime;
            await logTaskComplete(
              opsTask.taskId,
              opsTask.task,
              opsTask.sessionId,
              latency,
              opsTask.retries
            );
          } else {
            await logTaskFailed(
              opsTask.taskId,
              opsTask.task,
              opsTask.sessionId,
              opsTask.error || "Task failed",
              opsTask.retries
            );
          }
        } catch (error: any) {
          await logTaskFailed(
            opsTask.taskId,
            opsTask.task,
            opsTask.sessionId,
            error.message,
            opsTask.retries
          );
        }
      });

      reply.send({
        ok: true,
        status: "RUNNING",
        taskId: opsTask.taskId,
        message: "Task executing immediately",
      });
    }
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // POST /ops/queue - Add task to queue for scheduled execution
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.post(
    "/queue",
    async (
      request: FastifyRequest<{ Body: OpsQueueRequest }>,
      reply: FastifyReply
    ) => {
      const { task, steps, params, sessionId } = request.body;

      if (!task || !steps || steps.length === 0) {
        return reply.status(400).send({
          ok: false,
          error: "task and steps are required",
        });
      }

      const effectiveSessionId = sessionId || uuidv4();
      const opsTask = createTask(task, steps, effectiveSessionId, params);

      reply.send({
        ok: true,
        status: "QUEUED",
        taskId: opsTask.taskId,
        queuePosition: getQueueLength(),
        message: "Task queued for execution",
      });
    }
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET /ops/queue - View current queue
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.get("/queue", async (request: FastifyRequest, reply: FastifyReply) => {
    const queue = getQueue();
    const activeTask = getActiveTask();

    reply.send({
      ok: true,
      queueLength: queue.length,
      activeTask: activeTask
        ? {
            taskId: activeTask.taskId,
            task: activeTask.task,
            status: activeTask.status,
            currentStep: activeTask.currentStep,
            totalSteps: activeTask.steps.length,
          }
        : null,
      queue: queue.map((t) => ({
        taskId: t.taskId,
        task: t.task,
        status: t.status,
        steps: t.steps.length,
        retries: t.retries,
        createdAt: t.createdAt,
      })),
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // POST /ops/recover - Trigger recovery action for a service
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.post(
    "/recover",
    async (
      request: FastifyRequest<{ Body: OpsRecoveryRequest }>,
      reply: FastifyReply
    ) => {
      const { service, action } = request.body;

      if (!service || !action) {
        return reply.status(400).send({
          ok: false,
          error: "service and action are required",
        });
      }

      const result = await handleServiceFailure(service, action);

      reply.send({
        ok: result.success,
        service,
        action: result.action,
        message: result.message,
      });
    }
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET /ops/status - Get detailed status of system and tasks
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  app.get("/status", async (request: FastifyRequest, reply: FastifyReply) => {
    const services = await checkAllServices();
    const opsStatus = computeOpsStatus(services);
    const activeTask = getActiveTask();
    const queue = getQueue();

    const healthyServices = services.filter((s) => s.healthy).length;
    const totalServices = services.length;

    reply.send({
      ok: true,
      opsStatus,
      version: OPS_ENGINE_VERSION,
      uptime: getUptime(),
      services: {
        total: totalServices,
        healthy: healthyServices,
        unhealthy: totalServices - healthyServices,
      },
      queue: {
        length: queue.length,
        activeTask: activeTask?.taskId || null,
      },
      details: services,
    });
  });
}
