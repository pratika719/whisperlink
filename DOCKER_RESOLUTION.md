# Dockerization & Path Resolution: Issue & Resolution Summary

This document explains the root causes of the build and runtime issues encountered while containerizing the WhisperLink worker service and how they were resolved.

---

## 1. package.json Syntax & Validation Error
### The Error
`Incorrect type. Expected "string".` inside the `"scripts"` block in `package.json`.

### The Blocker
The Prisma configuration block was nested inside `"scripts"`:
```json
"scripts": {
  ...
  "prisma": {
    "schema": "src/lib/prisma/schema.prisma"
  }
}
```
All fields under `"scripts"` must be strings defining command-line scripts. Nesting a JSON object under `"scripts"` breaks package manager schemas and validation tools.

### The Solution
Moved the `"prisma"` block to the root level of the `package.json` object. This makes the syntax valid and keeps the custom configuration accessible:
```json
"scripts": {
  ...
},
"prisma": {
  "schema": "src/lib/prisma/schema.prisma"
}
```

---

## 2. Docker Build Blocker: Prisma Generate Error
### The Error
During the `npm ci` build stage:
```
Error: Could not find Prisma Schema that is required for this command.
You can either provide it with `--schema` argument,
set it in your Prisma Config file (e.g., `prisma.config.ts`),
...
Checked following paths:
schema.prisma: file not found
prisma/schema.prisma: file not found
```

### The Blocker
`npm ci` triggers the `postinstall` hook, which runs `prisma generate`. Prisma 7+ looks for a config file (`prisma.config.ts`) to resolve the schema's location (`src/lib/prisma/schema.prisma`). 

In the initial `Dockerfile.worker`, only `package*.json` and the `src/lib/prisma` folder were copied prior to running `npm ci`. Because `prisma.config.ts` and the main `tsconfig.json` (required by Prisma to parse the TS config file) were missing from the filesystem, Prisma CLI fell back to its default paths, failed to find the schema, and aborted the build.

### The Solution
Copied both `prisma.config.ts` and `tsconfig.json` into the Docker environment prior to running `npm ci`:
```dockerfile
COPY package*.json ./
COPY prisma.config.ts tsconfig.json ./
COPY src/lib/prisma ./src/lib/prisma

RUN npm ci
```

---

## 3. TypeScript Worker Compilation Error
### The Error
`tsc -p tsconfig.worker.json` threw multiple compilation errors:
```
src/lib/api/axios.ts(15,50): error TS2304: Cannot find name 'window'.
src/lib/query-client.ts(22,14): error TS2304: Cannot find name 'window'.
...
```

### The Blocker
The `"include"` property inside `tsconfig.worker.json` originally targeted `"src/lib/**/*.ts"` globally. This forced TypeScript to compile browser-specific modules (like client-side Axios instances and React Query setups) that rely on DOM globals (like `window`). In a standard Node.js worker runtime configuration (which does not load the `"dom"` type library), these references threw compilation errors.

### The Solution
Modified the `"include"` field in `tsconfig.worker.json` to only target `"workers/**/*.ts"`. By including only the worker entrypoints, TypeScript transitively follows the specific import trees required by the backend workers, leaving frontend-specific source files uncompiled:
```json
"include": [
  "workers/**/*.ts"
]
```

---

## 4. Worker Runtime Blocker: Import Alias Resolution
### The Error
Running `npm run worker:start` (which maps to `node dist-worker/workers/index.js`) threw:
```
Error: Cannot find module '@/services/email.service'
```

### The Blocker
The worker imports shared modules using the `@/` path alias configured in `tsconfig.json`. While tools like `tsx` dynamically resolve these aliases in development, the TypeScript compiler (`tsc`) does not rewrite path mappings when outputting JavaScript. Running the compiled files natively with Node.js resulted in a `MODULE_NOT_FOUND` error because Node cannot natively resolve `@/` paths.

### The Solution
1. Installed `tsc-alias` as a devDependency.
2. Updated the `worker:build` script to run both compiler tools:
   ```json
   "worker:build": "tsc -p tsconfig.worker.json && tsc-alias -p tsconfig.worker.json"
   ```
   `tsc-alias` scans the compiled JS files in `dist-worker/` and translates the `@/` import aliases into correct relative paths (e.g. `../src/services/email.service.js`), making the build runnable directly by Node.js.
