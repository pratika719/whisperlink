import http from "http";
import { logger } from "../src/lib/logger";

const port = Number(process.env.PORT || 10000);

export function startHealthServer() {
  const server = http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          service: "whisperlink-worker",
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("WhisperLink worker is running");
  });

  server.listen(port, "0.0.0.0", () => {
    logger.info({
      event: "worker_health_server_started",
      port,
    });
  });
}