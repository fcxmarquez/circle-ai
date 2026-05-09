import { describe, expect, it } from "vitest";
import {
  type EnvProvidersStatus,
  getResolvedAvailableModels,
  getSelectedModelError,
  hasAnyApiKey,
  resolveChatConfig,
} from "@/lib/chat/config";

describe("chat config helpers", () => {
  it("allows sending when the selected model has its required key", () => {
    const config = {
      openAIKey: "sk-openai",
      anthropicKey: "",
      selectedModel: "gpt-5.4-mini" as const,
      enabledModels: ["gpt-5.4-mini", "claude-sonnet-4-6"] as const,
    };
    const resolved = resolveChatConfig(config);

    expect(resolved.canSend).toBe(true);
    expect(getResolvedAvailableModels(resolved.models, config.enabledModels)).toEqual([
      "gpt-5.4-mini",
    ]);
    expect(resolved.issues.enabledModelsMissingKeys).toEqual(["claude-sonnet-4-6"]);
  });

  it("returns a model-specific error when the selected provider key is missing", () => {
    const config = {
      openAIKey: "",
      anthropicKey: "",
      selectedModel: "claude-sonnet-4-6" as const,
    };
    const resolved = resolveChatConfig(config);

    expect(resolved.canSend).toBe(false);
    expect(resolved.selectedModelError).toBe(
      "Anthropic API key is required for Claude Sonnet 4.6."
    );
  });

  it("falls back to the first available enabled model", () => {
    const config = {
      openAIKey: "sk-openai",
      anthropicKey: "",
      selectedModel: "claude-sonnet-4-6" as const,
      enabledModels: ["claude-sonnet-4-6", "gpt-5.4-mini"] as const,
    };

    expect(resolveChatConfig(config).selectedModel).toBe("gpt-5.4-mini");
  });

  it("ignores blank keys when checking whether any API key exists", () => {
    expect(
      hasAnyApiKey({
        openAIKey: "   ",
        anthropicKey: "",
      })
    ).toBe(false);
  });

  it("hides local models once any API key is present", () => {
    const guest = {
      openAIKey: "",
      anthropicKey: "",
      googleKey: "",
      enabledModels: ["local-auto", "claude-sonnet-4-6"] as const,
    };
    expect(
      getResolvedAvailableModels(resolveChatConfig(guest).models, guest.enabledModels)
    ).toEqual(["local-auto"]);

    const withKey = { ...guest, anthropicKey: "sk-ant" };
    expect(
      getResolvedAvailableModels(resolveChatConfig(withKey).models, withKey.enabledModels)
    ).toEqual(["claude-sonnet-4-6"]);
  });

  describe("with env-provided keys", () => {
    const envStatus: EnvProvidersStatus = { anthropicKey: true };

    it("treats env-provided providers as having a key even when config is empty", () => {
      const config = {
        openAIKey: "",
        anthropicKey: "",
        selectedModel: "claude-sonnet-4-6" as const,
        enabledModels: ["claude-sonnet-4-6"] as const,
      };
      const resolved = resolveChatConfig(config, envStatus);

      expect(hasAnyApiKey(config, envStatus)).toBe(true);
      expect(resolved.canSend).toBe(true);
      expect(resolved.selectedModelError).toBeNull();
      expect(getResolvedAvailableModels(resolved.models, config.enabledModels)).toEqual([
        "claude-sonnet-4-6",
      ]);
      expect(resolved.issues.enabledModelsMissingKeys).toEqual([]);
    });

    it("hides local models when env supplies any cloud key", () => {
      const config = {
        openAIKey: "",
        anthropicKey: "",
        googleKey: "",
        enabledModels: ["local-auto", "claude-sonnet-4-6"] as const,
      };
      const resolved = resolveChatConfig(config, envStatus);

      expect(getResolvedAvailableModels(resolved.models, config.enabledModels)).toEqual([
        "claude-sonnet-4-6",
      ]);
    });

    it("does not falsely advertise providers that env has not set", () => {
      const config = {
        openAIKey: "",
        anthropicKey: "",
        selectedModel: "gpt-5.4-mini" as const,
        enabledModels: ["gpt-5.4-mini", "claude-sonnet-4-6"] as const,
      };
      const resolved = resolveChatConfig(config, envStatus);

      expect(getSelectedModelError(config, envStatus)).toBe(
        "OpenAI API key is required for GPT-5.4 Mini."
      );
      expect(resolved.selectedModel).toBe("claude-sonnet-4-6");
      expect(getResolvedAvailableModels(resolved.models, config.enabledModels)).toEqual([
        "claude-sonnet-4-6",
      ]);
    });

    it("resolves provider sources and available models from one config view", () => {
      const config = {
        openAIKey: "sk-openai",
        anthropicKey: "",
        googleKey: "",
        selectedModel: "claude-sonnet-4-6" as const,
        enabledModels: ["local-auto", "gpt-5.4-mini", "claude-sonnet-4-6"] as const,
      };

      const resolved = resolveChatConfig(config, envStatus);

      expect(resolved.envProvidersStatus).toEqual({
        openAIKey: false,
        anthropicKey: true,
        googleKey: false,
      });
      expect(resolved.providerKeys.openAIKey.source).toBe("user");
      expect(resolved.providerKeys.anthropicKey.source).toBe("env");
      expect(resolved.providerKeys.googleKey.source).toBe("missing");
      expect(getResolvedAvailableModels(resolved.models, config.enabledModels)).toEqual([
        "gpt-5.4-mini",
        "claude-sonnet-4-6",
      ]);
      expect(resolved.models["local-auto"]).toMatchObject({
        available: false,
        enabled: true,
        hasRequiredKey: true,
      });
      expect(resolved.canSend).toBe(true);
      expect(resolved.selectedModel).toBe("claude-sonnet-4-6");
      expect(resolved.selectedModelError).toBeNull();
    });
  });
});
