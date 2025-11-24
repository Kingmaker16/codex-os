import { CrossValRequest, CrossValResult } from "./types.js";
import { callAllModels } from "./modelClient.js";
import { analyzeOutputs } from "./analysisEngine.js";
import { logCrossValToBrain } from "./brainClient.js";

export async function runCrossValidation(req: CrossValRequest): Promise<CrossValResult> {
  const outputs = await callAllModels(req.prompt, req.maxTokens ?? 256);
  const analysis = analyzeOutputs(outputs);

  const result: CrossValResult = {
    ok: true,
    sessionId: req.sessionId,
    domain: req.domain,
    fusedAnswer: analysis.fusedText,
    confidence: analysis.confidence,
    issues: analysis.issues,
    modelOutputs: outputs
  };

  await logCrossValToBrain(result);
  return result;
}
