# Bug: All AI models return 500 on Vercel (works locally)

## Status

**Verified** — fix confirmed working on Vercel (all providers)

## Symptoms

- Sending any message with any model (OpenAI, Anthropic, Google) returns 500 on Vercel
- UI shows "Failed to send message. Please try again."
- **Works fine on localhost (`bun dev`)**
- **Works fine with a local production build (`bun run build && bun start`)**

## Error progression in Vercel logs

All messages are truncated by the Vercel log table (roughly 27–28 char display limit per row).

### Deployment 1 (before any fix)

```
Error in streaming chat: Er...
```

### Deployment 2 (after adding debug logging — since reverted)

```
CHAT_ERR [Error] Unable to ...
TITLE_BUILD_ERR [Error] Una...
```

"Unable to import" is the error LangChain's `initChatModel` throws when a dynamic `await import('@langchain/xxx')` fails at runtime. The error originates inside `buildChatModel` in `lib/langchain/chatService.ts`, before any API call is made.

### Deployment 3 (after adding `@google/generative-ai` as direct dep)

```
Error in streaming chat: Er...
Title generation error: Err...
```

Different prefix — `@google/generative-ai` dep was likely not the root cause, or there is a second layer of failure now that the import itself resolves.

## What was tried

| Fix | Commit | Result |
|-----|--------|--------|
| Add `@langchain/google-genai` and `@google/generative-ai` to `serverExternalPackages` | `b8d0d6d` | Still 500 |
| Remove `clientOptions` for non-OpenAI providers | `9ec4e96` | Still 500 |
| Add `@google/generative-ai` as a direct `package.json` dependency | `e26cc93` | Still 500 |
| **Replace `initChatModel` with direct per-provider `await import()`** | `c5250b8` | **Confirmed working on Vercel** |

## Root cause hypothesis

`chatService.ts` calls `initChatModel` from the `langchain` package. `initChatModel` uses conditional `await import(...)` at runtime to lazy-load provider packages (`@langchain/openai`, `@langchain/anthropic`, `@langchain/google-genai`).

Vercel bundles serverless functions using **nft (Node File Tracer)**. nft statically traces import chains to determine which files to include in the lambda. Dynamic imports inside `node_modules/langchain/...` are NOT in our source code — nft may not trace them, so the provider packages are absent at runtime even though they are listed in `node_modules` and `serverExternalPackages`.

`serverExternalPackages` only tells the Next.js bundler not to inline these packages — it does not force nft to include them.

Since `bun start` runs against the full local `node_modules` tree, all packages are present and nothing fails. Vercel's lambda zip is pruned, so the missing packages surface only in production.

The same failure affects OpenAI and Anthropic — confirming it is NOT provider-specific but a universal `initChatModel` dynamic-import tracing problem.

## Fix applied

**Direct per-provider `await import()`** — replaced `initChatModel` with explicit branches in our source code. nft traces these and includes provider packages in the lambda.

```ts
if (provider === "OpenAI") {
  const { ChatOpenAI } = await import("@langchain/openai");
  llm = new ChatOpenAI({ ...fields });
} else if (provider === "Anthropic") {
  const { ChatAnthropic } = await import("@langchain/anthropic");
  llm = new ChatAnthropic({ ...fields });
} else {
  const { ChatGoogleGenerativeAI } = await import("@langchain/google-genai");
  llm = new ChatGoogleGenerativeAI({ ...fields });
}
```

## Why not Option B (`outputFileTracingIncludes`)?

`outputFileTracingIncludes` with the `langchain` aggregator package was investigated but is **not viable** with this dependency tree. `langchain@1.3.x` depends on `@langchain/langgraph@^1.2.8`, and resolving that range brings in `@langchain/langgraph@1.3.x` which requires `@langchain/core@^1.1.48`. Our pinned `@langchain/core@1.1.40` exports a subpath (`./language_models/stream`) that does not exist, crashing the Next.js build at page-data collection time with:

```
ERR_PACKAGE_PATH_NOT_EXPORTED: Package subpath './language_models/stream' is not defined
by "exports" in @langchain/core/package.json
```

`outputFileTracingIncludes` would require upgrading the entire `@langchain/*` stack in lockstep — a separate task. The direct-import approach has no such constraint and is the official LangChain JS recommendation anyway (`npm install @langchain/openai @langchain/anthropic @langchain/google-genai`).

## Key files

- `lib/langchain/chatService.ts` — `buildChatModel` calls `initChatModel`
- `next.config.js` — `serverExternalPackages` list
- `app/api/chat/route.ts` — streams response, logs `"Error in streaming chat:"`
- `app/api/generate-title/route.ts` — logs `"Title generation error:"`
