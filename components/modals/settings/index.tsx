"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Cpu, KeyRound, LogOut, Settings2, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ApiKeyField } from "@/components/modals/settings/ApiKeyField";
import { useResolvedChatConfig } from "@/components/providers/resolved-chat-config-provider";
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
import { getResolvedAvailableModels, resolveChatConfig } from "@/lib/chat/config";
import {
  DEFAULT_ENABLED_MODELS,
  DEFAULT_MODEL,
  MODEL_OPTIONS,
  MODEL_VALUES,
  type ModelValue,
} from "@/lib/models";
import { useConfig, useUserActions } from "@/store";
import type { ModelType } from "@/store/types";
import { createClient } from "@/utils/supabase/client";

type SettingsFormValues = {
  openAIKey?: string;
  anthropicKey?: string;
  googleKey?: string;
  selectedModel: string;
  enabledModels: string[];
};

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
  const { envProvidersStatus } = useResolvedChatConfig();

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

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedValues = form.watch();

  const resolveDraftConfig = (values: SettingsFormValues) =>
    resolveChatConfig(values, envProvidersStatus);
  const draftResolvedConfig = resolveDraftConfig(watchedValues);
  const availableEnabledModels = getResolvedAvailableModels(
    draftResolvedConfig.models,
    watchedValues.enabledModels
  );

  React.useEffect(() => {
    if (
      availableEnabledModels.length > 0 &&
      !availableEnabledModels.includes(watchedValues.selectedModel)
    ) {
      form.setValue("selectedModel", availableEnabledModels[0], { shouldValidate: true });
    }
  }, [availableEnabledModels, form, watchedValues.selectedModel]);

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
    const issues = resolveDraftConfig(data).issues;

    const enabledModels =
      issues.enabledModelsMissingKeys.length > 0
        ? data.enabledModels.filter(
            (m) => !issues.enabledModelsMissingKeys.includes(m as ModelValue)
          )
        : data.enabledModels;

    if (enabledModels.length === 0) {
      toast.error("Please enable at least one model.");
      return;
    }

    const selectedModel = enabledModels.includes(data.selectedModel)
      ? data.selectedModel
      : enabledModels[0];

    setConfig({
      openAIKey: data.openAIKey || "",
      anthropicKey: data.anthropicKey || "",
      googleKey: data.googleKey || "",
      selectedModel: selectedModel as ModelType,
      enabledModels: enabledModels as ModelType[],
    });
    handleClose(false);
    toast.success("Settings saved successfully");
  };

  // Prepare options for the multiple combobox
  const modelOptions: MultipleComboboxOption[] = MODEL_OPTIONS.map((option) => {
    return {
      value: option.value,
      label: option.label,
      badge: option.provider,
      disabled: !draftResolvedConfig.models[option.value].hasRequiredKey,
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
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <h3 className="text-md font-medium">AI Models</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Local models run in your browser with no API key required. Provide API
                keys below to unlock cloud models.
              </p>
              {/* Available Models with Checkboxes */}
              <FormField
                control={form.control}
                name="enabledModels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Models</FormLabel>
                    <FormDescription>
                      Select which models appear in your model selector. Cloud models
                      require a matching provider API key.
                    </FormDescription>
                    <FormControl>
                      <MultipleCombobox
                        options={modelOptions}
                        value={field.value}
                        onValueChange={(newValue) => {
                          if (newValue.length > 10) {
                            toast.error("You can select a maximum of 10 models");
                            return;
                          }

                          field.onChange(newValue);

                          if (
                            newValue.length > 0 &&
                            !newValue.includes(watchedValues.selectedModel)
                          ) {
                            form.setValue("selectedModel", newValue[0] as ModelType);
                          }
                        }}
                        placeholder="Select AI models..."
                        searchPlaceholder="Search models..."
                        emptyText="No models found."
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Default Model Selection */}
              {watchedValues.enabledModels.length > 0 ? (
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
              ) : null}
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
              <ApiKeyField
                control={form.control}
                placeholder="sk-..."
                label="OpenAI API Key"
                name="openAIKey"
                envSet={envProvidersStatus.openAIKey}
              />
              <ApiKeyField
                control={form.control}
                placeholder="sk-ant-..."
                label="Anthropic API Key"
                name="anthropicKey"
                envSet={envProvidersStatus.anthropicKey}
              />
              <ApiKeyField
                control={form.control}
                placeholder="AIza..."
                label="Google API Key"
                name="googleKey"
                envSet={envProvidersStatus.googleKey}
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
