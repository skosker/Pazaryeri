/**
 * Where to send someone after signing in. Only same-site paths are honoured: "/..." but
 * not "//evil.com" or "/\evil.com", which browsers treat as another host — otherwise a
 * crafted login link could bounce a freshly signed-in user to a phishing page.
 */
export function safeRedirectPath(value: unknown, fallback = "/panel"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
