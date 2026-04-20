import { describe, expect, it } from "vitest";
import {
  canSendSelectedModel,
  getAvailableModels,
  getConfigIssues,
  getResolvedSelectedModel,
  getSelectedModelError,
  hasAnyApiKey,
} from "@/lib/chat/config";

describe("chat config helpers", () => {
  it("allows sending when the selected model has its required key", () => {
    const config = {
      openAIKey: "sk-openai",
      anthropicKey: "",
      selectedModel: "gpt-5.4-mini" as const,
      enabledModels: ["gpt-5.4-mini", "claude-sonnet-4-6"] as const,
    };

    expect(canSendSelectedModel(config)).toBe(true);
    expect(getAvailableModels(config)).toEqual(["gpt-5.4-mini"]);
    expect(getConfigIssues(config).enabledModelsMissingKeys).toEqual([
      "claude-sonnet-4-6",
    ]);
  });

  it("returns a model-specific error when the selected provider key is missing", () => {
    const config = {
      openAIKey: "",
      anthropicKey: "",
      selectedModel: "claude-sonnet-4-6" as const,
    };

    expect(canSendSelectedModel(config)).toBe(false);
    expect(getSelectedModelError(config)).toBe(
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

    expect(getResolvedSelectedModel(config)).toBe("gpt-5.4-mini");
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
    expect(getAvailableModels(guest)).toEqual(["local-auto"]);

    const withKey = { ...guest, anthropicKey: "sk-ant" };
    expect(getAvailableModels(withKey)).toEqual(["claude-sonnet-4-6"]);
  });
});
