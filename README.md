# WhisperLink 🤫

WhisperLink is a modern, production-grade anonymous feedback application. It allows users to generate a unique public link to receive honest, anonymous messages from anyone, while providing a powerful dashboard to manage, read, and organize those messages securely.

## 🚀 Features Built So Far

### 1. Robust Authentication System
* **Custom Session Management:** Secure JWT-based authentication utilizing HTTP-only cookies (`jose` and `bcryptjs`).
* **Complete User Flows:** Login, Registration, and Session persistence (`/auth/me`).
* **Email Verification & OTP:** Users receive 6-digit verification codes upon registration. (Powered by Nodemailer & Resend API).
* **Password Recovery:** Forgot Password and Reset Password flows with secure, time-sensitive tokens.
* **Global Auth State:** Client-side user sessions managed via Zustand.

### 2. Anonymous Messaging System
* **Public Profiles:** Shareable URLs (`/u/[username]`) where anyone can securely submit an anonymous message.
* **Inbox Dashboard:** A rich UI for users to read, delete, and archive received messages.
* **Message Controls:** Users can toggle whether they are currently accepting new anonymous messages.
* **Live Unread Counts:** Real-time inbox polling powered by React Query.

### 3. Settings & Preferences
* Users can view their profile information and seamlessly toggle their messaging preferences on or off without reloading.

### 4. Modern UI & UX
* **Tech Stack:** Tailwind CSS, shadcn/ui, Radix UI, and Lucide Icons.
* **Dark Mode:** Built-in seamless dark mode support (`next-themes`).
* **Optimistic UI Updates:** Fast and fluid interactions for deleting and archiving messages via React Query mutations.

### 5. Advanced AI Capabilities (Groq + Llama 3.3)
* **AI Message Suggestions:** Inspires visitors on public profile pages by generating context-sensitive conversation suggestions.
* **AI Sentiment Analyzer:** Categorizes incoming messages (POSITIVE, NEGATIVE, NEUTRAL) with confidence ratings and presents color-coded visual indicators in the dashboard.
* **Token Bucket Quota Engine:** Enforces daily limits securely via atomic SQL database writes to protect API quotas.
* **Full Architectural Deep Dive:** Documented in [docs/ai-architecture.md](file:///d:/WhisperLink/my-app/docs/ai-architecture.md).

---

## 🏗️ Architecture & File Structure

The project follows a robust **Feature-Sliced Design** mixed with a **Service/Repository Pattern** to separate concerns cleanly:

```text
whisperlink/
├── prisma/                    # Database migrations and schema definitions
├── src/
├── docs/                      # Architectural design specifications & diagrams
│   ├── auth-architecture.md   # Authentication design
│   └── ai-architecture.md     # AI system design
│   ├── app/                   # Next.js App Router (Pages & API Routes)
│   │   ├── (auth)/            # Auth pages: login, register, verify, forgot-password
│   │   ├── api/               # API endpoints (/api/auth/*, /api/messages/*, /api/ai/*)
│   │   ├── dashboard/         # Protected dashboard and inbox views
│   │   └── u/[username]/      # Public message-sending profile pages
│   │
│   ├── components/            # Reusable UI components (shadcn/ui, providers)
│   │
│   ├── features/              # Feature-sliced modules encapsulating their own logic
│   │   ├── auth/              # Auth hooks, stores, API clients, and components
│   │   ├── messages/          # Messaging hooks, API clients, and Inbox components
│   │   └── ai/                # AI hooks, API clients, suggestion pills, and components
│   │
│   ├── lib/                   # Core utilities and configuration
│   │   ├── ai/                # AI Core providers, prompts, parser, and response schemas
│   │   ├── api/               # Axios client configuration
│   │   ├── auth/              # JWT, password hashing, and cookie helpers
│   │   ├── email/             # Nodemailer / Resend clients
│   │   ├── prisma/            # Prisma client instance and schema.prisma
│   │   ├── env.ts             # Strict environment variable validation (Zod)
│   │   └── route-handler.ts   # Standardized API response wrappers
│   │
│   ├── repositories/          # Data Access Layer (Database queries only)
│   │   ├── message.repository.ts
│   │   ├── user.repository.ts
│   │   ├── verification-token.repository.ts
│   │   └── ai-usage.repository.ts
│   │
│   ├── schemas/               # Zod validation schemas for API inputs
│   │
│   └── services/              # Business Logic Layer (Processes data before saving)
│       ├── auth.service.ts
│       ├── email.service.ts
│       ├── message.service.ts
│       └── ai.service.ts
```

### Why this architecture?
1. **Separation of Concerns:** Controllers (API Routes) handle HTTP parsing, `Services` handle business logic (like checking if a user accepts messages), and `Repositories` handle Prisma database queries.
2. **Feature Isolation:** Grouping hooks, components, and client-side API calls inside `src/features/` prevents the `src/components` folder from becoming bloated and makes specific domains easy to find.
3. **Type Safety & Validation:** `Zod` is used natively for everything from environment variables to incoming API requests, ensuring strict end-to-end type safety.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS + shadcn/ui
* **Database:** PostgreSQL (Neon) via Prisma ORM
* **State Management:** Zustand (Client State) + React Query (Server State)
* **Authentication:** Custom JWT (`jose`)
* **Email:** Nodemailer
* **AI Provider:** Groq Cloud SDK (Llama 3.3-70b-versatile)

## 📝 What's Next?
* **UI Automated Replies:** Fully exposing the backend's automated reply suggestions (casual, witty, thoughtful) inside the user's dashboard view.
* **Push Notifications:** Real-time alert notifications when new messages are received.
