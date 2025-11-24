import net from "node:net";

export async function findFreePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    function tryPort(port: number) {
      const server = net.createServer();
      server.unref();

      server.once("error", (err: any) => {
        if (err && err.code === "EADDRINUSE") {
          server.close(() => tryPort(port + 1));
        } else {
          server.close(() => reject(err));
        }
      });

      server.once("listening", () => {
        server.close(() => resolve(port));
      });

      server.listen(port, "0.0.0.0");
    }

    tryPort(startPort);
  });
}
