import { FastifyInstance } from "fastify";
import axios from "axios";

const SIM_URL = "http://localhost:5070";

export async function simRouter(app: FastifyInstance) {
  app.post("/sim/run", async (req, reply) => {
    try {
      const resp = await axios.post(`${SIM_URL}/sim/run`, req.body, {
        timeout: 60000,
        headers: { "Content-Type": "application/json" }
      });
      return resp.data;
    } catch (err: any) {
      reply.status(err.response?.status || 500);
      return {
        ok: false,
        error: "sim_proxy_error",
        message: err.message
      };
    }
  });
}
