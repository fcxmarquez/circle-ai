import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { initChatModel } from "langchain";
import {
  getModelConfig,
  getReasoningFields,
  type ReasoningLevel,
} from "@/constants/models";
import type { ModelType } from "@/store/types";

export const DEFAULT_SYSTEM_PROMPT =
  "You are EnkiAI, a helpful and knowledgeable AI assistant.";

const DEFAULT_TIMEOUT_MS = 120_000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_TEMPERATURE = 0.7;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatServiceConfig {
  openAIKey?: string;
  anthropicKey?: string;
  selectedModel: ModelType;
  reasoningLevel?: ReasoningLevel;
  maxTokens?: number;
  timeoutMs?: number;
  maxRetries?: number;
  temperature?: number;
}

export interface SendMessageStreamOptions {
  systemPrompt?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
}

const PROVIDER_PREFIX: Record<"OpenAI" | "Anthropic", string> = {
  OpenAI: "openai",
  Anthropic: "anthropic",
};

async function buildChatModel(
  config: ChatServiceConfig
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

  // initChatModel forwards fields to the underlying ChatOpenAI/ChatAnthropic
  // constructor. Anthropic uses `clientOptions.timeout`; OpenAI takes `timeout`
  // at the top level — we pass both, the unused one is ignored.
  const fields: Record<string, unknown> = {
    apiKey,
    maxTokens: config.maxTokens,
    maxRetries,
    timeout: timeoutMs,
    clientOptions: { timeout: timeoutMs },
    ...getReasoningFields(modelConfig, reasoningLevel),
  };

  if (modelConfig.reasoning.supportsTemperature) {
    fields.temperature = temperature;
  }

  const llm = await initChatModel(
    `${PROVIDER_PREFIX[modelConfig.provider]}:${config.selectedModel}`,
    fields
  );

  return { llm: llm as unknown as BaseChatModel, timeoutMs };
}

export class ChatService {
  private llm: BaseChatModel;
  private timeoutMs: number;
  private static instance: ChatService | null = null;
  private static lastConfig: string | null = null;

  private constructor(llm: BaseChatModel, timeoutMs: number) {
    this.llm = llm;
    this.timeoutMs = timeoutMs;
  }

  public static async getInstance(config: ChatServiceConfig): Promise<ChatService> {
    const configHash = JSON.stringify({
      openAIKey: config.openAIKey,
      anthropicKey: config.anthropicKey,
      selectedModel: config.selectedModel,
      reasoningLevel: config.reasoningLevel,
      maxTokens: config.maxTokens,
      timeoutMs: config.timeoutMs,
      maxRetries: config.maxRetries,
      temperature: config.temperature,
    });
    if (ChatService.instance && configHash === ChatService.lastConfig) {
      return ChatService.instance;
    }

    const { llm, timeoutMs } = await buildChatModel(config);
    ChatService.instance = new ChatService(llm, timeoutMs);
    ChatService.lastConfig = configHash;
    return ChatService.instance;
  }

  private convertToLangChainMessages(history: ChatMessage[]) {
    return history.map((msg) =>
      msg.role === "user" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    );
  }

  public async *sendMessageStream(
    message: string,
    history: ChatMessage[] = [],
    options: SendMessageStreamOptions = {}
  ): AsyncGenerator<string, void, unknown> {
    try {
      const historyMessages = this.convertToLangChainMessages(history);
      const systemPrompt = options.systemPrompt ?? DEFAULT_SYSTEM_PROMPT;
      const messages = [
        ...(systemPrompt.trim() ? [new SystemMessage(systemPrompt)] : []),
        ...historyMessages,
        new HumanMessage(message),
      ];

      const stream = await this.llm.stream(messages, {
        timeout: options.timeoutMs ?? this.timeoutMs,
        signal: options.signal,
      });

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) yield chunkText;
      }
    } catch (error) {
      console.error("Error in streaming chat:", error);
      throw error;
    }
  }
}
