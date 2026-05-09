"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
// TEMP: Disabled for rebuild - FCX-30
// import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/error-fallback";
import { ResolvedChatConfigProvider } from "@/components/providers/resolved-chat-config-provider";
// TEMP: Disabled for rebuild - FCX-30
// import { hasActiveSession, getUser } from "@/utils/supabase/session";
// import { useUserActions } from "@/store";

/**
 * Wraps child components with global providers for error handling and React Query state management.
 *
 * Initializes user authentication state on mount and provides error boundaries and React Query context to all descendants.
 *
 * @param children - The React nodes to be rendered within the provider context.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // TEMP: Disabled for rebuild - FCX-30
  // const { setIsSignedIn, setUserEmail } = useUserActions();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  // TEMP: Disabled for rebuild - FCX-30
  // Session initialization temporarily disabled to allow access without authentication
  // To reactivate: uncomment the block below
  /*
  useEffect(() => {
    const checkSession = async () => {
      const isSignedIn = await hasActiveSession();
      if (isSignedIn) {
        setIsSignedIn(true);
        const user = await getUser();
        setUserEmail(user?.email || "");
      }
    };
    checkSession();
  }, []);
  */

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ResolvedChatConfigProvider>{children}</ResolvedChatConfigProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
