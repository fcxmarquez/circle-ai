import { describe, expect, it } from "vitest";
import { createThinkingSplitter } from "./thinkingParser";

describe("createThinkingSplitter", () => {
  it("splits think tags into thinking and content events", () => {
    const splitter = createThinkingSplitter();

    expect(splitter.push("Before <think>inside</think> after")).toEqual([
      { t: "content", d: "Before " },
      { t: "thinking", d: "inside" },
    ]);
    expect(splitter.flush()).toEqual([{ t: "content", d: " after" }]);
  });

  it("preserves tags split across chunk boundaries", () => {
    const splitter = createThinkingSplitter();

    expect(splitter.push("Alpha <thi")).toEqual([{ t: "content", d: "Alp" }]);
    expect(splitter.push("nk>Beta</thi")).toEqual([
      { t: "content", d: "ha " },
      { t: "thinking", d: "Be" },
    ]);
    expect(splitter.push("nk>Gamma")).toEqual([{ t: "thinking", d: "ta" }]);
    expect(splitter.flush()).toEqual([{ t: "content", d: "Gamma" }]);
  });

  it("flushes unterminated thinking as thinking", () => {
    const splitter = createThinkingSplitter();

    expect(splitter.push("<think>still thinking")).toEqual([
      { t: "thinking", d: "still t" },
    ]);
    expect(splitter.flush()).toEqual([{ t: "thinking", d: "hinking" }]);
  });

  it("rejects empty tags", () => {
    expect(() => createThinkingSplitter("", "</think>")).toThrow(
      "createThinkingSplitter requires non-empty openTag and closeTag"
    );
    expect(() => createThinkingSplitter("<think>", "")).toThrow(
      "createThinkingSplitter requires non-empty openTag and closeTag"
    );
  });
});
