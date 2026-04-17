import type { StateCreator } from "zustand";
import {
  DEFAULT_ENABLED_MODELS,
  DEFAULT_MODEL,
  getModelConfig,
} from "@/constants/models";
import type { Config, StoreState } from "../types";

export interface ConfigSlice {
  config: Config;
  setConfig: (config: Partial<Config>) => void;
  clearConfig: () => void;
}

const initialConfig: Config = {
  openAIKey: "",
  anthropicKey: "",
  googleKey: "",
  selectedModel: DEFAULT_MODEL,
  enabledModels: [...DEFAULT_ENABLED_MODELS],
  reasoningLevel: getModelConfig(DEFAULT_MODEL)?.reasoning.defaultLevel ?? "none",
};

export const createConfigSlice: StateCreator<
  StoreState,
  [["zustand/devtools", never]],
  [],
  ConfigSlice
> = (set) => ({
  config: initialConfig,

  setConfig: (newConfig) =>
    set((state) => {
      const updatedConfig = { ...state.config, ...newConfig };

      if (!updatedConfig.enabledModels) {
        updatedConfig.enabledModels = [...DEFAULT_ENABLED_MODELS];
      }

      const nextModel = getModelConfig(updatedConfig.selectedModel);
      const requestedReasoningLevel = newConfig.reasoningLevel;

      // When the selected model changes, reset reasoning to the new model's
      // default unless the caller explicitly set a reasoningLevel in the same
      // update. Keeps the stored level valid for the active model's levels.
      if (
        newConfig.selectedModel &&
        newConfig.selectedModel !== state.config.selectedModel &&
        requestedReasoningLevel === undefined
      ) {
        updatedConfig.reasoningLevel = nextModel?.reasoning.defaultLevel ?? "none";
      }

      if (
        nextModel &&
        requestedReasoningLevel !== undefined &&
        !nextModel.reasoning.levels.includes(requestedReasoningLevel)
      ) {
        updatedConfig.reasoningLevel = nextModel.reasoning.defaultLevel;
      }

      return {
        config: updatedConfig,
      };
    }),

  clearConfig: () =>
    set(() => ({
      config: initialConfig,
    })),
});
