import Fastify from "fastify";
import router from "./src/router.js";

const app = Fastify({ logger: true });

app.register(router);

app.listen({ port: 5440, host: "0.0.0.0" }).then(() => {
  console.log("AIE v1 ULTRA-XP running on :5440");
});
