"use client";

import {
  BrainCircuit,
  Check,
  ChevronDown,
  type LucideIcon,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getModelConfig, type ReasoningLevel } from "@/lib/models";
import { cn } from "@/lib/utils";
import { useConfig } from "@/store";

const LEVEL_LABELS: Record<ReasoningLevel, string> = {
  none: "Off",
  low: "Low",
  medium: "Medium",
  high: "High",
  max: "Max",
};

const LEVEL_ICONS: Record<ReasoningLevel, LucideIcon> = {
  none: SignalZero,
  low: SignalLow,
  medium: SignalMedium,
  high: SignalHigh,
  max: Signal,
};

export function ReasoningSelector() {
  const { config, setConfig } = useConfig();
  const modelConfig = getModelConfig(config.selectedModel);

  useEffect(() => {
    const reasoning = modelConfig?.reasoning;
    if (!reasoning?.configurable) return;

    if (!reasoning.levels.includes(config.reasoningLevel)) {
      setConfig({ reasoningLevel: reasoning.defaultLevel });
    }
  }, [config.reasoningLevel, modelConfig, setConfig]);

  if (!modelConfig?.reasoning.configurable) {
    return null;
  }

  const levels = modelConfig.reasoning.levels;
  const selectedLevel = levels.includes(config.reasoningLevel)
    ? config.reasoningLevel
    : modelConfig.reasoning.defaultLevel;
  const SelectedSignalIcon = LEVEL_ICONS[selectedLevel];

  const handleSelect = (level: ReasoningLevel) => {
    setConfig({ reasoningLevel: level });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-10 rounded-lg border-border/70 bg-background/90 px-3 text-xs shadow-none",
            "hover:bg-accent hover:text-accent-foreground"
          )}
          aria-label={`Reasoning: ${LEVEL_LABELS[selectedLevel]}`}
        >
          <BrainCircuit className="h-4 w-4" />
          <span>{LEVEL_LABELS[selectedLevel]}</span>
          <SelectedSignalIcon className="h-4 w-4 text-muted-foreground" />
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="w-40">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          REASONING
        </DropdownMenuLabel>
        {levels.map((level) => {
          const SignalIcon = LEVEL_ICONS[level];
          const isSelected = level === selectedLevel;

          return (
            <DropdownMenuItem
              key={level}
              onSelect={() => handleSelect(level)}
              className={cn("justify-between", isSelected && "bg-accent")}
            >
              <span className="flex items-center gap-2">
                <SignalIcon className="h-4 w-4" />
                {LEVEL_LABELS[level]}
              </span>
              <Check
                className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
