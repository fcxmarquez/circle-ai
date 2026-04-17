export const REASONING_LEVELS = ["none", "low", "medium", "high", "max"] as const;

export type ReasoningLevel = (typeof REASONING_LEVELS)[number];

export type ModelProvider = "OpenAI" | "Anthropic" | "Google";

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
  requiresKey: ApiKeyType;
  reasoning: ModelReasoning;
}

export const MODEL_OPTIONS = [
  {
    value: "claude-opus-4-7",
    label: "Claude Opus 4.7",
    provider: "Anthropic",
    requiresKey: "anthropicKey",
    reasoning: {
      configurable: true,
      supportsTemperature: true,
      defaultLevel: "none",
      levels: ["none", "low", "medium", "high", "max"],
    },
  },
  {
    value: "claude-sonnet-4-6",
    label: "Claude Sonnet 4.6",
    provider: "Anthropic",
    requiresKey: "anthropicKey",
    reasoning: {
      configurable: true,
      supportsTemperature: true,
      defaultLevel: "none",
      levels: ["none", "low", "medium", "high", "max"],
    },
  },
  {
    value: "claude-haiku-4-5-20251001",
    label: "Claude Haiku 4.5",
    provider: "Anthropic",
    requiresKey: "anthropicKey",
    reasoning: {
      configurable: true,
      supportsTemperature: true,
      defaultLevel: "none",
      levels: ["none", "low", "medium", "high"],
    },
  },
  {
    value: "gpt-5.4",
    label: "GPT-5.4",
    provider: "OpenAI",
    requiresKey: "openAIKey",
    reasoning: {
      configurable: true,
      supportsTemperature: true,
      defaultLevel: "none",
      levels: ["none", "low", "medium", "high", "max"],
    },
  },
  {
    value: "gpt-5.4-mini",
    label: "GPT-5.4 Mini",
    provider: "OpenAI",
    requiresKey: "openAIKey",
    reasoning: {
      configurable: true,
      supportsTemperature: true,
      defaultLevel: "none",
      levels: ["none", "low", "medium", "high", "max"],
    },
  },
  {
    value: "gpt-5.4-nano",
    label: "GPT-5.4 Nano",
    provider: "OpenAI",
    requiresKey: "openAIKey",
    reasoning: {
      configurable: true,
      supportsTemperature: true,
      defaultLevel: "none",
      levels: ["none", "low", "medium", "high", "max"],
    },
  },
  {
    value: "gemma-4-31b-it",
    label: "Gemma 4 31B",
    provider: "Google",
    requiresKey: "googleKey",
    reasoning: {
      configurable: true,
      supportsTemperature: true,
      defaultLevel: "none",
      levels: ["none", "high"],
    },
  },
  {
    value: "gemma-4-26b-a4b-it",
    label: "Gemma 4 26B",
    provider: "Google",
    requiresKey: "googleKey",
    reasoning: {
      configurable: true,
      supportsTemperature: true,
      defaultLevel: "none",
      levels: ["none", "high"],
    },
  },
  {
    value: "gemini-3-flash-preview",
    label: "Gemini 3 Flash",
    provider: "Google",
    requiresKey: "googleKey",
    reasoning: {
      configurable: true,
      supportsTemperature: true,
      defaultLevel: "none",
      levels: ["none", "low", "medium", "high", "max"],
    },
  },
  {
    value: "gemini-3.1-flash-lite-preview",
    label: "Gemini 3.1 Flash Lite",
    provider: "Google",
    requiresKey: "googleKey",
    reasoning: {
      configurable: true,
      supportsTemperature: true,
      defaultLevel: "none",
      levels: ["none", "low", "medium", "high", "max"],
    },
  },
] as const satisfies readonly ModelDefinition[];

export type ModelValue = (typeof MODEL_OPTIONS)[number]["value"];

export const DEFAULT_MODEL: ModelValue = "claude-sonnet-4-6";
export const DEFAULT_ENABLED_MODELS: ModelValue[] = ["claude-sonnet-4-6", "gpt-5.4-mini"];

export function getModelConfig(modelValue: string): ModelDefinition | undefined {
  return MODEL_OPTIONS.find((m) => m.value === modelValue);
}

export const MODEL_LABELS = MODEL_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = { label: option.label, provider: option.provider };
    return acc;
  },
  {} as Record<ModelValue, { label: string; provider: ModelProvider }>
);

export const MODEL_VALUES = MODEL_OPTIONS.map((option) => option.value) as [
  ModelValue,
  ...ModelValue[],
];

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
  thinkingConfig?: { thinkingLevel: GoogleThinkingLevel };
};

export type ReasoningFields =
  | AnthropicReasoningFields
  | OpenAIReasoningFields
  | GoogleReasoningFields;

const ANTHROPIC_ADAPTIVE_MODELS = new Set<string>([
  "claude-opus-4-7",
  "claude-sonnet-4-6",
]);

const ANTHROPIC_THINKING_BUDGETS: Record<ReasoningLevel, number | null> = {
  none: null,
  low: 1024,
  medium: 4096,
  high: 10_000,
  max: 16_000,
};

const ANTHROPIC_ADAPTIVE_EFFORTS: Record<ReasoningLevel, AnthropicAdaptiveEffort | null> =
  {
    none: null,
    low: "low",
    medium: "medium",
    high: "high",
    max: "max",
  };

const OPENAI_REASONING_EFFORTS: Record<ReasoningLevel, OpenAIReasoningEffort> = {
  none: "none",
  low: "low",
  medium: "medium",
  high: "high",
  max: "xhigh",
};

const GOOGLE_THINKING_LEVELS: Record<ReasoningLevel, GoogleThinkingLevel | null> = {
  none: null,
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
  max: "HIGH",
};

function getAnthropicReasoningFields(
  model: ModelDefinition,
  level: ReasoningLevel
): AnthropicReasoningFields {
  if (ANTHROPIC_ADAPTIVE_MODELS.has(model.value)) {
    if (level === "none") {
      return {};
    }
    const effort = ANTHROPIC_ADAPTIVE_EFFORTS[level];
    if (!effort) return {};
    return { thinking: { type: "adaptive" }, outputConfig: { effort } };
  }

  const budget = ANTHROPIC_THINKING_BUDGETS[level];
  if (budget === null) return {};
  return { thinking: { type: "enabled", budget_tokens: budget } };
}

export function getReasoningFields(
  model: ModelDefinition,
  level: ReasoningLevel
): ReasoningFields {
  if (!model.reasoning.configurable || !model.reasoning.levels.includes(level)) {
    return {};
  }

  if (model.provider === "Anthropic") {
    return getAnthropicReasoningFields(model, level);
  }

  if (model.provider === "OpenAI") {
    return { reasoning: { effort: OPENAI_REASONING_EFFORTS[level] } };
  }

  if (model.provider === "Google") {
    const thinkingLevel = GOOGLE_THINKING_LEVELS[level];
    if (!thinkingLevel) return {};
    return { thinkingConfig: { thinkingLevel } };
  }

  return {};
}

export function supportsTemperatureAtLevel(
  model: ModelDefinition,
  level: ReasoningLevel
): boolean {
  if (!model.reasoning.supportsTemperature) return false;
  if (model.reasoning.configurable && level !== "none") {
    if (model.provider === "OpenAI" || model.provider === "Anthropic") {
      return false;
    }
  }
  return true;
}
