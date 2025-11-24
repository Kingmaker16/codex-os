import Fastify from "fastify";
import { MacOptimizer } from "./optimizer.js";

const app = Fastify({ logger: true });
const optimizer = new MacOptimizer();

app.get("/health", () => ({ ok: true, service: "mac-optimizer" }));

app.post("/optimize/run", async () => {
  const report = optimizer.run();
  return { ok: true, report };
});

app.listen({ port: 4900, host: "0.0.0.0" })
  .then(() => console.log("Codex Mac Optimizer running on :4900"));
