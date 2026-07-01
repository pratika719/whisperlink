"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./email.worker");
const health_server_1 = require("./health.server");
(0, health_server_1.startHealthServer)();
console.log({
    event: "workers_booted",
});
