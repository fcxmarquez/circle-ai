import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { initChatModel } from "langchain";
import {
  getModelConfig,
  getReasoningFields,
  supportsTemperatureAtLevel,
} from "@/constants/models";
import type { ChatMessage, ChatModelConfig } from "@/lib/chat/contracts";

export const DEFAULT_SYSTEM_PROMPT =
  "You are EnkiAI, a helpful and knowledgeable AI assistant.";

const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_TEMPERATURE = 0.7;

const PROVIDER_PREFIX: Record<"OpenAI" | "Anthropic", string> = {
  OpenAI: "openai",
  Anthropic: "anthropic",
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

  if (modelConfig.provider === "Google") {
    throw new Error("Google Gemini support is not yet implemented.");
  }

  const apiKey =
    modelConfig.provider === "Anthropic" ? config.anthropicKey : config.openAIKey;
  if (!apiKey) {
    throw new Error(
      modelConfig.provider === "Anthropic"
        ? "Anthropic API key is required for Claude models."
        : "OpenAI API key is required for OpenAI models."
    );
  }

  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = config.maxRetries ?? DEFAULT_MAX_RETRIES;
  const temperature = config.temperature ?? DEFAULT_TEMPERATURE;
  const reasoningLevel = config.reasoningLevel ?? modelConfig.reasoning.defaultLevel;

  const fields: Record<string, unknown> = {
    apiKey,
    maxTokens: config.maxTokens,
    maxRetries,
    timeout: timeoutMs,
    clientOptions: { timeout: timeoutMs },
    ...getReasoningFields(modelConfig, reasoningLevel),
  };

  if (supportsTemperatureAtLevel(modelConfig, reasoningLevel)) {
    fields.temperature = temperature;
  }

  const llm = await initChatModel(
    `${PROVIDER_PREFIX[modelConfig.provider]}:${config.selectedModel}`,
    fields
  );

  return { llm: llm as unknown as BaseChatModel, timeoutMs };
}

function convertToLangChainMessages(history: ChatMessage[]) {
  return history.map((msg) =>
    msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
  );
}

export async function* streamChatResponse({
  message,
  history = [],
  config,
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  signal,
}: StreamChatResponseOptions): AsyncGenerator<string, void, unknown> {
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
      const chunkText = chunk.text;
      if (chunkText) {
        yield chunkText;
      }
    }
  } catch (error) {
    console.error("Error in streaming chat:", error);
    throw error;
  }
}
