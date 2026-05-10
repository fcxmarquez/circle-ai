import { useQuery } from "@tanstack/react-query";
import type { EnvProvidersStatus } from "@/lib/chat/config";

async function fetchEnvProvidersStatus(): Promise<EnvProvidersStatus> {
  const response = await fetch("/api/providers", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch provider status (${response.status})`);
  }
  return (await response.json()) as EnvProvidersStatus;
}

export function useEnvProvidersStatusQuery() {
  return useQuery({
    queryKey: ["env-providers-status"],
    queryFn: fetchEnvProvidersStatus,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10_000),
  });
}
