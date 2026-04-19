export type LocalModelTier = "local-high" | "local-low" | "cpu";

export type LocalDevice = "webgpu" | "wasm";

export interface LocalModelSpec {
  modelId: string;
  device: LocalDevice;
  dtype: "q4" | "q4f16" | "fp32";
  label: string;
  approximateSizeMB: number;
}

export const LOCAL_MODEL_SPECS: Record<LocalModelTier, LocalModelSpec> = {
  "local-high": {
    modelId: "onnx-community/gemma-4-E2B-it-ONNX",
    device: "webgpu",
    dtype: "q4f16",
    label: "Gemma 4 E2B",
    approximateSizeMB: 3000,
  },
  "local-low": {
    modelId: "onnx-community/Qwen3.5-0.8B-ONNX",
    device: "webgpu",
    dtype: "q4",
    label: "Qwen 3.5 0.8B",
    approximateSizeMB: 700,
  },
  cpu: {
    modelId: "HuggingFaceTB/SmolLM2-135M-Instruct",
    device: "wasm",
    dtype: "q4",
    label: "SmolLM2 135M",
    approximateSizeMB: 200,
  },
};

interface NavigatorWithGPU extends Navigator {
  gpu?: unknown;
  deviceMemory?: number;
}

export async function detectModelTier(): Promise<LocalModelTier> {
  if (typeof navigator === "undefined") return "cpu";

  const nav = navigator as NavigatorWithGPU;
  const hasWebGPU = Boolean(nav.gpu);
  const memory = nav.deviceMemory ?? 0;
  const cores = nav.hardwareConcurrency ?? 0;

  if (hasWebGPU && memory >= 8 && cores >= 4) return "local-high";
  if (hasWebGPU && memory >= 4) return "local-low";
  return "cpu";
}

export async function resolveLocalModelSpec(): Promise<LocalModelSpec> {
  const tier = await detectModelTier();
  return LOCAL_MODEL_SPECS[tier];
}
