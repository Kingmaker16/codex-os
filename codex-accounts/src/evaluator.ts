import { PostEvaluationRequest, PostEvaluationDecision, RiskTier } from "./types.js";
import { getRiskState } from "./state.js";

export function evaluatePost(req: PostEvaluationRequest): PostEvaluationDecision {
  const state = getRiskState(req.accountId);
  if (!state) {
    return {
      ok: false,
      accountId: req.accountId,
      platform: req.platform,
      riskTier: "EXPERIMENT",
      riskScore: 100,
      recommendedAction: "DENY",
      notes: "Unknown account. Refusing to post."
    };
  }

  let recommendedAction: PostEvaluationDecision["recommendedAction"] = "ALLOW";
  let notes = "Account healthy.";

  if (state.status === "WATCH") {
    recommendedAction = state.riskTier === "SAFE" ? "THROTTLE" : "ALLOW";
    notes = "Account under watch; consider slower posting.";
  } else if (state.status === "LIMITED") {
    if (state.riskTier === "SAFE") {
      recommendedAction = "USE_BACKUP_ACCOUNT";
      notes = "Safe account under limited trust. Recommend using a medium-risk or experiment account.";
    } else {
      recommendedAction = "THROTTLE";
      notes = "Account risk elevated. Reduce post frequency and avoid borderline content.";
    }
  } else if (state.status === "PAUSED") {
    if (state.riskTier === "SAFE") {
      recommendedAction = "USE_BACKUP_ACCOUNT";
      notes = "Safe account is at high risk. Do not post. Use experiment layer if necessary.";
    } else {
      recommendedAction = "DENY";
      notes = "Account is at high risk. Automation should pause.";
    }
  }

  return {
    ok: true,
    accountId: req.accountId,
    platform: req.platform,
    riskTier: state.riskTier,
    riskScore: state.riskScore,
    recommendedAction,
    notes
  };
}
