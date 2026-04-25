import type { ModelDefinition, OpenAIReasoningFields, ReasoningLevel } from "./types";

const OPENAI_REASONING = {
  configurable: true,
  supportsTemperature: true,
  defaultLevel: "none",
  levels: ["none", "low", "medium", "high", "max"],
} as const satisfies ModelDefinition["reasoning"];

export const OPENAI_MODELS = [
  {
    value: "gpt-5.4",
    label: "GPT-5.4",
    provider: "OpenAI",
    requiresKey: "openAIKey",
    reasoning: OPENAI_REASONING,
  },
  {
    value: "gpt-5.4-mini",
    label: "GPT-5.4 Mini",
    provider: "OpenAI",
    requiresKey: "openAIKey",
    reasoning: OPENAI_REASONING,
  },
  {
    value: "gpt-5.4-nano",
    label: "GPT-5.4 Nano",
    provider: "OpenAI",
    requiresKey: "openAIKey",
    reasoning: OPENAI_REASONING,
  },
] as const satisfies readonly ModelDefinition[];

const REASONING_EFFORTS: Record<
  ReasoningLevel,
  "none" | "low" | "medium" | "high" | "xhigh"
> = {
  none: "none",
  low: "low",
  medium: "medium",
  high: "high",
  max: "xhigh",
};

export function getOpenAIReasoningFields(level: ReasoningLevel): OpenAIReasoningFields {
  return { reasoning: { effort: REASONING_EFFORTS[level] } };
}
