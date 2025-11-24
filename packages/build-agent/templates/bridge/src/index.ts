import Fastify from "fastify";

const app = Fastify();

app.get("/health", async () => ({
  ok: true,
  version: "0.1.0",
  service: "codex-bridge"
}));

app.get("/providers", async () => ([
  "openai",
  "deepseek"
]));

app.post("/respond", async (req, res) => {
  const { provider = "openai", model = "mock" } = (req.query as any) || {};
  const mockOutput = `Mock reply from ${provider}:${model}`;
  return { provider, model, output: mockOutput, usage: { prompt_tokens: 5, completion_tokens: 5 } };
});

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen({ port, host: "0.0.0.0" }).then(() => {
  console.log(`codex-bridge listening on :${port}`);
});
