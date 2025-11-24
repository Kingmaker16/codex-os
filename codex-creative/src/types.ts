export interface CreativeRequest {
  domain: "social" | "ecomm" | "trading" | "kingmaker" | "creative";
  niche: string;
  product?: string;
  audience?: string;
  goal: string;
}

export interface CreativeConcept {
  id: string;
  type: "video" | "script" | "hook" | "angle" | "storyboard" | "headline";
  title: string;
  description: string;
  beats?: string[];
  callToAction?: string;
  confidence: number;
  sourceModels: string[];
}

export interface CreativeResponse {
  ok: boolean;
  concepts: CreativeConcept[];
  nicheInsights: string;
}
