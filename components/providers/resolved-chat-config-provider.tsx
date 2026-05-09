"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo } from "react";
import { useEnvProvidersStatusQuery } from "@/fetch/providers/queries";
import { type ResolvedChatConfig, resolveChatConfig } from "@/lib/chat/config";
import { useConfig } from "@/store";

type ResolvedChatConfigContextValue = ResolvedChatConfig & {
  envStatusReady: boolean;
};

const ResolvedChatConfigContext = createContext<ResolvedChatConfigContextValue | null>(
  null
);

export function ResolvedChatConfigProvider({ children }: { children: ReactNode }) {
  const { config, setConfig } = useConfig();
  const envProvidersQuery = useEnvProvidersStatusQuery();
  const envStatusReady = !envProvidersQuery.isPending;

  const resolvedConfig = useMemo(
    () => resolveChatConfig(config, envProvidersQuery.data),
    [config, envProvidersQuery.data]
  );

  useEffect(() => {
    if (!envStatusReady) return;
    if (!resolvedConfig.selectedModel) return;
    if (resolvedConfig.selectedModel === config.selectedModel) return;

    setConfig({ selectedModel: resolvedConfig.selectedModel });
  }, [config.selectedModel, envStatusReady, resolvedConfig.selectedModel, setConfig]);

  const value = useMemo(
    () => ({
      ...resolvedConfig,
      envStatusReady,
    }),
    [envStatusReady, resolvedConfig]
  );

  return (
    <ResolvedChatConfigContext.Provider value={value}>
      {children}
    </ResolvedChatConfigContext.Provider>
  );
}

export function useResolvedChatConfig(): ResolvedChatConfigContextValue {
  const value = useContext(ResolvedChatConfigContext);

  if (!value) {
    throw new Error(
      "useResolvedChatConfig must be used within ResolvedChatConfigProvider"
    );
  }

  return value;
}
