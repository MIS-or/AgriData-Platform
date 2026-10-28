/**
 * Centralized Runtime Environment & Secret Accessor
 * Single Source of Truth:
 * - Local / Docker: Loaded from the single repository root `/.env` file.
 * - Production (Cloudflare Workers): Injected via `wrangler secret put <KEY>` & Worker bindings.
 * ZERO hardcoded secrets in codebase.
 */

export interface Env {
  // Goal-Driven Cloudflare Free Tier Edge Resource Bindings
  DB?: unknown;                                       // [Goal G2 & G4] Cloudflare D1 Serverless SQL (5GB Free)
  KV_CACHE?: unknown;                                 // [Goal G4, G5 & X4] Cloudflare Workers KV (Anti-Herd & Marts Cache)
  R2_VAULT?: unknown;                                 // [Goal G1 & G6] Cloudflare R2 Object Storage (Tier-1 Raw & SHA-256 Forecast Vault)
  HYPERDRIVE?: { connectionString?: string };         // [Goal G2, G3 & X6] Cloudflare Hyperdrive (Neon Postgres Pooler)

  // Cloudflare Free Tier Config & Secret Keys
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_D1_DATABASE_ID?: string;
  CLOUDFLARE_KV_NAMESPACE_ID?: string;
  CLOUDFLARE_R2_BUCKET_NAME?: string;
  CLOUDFLARE_HYPERDRIVE_ID?: string;
  CLOUDFLARE_TURNSTILE_SECRET_KEY?: string;           // [Goal G1 & X2] Cloudflare Turnstile Anti-Bot Verification

  // Neon Serverless PostgreSQL (3-Tier Data Warehouse)
  NEON_DATABASE_URL?: string;                         // Pooled Neon Serverless PostgreSQL URL
  NEON_DIRECT_DATABASE_URL?: string;                  // Unpooled Neon URL for DDL migrations
  NEON_PROJECT_ID?: string;                           // Neon Project ID

  // Security & Farmer PII Protection (Decree 13/2023/ND-CP)
  PII_HASH_SALT?: string;                             // Secret salt for farmer PII hashing (min 32 chars)
  DATA_ENCRYPTION_KEY?: string;                       // 32-byte hex key for AES-256-GCM field encryption
  INTERNAL_API_SECRET?: string;                       // Bearer token for internal admin/ops endpoints
  WEBHOOK_SIGNING_SECRET?: string;                    // HMAC-SHA256 signing key for webhooks

  // Cooperative & Farmer Communication (Gate G5)
  ZALO_OA_ACCESS_TOKEN?: string;                      // Zalo Official Account access token
  ZALO_OA_SECRET_KEY?: string;                        // Zalo Official Account secret key
  NODE_ENV?: string;                                  // development | test | production
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
