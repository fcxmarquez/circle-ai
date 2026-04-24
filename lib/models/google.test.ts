import { describe, expect, it } from "vitest";
import { getModelConfig, getReasoningFields } from "./index";

describe("getReasoningFields", () => {
  it("asks Google models to include returned thoughts", () => {
    const model = getModelConfig("gemini-3.1-flash-lite-preview");

    expect(model).toBeDefined();
    expect(getReasoningFields(model!, "medium")).toEqual({
      thinkingConfig: {
        includeThoughts: true,
        thinkingLevel: "MEDIUM",
      },
    });
  });
});
