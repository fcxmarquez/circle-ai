import {
  type ChatStreamEvent,
  ChatStreamEventSchema,
  type ChatStreamRequest,
} from "./contracts";

interface StreamChatRequestOptions {
  signal?: AbortSignal;
  onChunk?: (event: ChatStreamEvent) => void;
}

async function getErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const payload = await response.json().catch(() => null);
    if (payload && typeof payload.error === "string") {
      return payload.error;
    }
  }

  return `HTTP error! status: ${response.status}`;
}

export async function streamChatRequest(
  request: ChatStreamRequest,
  options: StreamChatRequestOptions = {}
): Promise<string> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  if (!response.body) {
    throw new Error("No response body returned from server");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const responseChunks: string[] = [];
  let lineBuffer = "";

  const processLine = (line: string) => {
    if (!line) return;

    try {
      const parsed = ChatStreamEventSchema.safeParse(JSON.parse(line));
      if (!parsed.success) return;

      if (parsed.data.t === "content") {
        responseChunks.push(parsed.data.d);
      }
      options.onChunk?.(parsed.data);
    } catch {
      // Ignore malformed stream lines so one bad frame does not kill the response.
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (!chunk) continue;

      lineBuffer += chunk;
      const lines = lineBuffer.split("\n");
      lineBuffer = lines.pop() ?? "";

      for (const line of lines) {
        processLine(line);
      }
    }

    const finalChunk = decoder.decode();
    if (finalChunk) {
      lineBuffer += finalChunk;
    }
    if (lineBuffer) {
      processLine(lineBuffer);
      lineBuffer = "";
    }
  } finally {
    reader.releaseLock();
  }

  return responseChunks.join("");
}
