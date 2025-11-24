import fetch from "node-fetch";

export const AUTONOMY_URL      = "http://localhost:5420";
export const WORKFLOW_URL      = "http://localhost:5430";
export const HARDENING_URL     = "http://localhost:5555";
export const SRL_URL           = "http://localhost:5540";
export const OPS_URL           = "http://localhost:5350";
export const STRATEGY_URL      = "http://localhost:5050";
export const SIM_URL           = "http://localhost:5070";

export async function postJson(url: string, body: any) {
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await resp.json().catch(()=>({}));
  return { ok: resp.ok, status: resp.status, data };
}
