export interface PlatformVisibility {
  platform: string;     
  shadowban: boolean;   
  reachScore: number;   
  visibilityLevel: "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";
  warnings: string[];
  lastChecked: string;
}

export interface VisibilityReport {
  accountId: string;
  platform: string;
  visibility: PlatformVisibility;
  recommendations: string[];
}

export interface TrendSignal {
  trend: string;
  intensity: number; 
}

export interface SafetySignal {
  tier: string;     
  riskScore: number; 
}

export interface VisibilityFusionResult {
  fusedScore: number;
  fusedStatus: string;
  reasons: string[];
}
