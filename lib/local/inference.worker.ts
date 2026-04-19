/// <reference lib="webworker" />

import {
  env,
  type ProgressInfo,
  pipeline,
  type TextGenerationPipeline,
  TextStreamer,
} from "@huggingface/transformers";

env.allowLocalModels = false;

// Optimize for mobile and prevent WASM memory crashes on iOS Safari/WebKit
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.numThreads = 1;
}

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

  if (!pipe.tokenizer.chat_template && modelId.toLowerCase().includes("gemma")) {
    pipe.tokenizer.chat_template =
      "{% if messages[0]['role'] == 'system' %}{% set loop_messages = messages[1:] %}{% set system_message = messages[0]['content'] %}{% else %}{% set loop_messages = messages %}{% set system_message = '' %}{% endif %}{{ bos_token }}{% for message in loop_messages %}{% if loop.index0 == 0 and system_message != '' %}{% set content = system_message + '\\n\\n' + message['content'] %}{% else %}{% set content = message['content'] %}{% endif %}{% if message['role'] == 'user' %}{{ '<start_of_turn>user\\n' + content + '<end_of_turn>\\n' }}{% elif message['role'] == 'model' or message['role'] == 'assistant' %}{{ '<start_of_turn>model\\n' + content + '<end_of_turn>\\n' }}{% endif %}{% endfor %}{% if add_generation_prompt %}{{ '<start_of_turn>model\\n' }}{% endif %}";
  }

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

        const cleanText = text.replace(/<end_of_turn>|<start_of_turn>|<bos>|<eos>/g, "");

        if (cleanText) {
          scope.postMessage({
            type: "chunk",
            requestId,
            text: cleanText,
          } satisfies OutgoingChunkMessage);
        }
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
