"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface MultipleComboboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  badge?: string;
}

interface MultipleComboboxProps {
  options: MultipleComboboxOption[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export function MultipleCombobox({
  options,
  value = [],
  onValueChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search items...",
  emptyText = "No items found.",
  className,
  disabled = false,
}: MultipleComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedValue: string) => {
    const newValue = value.includes(selectedValue)
      ? value.filter((item) => item !== selectedValue)
      : [...value, selectedValue];

    onValueChange?.(newValue);
  };

  const handleRemove = (valueToRemove: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newValue = value.filter((item) => item !== valueToRemove);
    onValueChange?.(newValue);
  };

  const selectedOptions = options.filter((option) => value.includes(option.value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between min-h-10 h-auto py-2", className)}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground truncate">{placeholder}</span>
            ) : null}

            {selectedOptions.length === 1 ? (
              <div className="flex items-center gap-1 min-w-0 flex-1">
                <span className="truncate">{selectedOptions[0].label}</span>
                {selectedOptions[0].badge ? (
                  <Badge
                    variant="secondary"
                    className="text-xs shrink-0 hidden sm:inline-flex"
                  >
                    {selectedOptions[0].badge}
                  </Badge>
                ) : null}
              </div>
            ) : null}

            {selectedOptions.length > 1 ? (
              <div className="flex flex-wrap gap-1 min-w-0 flex-1">
                <Badge variant="secondary" className="text-xs shrink-0">
                  {selectedOptions.length} selected
                </Badge>

                {/* Mobile: Show only count, Desktop: Show first few badges */}
                <div className="hidden sm:flex flex-wrap gap-1 min-w-0">
                  {selectedOptions.slice(0, 2).map((option) => (
                    <Badge
                      key={option.value}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-destructive/10 max-w-[120px]"
                      onClick={(e) => handleRemove(option.value, e)}
                    >
                      <span className="truncate">{option.label}</span>
                      <X className="h-3 w-3 ml-1 shrink-0 hover:text-destructive" />
                    </Badge>
                  ))}
                  {selectedOptions.length > 2 ? (
                    <Badge variant="outline" className="text-xs shrink-0">
                      +{selectedOptions.length - 2}
                    </Badge>
                  ) : null}
                </div>

                {/* Mobile: Show compact view */}
                <div className="sm:hidden flex items-center gap-1 min-w-0">
                  {selectedOptions.length <= 3 ? (
                    selectedOptions.map((option) => (
                      <Badge
                        key={option.value}
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-destructive/10 max-w-[80px]"
                        onClick={(e) => handleRemove(option.value, e)}
                      >
                        <span className="truncate text-xs">
                          {option.label.length > 8
                            ? option.label.split(" ")[0]
                            : option.label}
                        </span>
                        <X className="h-2.5 w-2.5 ml-0.5 shrink-0" />
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Tap to manage
                    </Badge>
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0 max-w-[calc(100vw-2rem)] sm:max-w-none"
        align="start"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList className="max-h-[40vh] sm:max-h-[300px]">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center gap-2 cursor-pointer py-3 sm:py-2"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 min-w-0">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">
                          {option.label}
                        </span>
                        {option.description ? (
                          <span className="text-xs text-muted-foreground line-clamp-2 sm:line-clamp-1">
                            {option.description}
                          </span>
                        ) : null}
                      </div>
                      {option.badge ? (
                        <Badge
                          variant="secondary"
                          className="text-xs shrink-0 self-start sm:self-center"
                        >
                          {option.badge}
                        </Badge>
                      ) : null}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
