"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  const router = useRouter();
  const [errorDetails, setErrorDetails] = useState({
    error: "",
    errorCode: "",
    errorDescription: "",
  });

  useEffect(() => {
    // Parse error details from URL hash
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrorDetails({
      error: params.get("error") || "Unknown error",
      errorCode: params.get("error_code") || "",
      errorDescription:
        params.get("error_description") ||
        "An unexpected error occurred during authentication.",
    });
  }, []);

  const handleRetry = () => {
    router.push("/auth/login");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="mx-auto w-full max-w-lg px-4 text-center sm:px-8">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-semibold text-lg text-red-500">Authentication Error</h1>
          <p className="text-muted-foreground">
            We encountered an issue while trying to sign you in.
          </p>
        </div>

        <div
          role="alert"
          className="w-full rounded-md border border-destructive/30 bg-destructive/5 p-4 text-left text-sm"
        >
          <p className="font-semibold">Error: {errorDetails.error}</p>
          {errorDetails.errorCode && <p>Code: {errorDetails.errorCode}</p>}
          <p className="mt-2">{errorDetails.errorDescription}</p>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          <Button className="w-full max-w-md" onClick={handleRetry}>
            Try Again
          </Button>
          <Button className="w-full max-w-md" variant="outline" onClick={handleGoHome}>
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
