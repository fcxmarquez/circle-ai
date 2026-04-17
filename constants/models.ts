export type ReasoningLevel = "none" | "low" | "medium" | "high" | "max";

export type ModelProvider = "OpenAI" | "Anthropic" | "Google";

export type ApiKeyType = "openAIKey" | "anthropicKey" | "googleKey";

export interface ModelReasoning {
  configurable: boolean;
  supportsTemperature: boolean;
  defaultLevel: ReasoningLevel;
  levels: ReasoningLevel[];
}

export interface ModelDefinition {
  value: string;
  label: string;
  provider: ModelProvider;
  requiresKey: ApiKeyType;
  description: string;
  reasoning: ModelReasoning;
}

export const MODEL_OPTIONS: ModelDefinition[] = [
  {
    value: "claude-sonnet-4-5-20250929",
    label: "Claude 4.5 Sonnet",
    provider: "Anthropic",
    requiresKey: "anthropicKey",
    description: "Best coding model with enhanced capabilities",
    reasoning: {
      configurable: true,
      supportsTemperature: true,
      defaultLevel: "none",
      levels: ["none", "low", "medium", "high"],
    },
  },
  {
    value: "claude-opus-4-5-20251101",
    label: "Claude 4.5 Opus",
    provider: "Anthropic",
    requiresKey: "anthropicKey",
    description: "Most intelligent model for complex reasoning",
    reasoning: {
      configurable: true,
      supportsTemperature: true,
      defaultLevel: "none",
      levels: ["none", "low", "medium", "high", "max"],
    },
  },
  {
    value: "claude-haiku-4-5-20251001",
    label: "Claude 4.5 Haiku",
    provider: "Anthropic",
    requiresKey: "anthropicKey",
    description: "Fastest, most cost-efficient Claude model",
    reasoning: {
      configurable: false,
      supportsTemperature: true,
      defaultLevel: "none",
      levels: ["none"],
    },
  },
  {
    value: "gpt-5.2",
    label: "GPT-5.2",
    provider: "OpenAI",
    requiresKey: "openAIKey",
    description: "Flagship reasoning model for complex tasks",
    reasoning: {
      configurable: true,
      supportsTemperature: false,
      defaultLevel: "none",
      levels: ["none", "low", "medium", "high", "max"],
    },
  },
  {
    value: "gpt-5-mini",
    label: "GPT-5 Mini",
    provider: "OpenAI",
    requiresKey: "openAIKey",
    description: "Balanced for intelligence, speed, and cost",
    reasoning: {
      configurable: false,
      supportsTemperature: true,
      defaultLevel: "none",
      levels: ["none"],
    },
  },
  {
    value: "gpt-5-nano",
    label: "GPT-5 Nano",
    provider: "OpenAI",
    requiresKey: "openAIKey",
    description: "Fastest, most cost-effective GPT model",
    reasoning: {
      configurable: false,
      supportsTemperature: true,
      defaultLevel: "none",
      levels: ["none"],
    },
  },
];

export const DEFAULT_MODEL = "claude-sonnet-4-5-20250929";
export const DEFAULT_ENABLED_MODELS = ["claude-sonnet-4-5-20250929", "gpt-5-mini"];

export function getModelConfig(modelValue: string): ModelDefinition | undefined {
  return MODEL_OPTIONS.find((m) => m.value === modelValue);
}

export const MODEL_LABELS = MODEL_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = { label: option.label, provider: option.provider };
    return acc;
  },
  {} as Record<string, { label: string; provider: string }>
);

export const MODEL_VALUES = MODEL_OPTIONS.map((option) => option.value) as [
  string,
  ...string[],
];

type AnthropicReasoningFields = {
  thinking?: { type: "enabled"; budget_tokens: number } | { type: "disabled" };
};

type OpenAIReasoningEffort = "none" | "low" | "medium" | "high";

type OpenAIReasoningFields = {
  reasoning?: { effort: OpenAIReasoningEffort };
};

export type ReasoningFields = AnthropicReasoningFields | OpenAIReasoningFields;

// Minimum thinking budget accepted by Anthropic is 1024 tokens. Claude 4.5
// only supports manual extended thinking (adaptive thinking is 4.6+).
const ANTHROPIC_THINKING_BUDGETS: Record<ReasoningLevel, number | null> = {
  none: null,
  low: 1024,
  medium: 4096,
  high: 10_000,
  max: 16_000,
};

// GPT-5.2 accepts { none, low, medium, high }. "xhigh" only exists on
// gpt-5.1-codex-max / gpt-5.3-codex, which we don't surface here.
const OPENAI_REASONING_EFFORTS: Record<ReasoningLevel, OpenAIReasoningEffort> = {
  none: "none",
  low: "low",
  medium: "medium",
  high: "high",
  max: "high",
};

export function getReasoningFields(
  model: ModelDefinition,
  level: ReasoningLevel
): ReasoningFields {
  if (!model.reasoning.configurable || !model.reasoning.levels.includes(level)) {
    return {};
  }

  if (model.provider === "Anthropic") {
    const budget = ANTHROPIC_THINKING_BUDGETS[level];
    if (budget === null) return {};
    return { thinking: { type: "enabled", budget_tokens: budget } };
  }

  if (model.provider === "OpenAI") {
    return { reasoning: { effort: OPENAI_REASONING_EFFORTS[level] } };
  }

  return {};
}
