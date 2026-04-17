import { useMutation } from "@tanstack/react-query";
import type { ChatMessage } from "@/lib/langchain/chatService";
import { useConfig } from "@/store";

interface SendMessageStreamVariables {
  message: string;
  history?: ChatMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  timeoutMs?: number;
  maxRetries?: number;
  temperature?: number;
  signal?: AbortSignal;
  onChunk?: (chunk: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error, partialResponse: string) => void;
}

export const useSendMessageStream = () => {
  const { config } = useConfig();

  return useMutation({
    mutationFn: async ({
      message,
      history = [],
      systemPrompt,
      maxTokens,
      timeoutMs,
      maxRetries,
      temperature,
      signal,
      onChunk,
      onComplete,
      onError,
    }: SendMessageStreamVariables) => {
      const responseChunks: string[] = [];

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            history,
            systemPrompt,
            timeoutMs,
            config: {
              openAIKey: config.openAIKey,
              anthropicKey: config.anthropicKey,
              selectedModel: config.selectedModel,
              reasoningLevel: config.reasoningLevel,
              maxTokens,
              timeoutMs,
              maxRetries,
              temperature,
            },
          }),
          signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body returned from server");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          responseChunks.push(chunk);
          onChunk?.(chunk);
        }

        const finalChunk = decoder.decode();
        if (finalChunk) {
          responseChunks.push(finalChunk);
          onChunk?.(finalChunk);
        }

        const fullResponse = responseChunks.join("");
        onComplete?.(fullResponse);
        return fullResponse;
      } catch (error) {
        if (error instanceof Error) {
          onError?.(error, responseChunks.join(""));
        }
        throw error;
      }
    },
  });
};
