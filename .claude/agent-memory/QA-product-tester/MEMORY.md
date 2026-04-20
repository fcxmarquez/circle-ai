# QA Product Tester - Agent Memory

## Project Overview

- **App**: Circle - AI chat application built with Next.js 15, Zustand, shadcn/ui
- **Local URL**: http://localhost:3000
- **Start command**: `bun dev` from `/Volumes/sourcecode/projects/circle-ai`

## Testing Patterns

- Always check if dev server is running first with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
- Use `mcp__claude-in-chrome__javascript_tool` with `window.location.href` to verify URLs
- Use `mcp__claude-in-chrome__read_console_messages` with `onlyErrors: true` to check for silent JS errors
- Wait 2-3 seconds after navigation for Next.js client-side routing to settle
- Use zoom feature to inspect sidebar highlights and small UI details

## Known App Characteristics

- Conversations are persisted in localStorage via Zustand persistence
- Sidebar uses hover state for three-dot menu visibility (not active state)
- Invalid conversation URLs redirect to `/` via `router.replace("/")`
- `/chat/` without an ID returns a 404 (no `app/chat/page.tsx` exists) -- known gap
- `New chat` button uses `router.push("/")` to reset to welcome screen

## Tested Features (2026-02-10)

- [FCX-52] URL chat-based routing: See `fcx-52-url-routing.md`
