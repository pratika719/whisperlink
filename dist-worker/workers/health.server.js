"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startHealthServer = startHealthServer;
const http_1 = __importDefault(require("http"));
const logger_1 = require("../src/lib/logger");
const port = Number(process.env.PORT || 10000);
function startHealthServer() {
    const server = http_1.default.createServer((req, res) => {
        if (req.url === "/health") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
                status: "ok",
                service: "whisperlink-worker",
                timestamp: new Date().toISOString(),
            }));
            return;
        }
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("WhisperLink worker is running");
    });
    server.listen(port, "0.0.0.0", () => {
        logger_1.logger.info({
            event: "worker_health_server_started",
            port,
        });
    });
}
