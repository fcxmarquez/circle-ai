---
alwaysApply: true
---

# Repo rules

This file provides guidance to AI agent when working with code in this repository.

## Development Commands

### Core Development

- `bun dev` - Start development server with Turbopack
- `bun run build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run Biome (lint + format check)
- `bun format` - Format code with Biome
- `bun lint:fix` - Auto-fix lint and format issues with Biome
- `bun install` - Install dependencies

### Database Management

- `bun migrate:generate` - Generate database migrations
- `bun migrate:push` - Generate and push migrations to database
- `npx drizzle-kit push` - Push schema changes to database

### Testing & Quality Assurance

- `bun test` - Run all tests (unit tests in `lib/**/*.test.ts` + Storybook browser tests)
- `bun test --project=unit` - Run only unit tests
- `bun test --project=storybook` - Run only Storybook browser tests
- `bun storybook` - Run Storybook development server
- `bun build-storybook` - Build Storybook for production
- `npx tsx --noEmit && bun lint && bun build` - Complete quality check (run this after finishing tasks)

### Git Workflow

- Ask for the confirmation of the user before committing code.
- The commit doesn't have to have a body. Has to be brief. Don't mention you as co-author in the commit message.
- Follows @commitlint/config-conventional standards

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Package Manager**: bun
- **State Management**: Zustand with persistence
- **Database**: Supabase PostgreSQL with Drizzle ORM
- **UI Components**: shadcn/ui + Tailwind CSS
- **AI Integration**: LangChain (OpenAI & Anthropic)
- **Data Fetching**: TanStack Query
- **Animations**: Motion library
- **Forms**: React Hook Form

### Project Structure

#### `/app` - Next.js App Router

- Main application layout with sidebar navigation
- Authentication pages (login, callback, auth-error)
- Global providers setup (QueryClient, ThemeProvider, ErrorBoundary)

#### `/components` - UI Components

- **Organized by functionality**: Buttons, Inputs, Modals, Feedback, etc.
- **UI components**: shadcn/ui components in `/ui` directory
- **Navigation**: Sidebar, nav actions, chat history, model selector
- **Chat**: Conversation components, bubble chat, input chat

#### `/db` - Database Layer

- **Schema**: Drizzle schema definitions for users, conversations, messages
- **Migrations**: Auto-generated SQL migrations
- **Relations**: Database relationships and constraints

#### `/store` - State Management

- **Zustand store with slices pattern**:
  - `uiSlice` - UI state (modals, status)
  - `chatSlice` - Chat conversations and messages
  - `configSlice` - API keys and model configuration
  - `userSlice` - User authentication state
- **Persistence**: Chat conversations and config are persisted to localStorage
- **Selectors**: Exported hooks for accessing store state

#### `/fetch` - API Layer

- **Query hooks**: TanStack Query is available for request/response-style data fetching
- **Chat transport**: Streaming chat requests use `lib/chat/client.ts` and `app/api/chat/route.ts`

#### `/lib` - Utilities & Services

- **ChatService**: Stateless LangChain adapter for AI model interactions
  - Supports OpenAI (GPT, O-series) and Anthropic (Claude) models
  - Handles streaming responses and model-specific configuration
  - Reasoning models (o3, o4-mini) don't use temperature parameter

## Key Implementation Details

### State Management Pattern

- Zustand store with multiple slices for separation of concerns
- Persisted state with version migration support
- Exported selector hooks for component consumption

### AI Integration

- Chat transport validates shared request contracts before reaching LangChain
- ChatService builds provider-specific LangChain models per request
- Supports both OpenAI and Anthropic via LangChain
- Streaming responses with chunk-by-chunk processing
- Model-specific configuration (temperature, reasoning models)

### Database Schema

- Users table with Supabase auth integration
- Conversations belong to users
- Messages cascade delete with conversations
- Requires manual Supabase trigger setup for user creation

### Authentication

- Supabase authentication (currently disabled for rebuild - see providers.tsx)
- Row Level Security policies for data access
- OAuth integration (Google) mentioned in README

### Environment Setup

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`

## Development Guidelines

### Code Quality

- Always run `npx tsx --noEmit && bun lint && bun build` after completing tasks
- Use conventional commit messages
- Follow existing component patterns and naming conventions

### React / JSX Conventions

- Use ternary (`cond ? <JSX /> : null`) instead of `&&` for conditional rendering inside JSX. Prevents accidentally rendering `0`, `NaN`, or `""` when the left operand is not a boolean. Applies only to JSX render positions (`{cond && <JSX>}`) — keep `&&` in `if`-conditions, return expressions, `cn()` arguments, ternary conditions, and other JS logical expressions.

### Linear Task Management

- When working with Linear MCP or Linear Tasks, never move tasks to completed status

### Testing

- Vitest configured with two projects: `unit` (node environment, `lib/**/*.test.ts`) and `storybook` (Playwright/chromium)
- `bun test` runs both projects; use `--project=unit` or `--project=storybook` to run one
- Storybook for component development and visual testing
