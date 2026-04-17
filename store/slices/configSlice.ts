import type { StateCreator } from "zustand";
import {
  DEFAULT_ENABLED_MODELS,
  DEFAULT_MODEL,
  getModelConfig,
  MODEL_OPTIONS,
} from "@/constants/models";
import type { Config, StoreState } from "../types";

export interface ConfigSlice {
  config: Config;
  setConfig: (config: Partial<Config>) => void;
  clearConfig: () => void;
  hasValidApiKey: () => boolean;
}

const initialConfig: Config = {
  openAIKey: "",
  anthropicKey: "",
  selectedModel: DEFAULT_MODEL,
  enabledModels: [...DEFAULT_ENABLED_MODELS],
  reasoningLevel: getModelConfig(DEFAULT_MODEL)?.reasoning.defaultLevel ?? "none",
};

export const createConfigSlice: StateCreator<
  StoreState,
  [["zustand/devtools", never]],
  [],
  ConfigSlice
> = (set, get) => ({
  config: initialConfig,

  setConfig: (newConfig) =>
    set((state) => {
      const updatedConfig = { ...state.config, ...newConfig };

      if (!updatedConfig.enabledModels) {
        updatedConfig.enabledModels = [...DEFAULT_ENABLED_MODELS];
      }

      // When the selected model changes, reset reasoning to the new model's
      // default unless the caller explicitly set a reasoningLevel in the same
      // update. Keeps the stored level valid for the active model's levels.
      if (
        newConfig.selectedModel &&
        newConfig.selectedModel !== state.config.selectedModel &&
        newConfig.reasoningLevel === undefined
      ) {
        const nextModel = getModelConfig(newConfig.selectedModel);
        updatedConfig.reasoningLevel = nextModel?.reasoning.defaultLevel ?? "none";
      }

      return {
        config: updatedConfig,
      };
    }),

  clearConfig: () =>
    set(() => ({
      config: initialConfig,
    })),

  hasValidApiKey: () => {
    const { config } = get();
    const hasKey = Boolean(config.openAIKey || config.anthropicKey);
    if (!hasKey) return false;

    const modelRequirements = MODEL_OPTIONS.reduce(
      (acc, option) => {
        acc[option.value] = option.requiresKey;
        return acc;
      },
      {} as Record<string, string>
    );

    return config.enabledModels.every((model) => {
      const requiredKey = modelRequirements[model];
      return requiredKey && Boolean(config[requiredKey as keyof Config]);
    });
  },
});
