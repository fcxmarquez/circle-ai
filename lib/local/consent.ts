const CONSENT_KEY = "circle-local-model-consent";

export function hasLocalModelConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(CONSENT_KEY) === "true";
  } catch {
    return false;
  }
}

export function setLocalModelConsent(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_KEY, "true");
  } catch {
    // Blocked storage (private mode, Brave Shields) — consent is session-only.
  }
}
