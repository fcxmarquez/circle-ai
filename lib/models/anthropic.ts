import type {
  AnthropicAdaptiveEffort,
  AnthropicReasoningFields,
  ModelDefinition,
  ReasoningLevel,
} from "./types";

export const ANTHROPIC_MODELS = [
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
] as const satisfies readonly ModelDefinition[];

const ADAPTIVE_MODELS = new Set<string>(["claude-opus-4-7", "claude-sonnet-4-6"]);

const THINKING_BUDGETS: Record<ReasoningLevel, number | null> = {
  none: null,
  low: 1024,
  medium: 4096,
  high: 10_000,
  max: 16_000,
};

const ADAPTIVE_EFFORTS: Record<ReasoningLevel, AnthropicAdaptiveEffort | null> = {
  none: null,
  low: "low",
  medium: "medium",
  high: "high",
  max: "max",
};

export function getAnthropicReasoningFields(
  model: ModelDefinition,
  level: ReasoningLevel
): AnthropicReasoningFields {
  if (ADAPTIVE_MODELS.has(model.value)) {
    if (level === "none") return {};
    const effort = ADAPTIVE_EFFORTS[level];
    if (!effort) return {};
    return { thinking: { type: "adaptive" }, outputConfig: { effort } };
  }

  const budget = THINKING_BUDGETS[level];
  if (budget === null) return {};
  return { thinking: { type: "enabled", budget_tokens: budget } };
}
