/**
 * Task Graph - Orchestrator Intelligence v2.0
 * 
 * Manages task dependencies, execution status, and results for multi-step workflows.
 */

export interface OrchestratorTask {
  id: string;
  type: string; // e.g. "post_video", "optimize_mac", "research_products", "generate_video"
  status: "pending" | "running" | "done" | "failed";
  dependsOn: string[]; // IDs of tasks that must complete first
  payload: any; // Task-specific input data
  result?: any; // Output from execution
  error?: string; // Error message if failed
}

export interface TaskGraph {
  id: string;
  tasks: OrchestratorTask[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Create a new TaskGraph from a list of tasks
 */
export function createTaskGraph(tasks: OrchestratorTask[]): TaskGraph {
  const graphId = `graph_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  return {
    id: graphId,
    tasks: tasks.map(t => ({ ...t, status: t.status || "pending" })),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update a task's status within the graph
 */
export function updateTaskStatus(
  graph: TaskGraph,
  taskId: string,
  status: OrchestratorTask["status"],
  result?: any,
  error?: string
): TaskGraph {
  const tasks = graph.tasks.map(t => {
    if (t.id === taskId) {
      return {
        ...t,
        status,
        result: result !== undefined ? result : t.result,
        error: error !== undefined ? error : t.error,
      };
    }
    return t;
  });

  return {
    ...graph,
    tasks,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get all tasks that are ready to run (dependencies satisfied)
 */
export function getRunnableTasks(graph: TaskGraph): OrchestratorTask[] {
  const completedTaskIds = new Set(
    graph.tasks.filter(t => t.status === "done").map(t => t.id)
  );

  return graph.tasks.filter(task => {
    // Already running or completed
    if (task.status !== "pending") return false;

    // Check if all dependencies are done
    return task.dependsOn.every(depId => completedTaskIds.has(depId));
  });
}

/**
 * Check if the graph is complete (all tasks done or failed)
 */
export function isGraphComplete(graph: TaskGraph): boolean {
  return graph.tasks.every(t => t.status === "done" || t.status === "failed");
}

/**
 * Check if the graph has any fatal errors
 */
export function hasGraphFailed(graph: TaskGraph): boolean {
  return graph.tasks.some(t => t.status === "failed");
}

/**
 * Get task by ID
 */
export function getTask(graph: TaskGraph, taskId: string): OrchestratorTask | undefined {
  return graph.tasks.find(t => t.id === taskId);
}

/**
 * Get task results for dependencies
 */
export function getDependencyResults(graph: TaskGraph, dependsOn: string[]): Record<string, any> {
  const results: Record<string, any> = {};
  
  for (const depId of dependsOn) {
    const task = getTask(graph, depId);
    if (task?.result) {
      results[depId] = task.result;
    }
  }
  
  return results;
}
