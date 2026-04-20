import type { ProgressInfo } from "@huggingface/transformers";
import type { LocalModelSpec } from "./capabilities";
import type { WorkerOutgoingMessage } from "./inference.worker";

export interface LocalChatMessage {
  role: string;
  content: string;
}

export interface StreamLocalChatOptions {
  spec: LocalModelSpec;
  messages: LocalChatMessage[];
  maxNewTokens?: number;
  signal?: AbortSignal;
  onChunk?: (chunk: string) => void;
  onProgress?: (progress: ProgressInfo) => void;
}

const TRANSFORMERS_CACHE_KEY = "transformers-cache";
export const MODEL_DOWNLOADED_KEY_PREFIX = "enki-model-downloaded-";

let worker: Worker | null = null;
let requestCounter = 0;
const pendingRejecters = new Set<(error: Error) => void>();

function getWorker(): Worker {
  if (typeof window === "undefined") {
    throw new Error("Local inference is only available in the browser.");
  }

  if (!worker) {
    worker = new Worker(new URL("./inference.worker.ts", import.meta.url), {
      type: "module",
      name: "local-inference",
    });
  }

  return worker;
}

export async function clearLocalModelCache(): Promise<void> {
  if (worker) {
    if (pendingRejecters.size > 0) {
      const error = new Error("Aborted");
      error.name = "AbortError";
      for (const reject of pendingRejecters) {
        reject(error);
      }
      pendingRejecters.clear();
    }
    worker.terminate();
    worker = null;
  }
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(MODEL_DOWNLOADED_KEY_PREFIX)) localStorage.removeItem(key);
    }
  } catch {
    // ignore blocked storage
  }
  if (typeof caches === "undefined") return;
  try {
    await caches.delete(TRANSFORMERS_CACHE_KEY);
  } catch {
    // Best-effort cleanup; ignore failures (e.g. blocked by storage policy).
  }
}

export async function streamLocalChatRequest(
  options: StreamLocalChatOptions
): Promise<string> {
  const { spec, messages, maxNewTokens = 512, signal, onChunk, onProgress } = options;

  if (signal?.aborted) {
    const error = new Error("Aborted");
    error.name = "AbortError";
    throw error;
  }

  const requestId = `local-${++requestCounter}-${Date.now()}`;
  const w = getWorker();
  let accumulated = "";

  return new Promise<string>((resolve, reject) => {
    const handleAbort = () => {
      w.postMessage({ type: "abort", requestId });
      const error = new Error("Aborted");
      error.name = "AbortError";
      rejectFromOutside(error);
    };

    const handleWorkerError = (event: ErrorEvent) => {
      rejectFromOutside(new Error(event.message ?? "Worker crashed"));
    };

    const handleWorkerMessageError = () => {
      rejectFromOutside(new Error("Worker message deserialization failed"));
    };

    const cleanup = () => {
      pendingRejecters.delete(rejectFromOutside);
      w.removeEventListener("message", handleMessage);
      w.removeEventListener("error", handleWorkerError);
      w.removeEventListener("messageerror", handleWorkerMessageError);
      signal?.removeEventListener("abort", handleAbort);
    };

    const rejectFromOutside = (error: Error) => {
      cleanup();
      reject(error);
    };
    pendingRejecters.add(rejectFromOutside);

    function handleMessage(event: MessageEvent<WorkerOutgoingMessage>) {
      const data = event.data;
      if (!data || data.requestId !== requestId) return;

      switch (data.type) {
        case "progress":
          onProgress?.(data.progress);
          break;
        case "chunk":
          accumulated += data.text;
          onChunk?.(data.text);
          break;
        case "complete":
          cleanup();
          resolve(accumulated);
          break;
        case "aborted": {
          cleanup();
          const error = new Error("Aborted");
          error.name = "AbortError";
          reject(error);
          break;
        }
        case "error":
          cleanup();
          reject(new Error(data.error));
          break;
      }
    }

    w.addEventListener("message", handleMessage);
    w.addEventListener("error", handleWorkerError, { once: true });
    w.addEventListener("messageerror", handleWorkerMessageError, { once: true });
    signal?.addEventListener("abort", handleAbort, { once: true });

    w.postMessage({
      type: "generate",
      requestId,
      modelId: spec.modelId,
      device: spec.device,
      dtype: spec.dtype,
      messages,
      maxNewTokens,
    });
  });
}
