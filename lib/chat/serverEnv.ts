import { API_KEY_TYPES, type ApiKeyType } from "@/lib/models";
import { env } from "@/utils/env";
import type { ChatApiKeys } from "./contracts";

function trimmed(value: string | undefined): string {
  return value?.trim() ?? "";
}

const ENV_VAR_BY_KEY: Record<ApiKeyType, keyof typeof env> = {
  openAIKey: "OPENAI_API_KEY",
  anthropicKey: "ANTHROPIC_API_KEY",
  googleKey: "GOOGLE_API_KEY",
};

function getEnvApiKey(key: ApiKeyType): string {
  return trimmed(env[ENV_VAR_BY_KEY[key]]);
}

export function getEnvProvidersStatus(): Record<ApiKeyType, boolean> {
  return {
    openAIKey: getEnvApiKey("openAIKey").length > 0,
    anthropicKey: getEnvApiKey("anthropicKey").length > 0,
    googleKey: getEnvApiKey("googleKey").length > 0,
  };
}

export function applyEnvApiKeys<T extends ChatApiKeys>(config: T): T {
  const next = { ...config };
  for (const key of API_KEY_TYPES) {
    const envValue = getEnvApiKey(key);
    if (envValue) {
      next[key] = envValue;
    }
  }
  return next;
}
