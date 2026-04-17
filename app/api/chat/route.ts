import type { NextRequest } from "next/server";
import { getSelectedModelError } from "@/lib/chat/config";
import { ChatStreamRequestSchema } from "@/lib/chat/contracts";
import { streamChatResponse } from "@/lib/langchain/chatService";

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsedBody = ChatStreamRequestSchema.safeParse(body);
  if (!parsedBody.success) {
    return jsonError("Invalid chat request.", 400);
  }

  const request = parsedBody.data;
  const selectedModelError = getSelectedModelError(request.config);
  if (selectedModelError) {
    return jsonError(selectedModelError, 400);
  }

  try {
    const stream = streamChatResponse({
      ...request,
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
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    console.error("API Chat Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return jsonError(errorMessage, 500);
  }
}
