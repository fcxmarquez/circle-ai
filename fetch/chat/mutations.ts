import { useMutation } from "@tanstack/react-query";
import { type ChatMessage, ChatService } from "@/lib/langchain/chatService";
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
        const chatService = await ChatService.getInstance({
          openAIKey: config.openAIKey,
          anthropicKey: config.anthropicKey,
          selectedModel: config.selectedModel,
          reasoningLevel: config.reasoningLevel,
          maxTokens,
          timeoutMs,
          maxRetries,
          temperature,
        });

        for await (const chunk of chatService.sendMessageStream(message, history, {
          systemPrompt,
          timeoutMs,
          signal,
        })) {
          responseChunks.push(chunk);
          onChunk?.(chunk);
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
