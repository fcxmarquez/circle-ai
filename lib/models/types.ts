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

type AnthropicAdaptiveEffort = "low" | "medium" | "high" | "max";

type AnthropicReasoningFields = {
  thinking?:
    | { type: "enabled"; budget_tokens: number }
    | { type: "adaptive" }
    | { type: "disabled" };
  outputConfig?: { effort: AnthropicAdaptiveEffort };
};

type OpenAIReasoningEffort = "none" | "low" | "medium" | "high" | "xhigh";

type OpenAIReasoningFields = {
  reasoning?: { effort: OpenAIReasoningEffort };
};

type GoogleThinkingLevel = "LOW" | "MEDIUM" | "HIGH";

type GoogleReasoningFields = {
  thinkingConfig?: { includeThoughts: true; thinkingLevel: GoogleThinkingLevel };
};

export type ReasoningFields =
  | AnthropicReasoningFields
  | OpenAIReasoningFields
  | GoogleReasoningFields;

export type {
  AnthropicAdaptiveEffort,
  AnthropicReasoningFields,
  GoogleReasoningFields,
  GoogleThinkingLevel,
  OpenAIReasoningEffort,
  OpenAIReasoningFields,
};
