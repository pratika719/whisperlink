# WhisperLink 🤫

WhisperLink is a production-grade, secure, and AI-augmented anonymous feedback application. It enables users to generate shareable public profiles to receive honest, anonymous messages from anyone, while providing a powerful, real-time dashboard to read, categorize, and manage messages.

Developed using a modern, scalable architecture, WhisperLink is built not just for functionality, but to showcase professional software engineering practices: **strict type safety**, **concurrency-safe rate limiting**, **secure JWT session management**, **decoupled clean architecture**, and **graceful high-availability LLM integrations**.

---

## 🚀 Key Engineering Showcases

### 1. Robust Authentication & Session Management
* **Secure JWT Sessions:** Custom session management using JSON Web Tokens via HTTP-only, `SameSite=Lax` cookies, protecting user sessions against Cross-Site Scripting (XSS) and Session Hijacking.
* **Dual-State Synchronization:** Bridged server-state validation (using **TanStack React Query** to fetch `/api/auth/me` with strict caching policies) and client-state cache (using **Zustand** persisted via `sessionStorage` to avoid tab leakage).
* **Server-Side Route Protection:** Asynchronous Next.js Server Components intercept requests, evaluate signatures, and trigger server-side redirects to completely eliminate layout flashing.
* **Onboarding Security:** 6-digit verification code flows (OTP) powered by **Nodemailer** with time-sensitive expiration keys.

### 2. High-Availability AI Pipeline (Groq + Llama 3.3)
* **AI Sentiment Analyzer:** Classifies incoming messages into `POSITIVE`, `NEGATIVE`, or `NEUTRAL` categories, assigning a floating-point confidence score `[0.0 - 1.0]` to display color-coded indicators in the user inbox.
* **AI Message Suggestions:** Generates context-appropriate, human-like prompts on public profiles to inspire visitors, custom-tailored to the owner's username.
* **Low-Temperature Determinism:** Overrides LLM temperature configuration to `0.1` to force highly probable tokens and guarantee deterministic classifications.
* **Graceful Degradation & Fallbacks:** If the external LLM provider goes down, the system transparently serves static fallback arrays. If a user exhausts their AI suggestions quota, visitors still see pre-generated suggestions, maintaining a 100% profile uptime.

### 3. Concurrency-Safe Token Bucket Rate Limiter
* **SQL-Level Atomic Increments:** Leverages database-level locks and transactional increments to prevent race conditions during rapid spam attempts (immune to read-modify-write race conditions).
* **Lazy Evaluation Reset:** Daily quotas reset on the *first request of a calendar day* rather than utilizing midnight cron jobs, eliminating database lock contention, timezone bugs, and cron infrastructure dependencies.
* **Lazy Record Initialization:** Saves database storage and reduces write-amplification by initializing user AI usage records only when they trigger an AI feature for the first time.

---

## 🏗️ System Architecture & Data Flow

WhisperLink follows a hybrid **Feature-Sliced Design (FSD)** and **Service-Repository Pattern** to segregate concerns. This architecture decouples presentation, business controllers, orchestrators, and data-access layers:

```mermaid
graph TD
    %% Boundaries
    subgraph Client ["Client Boundary (Browser)"]
        Form["Send Message Form"]
        Pills["Suggestion Pills Component"]
        Card["Message Card (Inbox View)"]
        ReactQuery["TanStack React Query Hooks"]
        ClientAPI["Axios API Client"]
    end

    subgraph API ["API Controller Layer"]
        RouteSug["POST /api/ai/suggestions"]
        RouteSend["POST /api/messages/send"]
        RouteUsage["GET /api/ai/usage"]
    end

    subgraph Service ["Business Logic Layer (Services)"]
        ServiceAI["AI Service"]
        ServiceMsg["Message Service"]
    end

    subgraph Infra ["AI Core Infrastructure"]
        PromptBuilder["Prompt Templates"]
        GroqProv["Groq SDK Provider"]
        Parser["AI Parser & Zod Schema Validation"]
        GroqAPI["Groq Cloud API (Llama 3.3-70b-versatile)"]
    end

    subgraph Data ["Data Access Layer (Repositories & DB)"]
        UsageRepo["AI Usage Repository"]
        MsgRepo["Message Repository"]
        DB[(PostgreSQL Database)]
    end

    %% Suggestion Generation Flow
    Form -->|Click 'Generate Ideas'| ReactQuery
    ReactQuery -->|Calls| ClientAPI
    ClientAPI -->|POST Request| RouteSug
    RouteSug -->|Check Quota / Get User| UsageRepo
    UsageRepo <-->|Query / Write Quota| DB
    RouteSug -->|If Quota Allowed: Call| ServiceAI
    ServiceAI -->|Builds Prompt| PromptBuilder
    ServiceAI -->|Invokes Generate| GroqProv
    GroqProv -->|Send System & User Message| GroqAPI
    GroqAPI -->|Raw JSON Text| GroqProv
    GroqProv -->|Return Text| ServiceAI
    ServiceAI -->|Validate & Clean| Parser
    Parser -->|Return Validated JSON| ServiceAI
    ServiceAI -->|Return Array| RouteSug
    RouteSug -->|Increment Quota Usage| UsageRepo
    RouteSug -->|JSON Response| ClientAPI
    ClientAPI -->|Data Hydration| ReactQuery
    ReactQuery -->|Render Pills| Pills
    Pills -->|Click Pill| Form

    %% Message Submission & Sentiment Analysis Flow
    Form -->|Submit Message| RouteSend
    RouteSend -->|Invoke Send| ServiceMsg
    ServiceMsg -->|Check Quota| UsageRepo
    ServiceMsg -->|If Allowed: Call| ServiceAI
    ServiceAI -->|Invoke Generate with low temperature = 0.1| GroqProv
    GroqProv -->|Generate Sentiment JSON| GroqAPI
    GroqAPI -->|JSON Sentiment & Score| Parser
    Parser -->|Return Sentiment Object| ServiceMsg
    ServiceMsg -->|Increment Analysis Quota| UsageRepo
    ServiceMsg -->|Save message + sentiment| MsgRepo
    MsgRepo -->|Prisma Write| DB
    Card -->|Reads Sentiment Badge & Confidence| DB
```

---

## 🛠️ Tech Stack & Directory Structure

* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript (Strict Type Safety)
* **Database:** PostgreSQL via Prisma ORM
* **State Management:** Zustand (Tab-bound Session Storage) & TanStack React Query (Server-State Synchronization)
* **API Client:** Axios with Dynamic Interceptors
* **AI Provider:** Groq SDK (Llama 3.3-70b-versatile)
* **Styling:** Tailwind CSS + Radix UI + shadcn/ui

```text
whisperlink/
├── src/
│   ├── app/                   # Next.js App Router (Pages, Layouts & API Routes)
│   ├── components/            # Reusable core UI components (buttons, inputs, layout containers)
│   ├── features/              # Feature-sliced modules (Auth, Messages, AI)
│   │   ├── auth/              # Auth forms, hooks (useLogin), Zustand auth store
│   │   ├── messages/          # Message inbox components, hooks, cards
│   │   └── ai/                # AI components, custom query hooks, Axios client
│   ├── lib/                   # Deep system infrastructure & configs
│   │   ├── ai/                # LLM providers, prompts, parser, and schemas
│   │   ├── api/               # Centralized Axios instance configuration
│   │   ├── auth/              # JWT verification, password hashing, and cookie helpers
│   │   └── prisma/            # Prisma Client wrapper and Schema file
│   ├── repositories/          # Pure Data Access Layer (Prisma SQL queries)
│   ├── services/              # Business Logic Orchestration (Auth, Email, Messages, AI)
│   ├── schemas/               # Zod validation schemas for APIs
│   └── types/                 # Shared TypeScript declarations
```

---

## 💡 Senior Engineering Code Patterns

### Pattern 1: Concurrency-Safe, Lazy-Evaluated Rate Limiting
To prevent API billing exhaustion and spam, the quota system in [ai-usage.repository.ts](file:///d:/WhisperLink/my-app/src/repositories/ai-usage.repository.ts) relies on **Lazy Evaluation** and **Atomic Database Updates**:

```typescript
// Excerpt from src/repositories/ai-usage.repository.ts

export const aiUsageRepository = {
  /**
   * Evaluates usage and resets the daily counter on-demand.
   * Eliminates the need for fragile, timezone-sensitive midnight cron jobs.
   */
  async canUseSuggestions(userId: string): Promise<{ allowed: boolean; remaining: number }> {
    const usage = await this.findOrCreate(userId);
    const shouldReset = this.isDifferentDay(usage.lastUsedAt);

    if (shouldReset) {
      // Lazy reset on next user interaction — atomic, timezone-independent update
      const reset = await prisma.aIUsage.update({
        where: { userId },
        data: { suggestionsUsed: 0, analysisUsed: 0, lastUsedAt: new Date() },
      });
      return { allowed: true, remaining: DAILY_SUGGESTION_LIMIT };
    }

    const remaining = DAILY_SUGGESTION_LIMIT - usage.suggestionsUsed;
    return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
  },

  /**
   * Increments usage atomically inside a database transaction.
   * Prevents read-modify-write race conditions under high concurrent requests.
   */
  async incrementSuggestions(userId: string) {
    return prisma.$transaction([
      prisma.aIUsage.update({
        where: { userId },
        data: {
          suggestionsUsed: { increment: 1 },
          lastUsedAt: new Date(),
        },
      }),
      prisma.aIUsageLog.create({
        data: { userId, feature: "suggestions" },
      }),
    ]);
  }
};
```

### Pattern 2: Breaking Circular Dependencies in Axios Interceptors
Statically importing the Zustand Auth Store at the top of the Axios client creates circular dependency chains: `axios.ts` ➡️ `auth.store.ts` ➡️ `auth.client.ts` ➡️ `axios.ts`. 

In [axios.ts](file:///d:/WhisperLink/my-app/src/lib/api/axios.ts), we utilize **dynamic runtime imports** inside the interceptor's error block. This allows the compiler to resolve imports cleanly and prevents runtime initialization crashes:

```typescript
// Excerpt from src/lib/api/axios.ts

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Detect expired or invalidated session token (401 Unauthorized)
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const pathname = window.location.pathname;
      const isPublicPath = pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/u/");

      if (!isPublicPath) {
        // Dynamic runtime import breaks circular dependencies
        import("@/features/auth/store/auth.store").then(({ useAuthStore }) => {
          useAuthStore.getState().logout(); // Evict client state cache
        });

        window.location.href = "/login"; // Clear browser location context
      }
    }
    return Promise.reject(error);
  }
);
```

### Pattern 3: Layout Flashing Mitigation (Server Component Security)
In Next.js App Router, using client-side redirects causes jarring "layout flashes" while page scripts evaluate authentication state. WhisperLink blocks layout flashing by validating JWTs on the server in [layout.tsx](file:///d:/WhisperLink/my-app/src/app/dashboard/layout.tsx) before transmitting any HTML:

```typescript
// Excerpt from src/app/dashboard/layout.tsx

export default async function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  // Reads HttpOnly JWT cookie directly from headers
  const token = await getSessionCookie();
  if (!token) {
    redirect("/login"); // Instantly redirects on the server
  }

  // Verifies cryptographic signature on the backend
  const user = await verifyAccessToken(token);

  return (
    <DashboardLayout user={{ username: user.username, email: user.email }}>
      {children}
    </DashboardLayout>
  );
}
```

---

## 🗄️ Database Schema Blueprint

WhisperLink uses PostgreSQL. Below is the simplified Prisma data schema containing the key indices optimization for performance queries:

```prisma
// Excerpt from src/lib/prisma/schema.prisma

enum Sentiment {
  POSITIVE
  NEGATIVE
  NEUTRAL
}

model User {
  id              String             @id @default(cuid())
  username        String             @unique
  email           String             @unique
  password        String
  isVerified      Boolean            @default(false)
  acceptMessages  Boolean            @default(true)
  createdAt       DateTime           @default(now())
  
  messages        Message[]          @relation("ReceivedMessages")
  aiUsage         AIUsage?
  
  @@index([email])
  @@index([username])
}

model Message {
  id              String             @id @default(cuid())
  receiverId      String
  receiver        User               @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)
  content         String
  isRead          Boolean            @default(false)
  isArchived      Boolean            @default(false)
  isDeleted       Boolean            @default(false)
  
  // AI Sentiment Fields
  sentiment       Sentiment?
  sentimentScore  Float?             // Range [0.0 - 1.0]
  createdAt       DateTime           @default(now())

  @@index([receiverId])
  @@index([createdAt])
}

model AIUsage {
  id              String             @id @default(cuid())
  userId          String             @unique
  user            User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  suggestionsUsed Int                @default(0)
  analysisUsed    Int                @default(0)
  lastUsedAt      DateTime?

  @@index([userId])
}
```

---

## ⚙️ Local Setup & Installation

Follow these steps to spin up the local development environment:

### 1. Prerequisites
* **Node.js:** v20+ recommended
* **PostgreSQL:** Local database running or Neon Server access

### 2. Environment Configurations
Create a `.env` file in the root directory:
```env
# Database Credentials
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/whisperlink?schema=public"

# Crypto Secret (JWT)
JWT_SECRET="generate-a-long-secure-random-string-here"

# AI Provider Configurations
GROQ_API_KEY="gsk_your_groq_api_key_here"

# SMTP Configuration (Email OTP)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="your-smtp-username"
SMTP_PASSWORD="your-smtp-password"
EMAIL_FROM="no-reply@whisperlink.com"

# App Context URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Installation Commands
```bash
# Clone the repository
git clone https://github.com/<your-username>/whisperlink.git
cd whisperlink

# Install dependencies
npm install

# Build Prisma Client & Run Database Migrations
npx prisma db push

# Generate Prisma Client manually (if not done in postinstall)
npx prisma generate

# Run the local development server
npm run dev
```

### 4. Build and Code Quality
```bash
# Verify type safety and compile the Next.js production bundle
npm run build

# Run code linter checks
npm run lint
```

---

## 🚀 Deployment & Containerization

WhisperLink is designed to run as a multi-service containerized application, separating the frontend Next.js app from the BullMQ email and background job worker.

### 📦 Worker Service Architecture

The worker service resides in `workers/index.ts` and processes queued background jobs (such as verification and password reset emails). To run the worker service, you can use the following commands:

#### 1. Running Locally
- **Development Mode** (uses on-the-fly TS transpilation and resolves path mappings):
  ```bash
  npm run worker:dev
  ```
- **Production Build & Run** (compiles TypeScript to JavaScript in `dist-worker/` and resolves `@/` imports using `tsc-alias`):
  ```bash
  npm run worker:build
  npm run worker:start
  ```

#### 2. Running inside Docker
A dedicated `Dockerfile.worker` is provided for containerizing the worker. 

To build and run the worker image individually:
```bash
docker build -f Dockerfile.worker -t whisperlink-worker .
docker run -e REDIS_URL=redis://your-redis:6379 -e DATABASE_URL=postgresql://your-db:5432/db whisperlink-worker
```

### 🕸️ Orchestrating with Docker Compose

A pre-configured `docker-compose.yml` orchestrates:
- **PostgreSQL (`postgres`)**: Database service.
- **Redis (`redis`)**: Message broker for BullMQ.
- **Worker (`worker`)**: Background job processor.

Inside the containerized environment, the worker automatically resolves connections using the internal Docker Compose service names (`postgres` and `redis`) instead of `localhost`:
- `DATABASE_URL=postgresql://whisper_user:whisper_password@postgres:5432/whisperlink_v2?schema=public`
- `REDIS_URL=redis://redis:6379`

To spin up all services together:
```bash
docker compose up -d --build
```

### 📋 Production Guidelines
For checklist validation (including TLS/SSL configurations, PgBouncer pooling, and secret key generation), please refer to our [production_env_checklist.md](file:///d:/WhisperLink/my-app/production_env_checklist.md).

