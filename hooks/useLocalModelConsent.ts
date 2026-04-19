import { useRef, useState } from "react";
import type { LocalModelSpec } from "@/lib/local/capabilities";
import { resolveLocalModelSpec } from "@/lib/local/capabilities";
import { hasLocalModelConsent, setLocalModelConsent } from "@/lib/local/consent";

export function useLocalModelConsent() {
  const [open, setOpen] = useState(false);
  const [spec, setSpec] = useState<LocalModelSpec | null>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  // Returns the resolved spec on success, null if the user cancelled.
  // Resolves the spec once here so callers don't need to re-resolve.
  const requestConsent = async (): Promise<LocalModelSpec | null> => {
    const resolved = await resolveLocalModelSpec();
    if (hasLocalModelConsent()) return resolved;
    setSpec(resolved);
    setOpen(true);
    const confirmed = await new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
    return confirmed ? resolved : null;
  };

  const confirm = () => {
    setOpen(false);
    setLocalModelConsent();
    resolverRef.current?.(true);
    resolverRef.current = null;
  };

  const cancel = () => {
    setOpen(false);
    resolverRef.current?.(false);
    resolverRef.current = null;
  };

  return { open, spec, requestConsent, confirm, cancel };
}
