"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useResolvedChatConfig } from "@/components/providers/resolved-chat-config-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getResolvedAvailableModels } from "@/lib/chat/config";
import { MODEL_LABELS } from "@/lib/models";
import { useConfig } from "@/store";
import type { ModelType } from "@/store/types";

export function ModelSelector() {
  const { config, setConfig } = useConfig();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { models, selectedModel } = useResolvedChatConfig();
  const availableModels = getResolvedAvailableModels(models, config.enabledModels);

  const handleModelSelect = (model: ModelType) => {
    setConfig({ selectedModel: model });
  };

  if ((config.enabledModels || []).length === 0) {
    return (
      <Button variant="ghost" className="text-muted-foreground cursor-not-allowed">
        No models configured
      </Button>
    );
  }

  if (!selectedModel || availableModels.length === 0) {
    return (
      <Button variant="ghost" className="text-muted-foreground cursor-not-allowed">
        No model selected
      </Button>
    );
  }

  const currentModelInfo = MODEL_LABELS[selectedModel];

  return (
    <DropdownMenu onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger className="focus-visible:ring-transparent" asChild>
        <Button variant="ghost" className="text-foreground max-w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="truncate">{currentModelInfo?.label || "Select Model"}</span>
            <Badge variant="secondary" className="text-xs shrink-0">
              {currentModelInfo?.provider}
            </Badge>
          </div>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : "rotate-0"}`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        {availableModels.map((model) => {
          const modelInfo = MODEL_LABELS[model];
          const isSelected = model === selectedModel;
          return (
            <DropdownMenuItem
              key={model}
              onClick={() => handleModelSelect(model)}
              className={`flex items-center justify-between ${isSelected ? "bg-accent" : ""}`}
            >
              <span>{modelInfo.label}</span>
              <Badge variant="outline" className="text-xs">
                {modelInfo.provider}
              </Badge>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
