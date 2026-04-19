/// <reference lib="webworker" />

import {
  env,
  type ProgressInfo,
  pipeline,
  type TextGenerationPipeline,
  TextStreamer,
} from "@huggingface/transformers";

env.allowLocalModels = false;

interface GenerateMessage {
  type: "generate";
  requestId: string;
  modelId: string;
  device: "webgpu" | "wasm";
  dtype: "q4" | "q4f16" | "fp32";
  messages: { role: string; content: string }[];
  maxNewTokens?: number;
}

interface AbortMessage {
  type: "abort";
  requestId: string;
}

type IncomingMessage = GenerateMessage | AbortMessage;

interface OutgoingProgressMessage {
  type: "progress";
  requestId: string;
  progress: ProgressInfo;
}

interface OutgoingChunkMessage {
  type: "chunk";
  requestId: string;
  text: string;
}

interface OutgoingCompleteMessage {
  type: "complete";
  requestId: string;
}

interface OutgoingAbortedMessage {
  type: "aborted";
  requestId: string;
}

interface OutgoingErrorMessage {
  type: "error";
  requestId: string;
  error: string;
}

export type WorkerOutgoingMessage =
  | OutgoingProgressMessage
  | OutgoingChunkMessage
  | OutgoingCompleteMessage
  | OutgoingAbortedMessage
  | OutgoingErrorMessage;

const scope = self as DedicatedWorkerGlobalScope;

interface PipelineCache {
  key: string;
  pipeline: TextGenerationPipeline;
}

let cached: PipelineCache | null = null;
const abortedRequests = new Set<string>();

class AbortedError extends Error {
  constructor() {
    super("Generation aborted");
    this.name = "AbortedError";
  }
}

async function getPipeline(
  requestId: string,
  modelId: string,
  device: "webgpu" | "wasm",
  dtype: "q4" | "q4f16" | "fp32"
): Promise<TextGenerationPipeline> {
  const key = `${modelId}::${device}::${dtype}`;
  if (cached && cached.key === key) return cached.pipeline;

  const pipe = (await pipeline("text-generation", modelId, {
    device,
    dtype,
    progress_callback: (progress: ProgressInfo) => {
      scope.postMessage({
        type: "progress",
        requestId,
        progress,
      } satisfies OutgoingProgressMessage);
    },
  })) as TextGenerationPipeline;

  cached = { key, pipeline: pipe };
  return pipe;
}

scope.addEventListener("message", async (event: MessageEvent<IncomingMessage>) => {
  const data = event.data;

  if (data.type === "abort") {
    abortedRequests.add(data.requestId);
    return;
  }

  if (data.type !== "generate") return;

  const { requestId, modelId, device, dtype, messages, maxNewTokens = 512 } = data;

  try {
    const generator = await getPipeline(requestId, modelId, device, dtype);

    if (abortedRequests.has(requestId)) {
      throw new AbortedError();
    }

    const streamer = new TextStreamer(generator.tokenizer, {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (text: string) => {
        if (abortedRequests.has(requestId)) {
          throw new AbortedError();
        }
        scope.postMessage({
          type: "chunk",
          requestId,
          text,
        } satisfies OutgoingChunkMessage);
      },
    });

    await generator(messages, {
      max_new_tokens: maxNewTokens,
      do_sample: false,
      streamer,
    });

    if (abortedRequests.has(requestId)) {
      scope.postMessage({
        type: "aborted",
        requestId,
      } satisfies OutgoingAbortedMessage);
    } else {
      scope.postMessage({
        type: "complete",
        requestId,
      } satisfies OutgoingCompleteMessage);
    }
  } catch (error) {
    if (error instanceof AbortedError || abortedRequests.has(requestId)) {
      scope.postMessage({
        type: "aborted",
        requestId,
      } satisfies OutgoingAbortedMessage);
    } else {
      const message = error instanceof Error ? error.message : "Unknown worker error";
      scope.postMessage({
        type: "error",
        requestId,
        error: message,
      } satisfies OutgoingErrorMessage);
    }
  } finally {
    abortedRequests.delete(requestId);
  }
});
