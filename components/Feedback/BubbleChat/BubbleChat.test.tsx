import { describe, expect, it } from "vitest";
import { shouldShowPendingPlaceholder, shouldShowThinkingBlock } from ".";

describe("BubbleChat", () => {
  it("does not render empty thinking UI before thinking text arrives", () => {
    expect(
      shouldShowThinkingBlock({
        role: "assistant",
      })
    ).toBe(false);
  });

  it("keeps the generic pending placeholder before any tokens arrive", () => {
    expect(
      shouldShowPendingPlaceholder({
        message: "",
        role: "assistant",
        status: "pending",
      })
    ).toBe(true);
  });

  it("hides the generic pending placeholder after thinking text arrives", () => {
    expect(
      shouldShowPendingPlaceholder({
        message: "",
        role: "assistant",
        status: "pending",
        thinking: "The model returned a thought.",
      })
    ).toBe(false);
  });

  it("keeps stored thinking visible after the message finishes", () => {
    expect(
      shouldShowThinkingBlock({
        role: "assistant",
        thinking: "The model returned a thought.",
      })
    ).toBe(true);
  });
});
