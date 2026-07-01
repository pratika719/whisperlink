# Production Environment Configuration Checklist

Use this checklist to ensure that WhisperLink and its worker service are safely, securely, and optimally configured for production environments.

## 1. Database Configuration (PostgreSQL)
- [ ] **Database URL**: Set `DATABASE_URL` to a production PostgreSQL database.
- [ ] **Connection Pooling**: Use a pooler (e.g., PgBouncer) for high traffic. The URL should point to the pooler's port (usually `6543` on Supabase/Neon).
- [ ] **SSL Connections**: Ensure the database URL includes `?sslmode=require` (or equivalent) to encrypt database traffic.
- [ ] **Migrations**: Run migrations during deployment using `npx prisma migrate deploy` (never run `prisma db push` in production).

## 2. Redis Cache & Queue
- [ ] **Redis Connection**: Set `REDIS_URL` using a secure TLS connection (e.g., `rediss://...` instead of `redis://`).
- [ ] **Authentication**: Ensure Redis requires password authentication.
- [ ] **Persistence**: Enable AOF (Append Only File) or RDB snapshots if queue state durability is critical.

## 3. Authentication & Secrets
- [ ] **AUTH_SECRET**: Ensure `AUTH_SECRET` is a secure 32+ character random string (generated via `openssl rand -base64 32`).
- [ ] **Token Expiration**: Set appropriate expiration limits on session tokens.

## 4. SMTP Email Delivery
- [ ] **Email Credentials**: Set `SMTP_HOST`, `SMTP_PORT` (usually `465` for SSL or `587` for STARTTLS), `SMTP_USER`, and `SMTP_PASSWORD` to a transactional email provider (e.g., Resend, SendGrid, Amazon SES).
- [ ] **Verified Sender**: Ensure `EMAIL_FROM` matches a verified domain on your email provider to prevent emails from going to spam.

## 5. Third-Party APIs
- [ ] **API Keys**: Configure `GROQ_API_KEY` (and any other keys) using production API tokens.
- [ ] **Rate Limiting**: Enable spending limits and monitor usage quotas in the API provider dashboard to prevent unexpected billing.

## 6. Docker & Container Security
- [ ] **Production Env Var**: Ensure `NODE_ENV` is set to `production` in container runs.
- [ ] **No Secrets in Images**: Do not burn secrets (like database credentials) into the Dockerfile or commit `.env` files to git. Pass them at runtime via container environments.
- [ ] **Resource Limits**: Set CPU and memory limits for the worker container (e.g., in Docker Compose or Kubernetes) to prevent resource starvation.

## 7. Logging & Observability
- [ ] **Pino Log Level**: Configure `LOG_LEVEL` (defaults to `info` in production). Avoid `debug` or `trace` in production to prevent spamming logs and leaking sensitive data.
- [ ] **Pretty Printing**: Ensure pretty-printing (`pino-pretty`) is disabled in production to keep logs in a structured JSON format suitable for log collectors (Datadog, AWS CloudWatch, Logstash).
