"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Cpu, Eye, EyeOff, KeyRound, LogOut, Settings2, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  MultipleCombobox,
  type MultipleComboboxOption,
} from "@/components/ui/multiple-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  DEFAULT_ENABLED_MODELS,
  DEFAULT_MODEL,
  MODEL_OPTIONS,
  MODEL_VALUES,
} from "@/constants/models";
import {
  getAvailableModels,
  getConfigIssues,
  getSelectedModelError,
  hasAnyApiKey,
  hasRequiredKeyForModel,
} from "@/lib/chat/config";
import { useConfig, useUserActions } from "@/store";
import type { ModelType } from "@/store/types";
import { createClient } from "@/utils/supabase/client";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const settingsFormSchema = z.object({
  openAIKey: z.string().optional(),
  anthropicKey: z.string().optional(),
  googleKey: z.string().optional(),
  selectedModel: z.enum(MODEL_VALUES),
  enabledModels: z
    .array(z.enum(MODEL_VALUES))
    .min(1, "Please enable at least one model")
    .max(10, "You can select a maximum of 10 models"),
});

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { config, setConfig } = useConfig();
  const { setLogout } = useUserActions();
  const { theme = "system", setTheme } = useTheme();

  const form = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      openAIKey: config.openAIKey || "",
      anthropicKey: config.anthropicKey || "",
      googleKey: config.googleKey || "",
      selectedModel: (config.selectedModel || DEFAULT_MODEL) as ModelType,
      enabledModels: (config.enabledModels || [...DEFAULT_ENABLED_MODELS]) as ModelType[],
    },
  });

  React.useEffect(() => {
    form.reset({
      openAIKey: config.openAIKey || "",
      anthropicKey: config.anthropicKey || "",
      googleKey: config.googleKey || "",
      selectedModel: (config.selectedModel || DEFAULT_MODEL) as ModelType,
      enabledModels: (config.enabledModels || [...DEFAULT_ENABLED_MODELS]) as ModelType[],
    });
  }, [config, form]);

  const [showPasswords, setShowPasswords] = useState({
    openAI: false,
    anthropic: false,
    google: false,
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedValues = form.watch();

  const hasConfiguredApiKey = hasAnyApiKey(watchedValues);
  const availableEnabledModels = getAvailableModels({
    enabledModels: watchedValues.enabledModels,
    openAIKey: watchedValues.openAIKey,
    anthropicKey: watchedValues.anthropicKey,
    googleKey: watchedValues.googleKey,
  });

  React.useEffect(() => {
    if (!hasConfiguredApiKey) {
      return;
    }

    if (
      availableEnabledModels.length > 0 &&
      !availableEnabledModels.includes(watchedValues.selectedModel)
    ) {
      form.setValue("selectedModel", availableEnabledModels[0], { shouldValidate: true });
    }
  }, [availableEnabledModels, form, hasConfiguredApiKey, watchedValues.selectedModel]);

  const handleClose = (next: boolean) => {
    onOpenChange(next);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to logout");
      return;
    }

    setLogout();
    handleClose(false);
    toast.success("Logged out successfully");
  };

  const onSubmit = (data: z.infer<typeof settingsFormSchema>) => {
    if (!hasAnyApiKey(data)) {
      toast.error("Please provide at least one API key.");
      return;
    }

    const issues = getConfigIssues(data);

    if (issues.noEnabledModels) {
      toast.error("Please enable at least one model.");
      return;
    }

    if (issues.selectedModelNotEnabled) {
      return toast.error("Default model must be one of the enabled models.");
    }

    if (issues.enabledModelsMissingKeys.length > 0) {
      toast.error("Each enabled model needs a matching provider API key.");
      return;
    }

    const selectedModelError = getSelectedModelError(data);
    if (selectedModelError) {
      toast.error(selectedModelError);
      return;
    }

    setConfig({
      openAIKey: data.openAIKey || "",
      anthropicKey: data.anthropicKey || "",
      googleKey: data.googleKey || "",
      selectedModel: data.selectedModel as ModelType,
      enabledModels: data.enabledModels as ModelType[],
    });
    handleClose(false);
    toast.success("Settings saved successfully");
  };

  // Prepare options for the multiple combobox
  const modelOptions: MultipleComboboxOption[] = MODEL_OPTIONS.map((option) => {
    const hasRequiredKey = hasRequiredKeyForModel(option.value, {
      openAIKey: watchedValues.openAIKey,
      anthropicKey: watchedValues.anthropicKey,
      googleKey: watchedValues.googleKey,
    });
    return {
      value: option.value,
      label: option.label,
      badge: option.provider,
      disabled: !hasRequiredKey,
    };
  });

  const availableDefaultModels = MODEL_OPTIONS.filter((option) =>
    availableEnabledModels.includes(option.value)
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure your AI model preferences and API keys
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Theme Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SunMoon className="h-4 w-4" />
                <h3 className="text-md font-medium">Theme</h3>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            {/* Model Selection Section */}
            <div
              className={`space-y-4 ${!hasConfiguredApiKey ? "opacity-50 pointer-events-none" : ""}`}
            >
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <h3 className="text-md font-medium">AI Models</h3>
                {!hasConfiguredApiKey && (
                  <Badge variant="secondary" className="text-xs">
                    Requires API Key
                  </Badge>
                )}
              </div>
              {!hasConfiguredApiKey && (
                <p className="text-sm text-muted-foreground">
                  Please provide at least one API key below to enable model selection.
                </p>
              )}
              {/* Available Models with Checkboxes */}
              <FormField
                control={form.control}
                name="enabledModels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Models</FormLabel>
                    <FormDescription>
                      Select which models appear in your model selector. You need valid
                      API keys for each enabled model.
                    </FormDescription>
                    <FormControl>
                      <MultipleCombobox
                        options={modelOptions}
                        value={hasConfiguredApiKey ? field.value : []}
                        onValueChange={(newValue) => {
                          if (!hasConfiguredApiKey) return;

                          if (newValue.length > 10) {
                            toast.error("You can select a maximum of 10 models");
                            return;
                          }

                          field.onChange(newValue);

                          // Auto-select first model if enabling and none selected
                          if (
                            newValue.length > 0 &&
                            !newValue.includes(watchedValues.selectedModel)
                          ) {
                            form.setValue("selectedModel", newValue[0] as ModelType);
                          }
                        }}
                        placeholder={
                          hasConfiguredApiKey
                            ? "Select AI models..."
                            : "Provide API keys first"
                        }
                        searchPlaceholder="Search models..."
                        emptyText="No models found."
                        disabled={!hasConfiguredApiKey}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Default Model Selection */}
              {hasConfiguredApiKey && watchedValues.enabledModels.length > 0 && (
                <FormField
                  control={form.control}
                  name="selectedModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Model</FormLabel>
                      <FormDescription>
                        This model will be selected by default for new conversations.
                      </FormDescription>
                      <FormControl>
                        <Select {...field}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose default model" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDefaultModels.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <span>{option.label}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {option.provider}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <Separator />
            {/* API Keys Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                <h3 className="text-md font-medium">API Keys</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Provide the API key for your selected model. Your keys are securely stored
                in your browser.
              </p>
              {/* OpenAI Key */}
              <FormField
                control={form.control}
                name="openAIKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OpenAI API Key</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPasswords.openAI ? "text" : "password"}
                          placeholder="sk-..."
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              openAI: !prev.openAI,
                            }))
                          }
                        >
                          {showPasswords.openAI ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Anthropic Key */}
              <FormField
                control={form.control}
                name="anthropicKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anthropic API Key</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPasswords.anthropic ? "text" : "password"}
                          placeholder="sk-ant-..."
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              anthropic: !prev.anthropic,
                            }))
                          }
                        >
                          {showPasswords.anthropic ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Google Key */}
              <FormField
                control={form.control}
                name="googleKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google API Key</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPasswords.google ? "text" : "password"}
                          placeholder="AIza..."
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              google: !prev.google,
                            }))
                          }
                        >
                          {showPasswords.google ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <Button type="submit" className="w-full">
                  Save Settings
                </Button>
              </div>
            </div>
            <Separator />
            {/* Profile Section */}
            <div className="space-y-4">
              <Button variant="outline" onClick={handleLogout} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
