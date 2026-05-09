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
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
