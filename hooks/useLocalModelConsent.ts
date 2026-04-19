import { useRef, useState } from "react";
import type { LocalModelSpec } from "@/lib/local/capabilities";
import { resolveLocalModelSpec } from "@/lib/local/capabilities";
import { hasLocalModelConsent, setLocalModelConsent } from "@/lib/local/consent";

export function useLocalModelConsent() {
  const [open, setOpen] = useState(false);
  const [spec, setSpec] = useState<LocalModelSpec | null>(null);
  const resolverRef = useRef<((ok: boolean) => void) | null>(null);

  const requestConsent = async (): Promise<boolean> => {
    if (hasLocalModelConsent()) return true;
    const resolved = await resolveLocalModelSpec();
    setSpec(resolved);
    setOpen(true);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
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
