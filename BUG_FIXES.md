# whisperlink-debug-log-2026-06-08

This document details the diagnostic steps, explanations, and fixes applied to solve the compilation and linting errors in the WhisperLink codebase.

---

## 1. Positional Parameter Casing & Syntax Error
* **File:** [auth.service.ts](file:///d:/WhisperLink/my-app/src/services/auth.service.ts#L62-L67)
* **Problem:** 
  The `verificationTokenRepository.create` method expects four positional arguments:
  ```ts
  create(userId: string, token: string, type: TokenType, expiresAt: Date)
  ```
  However, it was called using named-argument emulation:
  ```ts
  await verificationTokenRepository.create(
    userId: user.id,
    token: otp,
    ...
  )
  ```
  JavaScript/TypeScript parses this syntax as statement labels inside a call, generating 8 arguments instead of 4, causing the signature match to fail.
* **Solution:** Removed the labels and passed the parameters positionally:
  ```ts
  await verificationTokenRepository.create(
    user.id,
    otp,
    TokenType.EMAIL_VERIFICATION,
    expiresAt
  )
  ```

---

## 2. Missing `await` & Unresolved Promise Lookup
* **File:** [auth.service.ts](file:///d:/WhisperLink/my-app/src/services/auth.service.ts#L186-L188)
* **Problem:** 
  In the `forgotPassword` service method, the asynchronous database call `userRepository.findByEmail` was invoked without `await`. Consequently, `user` was resolved to `Promise<User | null>` instead of the actual `User | null` object, triggering the compiler warning:
  ```
  Property 'id' does not exist on type 'Promise<{ email: string; ... } | null>'.
  ```
  Additionally, the null check was checking `!email` (which referred to an unused `zod` import) rather than checking the resolved `!user`.
* **Solution:** 
  1. Added `await` before the repository call.
  2. Changed the conditional statement to `if (!user)`.
  3. Cleaned up the stray `import { email, success } from "zod"` at the top of the file.

---

## 3. Environment Config Validation Placement (`@t3-oss/env-nextjs`)
* **File:** [env.ts](file:///d:/WhisperLink/my-app/src/lib/env.ts#L81)
* **Problem:** 
  The environment variable `NEXT_PUBLIC_APP_URL` was defined in the `server` validation block. `@t3-oss/env-nextjs` throws a type error if any environment variable prefixed with `NEXT_PUBLIC_` resides in the server-only block.
* **Solution:**
  1. Relocated `NEXT_PUBLIC_APP_URL` schema validation into the `client` config block.
  2. Indented `EMAIL_FROM` properly within the `server` block.
  3. Added both variables to the `runtimeEnv` mapping so they correctly bind at runtime.

---

## 4. Index Signature Mismatch on `SessionPayload`
* **File:** [cookies.ts](file:///d:/WhisperLink/my-app/src/lib/auth/cookies.ts#L21) / [session.ts](file:///d:/WhisperLink/my-app/src/lib/auth/session.ts#L5)
* **Problem:** 
  `SignJWT` from the `jose` library expects payloads of type `JWTPayload` containing an index signature `[key: string]: unknown`. The `SessionPayload` interface lacked this.
* **Solution:** Had `SessionPayload` extend `JWTPayload` from `jose` so it satisfies the index signature requirement natively.

---

## 5. Type Reference Case Sensitivity Typo
* **File:** [jwt.ts](file:///d:/WhisperLink/my-app/src/lib/auth/jwt.ts#L33)
* **Problem:** 
  The return type of `verifyAccessToken` was declared as `Promise<JwtPayload>` (uppercase J), whereas the interface definition was named `jwtPayload` (lowercase j).
* **Solution:** Adjusted the return type reference to `Promise<jwtPayload>` to establish matching case sensitivity.

---

## 6. Assignment Type Operator Bug in Custom `ApiError`
* **File:** [api-error.ts](file:///d:/WhisperLink/my-app/src/lib/api-error.ts#L11)
* **Problem:** 
  The custom `ApiError` class constructor contained a subtraction operator `-` instead of an assignment operator `=`:
  ```ts
  this.statuscode-statusCode;
  ```
  This failed to assign the value, leaving the readonly field `statuscode` uninitialized. There was also a naming mismatch between `statuscode` (defined in the class) and `statusCode` (expected by `route-handler`).
* **Solution:** 
  1. Changed the assignment operator to `=`.
  2. Aligned the case style to `statusCode` across the class, constructor, and handler.
  3. Removed the unused `import { error } from "console"`.

---

## 7. Invalid Import References in Auth Service
* **File:** [auth.service.ts](file:///d:/WhisperLink/my-app/src/services/auth.service.ts#L22)
* **Problem:** 
  * `sendVerificationEmail` and `sendPasswordResetEmail` were imported from `@/lib/email/resend` which did not exist.
  * The method invocations passed 3 arguments instead of 2.
  * `TokenType` was imported from `@prisma/client` but caused a export/generation conflict.
  * The `generateAccessToken` invocation specified an invalid `id` property on the payload.
* **Solution:** 
  1. Fixed imports to point to `@/services/email.service`.
  2. Adjusted parameter signatures to correctly supply `to` and `otp` / `token`.
  3. Imported `TokenType` from `@/repositories/verification-token.repository`.
  4. Mapped `id` to the expected JWT claim standard `sub`.

---

## 8. Missing Encryption/Hashing Helper File
* **File:** [password.ts](file:///d:/WhisperLink/my-app/src/lib/auth/password.ts) [NEW]
* **Problem:** 
  `auth.service.ts` imported `@/lib/auth/password` to hash passwords, but no such file existed in the project codebase.
* **Solution:** Created the `password.ts` library wrapper utilizing `bcryptjs` for secure password hashing and validation.

---

## 9. Next.js Route Request Parsing Bug
* **File:** [route.ts](file:///d:/WhisperLink/my-app/src/app/api/auth/login/route.ts#L13)
* **Problem:** 
  `req.json()` was called without an `await` block in the login route handler. Since `req.json()` returns a Promise, parsing with Zod failed at runtime.
* **Solution:** Added `await` to yield the correct request body object.

---

## 10. ESLint Code Standard Cleanups
* **Files:** [prisma.ts](file:///d:/WhisperLink/my-app/src/lib/prisma/prisma.ts#L77), [session.ts](file:///d:/WhisperLink/my-app/src/lib/auth/session.ts#L54), [message.repository.ts](file:///d:/WhisperLink/my-app/src/repositories/message.repository.ts#L2)
* **Problems:** 
  * `require("pg")` triggered `@typescript-eslint/no-require-imports`.
  * Unused variables/imports flagged by the compiler.
* **Solutions:** 
  1. Imported `Pool` via ES modules.
  2. Used ES2019 optional catch binding (`catch {}`) to eliminate the unused `err` variable.
  3. Removed the unused `Prisma` type import from the message repository.

---

## 11. Database Connection & Migration Errors
* **File:** [.env](file:///d:/WhisperLink/my-app/.env#L25) / [schema.prisma](file:///d:/WhisperLink/my-app/src/lib/prisma/schema.prisma)
* **Problems:** 
  1. The `DATABASE_URL` was defined with a duplicate prefix: `DATABASE_URL="DATABASE_URL="..."`.
  2. The local PostgreSQL password contained an unescaped `@` character (`pratikag@186`), which disrupted URL parsing.
  3. The `token` field in the `VerificationToken` model was missing the `@unique` constraint required for `findUnique` and `delete` operations in the repository.
  4. The custom `prisma-client` generator in `schema.prisma` did not have an explicit `output` path configured, preventing Prisma client compilation.
  5. The `isDifferentDay` function signature in `ai-usage.repository.ts` expected a non-null `Date` but was passed a nullable value (`Date | null`).
* **Solutions:** 
  1. Fixed the duplicate prefix and URL-encoded the `@` symbol to `%40` in `DATABASE_URL`.
  2. Added `@unique` to the `token` field in `schema.prisma`.
  3. Added `output = "../../generated/prisma"` to the client generator config in `schema.prisma`.
  4. Adjusted the parameter signature of `isDifferentDay` in `ai-usage.repository.ts` to accept `Date | null`.
  5. Synced the schema changes to the local DB using `npx prisma db push --accept-data-loss` and re-generated the client.

