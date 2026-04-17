import type { MODEL_VALUES, ReasoningLevel } from "@/constants/models";
import type { ChatSlice } from "./slices/chatSlice";
import type { ConfigSlice } from "./slices/configSlice";
import type { UISlice } from "./slices/uiSlice";
import type { UserSlice } from "./slices/userSlice";

export type ModelType = (typeof MODEL_VALUES)[number];

export interface Config {
  openAIKey: string;
  anthropicKey: string;
  selectedModel: ModelType;
  enabledModels: ModelType[];
  reasoningLevel: ReasoningLevel;
}

export interface UIState {
  modal: {
    isOpen: boolean;
    children: React.JSX.Element | null;
  };
  modals: {
    settings: boolean;
    searchChats: boolean;
  };
}

export type StoreState = UISlice & ChatSlice & ConfigSlice & UserSlice;
