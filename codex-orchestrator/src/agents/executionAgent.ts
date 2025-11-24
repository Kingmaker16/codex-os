/**
 * Execution Agent - Orchestrator Intelligence v2.0
 * 
 * Executes TaskGraphs by orchestrating calls to multiple services.
 */

import type { TaskGraph, OrchestratorTask } from "../intents/taskGraph.js";
import {
  getRunnableTasks,
  updateTaskStatus,
  isGraphComplete,
  getDependencyResults,
} from "../intents/taskGraph.js";
import { planRoute } from "../intents/routePlanner.js";

/**
 * Execute a TaskGraph by calling appropriate services
 */
export async function executeTaskGraph(graph: TaskGraph): Promise<TaskGraph> {
  let currentGraph = graph;
  const maxIterations = 100; // Prevent infinite loops
  let iteration = 0;

  console.log(`[ExecutionAgent] Starting execution of graph ${graph.id} with ${graph.tasks.length} tasks`);

  while (!isGraphComplete(currentGraph) && iteration < maxIterations) {
    iteration++;
    const runnableTasks = getRunnableTasks(currentGraph);

    if (runnableTasks.length === 0) {
      // No runnable tasks but graph not complete = deadlock or all remaining tasks failed
      console.warn(`[ExecutionAgent] No runnable tasks found. Graph may be deadlocked.`);
      break;
    }

    console.log(`[ExecutionAgent] Iteration ${iteration}: ${runnableTasks.length} runnable tasks`);

    // Execute all runnable tasks in parallel
    const executionPromises = runnableTasks.map(task => executeTask(task, currentGraph));
    const results = await Promise.allSettled(executionPromises);

    // Update graph with results
    for (let i = 0; i < runnableTasks.length; i++) {
      const task = runnableTasks[i];
      const result = results[i];

      if (result.status === "fulfilled") {
        currentGraph = updateTaskStatus(
          currentGraph,
          task.id,
          "done",
          result.value,
          undefined
        );
        console.log(`[ExecutionAgent] Task ${task.id} (${task.type}) completed successfully`);
      } else {
        currentGraph = updateTaskStatus(
          currentGraph,
          task.id,
          "failed",
          undefined,
          result.reason?.message || "Unknown error"
        );
        console.error(`[ExecutionAgent] Task ${task.id} (${task.type}) failed:`, result.reason);
      }
    }
  }

  if (iteration >= maxIterations) {
    console.error(`[ExecutionAgent] Max iterations reached. Graph execution incomplete.`);
  } else {
    console.log(`[ExecutionAgent] Graph ${graph.id} execution complete after ${iteration} iterations`);
  }

  return currentGraph;
}

/**
 * Execute a single task by calling the appropriate service
 */
async function executeTask(task: OrchestratorTask, graph: TaskGraph): Promise<any> {
  console.log(`[ExecutionAgent] Executing task ${task.id} (${task.type})`);

  // Get dependency results
  const depResults = getDependencyResults(graph, task.dependsOn);

  // Plan the route
  let route;
  try {
    route = planRoute(task);
  } catch (err: any) {
    throw new Error(`Route planning failed: ${err.message}`);
  }

  // Build request payload
  const payload = buildPayload(task, depResults);

  // Execute the service call
  try {
    if (route.method === "GET") {
      // GET request with query params
      const queryString = new URLSearchParams(payload).toString();
      const url = queryString ? `${route.endpoint}?${queryString}` : route.endpoint;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } else {
      // POST request
      const response = await fetch(route.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    }
  } catch (err: any) {
    throw new Error(`Service call failed: ${err.message}`);
  }
}

/**
 * Build payload for service call, incorporating dependency results
 */
function buildPayload(task: OrchestratorTask, depResults: Record<string, any>): any {
  const payload = { ...task.payload };

  // Smart payload enrichment based on dependency results
  // Look for references like "videoFromTask": "t2" and replace with actual result
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value === "string" && value.endsWith("FromTask")) {
      // Extract task ID (e.g., "scriptFromTask" -> look for script in deps)
      const depTaskId = payload[key.replace("FromTask", "TaskId")] || task.dependsOn[0];
      if (depResults[depTaskId]) {
        // Replace with actual result
        const fieldName = key.replace("FromTask", "");
        payload[fieldName] = depResults[depTaskId][fieldName] || depResults[depTaskId];
        delete payload[key]; // Remove the "FromTask" placeholder
      }
    }
  }

  // Add all dependency results as context (if not already present)
  if (Object.keys(depResults).length > 0 && !payload.dependencyResults) {
    payload.dependencyResults = depResults;
  }

  return payload;
}
