import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { initChatModel } from "langchain";
import type {
  ChatApiKeys,
  ChatMessage,
  ChatModelConfig,
  ChatStreamEvent,
} from "@/lib/chat/contracts";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/chat/prompt";
import {
  getModelConfig,
  getReasoningFields,
  supportsTemperatureAtLevel,
} from "@/lib/models";

const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_TEMPERATURE = 0.7;

type CloudProvider = "OpenAI" | "Anthropic" | "Google";

const PROVIDER_PREFIX: Record<CloudProvider, string> = {
  OpenAI: "openai",
  Anthropic: "anthropic",
  Google: "google-genai",
};

const PROVIDER_KEY: Record<CloudProvider, keyof ChatApiKeys> = {
  OpenAI: "openAIKey",
  Anthropic: "anthropicKey",
  Google: "googleKey",
};

export interface StreamChatResponseOptions {
  message: string;
  history?: ChatMessage[];
  config: ChatModelConfig;
  systemPrompt?: string;
  signal?: AbortSignal;
}

async function buildChatModel(
  config: ChatModelConfig
): Promise<{ llm: BaseChatModel; timeoutMs: number }> {
  const modelConfig = getModelConfig(config.selectedModel);
  if (!modelConfig) {
    throw new Error(`Unknown model: ${config.selectedModel}`);
  }

  if (modelConfig.provider === "Local") {
    throw new Error(
      `${modelConfig.label} runs in the browser and cannot be used server-side.`
    );
  }

  const provider = modelConfig.provider;
  const apiKey = config[PROVIDER_KEY[provider]];
  if (!apiKey) {
    throw new Error(`${provider} API key is required for ${modelConfig.label}.`);
  }

  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
  const reasoningLevel = config.reasoningLevel ?? modelConfig.reasoning.defaultLevel;

  const reasoningFields = getReasoningFields(modelConfig, reasoningLevel);
  const withTemperature = supportsTemperatureAtLevel(modelConfig, reasoningLevel);
  const temperatureField = withTemperature
    ? { temperature: config.temperature ?? DEFAULT_TEMPERATURE }
    : {};

  const providerFields =
    provider === "OpenAI"
      ? {
          maxTokens: config.maxTokens,
          timeout: timeoutMs,
          // clientOptions is OpenAI SDK-specific; other providers reject it
          clientOptions: { timeout: timeoutMs },
        }
      : provider === "Anthropic"
        ? { maxTokens: config.maxTokens, timeout: timeoutMs }
        : { maxOutputTokens: config.maxTokens };

  const llm = await initChatModel(
    `${PROVIDER_PREFIX[provider]}:${config.selectedModel}`,
    {
      apiKey,
      maxRetries,
      ...temperatureField,
      ...reasoningFields,
      ...providerFields,
    }
  );

  return { llm, timeoutMs };
}

function convertToLangChainMessages(history: ChatMessage[]) {
  return history.map((msg) =>
    msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
  );
}

export async function generateConversationTitle(
  message: string,
  config: ChatModelConfig
): Promise<string> {
  const { llm } = await buildChatModel({
    ...config,
    reasoningLevel: "none",
    temperature: 0.3,
  });

  const result = await llm.invoke([
    new SystemMessage(
      "You generate brief conversation titles. Reply with only the title — no quotes, no trailing punctuation."
    ),
    new HumanMessage(
      `Generate a title of 3–7 words for a conversation starting with this message:\n\n${message}`
    ),
  ]);

  const raw = result.contentBlocks
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  return raw
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/[.!?]+$/, "")
    .trim()
    .slice(0, 80);
}

export async function* streamChatResponse({
  message,
  history = [],
  config,
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  signal,
}: StreamChatResponseOptions): AsyncGenerator<ChatStreamEvent, void, unknown> {
  try {
    const historyMessages = convertToLangChainMessages(history);
    const messages = [
      ...(systemPrompt.trim() ? [new SystemMessage(systemPrompt)] : []),
      ...historyMessages,
      new HumanMessage(message),
    ];

    const { llm, timeoutMs } = await buildChatModel(config);
    const stream = await llm.stream(messages, {
      timeout: timeoutMs,
      signal,
    });

    for await (const chunk of stream) {
      for (const block of chunk.contentBlocks) {
        if (block.type === "text" && block.text) {
          yield { t: "content", d: block.text };
        } else if (block.type === "reasoning" && block.reasoning) {
          yield { t: "thinking", d: block.reasoning };
        }
      }
    }
  } catch (error) {
    console.error("Error in streaming chat:", error);
    throw error;
  }
}
