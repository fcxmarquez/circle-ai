export const REASONING_LEVELS = ["none", "low", "medium", "high", "max"] as const;

export type ReasoningLevel = (typeof REASONING_LEVELS)[number];

export type ModelProvider = "OpenAI" | "Anthropic" | "Google" | "Local";

export type ApiKeyType = "openAIKey" | "anthropicKey" | "googleKey";

export interface ModelReasoning {
  configurable: boolean;
  supportsTemperature: boolean;
  defaultLevel: ReasoningLevel;
  levels: readonly ReasoningLevel[];
}

export interface ModelDefinition {
  value: string;
  label: string;
  provider: ModelProvider;
  requiresKey: ApiKeyType | null;
  reasoning: ModelReasoning;
}

export type AnthropicAdaptiveEffort = "low" | "medium" | "high" | "max";

export type AnthropicReasoningFields = {
  thinking?:
    | { type: "enabled"; budget_tokens: number }
    | { type: "adaptive" }
    | { type: "disabled" };
  outputConfig?: { effort: AnthropicAdaptiveEffort };
};

export type OpenAIReasoningEffort = "none" | "low" | "medium" | "high" | "xhigh";

export type OpenAIReasoningFields = {
  reasoning?: { effort: OpenAIReasoningEffort };
};

export type GoogleThinkingLevel = "LOW" | "MEDIUM" | "HIGH";

export type GoogleReasoningFields = {
  thinkingConfig?: { includeThoughts: true; thinkingLevel: GoogleThinkingLevel };
};

export type ReasoningFields =
  | AnthropicReasoningFields
  | OpenAIReasoningFields
  | GoogleReasoningFields;
