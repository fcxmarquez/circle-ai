import {
  API_KEY_TYPES,
  type ApiKeyType,
  getModelConfig,
  MODEL_OPTIONS,
  type ModelValue,
} from "@/lib/models";
import type { ChatApiKeys } from "./contracts";

type ChatSelectionConfig = ChatApiKeys & {
  selectedModel?: string;
  enabledModels?: readonly string[];
};

export type EnvProvidersStatus = Partial<Record<ApiKeyType, boolean>>;

export interface ChatConfigIssues {
  noEnabledModels: boolean;
  selectedModelNotEnabled: boolean;
  selectedModelMissingKey: boolean;
  enabledModelsMissingKeys: ModelValue[];
}

export type ApiKeySource = "env" | "user" | "missing";

export type NormalizedEnvProvidersStatus = Record<ApiKeyType, boolean>;

export interface ResolvedProviderKeyStatus {
  available: boolean;
  envSet: boolean;
  source: ApiKeySource;
  userSet: boolean;
}

export type ResolvedProviderKeysStatus = Record<ApiKeyType, ResolvedProviderKeyStatus>;

export interface ResolvedModelStatus {
  available: boolean;
  enabled: boolean;
  hasRequiredKey: boolean;
}

export type ResolvedModelsStatus = Record<ModelValue, ResolvedModelStatus>;

export interface ResolvedChatConfig {
  canSend: boolean;
  envProvidersStatus: NormalizedEnvProvidersStatus;
  issues: ChatConfigIssues;
  models: ResolvedModelsStatus;
  providerKeys: ResolvedProviderKeysStatus;
  selectedModel: ModelValue | null;
  selectedModelError: string | null;
}

function hasValue(value?: string): boolean {
  return Boolean(value?.trim());
}

function getApiKeySource(envSet: boolean, userSet: boolean): ApiKeySource {
  if (envSet) return "env";
  if (userSet) return "user";
  return "missing";
}

function normalizeEnvProvidersStatus(
  envStatus?: EnvProvidersStatus
): NormalizedEnvProvidersStatus {
  return API_KEY_TYPES.reduce((acc, key) => {
    acc[key] = Boolean(envStatus?.[key]);
    return acc;
  }, {} as NormalizedEnvProvidersStatus);
}

function getProviderKeysStatus(
  config: ChatApiKeys,
  envStatus?: EnvProvidersStatus
): ResolvedProviderKeysStatus {
  const normalizedEnvStatus = normalizeEnvProvidersStatus(envStatus);

  return API_KEY_TYPES.reduce((acc, key) => {
    const envSet = normalizedEnvStatus[key];
    const userSet = hasValue(config[key]);

    acc[key] = {
      available: envSet || userSet,
      envSet,
      source: getApiKeySource(envSet, userSet),
      userSet,
    };

    return acc;
  }, {} as ResolvedProviderKeysStatus);
}

function getModelsStatus(
  config: ChatSelectionConfig,
  envStatus?: EnvProvidersStatus,
  availableModels = getAvailableModels(config, envStatus)
): ResolvedModelsStatus {
  const enabledModels = config.enabledModels ?? [];

  return MODEL_OPTIONS.reduce((acc, model) => {
    const value = model.value as ModelValue;

    acc[value] = {
      available: availableModels.includes(value),
      enabled: enabledModels.includes(value),
      hasRequiredKey: hasRequiredKeyForModel(value, config, envStatus),
    };

    return acc;
  }, {} as ResolvedModelsStatus);
}

export function getResolvedAvailableModels(
  models: ResolvedModelsStatus,
  order: readonly string[] = MODEL_OPTIONS.map((model) => model.value)
): ModelValue[] {
  return order.filter((model): model is ModelValue => {
    const modelStatus = models[model as ModelValue];
    return Boolean(modelStatus?.available);
  });
}

function isSupportedApiKey(key: ApiKeyType | null): key is ApiKeyType {
  return key !== null && API_KEY_TYPES.includes(key);
}

function hasResolvedKey(
  config: ChatApiKeys,
  key: ApiKeyType,
  envStatus?: EnvProvidersStatus
): boolean {
  if (envStatus?.[key]) return true;
  return hasValue(config[key]);
}

export function hasAnyApiKey(
  config: ChatApiKeys,
  envStatus?: EnvProvidersStatus
): boolean {
  return API_KEY_TYPES.some((key) => hasResolvedKey(config, key, envStatus));
}

function hasRequiredKeyForModel(
  modelValue: string,
  config: ChatApiKeys,
  envStatus?: EnvProvidersStatus
): boolean {
  const modelConfig = getModelConfig(modelValue);
  if (!modelConfig) return false;
  if (modelConfig.requiresKey === null) return true;
  if (!isSupportedApiKey(modelConfig.requiresKey)) return false;
  return hasResolvedKey(config, modelConfig.requiresKey, envStatus);
}

function getAvailableModels(
  config: ChatSelectionConfig,
  envStatus?: EnvProvidersStatus
): ModelValue[] {
  const suppressLocal = hasAnyApiKey(config, envStatus);
  return (config.enabledModels ?? []).filter((model): model is ModelValue => {
    const modelConfig = getModelConfig(model);
    if (!modelConfig) return false;
    if (suppressLocal && modelConfig.provider === "Local") return false;
    return hasRequiredKeyForModel(model, config, envStatus);
  });
}

function getResolvedSelectedModelFromAvailable(
  config: ChatSelectionConfig,
  availableModels: readonly ModelValue[]
): ModelValue | null {
  if (
    config.selectedModel &&
    availableModels.includes(config.selectedModel as ModelValue)
  ) {
    return config.selectedModel as ModelValue;
  }
  return availableModels[0] ?? null;
}

export function getSelectedModelError(
  config: ChatApiKeys & { selectedModel?: string },
  envStatus?: EnvProvidersStatus
): string | null {
  if (!config.selectedModel) {
    return "Select a model in settings.";
  }

  const modelConfig = getModelConfig(config.selectedModel);
  if (!modelConfig) {
    return "Selected model is not available.";
  }

  if (hasRequiredKeyForModel(config.selectedModel, config, envStatus)) {
    return null;
  }

  return `${modelConfig.provider} API key is required for ${modelConfig.label}.`;
}

function getConfigIssues(
  config: ChatSelectionConfig,
  envStatus?: EnvProvidersStatus
): ChatConfigIssues {
  const enabledModels = config.enabledModels ?? [];
  const selectedModel = config.selectedModel;

  return {
    noEnabledModels: enabledModels.length === 0,
    selectedModelNotEnabled:
      selectedModel !== undefined &&
      enabledModels.length > 0 &&
      !enabledModels.includes(selectedModel),
    selectedModelMissingKey:
      selectedModel !== undefined &&
      !hasRequiredKeyForModel(selectedModel, config, envStatus),
    enabledModelsMissingKeys: enabledModels.filter(
      (model): model is ModelValue =>
        Boolean(getModelConfig(model)) &&
        !hasRequiredKeyForModel(model, config, envStatus)
    ),
  };
}

export function resolveChatConfig(
  config: ChatSelectionConfig,
  envStatus?: EnvProvidersStatus
): ResolvedChatConfig {
  const normalizedEnvStatus = normalizeEnvProvidersStatus(envStatus);
  const availableModels = getAvailableModels(config, normalizedEnvStatus);
  const selectedModel = getResolvedSelectedModelFromAvailable(config, availableModels);

  return {
    canSend: selectedModel
      ? hasRequiredKeyForModel(selectedModel, config, normalizedEnvStatus)
      : false,
    envProvidersStatus: normalizedEnvStatus,
    issues: getConfigIssues(config, normalizedEnvStatus),
    models: getModelsStatus(config, normalizedEnvStatus, availableModels),
    providerKeys: getProviderKeysStatus(config, normalizedEnvStatus),
    selectedModel,
    selectedModelError: selectedModel
      ? getSelectedModelError({ ...config, selectedModel }, normalizedEnvStatus)
      : getSelectedModelError(config, normalizedEnvStatus),
  };
}
