import type { ModelDefinition } from "./types";

export const LOCAL_MODELS = [
  {
    value: "local-auto",
    label: "Local model",
    provider: "Local",
    requiresKey: null,
    reasoning: {
      configurable: false,
      supportsTemperature: false,
      defaultLevel: "none",
      levels: ["none"],
    },
  },
] as const satisfies readonly ModelDefinition[];
