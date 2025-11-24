/**
 * Codex Stability Layer - Service Registry
 * 
 * Static description of all Codex services for monitoring
 */

export interface CodexService {
  name: string;
  port: number;
  healthPath: string;
  startCommand: string[];
  cwd: string;
  critical?: boolean;  // If true, failure triggers immediate diagnostics
}

export const SERVICES: CodexService[] = [
  {
    name: "brain",
    port: 4100,
    healthPath: "/health",
    startCommand: ["npm", "start"],
    cwd: "/Users/amar/Codex/codex-brain",
    critical: true
  },
  {
    name: "bridge",
    port: 4000,
    healthPath: "/providers",
    startCommand: ["npm", "start"],
    cwd: "/Users/amar/Codex/codex-bridge",
    critical: true
  },
  {
    name: "orchestrator",
    port: 4200,
    healthPath: "/health",
    startCommand: ["npm", "start"],
    cwd: "/Users/amar/Codex/codex-orchestrator",
    critical: true
  },
  {
    name: "hands",
    port: 4300,
    healthPath: "/health",
    startCommand: ["npm", "start"],
    cwd: "/Users/amar/Codex/codex-hands",
    critical: false
  },
  {
    name: "voice",
    port: 9001,
    healthPath: "/health",
    startCommand: ["npm", "start"],
    cwd: "/Users/amar/Codex/codex-voice",
    critical: false
  },
  {
    name: "vision",
    port: 4600,
    healthPath: "/health",
    startCommand: ["npm", "start"],
    cwd: "/Users/amar/Codex/codex-vision",
    critical: false
  },
  {
    name: "knowledge",
    port: 4500,
    healthPath: "/health",
    startCommand: ["npm", "start"],
    cwd: "/Users/amar/Codex/codex-knowledge",
    critical: false
  },
  {
    name: "ui",
    port: 5173,
    healthPath: "/",
    startCommand: ["npm", "run", "dev"],
    cwd: "/Users/amar/Codex/codex-desktop",
    critical: false
  }
];

/**
 * Get service by name
 */
export function getService(name: string): CodexService | undefined {
  return SERVICES.find(s => s.name === name);
}

/**
 * Get critical services only
 */
export function getCriticalServices(): CodexService[] {
  return SERVICES.filter(s => s.critical);
}
