import fetch from "node-fetch";
import { SRLFinding } from "../types.js";

const OPS_URL = "http://localhost:5350";
const TELEMETRY_URL = "http://localhost:4950";

export async function checkSystemStress(): Promise<SRLFinding[]> {
  const findings: SRLFinding[] = [];
  try {
    const tele = await fetch(TELEMETRY_URL + "/metrics").then(r => r.json()).catch(() => null) as any;
    if (tele && tele.cpu && tele.cpu > 0.85) {
      findings.push({
        type: "RESOURCE_STRESS",
        level: "WARN",
        message: "CPU usage is high. Avoid launching heavy workflows."
      });
    }
  } catch {}
  try {
    await fetch(OPS_URL + "/ops/health").catch(() => {});
  } catch {}
  return findings;
}
