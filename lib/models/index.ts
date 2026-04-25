import { ANTHROPIC_MODELS, getAnthropicReasoningFields } from "./anthropic";
import { GOOGLE_MODELS, getGoogleReasoningFields } from "./google";
import { LOCAL_MODELS } from "./local";
import { getOpenAIReasoningFields, OPENAI_MODELS } from "./openai";
import type {
  ModelDefinition,
  ModelProvider,
  ReasoningFields,
  ReasoningLevel,
} from "./types";

export type {
  ApiKeyType,
  ModelDefinition,
  ModelProvider,
  ModelReasoning,
  ReasoningFields,
  ReasoningLevel,
} from "./types";
export { REASONING_LEVELS } from "./types";

export const MODEL_OPTIONS = [
  ...LOCAL_MODELS,
  ...ANTHROPIC_MODELS,
  ...OPENAI_MODELS,
  ...GOOGLE_MODELS,
] as const satisfies readonly ModelDefinition[];

export type ModelValue = (typeof MODEL_OPTIONS)[number]["value"];

export const DEFAULT_MODEL: ModelValue = "local-auto";
export const DEFAULT_ENABLED_MODELS: readonly ModelValue[] = [
  "local-auto",
  "claude-sonnet-4-6",
  "gpt-5.4-mini",
];

export function getModelConfig(modelValue: string): ModelDefinition | undefined {
  return MODEL_OPTIONS.find((m) => m.value === modelValue);
}

export function isLocalModel(modelValue: string): boolean {
  return getModelConfig(modelValue)?.provider === "Local";
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
    return getOpenAIReasoningFields(level);
  }

  if (model.provider === "Google") {
    return getGoogleReasoningFields(level);
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
