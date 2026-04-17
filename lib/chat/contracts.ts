import { z } from "zod";
import {
  MODEL_VALUES,
  type ModelValue,
  REASONING_LEVELS,
  type ReasoningLevel,
} from "@/constants/models";

export const ChatRoleSchema = z.enum(["user", "assistant"]);

export type ChatRole = z.infer<typeof ChatRoleSchema>;

export const ChatMessageSchema = z.object({
  role: ChatRoleSchema,
  content: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatModelConfigSchema = z.object({
  openAIKey: z.string().optional(),
  anthropicKey: z.string().optional(),
  selectedModel: z.enum(MODEL_VALUES),
  reasoningLevel: z.enum(REASONING_LEVELS).optional(),
  maxTokens: z.number().int().positive().optional(),
  timeoutMs: z.number().int().positive().optional(),
  maxRetries: z.number().int().min(0).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export type ChatModelConfig = z.infer<typeof ChatModelConfigSchema>;
export type ChatApiKeys = Pick<ChatModelConfig, "openAIKey" | "anthropicKey">;
export type ChatModelSelection = {
  selectedModel?: ModelValue;
  enabledModels?: readonly ModelValue[];
};
export type ChatReasoningConfig = {
  selectedModel: ModelValue;
  reasoningLevel: ReasoningLevel;
};

export const ChatStreamRequestSchema = z.object({
  message: z.string().trim().min(1, "Message is required."),
  history: z.array(ChatMessageSchema).default([]),
  systemPrompt: z.string().optional(),
  config: ChatModelConfigSchema,
});

export type ChatStreamRequest = z.infer<typeof ChatStreamRequestSchema>;
