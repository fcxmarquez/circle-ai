"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useEnvProvidersStatusQuery } from "@/fetch/providers/queries";
import { type ResolvedChatConfig, resolveChatConfig } from "@/lib/chat/config";
import { useConfig } from "@/store";
import { EnvProvidersStatusErrorAlert } from "./EnvProvidersStatusErrorAlert";

type ResolvedChatConfigContextValue = ResolvedChatConfig & {
  envStatusReady: boolean;
};

const ResolvedChatConfigContext = createContext<ResolvedChatConfigContextValue | null>(
  null
);

export function ResolvedChatConfigProvider({ children }: { children: ReactNode }) {
  const { config, setConfig } = useConfig();
  const envProvidersQuery = useEnvProvidersStatusQuery();
  const envStatusReady = envProvidersQuery.isSuccess;
  const [isProviderErrorDismissed, setProviderErrorDismissed] = useState(false);

  const resolvedConfig = useMemo(
    () => resolveChatConfig(config, envProvidersQuery.data),
    [config, envProvidersQuery.data]
  );

  useEffect(() => {
    if (!envProvidersQuery.isSuccess) return;
    if (!resolvedConfig.selectedModel) return;
    if (resolvedConfig.selectedModel === config.selectedModel) return;

    setConfig({ selectedModel: resolvedConfig.selectedModel });
  }, [
    config.selectedModel,
    envProvidersQuery.isSuccess,
    resolvedConfig.selectedModel,
    setConfig,
  ]);

  useEffect(() => {
    if (!envProvidersQuery.isError) {
      setProviderErrorDismissed(false);
    }
  }, [envProvidersQuery.isError]);

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
      {envProvidersQuery.isError && !isProviderErrorDismissed ? (
        <EnvProvidersStatusErrorAlert
          isRetrying={envProvidersQuery.isFetching}
          onDismiss={() => setProviderErrorDismissed(true)}
          onRetry={() => {
            void envProvidersQuery.refetch();
          }}
        />
      ) : null}
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
