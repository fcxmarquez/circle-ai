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
  description: string;
  reasoning: ModelReasoning;
}

export const MODEL_OPTIONS = [
  {
    value: "claude-opus-4-7",
    label: "Claude Opus 4.7",
    provider: "Anthropic",
    requiresKey: "anthropicKey",
    description: "Most capable model for complex reasoning and agentic coding",
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
    description: "Best balance of speed and intelligence",
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
    description: "Fastest Claude model with near-frontier intelligence",
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
    description: "Frontier model for complex professional work",
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
    description: "Balanced speed and intelligence for high-volume workloads",
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
    description: "Fastest GPT model for classification and extraction",
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

export type ReasoningFields = AnthropicReasoningFields | OpenAIReasoningFields;

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
