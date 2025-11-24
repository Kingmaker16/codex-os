// Orchestrator integration route configuration
// Add to codex-orchestrator/src/index.ts:
//
// import fetch from "node-fetch";
//
// app.all("/optimizer/*", async (req, reply) => {
//   const path = req.url.replace("/optimizer", "");
//   const url = `http://localhost:5490${path}`;
//   const resp = await fetch(url, {
//     method: req.method,
//     headers: { "Content-Type": "application/json" },
//     body: req.method !== "GET" ? JSON.stringify(req.body) : undefined
//   });
//   const data = await resp.json();
//   return data;
// });

export const ORCHESTRATOR_ROUTE_CONFIG = {
  prefix: "/optimizer",
  target: "http://localhost:5490",
  methods: ["GET", "POST"]
};
