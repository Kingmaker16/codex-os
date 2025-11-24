export interface TurnAppended_v1 {
  kind: "TurnAppended";
  version: 1;
  turnId: string;
  sessionId: string;
  role: "user" | "assistant";
  text: string;
  audioRef?: string;
  ts: string;
}

export interface SummaryUpdated_v1 {
  kind: "SummaryUpdated";
  version: 1;
  sessionId: string;
  summary: string;
  rulesDelta: string[];
  ts: string;
}

export type ContractEvents =
  | TurnAppended_v1
  | SummaryUpdated_v1;
