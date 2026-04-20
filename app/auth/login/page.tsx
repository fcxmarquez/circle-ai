"use client";

import { GoogleAuthButton } from "@/components/auth/AuthButton";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 text-center sm:px-8">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3">
          <h1 className="font-semibold text-lg">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to continue to Circle</p>
        </div>
        <GoogleAuthButton />
      </div>
    </div>
  );
}
