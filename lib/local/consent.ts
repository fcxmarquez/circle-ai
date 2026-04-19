const CONSENT_KEY = "circle-local-model-consent";

export function hasLocalModelConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) === "true";
}

export function setLocalModelConsent(): void {
  localStorage.setItem(CONSENT_KEY, "true");
}
