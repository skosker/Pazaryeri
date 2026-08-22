/**
 * The public address of this deployment.
 *
 * Everything that has to produce an absolute URL — verification and password-reset
 * links, the iyzico callback, canonical tags, the sitemap — reads it from here rather
 * than hard-coding a host, so pointing the site at a new domain is one environment
 * variable rather than a search across the codebase.
 *
 * NEXT_PUBLIC_APP_URL is the one to set in production. VERCEL_URL is the per-deployment
 * hostname Vercel injects; it is the sensible fallback for preview builds, where no
 * custom domain exists. Local development falls through to localhost.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");
