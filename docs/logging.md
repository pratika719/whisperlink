# Structured Logging & Observability Architecture

This document describes the design and implementation of structured logging, request correlation (Request IDs), asynchronous task observability, and health monitoring in WhisperLink.

---

## 1. Concepts of Structured Logging

In production backends, unstructured console logs (`console.log("User registered: " + email)`) are difficult to query, parse, and filter. Structured logging solves this by formatting log entries as machine-readable JSON objects. 

Every log entry in WhisperLink contains standardized metadata fields:
- `level`: Log severity (info, warn, error, debug).
- `time`: ISO 8601 timestamp.
- `service`: Name of the service (`whisperlink`).
- `environment`: The current runtime environment (development, production).
- `event`: A unique, snake_case string denoting the specific code event (e.g. `request_started`, `email_job_completed`).

---

## 2. Pino Logger Configuration
WhisperLink uses **Pino**, the fastest structured JSON logger for Node.js. 

The configuration file is located at [logger.ts](file:///d:/WhisperLink/my-app/src/lib/logger.ts):
```typescript
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: {
    service: "whisperlink",
    environment: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
```

During local development (`NODE_ENV !== "production"`), the dev server utilizes `pino-pretty` to format these raw JSON logs into human-readable colored console streams, while production environments ingest the raw JSON directly into centralized log aggregation systems (like Datadog, AWS CloudWatch, or Logtail).

---

## 3. Request Correlation (Request IDs)
To trace transactions as they cross network boundaries (e.g., from an HTTP request to an asynchronous Redis queue worker), we generate a unique Request ID for each transaction.

The utility is defined in [request-id.ts](file:///d:/WhisperLink/my-app/src/lib/utils/request-id.ts):
```typescript
import crypto from "crypto";

export function createRequestId() {
  return crypto.randomUUID();
}
```

### Flow of a Request ID:
1. An incoming HTTP request hits an API endpoint.
2. The route wrapper (`withLogging`) reads the incoming `x-request-id` header or generates a new one.
3. The Request ID is injected into database context, logs, and any enqueued asynchronous jobs (`payload.requestId`).
4. The background queue worker retrieves the Request ID from the job payload and prefixes all of its internal processing logs with that ID.
5. You can query your logs by a single `requestId` to view the entire request-to-delivery lifecycle.

---

## 4. HTTP Request Logging Middleware
We implement structured request logging via a higher-order route wrapper in [route-handler.ts](file:///d:/WhisperLink/my-app/src/lib/route-handler.ts#L41-L93):

```typescript
export function withLogging(
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>
) {
  return async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const requestId = req.headers.get("x-request-id") || createRequestId();
    const url = new URL(req.url);

    logger.info({
      event: "request_started",
      requestId,
      method: req.method,
      url: url.pathname + url.search,
    });

    try {
      const response = await handler(req, ...args);

      logger.info({
        event: "request_completed",
        requestId,
        method: req.method,
        url: url.pathname + url.search,
        status: response.status,
        durationMs: Date.now() - startTime,
      });

      response.headers.set("x-request-id", requestId);
      return response;
    } catch (error) {
      logger.error({
        event: "request_failed",
        requestId,
        method: req.method,
        url: url.pathname + url.search,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        durationMs: Date.now() - startTime,
      });
      throw error;
    }
  };
}
```

This wrapper intercepts all HTTP starts, completions, and failures, and appends the `x-request-id` header to the outgoing HTTP response.

---

## 5. Async Worker & Email Service Observability
The background worker in [email.worker.ts](file:///d:/WhisperLink/my-app/workers/email.worker.ts) and the core mail delivery client in [email.service.ts](file:///d:/WhisperLink/my-app/src/services/email.service.ts) are fully hooked into the structured logger.

- **Job Start:** Logged as `email_job_started` carrying `requestId`, `jobId`, and `jobType`.
- **Job Completion:** Logged as `email_job_completed` with duration metrics.
- **Job Failure:** Logged as `bullmq_job_failed` at error level with the full stack trace.
- **Provider Status:** Logs `verification_email_sent_to_provider` or `password_reset_email_sent_to_provider` upon successful SMTP transport handoff.

If SMTP delivery fails, the email service explicitly throws the error, causing the BullMQ worker to register a job failure, trigger backoff retries, and log the incident.

---

## 6. Deep Health Monitoring
The deep health check at `/api/health` ([route.ts](file:///d:/WhisperLink/my-app/src/app/api/health/route.ts)) checks the health of three essential system components independently:
1. **PostgreSQL Connection:** Tested via `prisma.$queryRaw` (executing `SELECT 1`).
2. **Redis Connection:** Tested via raw `redis.ping()` (expecting `"PONG"`).
3. **Queue Health:** Tested via `emailQueue.getJobCounts()`.

If any of these dependencies fail, the endpoint returns `503 Service Unavailable`, specifying exactly which system failed.

---

## 7. Testing Procedures

### A. Worker Stopped Test
1. **Stop the background worker process:**
   Terminate the worker thread (e.g. stop `npm run worker:dev`).
2. **Enqueue a Job:**
   Trigger an OTP request (e.g., by submitting registration) or request a password reset.
3. **Verify Queue Staged Status:**
   Request `/api/health`. You will see `queue.jobCounts.waiting` increment to `1` (since no active worker is fetching the job).
4. **Restart the Worker:**
   Boot the worker process (`npm run worker:dev`).
5. **Verify Queue Processing:**
   Observe the worker console log. The worker will pick up the staged job from Redis immediately.
   Verify `/api/health` to confirm `queue.jobCounts.waiting` is back to `0` and `queue.jobCounts.completed` has increased.

### B. Failed Email Test
1. **Simulate a delivery failure:**
   Temper SMTP credentials in your local `.env` (e.g., change `SMTP_PASSWORD` to an invalid string).
2. **Enqueue a Job:**
   Submit an OTP or password reset request.
3. **Verify Worker Backoff and Failure Logging:**
   - The worker console will log a `bullmq_job_failed` error.
   - It will attempt delivery 3 times (configured in `email.queue.ts` via `attempts: 3` and exponential `backoff`) before giving up.
   - Verify `/api/health` to confirm `queue.jobCounts.failed` increments.

---

## 8. Resources & External Documentation

To deepen your understanding of logging patterns and Pino:

- [Pino Official Documentation](https://getpino.io/) — Performance benchmarks, API guide, and pretty-printing configuration.
- [Pino GitHub Repository](https://github.com/pinojs/pino) — Core source code and architectural details.
- [Twelve-Factor App Methodology: Logs](https://12factor.net/logs) — The industry standard guidelines on why logs should be treated as event streams.
- [BullMQ Documentation: Job Retries & Backoff](https://docs.bullmq.io/guide/jobs/retries) — Understanding how failed worker jobs are automatically retried.
