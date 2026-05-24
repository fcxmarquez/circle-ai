[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Circle

Circle is an open-source AI chat client built for power users who want full control over their AI experience. It runs as a Next.js web application that you can self-host on your own infrastructure, connecting directly to the AI providers of your choice using your own API keys — no intermediary, no markup, no lock-in.

---

## ✨ Current Features

### 🤖 Multi-Provider Model Support

Circle connects to multiple AI providers through a unified interface:

- **Anthropic** — Claude models via the Anthropic API
- **OpenAI** — GPT models via the OpenAI API
- **Google** — Gemini and Gemma models via the Google API
- **Local (in-browser)** — runs models directly in your browser via WebGPU/WASM with no API key required; auto-selects a model tier based on your hardware

### 🧠 Configurable Reasoning

For models that support extended thinking (Claude, GPT, Gemini), you can set the reasoning depth per message: none, low, medium, high, or max. The interface adapts the available levels to each model's capabilities.

### ⚡ Streaming Chat

Responses stream token by token with a stop button to interrupt generation at any point.

### 💬 Conversation Management

- Conversations are listed in a collapsible sidebar
- New chats automatically receive an AI-generated title after the first exchange
- State is persisted to localStorage so your history survives page reloads

### ⌨️ Keyboard-First UX

Global keyboard shortcuts for common actions, a model selector in the header, and a responsive layout that works on both desktop and mobile.

### 💾 Local-First Storage

Conversations and configuration are persisted to localStorage, so your history and API keys survive page reloads without requiring an account or backend. Backend storage is in development.

---

## 🗺️ Roadmap

### Near Term

- 🪙 **Token tracking** — display input/output token counts and estimated cost per conversation to make API spend visible
- 🛑 **Spend limits** — configurable hard caps per provider to prevent runaway charges
- 🔀 **OpenRouter support** — a single API key to access hundreds of models from multiple providers

### Core Platform

- 🗄️ **Persistent backend** — full server-side storage for chat history and user configuration, replacing the current localStorage approach, to support multiple devices and sessions
- 🔐 **OAuth system** — a complete auth overhaul enabling sign-in with Google and other providers, with proper session management

### Organization & Customization

- 📁 **Project system** — group conversations into projects with per-project custom instructions and attached files, so you can maintain separate contexts for work, research, or personal use
- 🖼️ **Multimedia upload** — attach images, documents, and other files directly to messages

### Extended Capabilities

- 🌐 **Web search** — real-time web access via Exa MCP, injected into the context before the model responds
- 🔌 **MCP support** — connect any Model Context Protocol server to extend what the model can see and do
- 🐧 **Agent sandbox** — a small Linux environment (filesystem, shell) the model can use as an action space for multi-step tasks
- 🗣️ **Multi-agent debate** — route complex queries through multiple model instances that challenge and refine each other's answers before surfacing a response, inspired by Grok's debate architecture
- 🔬 **Deep research** — an autonomous research pipeline that decomposes a question, searches iteratively, and synthesizes a structured report

---

## 🚀 Self-Hosting

### Prerequisites

- Node.js 18+ or Bun
- API keys for whichever providers you want to use (not required if using local in-browser models)

### Setup

```bash
git clone https://github.com/fcxmarquez/circle-ai.git
cd circle-ai
bun install
bun dev
```

Open the app, go to settings, and enter your API keys. Everything is stored locally in your browser — no account or backend required.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **AI**: LangChain (OpenAI + Anthropic + Google integrations)
- **Local inference**: Hugging Face Transformers.js via WebGPU/WASM
- **State**: Zustand with localStorage persistence
- **UI**: shadcn/ui + Tailwind CSS
- **Package manager**: Bun

---

## 📄 License

MIT
