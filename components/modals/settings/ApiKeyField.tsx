"use client";

import { Eye, EyeOff, Lock, X } from "lucide-react";
import { useState } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type ProviderKeyFieldName = "openAIKey" | "anthropicKey" | "googleKey";

interface ApiKeyFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  envSet?: boolean;
  label: string;
  name: Extract<FieldPath<TFieldValues>, ProviderKeyFieldName>;
  placeholder: string;
}

function EnvironmentBadge() {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <Badge className="text-xs" tabIndex={0} variant="secondary">
          <Lock className="h-3 w-3 mr-1" />
          Environment
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">
        This provider key is configured on the server through an environment variable.
      </TooltipContent>
    </Tooltip>
  );
}

export function ApiKeyField<TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  control,
  envSet,
}: ApiKeyFieldProps<TFieldValues>) {
  const [show, setShow] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            {label}
            {envSet ? <EnvironmentBadge /> : null}
          </FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                aria-readonly={envSet}
                autoComplete="off"
                className={!envSet && field.value ? "pr-20" : "pr-10"}
                disabled={envSet}
                placeholder={envSet ? "Set via environment variable" : placeholder}
                type={show ? "text" : "password"}
                value={envSet ? "" : String(field.value ?? "")}
              />
              <div className="absolute right-0 top-0 h-full flex items-center">
                {!envSet && field.value ? (
                  <Button
                    aria-label={`Clear ${label}`}
                    className="h-full px-2 hover:bg-transparent"
                    onClick={() => field.onChange("")}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : null}
                {!envSet ? (
                  <Button
                    aria-label={show ? `Hide ${label}` : `Show ${label}`}
                    className="h-full px-3 hover:bg-transparent"
                    onClick={() => setShow((s) => !s)}
                    size="icon"
                    type="button"
                    variant="ghost"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                ) : null}
              </div>
            </div>
          </FormControl>
          {envSet ? (
            <FormDescription>
              Provided by the server environment. Override the configured value to change
              it.
            </FormDescription>
          ) : null}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
