import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { dedupedJSONStorage, type PersistedSlice } from "./persistStorage";

const NAME = "chat-store";

class MemoryStorage {
  private map = new Map<string, string>();
  getItem = vi.fn((k: string) => this.map.get(k) ?? null);
  setItem = vi.fn((k: string, v: string) => {
    this.map.set(k, v);
  });
  removeItem = vi.fn((k: string) => {
    this.map.delete(k);
  });
  clear = () => this.map.clear();
}

let storage: MemoryStorage;
const originalWindow = globalThis.window;

beforeEach(() => {
  storage = new MemoryStorage();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { localStorage: storage },
  });
  dedupedJSONStorage.removeItem(NAME);
});

afterEach(() => {
  if (originalWindow === undefined) {
    Reflect.deleteProperty(globalThis, "window");
    return;
  }
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: originalWindow,
  });
});

const makeValue = (overrides?: Partial<PersistedSlice>) => {
  const conversations = overrides?.chat?.conversations ?? [];
  const config =
    overrides?.config ??
    ({
      openAIKey: "",
      anthropicKey: "",
      googleKey: "",
      selectedModel: "claude-sonnet-4-6",
      enabledModels: ["claude-sonnet-4-6"],
      reasoningLevel: "none",
    } as PersistedSlice["config"]);
  return {
    state: { chat: { conversations }, config },
    version: 6,
  };
};

describe("dedupedJSONStorage", () => {
  test("first write hits storage", () => {
    dedupedJSONStorage.setItem(NAME, makeValue());
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  test("subsequent writes with identical refs skip storage", () => {
    const v = makeValue();
    dedupedJSONStorage.setItem(NAME, v);
    dedupedJSONStorage.setItem(NAME, v);
    dedupedJSONStorage.setItem(NAME, v);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  test("60 identical writes (streaming-chunk shape) hit storage exactly once", () => {
    const v = makeValue();
    for (let i = 0; i < 60; i++) dedupedJSONStorage.setItem(NAME, v);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });

  test("write with new conversations ref hits storage", () => {
    const v1 = makeValue();
    const v2 = makeValue({
      chat: { conversations: [...v1.state.chat.conversations] },
      config: v1.state.config,
    });
    dedupedJSONStorage.setItem(NAME, v1);
    dedupedJSONStorage.setItem(NAME, v2);
    expect(storage.setItem).toHaveBeenCalledTimes(2);
  });

  test("write with new config ref hits storage", () => {
    const v1 = makeValue();
    const v2 = makeValue({
      chat: v1.state.chat,
      config: { ...v1.state.config },
    });
    dedupedJSONStorage.setItem(NAME, v1);
    dedupedJSONStorage.setItem(NAME, v2);
    expect(storage.setItem).toHaveBeenCalledTimes(2);
  });

  test("getItem round-trips through JSON.parse", async () => {
    const v = makeValue();
    dedupedJSONStorage.setItem(NAME, v);
    const got = await dedupedJSONStorage.getItem(NAME);
    expect(got).not.toBeNull();
    expect(got?.state.chat.conversations).toEqual([]);
    expect(got?.version).toBe(6);
  });

  test("getItem returns null when storage is empty", async () => {
    expect(await dedupedJSONStorage.getItem(NAME)).toBeNull();
  });

  test("getItem returns null on malformed payload", async () => {
    storage.setItem(NAME, "{not json");
    expect(await dedupedJSONStorage.getItem(NAME)).toBeNull();
  });

  test("quota error is caught; cache resets so next mutation retries", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const v1 = makeValue();
    dedupedJSONStorage.setItem(NAME, v1);
    expect(storage.setItem).toHaveBeenCalledTimes(1);

    const quotaError = new Error("quota exceeded");
    quotaError.name = "QuotaExceededError";
    storage.setItem.mockImplementationOnce(() => {
      throw quotaError;
    });

    const v2 = makeValue({
      chat: { conversations: [...v1.state.chat.conversations, {} as never] },
      config: v1.state.config,
    });
    dedupedJSONStorage.setItem(NAME, v2);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("localStorage quota exceeded")
    );

    // After quota failure, dedupe refs are reset; same payload retries on next call.
    storage.setItem.mockClear();
    dedupedJSONStorage.setItem(NAME, v2);
    expect(storage.setItem).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  test("removeItem clears dedupe cache so next write hits storage", () => {
    const v = makeValue();
    dedupedJSONStorage.setItem(NAME, v);
    dedupedJSONStorage.removeItem(NAME);
    storage.setItem.mockClear();
    dedupedJSONStorage.setItem(NAME, v);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });
});
