import Fastify from "fastify";

const app = Fastify();
app.get("/", async () => ({ ok: true, service: "SERVICE_NAME" }));

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen({ port, host: "0.0.0.0" }).then(() => {
  console.log(`SERVICE_NAME listening on :${port}`);
});
