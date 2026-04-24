import type {
  GoogleReasoningFields,
  GoogleThinkingLevel,
  ModelDefinition,
  ReasoningLevel,
} from "./types";

export const GOOGLE_MODELS = [
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
      levels: ["none", "low", "medium", "high"],
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
      levels: ["none", "low", "medium", "high"],
    },
  },
] as const satisfies readonly ModelDefinition[];

const THINKING_LEVELS: Record<ReasoningLevel, GoogleThinkingLevel | null> = {
  none: null,
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
  max: "HIGH",
};

export function getGoogleReasoningFields(level: ReasoningLevel): GoogleReasoningFields {
  const thinkingLevel = THINKING_LEVELS[level];
  if (!thinkingLevel) return {};
  return { thinkingConfig: { includeThoughts: true, thinkingLevel } };
}
