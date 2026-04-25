import { type ApiKeyType, getModelConfig, type ModelValue } from "@/lib/models";
import type { ChatApiKeys, ChatModelSelection } from "./contracts";

type ChatSelectionConfig = ChatApiKeys & {
  selectedModel?: string;
  enabledModels?: readonly string[];
};

export interface ChatConfigIssues {
  noEnabledModels: boolean;
  selectedModelNotEnabled: boolean;
  selectedModelMissingKey: boolean;
  enabledModelsMissingKeys: ModelValue[];
}

function hasValue(value?: string): boolean {
  return Boolean(value?.trim());
}

function isSupportedApiKey(key: ApiKeyType | null): key is ApiKeyType {
  return key === "openAIKey" || key === "anthropicKey" || key === "googleKey";
}

export function hasAnyApiKey(config: ChatApiKeys): boolean {
  return (
    hasValue(config.openAIKey) ||
    hasValue(config.anthropicKey) ||
    hasValue(config.googleKey)
  );
}

export function getRequiredApiKey(modelValue: string): ApiKeyType | null {
  return getModelConfig(modelValue)?.requiresKey ?? null;
}

export function hasRequiredKeyForModel(modelValue: string, config: ChatApiKeys): boolean {
  const modelConfig = getModelConfig(modelValue);
  if (!modelConfig) return false;
  if (modelConfig.requiresKey === null) return true;
  if (!isSupportedApiKey(modelConfig.requiresKey)) return false;
  return hasValue(config[modelConfig.requiresKey]);
}

export function getAvailableModels(config: ChatSelectionConfig): ModelValue[] {
  const suppressLocal = hasAnyApiKey(config);
  return (config.enabledModels ?? []).filter((model): model is ModelValue => {
    const modelConfig = getModelConfig(model);
    if (!modelConfig) return false;
    if (suppressLocal && modelConfig.provider === "Local") return false;
    return hasRequiredKeyForModel(model, config);
  });
}

export function getResolvedSelectedModel(config: ChatSelectionConfig): ModelValue | null {
  const availableModels = getAvailableModels(config);
  if (
    config.selectedModel &&
    availableModels.includes(config.selectedModel as ModelValue)
  ) {
    return config.selectedModel as ModelValue;
  }
  return availableModels[0] ?? null;
}

export function canSendSelectedModel(
  config: ChatApiKeys & Pick<ChatModelSelection, "selectedModel">
): boolean {
  if (!config.selectedModel) {
    return false;
  }

  return hasRequiredKeyForModel(config.selectedModel, config);
}

export function getSelectedModelError(
  config: ChatApiKeys & { selectedModel?: string }
): string | null {
  if (!config.selectedModel) {
    return "Select a model in settings.";
  }

  const modelConfig = getModelConfig(config.selectedModel);
  if (!modelConfig) {
    return "Selected model is not available.";
  }

  if (hasRequiredKeyForModel(config.selectedModel, config)) {
    return null;
  }

  return `${modelConfig.provider} API key is required for ${modelConfig.label}.`;
}

export function getConfigIssues(config: ChatSelectionConfig): ChatConfigIssues {
  const enabledModels = config.enabledModels ?? [];
  const selectedModel = config.selectedModel;

  return {
    noEnabledModels: enabledModels.length === 0,
    selectedModelNotEnabled:
      selectedModel !== undefined &&
      enabledModels.length > 0 &&
      !enabledModels.includes(selectedModel),
    selectedModelMissingKey:
      selectedModel !== undefined && !hasRequiredKeyForModel(selectedModel, config),
    enabledModelsMissingKeys: enabledModels.filter(
      (model): model is ModelValue =>
        Boolean(getModelConfig(model)) && !hasRequiredKeyForModel(model, config)
    ),
  };
}
