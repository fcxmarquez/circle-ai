import type { ModelValue, ReasoningLevel } from "@/constants/models";
import type { ChatApiKeys } from "@/lib/chat/contracts";
import type { ChatSlice } from "./slices/chats/types";
import type { ConfigSlice } from "./slices/configSlice";
import type { UISlice } from "./slices/uiSlice";
import type { UserSlice } from "./slices/userSlice";

export type ModelType = ModelValue;

export interface Config extends ChatApiKeys {
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
