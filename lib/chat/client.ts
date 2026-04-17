import type { ChatStreamRequest } from "./contracts";

interface StreamChatRequestOptions {
  signal?: AbortSignal;
  onChunk?: (chunk: string) => void;
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

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (!chunk) continue;

      responseChunks.push(chunk);
      options.onChunk?.(chunk);
    }

    const finalChunk = decoder.decode();
    if (finalChunk) {
      responseChunks.push(finalChunk);
      options.onChunk?.(finalChunk);
    }
  } finally {
    reader.releaseLock();
  }

  return responseChunks.join("");
}
