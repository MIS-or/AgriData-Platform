/**
 * Centralized Runtime Environment & Secret Accessor
 * Single Source of Truth:
 * - Local / Docker: Loaded from the single repository root `/.env` file.
 * - Production (Cloudflare Workers): Injected via `wrangler secret put <KEY>` & Worker bindings.
 * ZERO hardcoded secrets in codebase.
 */

export interface Env {
  // Cloudflare Free Tier Edge Resource Bindings
  DB?: unknown;                                       // Cloudflare D1 Serverless SQL (5GB Free)
  KV_CACHE?: unknown;                                 // Cloudflare Workers KV (1GB Free, 100k reads/day)
  R2_VAULT?: unknown;                                 // Cloudflare R2 Object Storage (10GB Free, 0 Egress)
  HYPERDRIVE?: { connectionString?: string };         // Cloudflare Hyperdrive (Free Postgres Pooler & Cache)
  AI?: { run: (model: string, input: unknown) => Promise<unknown> }; // Cloudflare Workers AI (10k Neurons/day Free)
  VECTORIZE_AGRI_KB?: { query: (vector: number[], options?: unknown) => Promise<unknown> }; // Cloudflare Vectorize (30M dims/mo Free)
  ANALYTICS_ENGINE?: { writeDataPoint: (event: { blobs?: string[]; doubles?: number[]; indexes?: string[] }) => void }; // Cloudflare Analytics Engine (100k points/day Free)

  // Cloudflare Free Tier Config & Secret Keys
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_D1_DATABASE_ID?: string;
  CLOUDFLARE_KV_NAMESPACE_ID?: string;
  CLOUDFLARE_R2_BUCKET_NAME?: string;
  CLOUDFLARE_HYPERDRIVE_ID?: string;
  CLOUDFLARE_VECTORIZE_INDEX_NAME?: string;
  CLOUDFLARE_WORKERS_AI_DAILY_NEURON_LIMIT?: string;
  CLOUDFLARE_ANALYTICS_DATASET?: string;
  CLOUDFLARE_TURNSTILE_SECRET_KEY?: string;

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
