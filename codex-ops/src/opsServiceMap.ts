// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Ops Engine v1 ULTRA - Service Map
// Maps all Codex services with ports and health endpoints
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ServiceDefinition {
  name: string;
  port: number;
  healthPath: string;
  priority: number; // 1=critical, 2=high, 3=normal
}

export const CODEX_SERVICES: Record<string, ServiceDefinition> = {
  bridge: {
    name: "Bridge",
    port: 4000,
    healthPath: "/health",
    priority: 1,
  },
  brain: {
    name: "Brain",
    port: 4100,
    healthPath: "/health",
    priority: 1,
  },
  orchestrator: {
    name: "Orchestrator",
    port: 4200,
    healthPath: "/health",
    priority: 1,
  },
  hands: {
    name: "Hands v5",
    port: 4350,
    healthPath: "/health",
    priority: 2,
  },
  knowledge: {
    name: "Knowledge Engine",
    port: 4500,
    healthPath: "/health",
    priority: 2,
  },
  vision: {
    name: "Vision v2.6",
    port: 4650,
    healthPath: "/health",
    priority: 2,
  },
  video: {
    name: "Video Engine",
    port: 4700,
    healthPath: "/health",
    priority: 2,
  },
  monetization: {
    name: "Monetization",
    port: 4850,
    healthPath: "/health",
    priority: 3,
  },
  telemetry: {
    name: "Telemetry",
    port: 4950,
    healthPath: "/health",
    priority: 1,
  },
  voice: {
    name: "Voice v2",
    port: 9001,
    healthPath: "/health",
    priority: 3,
  },
  strategy: {
    name: "Strategy",
    port: 5050,
    healthPath: "/health",
    priority: 2,
  },
  trends: {
    name: "Trends",
    port: 5060,
    healthPath: "/health",
    priority: 2,
  },
  simulation: {
    name: "Simulation",
    port: 5070,
    healthPath: "/health",
    priority: 3,
  },
  visibility: {
    name: "Visibility",
    port: 5080,
    healthPath: "/health",
    priority: 2,
  },
  accounts: {
    name: "Account Safety",
    port: 5090,
    healthPath: "/health",
    priority: 1,
  },
  ecommerce: {
    name: "E-Commerce",
    port: 5100,
    healthPath: "/health",
    priority: 2,
  },
  engagement: {
    name: "Engagement",
    port: 5110,
    healthPath: "/health",
    priority: 2,
  },
  campaign: {
    name: "Campaign",
    port: 5120,
    healthPath: "/health",
    priority: 2,
  },
  creative: {
    name: "Creative",
    port: 5200,
    healthPath: "/health",
    priority: 2,
  },
  creativeSuite: {
    name: "Creative Suite",
    port: 5250,
    healthPath: "/health",
    priority: 2,
  },
  distribution: {
    name: "Distribution",
    port: 5300,
    healthPath: "/health",
    priority: 2,
  },
};

export function getServiceByName(name: string): ServiceDefinition | undefined {
  return CODEX_SERVICES[name];
}

export function getAllServices(): ServiceDefinition[] {
  return Object.values(CODEX_SERVICES);
}

export function getCriticalServices(): ServiceDefinition[] {
  return getAllServices().filter((s) => s.priority === 1);
}
