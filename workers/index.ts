import "./email.worker";
import { startHealthServer } from "./health.server";

startHealthServer();

console.log({
  event: "workers_booted",
});