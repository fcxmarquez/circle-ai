import type { NextRequest } from "next/server";
import {
  type ChatMessage,
  ChatService,
  type ChatServiceConfig,
} from "@/lib/langchain/chatService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, systemPrompt, timeoutMs, config } = body as {
      message: string;
      history: ChatMessage[];
      systemPrompt?: string;
      timeoutMs?: number;
      config: ChatServiceConfig;
    };

    if (!config || (!config.openAIKey && !config.anthropicKey)) {
      return new Response(
        JSON.stringify({
          error: "Missing API key. Please check your settings.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const chatService = await ChatService.getInstance(config);
    const stream = chatService.sendMessageStream(message, history, {
      systemPrompt,
      timeoutMs,
      signal: req.signal,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error: unknown) {
          console.error("Streaming error:", error);
          // If the error is an AbortError, we don't need to propagate a crash.
          if (error instanceof Error && error.name === "AbortError") {
            // Just close the stream cleanly
          } else {
            // Not a generic AbortError, propagate it via stream.
            controller.error(error);
          }
        } finally {
          try {
            controller.close();
          } catch {
            // Stream might already be closed
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    console.error("API Chat Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
