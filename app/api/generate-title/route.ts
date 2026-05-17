import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSelectedModelError } from "@/lib/chat/config";
import { ChatModelConfigSchema } from "@/lib/chat/contracts";
import { applyEnvApiKeys } from "@/lib/chat/serverEnv";
import { generateConversationTitle } from "@/lib/langchain/chatService";
import { isLocalModel } from "@/lib/models";

const GenerateTitleRequestSchema = z.object({
  message: z.string().trim().min(1),
  config: ChatModelConfigSchema,
});

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

  const parsed = GenerateTitleRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request.", 400);
  }

  const { message, config: rawConfig } = parsed.data;

  if (isLocalModel(rawConfig.selectedModel)) {
    return jsonError("Local models cannot generate titles server-side.", 400);
  }

  const config = applyEnvApiKeys(rawConfig);
  const modelError = getSelectedModelError(config);
  if (modelError) {
    return jsonError(modelError, 400);
  }

  try {
    const title = await generateConversationTitle(message, config);
    return Response.json({ title });
  } catch (error) {
    console.error("Title generation error:", error);
    return jsonError("Failed to generate title.", 500);
  }
}
