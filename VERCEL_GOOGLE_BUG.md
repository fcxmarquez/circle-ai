# Bug: All AI models return 500 on Vercel (works locally)

## Status

**Resolved** — `initChatModel` restored and verified working on Vercel (all providers)

## Symptoms

- Sending any message with any model (OpenAI, Anthropic, Google) returns 500 on Vercel
- UI shows "Failed to send message. Please try again."
- **Works fine on localhost (`bun dev`)**
- **Works fine with a local production build (`bun run build && bun start`)**

## Root cause

`initChatModel` (from the `langchain` package) loads providers through a **variable** dynamic
import — `await import(config.package)` in `langchain/dist/chat_models/universal.js`. That single
line breaks in two independent ways on Vercel:

1. **Bundling.** `langchain` was not in `serverExternalPackages`, so Turbopack bundled it into the
   route chunk. Turbopack cannot resolve a fully-dynamic import expression at build time and
   compiles it into a stub that throws at runtime
   (`Error: Cannot find module as expression is too dynamic`, `code: MODULE_NOT_FOUND`) — it never
   attempts Node resolution, so it fails even if the packages are present in the lambda.

2. **Tracing.** Vercel prunes the lambda using nft (Node File Tracer), which statically follows
   import chains. A variable specifier is untraceable, so `@langchain/openai`,
   `@langchain/anthropic`, and `@langchain/google-genai` were excluded from the lambda even though
   they sat in `node_modules` and `serverExternalPackages`.

Locally both layers are masked because the full `node_modules` tree is always on disk.

A third trap surfaced while fixing this: `outputFileTracingIncludes` globs are **not re-traced**.
Force-including `@anthropic-ai/sdk/**/*` still failed at runtime because its own dependency
(`standardwebhooks`) was not in the include list.

## Fix

Three pieces, all required (commits `ef95f77`, `e0c2722`, `cfe7a33`):

1. **Upgrade the `@langchain/*` stack in lockstep** so `langchain` can be reinstalled:
   `langchain@1.4.x`, `@langchain/core@1.1.48`, `@langchain/openai@1.4.x`,
   `@langchain/anthropic@1.4.x`, `@langchain/google-genai@2.1.x`. (Older `@langchain/core@1.1.40`
   lacked the `./language_models/stream` export that `@langchain/langgraph` needs, crashing
   `next build` with `ERR_PACKAGE_PATH_NOT_EXPORTED`.)

2. **Add `langchain` to `serverExternalPackages`** in `next.config.js`. Unbundled, its dynamic
   import executes as a real Node `import()` and resolves from `node_modules` at runtime.

3. **Literal import anchors** in `lib/langchain/chatService.ts`: an unreachable
   `if (process.env.NFT_TRACE_PROVIDER_IMPORTS)` block containing
   `import("@langchain/openai")` etc. nft traces literal specifiers (and their full transitive
   closure — `openai`, `@anthropic-ai/sdk`, `standardwebhooks`, …) so everything lands in the
   lambda. Runtime still lazy-loads only the requested provider through `initChatModel`. This
   replaced an `outputFileTracingIncludes` glob list, which was brittle (see trap above) and
   shipped ~5,000 files vs ~1,200 with anchors.

## What was tried

| Fix | Commit | Result |
|-----|--------|--------|
| Add `@langchain/google-genai` and `@google/generative-ai` to `serverExternalPackages` | `b8d0d6d` | Still 500 |
| Remove `clientOptions` for non-OpenAI providers | `9ec4e96` | Still 500 |
| Add `@google/generative-ai` as a direct `package.json` dependency | `e26cc93` | Still 500 |
| Replace `initChatModel` with direct per-provider `await import()` | `c5250b8` | Worked (interim fix) |
| Restore `initChatModel` + `outputFileTracingIncludes` globs | `ef95f77` | Still 500 — Turbopack stub (root cause 1) |
| Externalize `langchain` in `serverExternalPackages` | `e0c2722` | OpenAI/Google OK; Anthropic 500 — `standardwebhooks` pruned (include globs not re-traced) |
| **Externalized `langchain` + literal import anchors** | `cfe7a33` | **All providers verified on Vercel** |

## How it was verified

POST to `/api/chat` on the preview deployment with dummy API keys per provider. Success criterion:
the function logs show the **provider's own auth rejection** (OpenAI `401 Incorrect API key`,
Anthropic `authentication_error`, Google `400 API key not valid`) instead of an import/module
error — proving import, model construction, and the HTTP call all work. Then confirmed in the UI
with real keys.

Note: Vercel's log table truncates messages to ~28 chars. Full messages require
`vercel logs <deployment-url> --json` (tail while reproducing; delivery lags up to ~2 min).

## Key files

- `lib/langchain/chatService.ts` — `buildChatModel` via `initChatModel`, trace-anchor imports
- `next.config.js` — `serverExternalPackages` (must include `langchain` and the provider packages)
- `app/api/chat/route.ts` — streams response, logs `"Error in streaming chat:"`
- `app/api/generate-title/route.ts` — logs `"Title generation error:"`
