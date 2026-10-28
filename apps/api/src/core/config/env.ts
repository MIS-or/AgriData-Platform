/**
 * Centralized Runtime Environment & Secret Accessor
 * Single Source of Truth:
 * - Local / Docker: Loaded from the single repository root `/.env` file.
 * - Production (Cloudflare Workers): Injected via `wrangler secret put <KEY>`.
 * ZERO hardcoded secrets in codebase.
 */

export interface Env {
  DB?: unknown;                        // Cloudflare D1 Edge Database Binding
  KV_CACHE?: unknown;                  // Cloudflare KV Fast Lookup Binding
  NEON_DATABASE_URL?: string;          // Pooled Neon Serverless PostgreSQL URL
  NEON_DIRECT_DATABASE_URL?: string;   // Unpooled Neon URL for DDL migrations
  NEON_PROJECT_ID?: string;            // Neon Project ID
  PII_HASH_SALT?: string;              // Secret salt for farmer PII hashing (Decree 13/2023/ND-CP)
  DATA_ENCRYPTION_KEY?: string;        // 32-byte hex key for AES-256-GCM field encryption
  INTERNAL_API_SECRET?: string;        // Bearer token for internal admin/ops endpoints
  WEBHOOK_SIGNING_SECRET?: string;     // HMAC-SHA256 signing key for webhooks
  ZALO_OA_ACCESS_TOKEN?: string;       // Zalo Official Account access token (Gate G5)
  ZALO_OA_SECRET_KEY?: string;         // Zalo Official Account secret key
  NODE_ENV?: string;                   // development | test | production
}

/**
 * Safely reads a secret or config key from Cloudflare Worker bindings (`c.env`)
 * with fallback to `process.env` (populated from root `.env` in local/Docker/CI).
 */
export function resolveEnvSecret<K extends keyof Env>(
  bindings: Env | undefined,
  key: K
): string | undefined {
  if (bindings && typeof bindings[key] === 'string' && (bindings[key] as string).length > 0) {
    return bindings[key] as string;
  }
  if (typeof process !== 'undefined' && process.env && typeof process.env[key as string] === 'string') {
    const val = process.env[key as string]?.trim();
    return val && val.length > 0 ? val : undefined;
  }
  return undefined;
}

